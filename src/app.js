import { VOCABULARY } from "./vocabulary.js";
import { WORKSHEET_GROUPS } from "./worksheet.js";
import {
  assignWorksheetAnswer,
  createChoiceQuestion,
  defaultProgress,
  defaultWorksheetProgress,
  gradeSpelling,
  gradeWorksheetGroup,
  isValidWorksheetGroup,
  mergeWorksheetProgress,
  progressStorage,
  removeWorksheetAnswer,
  selectWorksheetGroup,
  worksheetMistakeVocabularyIds,
  worksheetProgressStorage,
  selectQuizEntries
} from "./core.js";

const STORAGE_KEY = "cs-vocabulary-progress-v1";
const WORKSHEET_STORAGE_KEY = "cs-pdf-practice-v1";
const QUIZ_MODES = new Set(["term-to-zh", "definition-to-term", "spelling"]);
const byId = new Map(VOCABULARY.map((entry) => [entry.id, entry]));
const validIds = new Set(byId.keys());
const validWorksheetGroups = WORKSHEET_GROUPS.filter(isValidWorksheetGroup);
const hasInvalidWorksheetGroups =
  validWorksheetGroups.length !== WORKSHEET_GROUPS.length;
const worksheetById = new Map(
  validWorksheetGroups.map((group) => [group.id, group])
);

const elements = {
  viewButtons: [...document.querySelectorAll("[data-view-button]")],
  views: [...document.querySelectorAll(".view")],
  status: document.querySelector("#status-message"),
  cardOrder: document.querySelector("#card-order"),
  cardCount: document.querySelector("#card-count"),
  cardFront: document.querySelector("#card-front"),
  cardBack: document.querySelector("#card-back"),
  cardTerm: document.querySelector("#card-term"),
  cardDefinition: document.querySelector("#card-definition"),
  cardZh: document.querySelector("#card-zh"),
  cardSource: document.querySelector("#card-source"),
  cardPage: document.querySelector("#card-page"),
  previousCard: document.querySelector("#previous-card"),
  flipCard: document.querySelector("#flip-card"),
  nextCard: document.querySelector("#next-card"),
  markReview: document.querySelector("#mark-review"),
  markFamiliar: document.querySelector("#mark-familiar"),
  quizMode: document.querySelector("#quiz-mode"),
  quizScope: document.querySelector("#quiz-scope"),
  startQuiz: document.querySelector("#start-quiz"),
  quizStage: document.querySelector("#quiz-stage"),
  quizProgress: document.querySelector("#quiz-progress"),
  quizPrompt: document.querySelector("#quiz-prompt"),
  quizOptions: document.querySelector("#quiz-options"),
  spellingForm: document.querySelector("#spelling-form"),
  spellingAnswer: document.querySelector("#spelling-answer"),
  submitSpelling: document.querySelector("#submit-spelling"),
  quizFeedback: document.querySelector("#quiz-feedback"),
  correctAnswer: document.querySelector("#quiz-correct-answer"),
  nextQuestion: document.querySelector("#next-question"),
  lastScore: document.querySelector("#last-score"),
  mistakeList: document.querySelector("#mistake-list"),
  retryMistakes: document.querySelector("#retry-mistakes"),
  clearProgress: document.querySelector("#clear-progress"),
  worksheetType: document.querySelector("#worksheet-type"),
  worksheetGroup: document.querySelector("#worksheet-group"),
  worksheetLabel: document.querySelector("#worksheet-label"),
  worksheetProgress: document.querySelector("#worksheet-progress"),
  worksheetBank: document.querySelector("#worksheet-bank"),
  worksheetPrompts: document.querySelector("#worksheet-prompts"),
  worksheetScore: document.querySelector("#worksheet-score"),
  openSentenceCompletion: document.querySelector("#open-sentence-completion"),
  checkWorksheet: document.querySelector("#check-worksheet"),
  resetWorksheet: document.querySelector("#reset-worksheet"),
  previousWorksheet: document.querySelector("#previous-worksheet"),
  nextWorksheet: document.querySelector("#next-worksheet")
};

const unavailableStorage = {
  getItem() { throw new Error("Storage unavailable"); },
  setItem() { throw new Error("Storage unavailable"); },
  removeItem() { throw new Error("Storage unavailable"); }
};

let storageAvailable = true;
let store;
let worksheetStore;
try {
  const storage = window.localStorage;
  const probeKey = `${STORAGE_KEY}-probe`;
  storage.setItem(probeKey, "1");
  storage.removeItem(probeKey);
  store = progressStorage(storage, STORAGE_KEY);
  worksheetStore = worksheetProgressStorage(
    storage,
    WORKSHEET_STORAGE_KEY,
    validWorksheetGroups
  );
} catch {
  storageAvailable = false;
  store = progressStorage(unavailableStorage, STORAGE_KEY);
  worksheetStore = worksheetProgressStorage(
    unavailableStorage,
    WORKSHEET_STORAGE_KEY,
    validWorksheetGroups
  );
}

const state = {
  cardOrder: [...VOCABULARY],
  cardIndex: 0,
  flipped: false,
  progress: store.load(validIds),
  quiz: null,
  worksheet: {
    type: "definition-matching",
    groupId: "p1-definition-matching",
    selectedWordId: null,
    progress: worksheetStore.load(),
    grade: null
  }
};

function shuffle(values) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function announce(message = "") {
  const warning = storageAvailable
    ? ""
    : "Storage is unavailable. Progress will continue for this session only.";
  elements.status.textContent = [warning, message].filter(Boolean).join(" ");
}

function saveProgress(message = "") {
  if (!store.save(state.progress)) {
    storageAvailable = false;
  }
  announce(message);
}

function setView(viewId) {
  for (const view of elements.views) {
    view.hidden = view.id !== viewId;
  }
  for (const button of elements.viewButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.viewButton === viewId));
  }
  if (viewId === "mistakes-view") renderMistakes();
  if (viewId === "pdf-practice-view") {
    renderWorksheetSelectors();
    renderWorksheet();
  }
}

function worksheetGroupsForType(type) {
  return validWorksheetGroups.filter((group) => group.type === type);
}

function currentWorksheetGroup() {
  return worksheetById.get(state.worksheet.groupId) || null;
}

function currentWorksheetProgress() {
  const group = currentWorksheetGroup();
  if (!group) return { assignments: {}, score: null };
  return state.worksheet.progress.groups[group.id] || {
    assignments: {},
    score: null
  };
}

function saveWorksheetProgress(message = "") {
  if (!worksheetStore.save(state.worksheet.progress)) storageAvailable = false;
  announce(message);
}

function renderWorksheetSelectors() {
  const groups = worksheetGroupsForType(state.worksheet.type);
  if (groups.length === 0) {
    state.worksheet.groupId = null;
    state.worksheet.selectedWordId = null;
    state.worksheet.grade = null;
    elements.worksheetGroup.replaceChildren();
    return;
  }
  if (!groups.some((group) => group.id === state.worksheet.groupId)) {
    state.worksheet.groupId = groups[0].id;
    state.worksheet.selectedWordId = null;
    state.worksheet.grade = null;
  }
  elements.worksheetType.value = state.worksheet.type;
  elements.worksheetGroup.replaceChildren();
  for (const group of groups) {
    const option = document.createElement("option");
    option.value = group.id;
    option.textContent = group.label;
    elements.worksheetGroup.append(option);
  }
  elements.worksheetGroup.value = state.worksheet.groupId;
}

function openSentenceCompletion() {
  const group = worksheetById.get("p1-sentence-completion");
  if (!group) {
    announce("Page 1 Exercise 4 sentence completion is unavailable.");
    return;
  }
  state.worksheet = selectWorksheetGroup(state.worksheet, group);
  renderWorksheetSelectors();
  renderWorksheet();
  announce("Opened Page 1 Exercise 4 sentence completion.");
}

function worksheetSlot(prompt, promptNumber, wordById, assignments) {
  const button = document.createElement("button");
  const assignedWord = wordById.get(assignments[prompt.id]);
  const selectedWord = wordById.get(state.worksheet.selectedWordId);
  button.type = "button";
  button.className = "worksheet-slot";
  button.dataset.promptId = prompt.id;
  button.textContent = assignedWord ? assignedWord.term : "Select a word";
  let label;
  if (selectedWord) {
    label = assignedWord
      ? `Question ${promptNumber} answer: ${assignedWord.term}. Replace with ${selectedWord.term}.`
      : `Question ${promptNumber}, empty answer. Assign ${selectedWord.term}.`;
  } else {
    label = assignedWord
      ? `Question ${promptNumber} answer: ${assignedWord.term}. Remove ${assignedWord.term}.`
      : `Question ${promptNumber}, empty answer. Select a word before assigning.`;
  }
  button.setAttribute("aria-label", label);
  button.addEventListener("click", () => activateWorksheetSlot(prompt.id));
  return button;
}

function focusWorksheetWord(wordId) {
  const button = [...elements.worksheetBank.querySelectorAll("[data-word-id]")]
    .find(({ dataset }) => dataset.wordId === wordId);
  button?.focus();
}

function focusWorksheetSlot(promptId) {
  const button = [...elements.worksheetPrompts.querySelectorAll("[data-prompt-id]")]
    .find(({ dataset }) => dataset.promptId === promptId);
  button?.focus();
}

function renderWorksheet() {
  const group = currentWorksheetGroup();
  elements.worksheetBank.replaceChildren();
  elements.worksheetPrompts.replaceChildren();
  elements.worksheetScore.textContent = "";

  if (!group) {
    elements.worksheetLabel.textContent = hasInvalidWorksheetGroups
      ? "Worksheet unavailable because its exercise data is invalid."
      : "Worksheet unavailable.";
    elements.worksheetProgress.textContent = "";
    elements.checkWorksheet.disabled = true;
    elements.resetWorksheet.disabled = true;
    elements.previousWorksheet.disabled = true;
    elements.nextWorksheet.disabled = true;
    return;
  }

  const groups = worksheetGroupsForType(state.worksheet.type);
  const groupIndex = groups.findIndex(({ id }) => id === group.id);
  const saved = currentWorksheetProgress();
  const assignments = saved.assignments;
  const wordById = new Map(group.wordBank.map((word) => [word.id, word]));
  const grade = saved.score
    ? gradeWorksheetGroup(group, assignments)
    : state.worksheet.grade;

  elements.worksheetLabel.textContent = group.label;
  elements.worksheetProgress.textContent = `Exercise ${groupIndex + 1} / ${groups.length}`;
  elements.checkWorksheet.disabled = false;
  elements.resetWorksheet.disabled = false;
  elements.previousWorksheet.disabled = groupIndex <= 0;
  elements.nextWorksheet.disabled = groupIndex === groups.length - 1;

  for (const word of group.wordBank) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.wordId = word.id;
    button.dataset.used = String(Object.values(assignments).includes(word.id));
    button.setAttribute("aria-pressed", String(state.worksheet.selectedWordId === word.id));
    button.textContent = word.term;
    button.addEventListener("click", () => selectWorksheetWord(word.id));
    elements.worksheetBank.append(button);
  }

  const gradeByPromptId = new Map((grade?.results || []).map((result) => [result.promptId, result]));
  for (const [promptIndex, prompt] of group.prompts.entries()) {
    const item = document.createElement("li");
    item.className = "worksheet-prompt";
    const promptGrade = gradeByPromptId.get(prompt.id);
    if (promptGrade) item.dataset.status = promptGrade.status;

    if (group.type === "sentence-completion") {
      const [before, after] = prompt.text.split("{{blank}}");
      item.append(document.createTextNode(before));
      item.append(worksheetSlot(prompt, promptIndex + 1, wordById, assignments));
      item.append(document.createTextNode(after));
    } else {
      const text = document.createElement("span");
      text.textContent = `${prompt.text} `;
      item.append(
        text,
        worksheetSlot(prompt, promptIndex + 1, wordById, assignments)
      );
    }

    if (promptGrade) {
      const result = document.createElement("p");
      result.className = "worksheet-result";
      result.textContent = promptGrade.status === "correct"
        ? "Correct"
        : promptGrade.status === "incorrect"
          ? "Incorrect"
          : "Not answered";
      item.append(result);
      if (promptGrade.status !== "correct") {
        const answer = document.createElement("p");
        answer.className = "correct-answer";
        answer.textContent = `Correct word: ${wordById.get(promptGrade.answerId).term}`;
        item.append(answer);
      }
    }
    elements.worksheetPrompts.append(item);
  }

  if (saved.score) {
    elements.worksheetScore.textContent = `Score: ${saved.score.correct} / ${saved.score.total}`;
  }
}

function selectWorksheetWord(wordId) {
  const group = currentWorksheetGroup();
  const word = group?.wordBank.find(({ id }) => id === wordId);
  state.worksheet.selectedWordId =
    state.worksheet.selectedWordId === wordId ? null : wordId;
  renderWorksheet();
  focusWorksheetWord(wordId);
  announce(
    state.worksheet.selectedWordId
      ? `Selected word: ${word?.term || wordId}.`
      : "Word selection cleared."
  );
}

function activateWorksheetSlot(promptId) {
  const group = currentWorksheetGroup();
  if (!group) return;
  const saved = currentWorksheetProgress();
  const selectedWordId = state.worksheet.selectedWordId;
  const previousWordId = saved.assignments[promptId];
  const previousPromptId = selectedWordId
    ? Object.entries(saved.assignments).find(
        ([assignedPromptId, wordId]) =>
          assignedPromptId !== promptId && wordId === selectedWordId
      )?.[0]
    : null;
  const assignments = selectedWordId
    ? assignWorksheetAnswer(
        saved.assignments,
        promptId,
        selectedWordId
      )
    : removeWorksheetAnswer(saved.assignments, promptId);
  const wordById = new Map(group.wordBank.map((word) => [word.id, word]));
  const promptNumber =
    group.prompts.findIndex(({ id }) => id === promptId) + 1;
  const selectedTerm = wordById.get(selectedWordId)?.term || selectedWordId;
  const previousTerm = wordById.get(previousWordId)?.term || previousWordId;
  let message;
  if (!selectedWordId) {
    message = previousWordId
      ? `Removed ${previousTerm} from question ${promptNumber}.`
      : `Question ${promptNumber} has no answer to remove.`;
  } else if (previousPromptId) {
    message = previousWordId && previousWordId !== selectedWordId
      ? `Moved ${selectedTerm} to question ${promptNumber} and replaced ${previousTerm}.`
      : `Moved ${selectedTerm} to question ${promptNumber}.`;
  } else if (previousWordId && previousWordId !== selectedWordId) {
    message =
      `Replaced ${previousTerm} with ${selectedTerm} in question ${promptNumber}.`;
  } else {
    message = `Assigned ${selectedTerm} to question ${promptNumber}.`;
  }
  state.worksheet.progress.groups[group.id] = { assignments, score: null };
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  saveWorksheetProgress(message);
  renderWorksheet();
  focusWorksheetSlot(promptId);
}

function checkWorksheet() {
  const group = currentWorksheetGroup();
  if (!group) return;
  const saved = currentWorksheetProgress();
  const grade = gradeWorksheetGroup(group, saved.assignments);
  state.worksheet.progress.groups[group.id] = {
    assignments: saved.assignments,
    score: { correct: grade.correct, total: grade.total }
  };
  state.worksheet.grade = grade;
  const mistakes = new Set(state.progress.mistakes);
  for (const vocabularyId of worksheetMistakeVocabularyIds(group, grade)) {
    mistakes.add(vocabularyId);
  }
  state.progress.mistakes = [...mistakes];
  saveProgress();
  saveWorksheetProgress(`Worksheet checked: ${grade.correct} / ${grade.total}.`);
  renderWorksheet();
}

function resetWorksheet() {
  const group = currentWorksheetGroup();
  if (!group) return;
  state.worksheet.progress.groups[group.id] = { assignments: {}, score: null };
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  saveWorksheetProgress("Worksheet reset.");
  renderWorksheet();
}

function moveWorksheet(offset) {
  const groups = worksheetGroupsForType(state.worksheet.type);
  const index = groups.findIndex(({ id }) => id === state.worksheet.groupId);
  const next = groups[index + offset];
  if (!next) return;
  state.worksheet.groupId = next.id;
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  renderWorksheetSelectors();
  renderWorksheet();
}

function renderCard() {
  const entry = state.cardOrder[state.cardIndex];
  elements.cardCount.textContent = `${state.cardIndex + 1} / ${state.cardOrder.length}`;
  elements.cardTerm.textContent = entry.term;
  elements.cardDefinition.textContent = entry.definition;
  elements.cardZh.textContent = entry.zh;
  elements.cardSource.textContent = `Source: ${entry.source}`;
  elements.cardPage.textContent = `PDF page ${entry.page}`;
  elements.cardFront.hidden = state.flipped;
  elements.cardBack.hidden = !state.flipped;
  elements.flipCard.textContent = state.flipped ? "Show term" : "Flip";

  const familiar = state.progress.familiar.includes(entry.id);
  const review = state.progress.review.includes(entry.id);
  elements.markFamiliar.textContent = familiar ? "✓ Familiar" : "Mark familiar";
  elements.markFamiliar.setAttribute("aria-pressed", String(familiar));
  elements.markReview.textContent = review ? "★ Review marked" : "Mark for review";
  elements.markReview.setAttribute("aria-pressed", String(review));
}

function moveCard(offset) {
  state.cardIndex = (state.cardIndex + offset + state.cardOrder.length) % state.cardOrder.length;
  state.flipped = false;
  renderCard();
}

function markCard(kind) {
  const entryId = state.cardOrder[state.cardIndex].id;
  const other = kind === "familiar" ? "review" : "familiar";
  const selected = new Set(state.progress[kind]);
  selected.has(entryId) ? selected.delete(entryId) : selected.add(entryId);
  state.progress[kind] = [...selected];
  state.progress[other] = state.progress[other].filter((id) => id !== entryId);
  saveProgress(kind === "familiar" ? "Familiar status updated." : "Review status updated.");
  renderCard();
}

function renderMistakes() {
  elements.mistakeList.replaceChildren();
  const mistakes = state.progress.mistakes.map((id) => byId.get(id)).filter(Boolean);
  if (mistakes.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No mistakes saved yet.";
    elements.mistakeList.append(item);
  } else {
    for (const entry of mistakes) {
      const item = document.createElement("li");
      item.textContent = `${entry.term} — ${entry.zh} (PDF page ${entry.page}, ${entry.source})`;
      elements.mistakeList.append(item);
    }
  }
  const score = state.progress.lastScore;
  elements.lastScore.textContent = score
    ? `Last score: ${score.correct} / ${score.total}`
    : "No completed quiz yet.";
  elements.retryMistakes.disabled = mistakes.length === 0;
}

function resetQuizFeedback() {
  elements.quizFeedback.textContent = "";
  elements.quizFeedback.removeAttribute("data-result");
  elements.correctAnswer.textContent = "";
  elements.nextQuestion.hidden = true;
}

function renderQuizQuestion() {
  const quiz = state.quiz;
  const entry = quiz.entries[quiz.index];
  quiz.locked = false;
  resetQuizFeedback();
  elements.quizProgress.textContent = `Question ${quiz.index + 1} / ${quiz.entries.length}`;
  elements.quizOptions.replaceChildren();
  elements.spellingAnswer.value = "";

  if (quiz.mode === "spelling") {
    quiz.question = { entryId: entry.id, prompt: entry.definition, answer: entry.term };
    elements.quizPrompt.textContent = quiz.question.prompt;
    elements.quizOptions.hidden = true;
    elements.spellingForm.hidden = false;
    elements.spellingAnswer.disabled = false;
    elements.submitSpelling.disabled = false;
    elements.spellingAnswer.focus();
    return;
  }

  quiz.question = createChoiceQuestion(entry, VOCABULARY, quiz.mode);
  elements.quizPrompt.textContent = quiz.question.prompt;
  elements.quizOptions.hidden = false;
  elements.spellingForm.hidden = true;
  for (const option of quiz.question.options) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => answerQuestion(option));
    elements.quizOptions.append(button);
  }
}

function answerQuestion(answer) {
  const quiz = state.quiz;
  if (!quiz || quiz.locked) return;
  quiz.locked = true;
  const entryId = quiz.question.entryId;
  const correct = quiz.mode === "spelling"
    ? gradeSpelling(answer, quiz.question.answer)
    : answer === quiz.question.answer;

  for (const button of elements.quizOptions.querySelectorAll("button")) {
    button.disabled = true;
  }
  elements.spellingAnswer.disabled = true;
  elements.submitSpelling.disabled = true;
  elements.quizFeedback.dataset.result = correct ? "correct" : "incorrect";
  elements.quizFeedback.textContent = correct ? "✓ Correct" : "✗ Incorrect";
  elements.correctAnswer.textContent = `Correct answer: ${quiz.question.answer}`;
  elements.nextQuestion.hidden = false;

  const mistakes = new Set(state.progress.mistakes);
  if (correct) {
    quiz.correct += 1;
    if (quiz.mistakesOnly) mistakes.delete(entryId);
  } else {
    mistakes.add(entryId);
  }
  state.progress.mistakes = [...mistakes];
  saveProgress();
  elements.nextQuestion.focus();
}

function finishQuiz() {
  const quiz = state.quiz;
  state.progress.lastScore = { correct: quiz.correct, total: quiz.entries.length };
  saveProgress(`Quiz complete: ${quiz.correct} / ${quiz.entries.length}.`);
  elements.quizProgress.textContent = "Quiz complete";
  elements.quizPrompt.textContent = `Score: ${quiz.correct} / ${quiz.entries.length}`;
  elements.quizOptions.replaceChildren();
  elements.quizOptions.hidden = false;
  elements.spellingForm.hidden = true;
  resetQuizFeedback();
  renderMistakes();
  state.quiz = null;
}

function nextQuestion() {
  if (!state.quiz || !state.quiz.locked) return;
  state.quiz.index += 1;
  if (state.quiz.index >= state.quiz.entries.length) {
    finishQuiz();
  } else {
    renderQuizQuestion();
  }
}

function startQuiz({ mistakesOnly = elements.quizScope.value === "mistakes" } = {}) {
  const selectedScope = elements.quizScope.value;
  const pool = mistakesOnly
    ? state.progress.mistakes.map((id) => byId.get(id)).filter(Boolean)
    : VOCABULARY;
  if (pool.length === 0) {
    elements.quizStage.hidden = true;
    announce("There are no saved mistakes to retry.");
    return;
  }
  const limit = !mistakesOnly && selectedScope === "all" ? pool.length : 10;
  const entries = selectQuizEntries(pool, Math.random, limit);
  const selectedMode = elements.quizMode.value;
  state.quiz = {
    mode: QUIZ_MODES.has(selectedMode) ? selectedMode : "term-to-zh",
    mistakesOnly,
    entries,
    index: 0,
    correct: 0,
    locked: false,
    question: null
  };
  elements.quizStage.hidden = false;
  announce();
  renderQuizQuestion();
}

for (const button of elements.viewButtons) {
  button.addEventListener("click", () => setView(button.dataset.viewButton));
}

elements.cardOrder.addEventListener("change", () => {
  state.cardOrder = elements.cardOrder.value === "random"
    ? shuffle(VOCABULARY)
    : [...VOCABULARY];
  state.cardIndex = 0;
  state.flipped = false;
  renderCard();
});
elements.previousCard.addEventListener("click", () => moveCard(-1));
elements.nextCard.addEventListener("click", () => moveCard(1));
elements.flipCard.addEventListener("click", () => {
  state.flipped = !state.flipped;
  renderCard();
});
elements.markReview.addEventListener("click", () => markCard("review"));
elements.markFamiliar.addEventListener("click", () => markCard("familiar"));
elements.startQuiz.addEventListener("click", () => startQuiz());
elements.nextQuestion.addEventListener("click", nextQuestion);
elements.spellingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  answerQuestion(elements.spellingAnswer.value);
});
elements.retryMistakes.addEventListener("click", () => {
  elements.quizScope.value = "mistakes";
  setView("quiz-view");
  startQuiz({ mistakesOnly: true });
});
elements.worksheetType.addEventListener("change", () => {
  state.worksheet.type = elements.worksheetType.value;
  const groups = worksheetGroupsForType(state.worksheet.type);
  state.worksheet.groupId = groups[0]?.id || "";
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  renderWorksheetSelectors();
  renderWorksheet();
});
elements.worksheetGroup.addEventListener("change", () => {
  state.worksheet.groupId = elements.worksheetGroup.value;
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  renderWorksheet();
});
elements.openSentenceCompletion.addEventListener("click", openSentenceCompletion);
elements.checkWorksheet.addEventListener("click", checkWorksheet);
elements.resetWorksheet.addEventListener("click", resetWorksheet);
elements.previousWorksheet.addEventListener("click", () => moveWorksheet(-1));
elements.nextWorksheet.addEventListener("click", () => moveWorksheet(1));
elements.clearProgress.addEventListener("click", () => {
  if (!window.confirm("確定要清除所有熟悉度、錯題和測驗紀錄嗎？")) return;
  state.progress = defaultProgress();
  state.worksheet.progress = defaultWorksheetProgress();
  state.worksheet.grade = null;
  state.worksheet.selectedWordId = null;
  if (!store.clear()) storageAvailable = false;
  if (!worksheetStore.clear()) storageAvailable = false;
  renderCard();
  renderMistakes();
  renderWorksheet();
  announce("Saved progress cleared.");
});

renderCard();
renderMistakes();
renderWorksheetSelectors();
renderWorksheet();
announce();
