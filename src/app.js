import { VOCABULARY } from "./vocabulary.js";
import {
  createChoiceQuestion,
  defaultProgress,
  gradeSpelling,
  progressStorage,
  selectQuizEntries
} from "./core.js";

const STORAGE_KEY = "cs-vocabulary-progress-v1";
const QUIZ_MODES = new Set(["term-to-zh", "definition-to-term", "spelling"]);
const byId = new Map(VOCABULARY.map((entry) => [entry.id, entry]));
const validIds = new Set(byId.keys());

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
  clearProgress: document.querySelector("#clear-progress")
};

const unavailableStorage = {
  getItem() { throw new Error("Storage unavailable"); },
  setItem() { throw new Error("Storage unavailable"); },
  removeItem() { throw new Error("Storage unavailable"); }
};

let storageAvailable = true;
let store;
try {
  const storage = window.localStorage;
  const probeKey = `${STORAGE_KEY}-probe`;
  storage.setItem(probeKey, "1");
  storage.removeItem(probeKey);
  store = progressStorage(storage, STORAGE_KEY);
} catch {
  storageAvailable = false;
  store = progressStorage(unavailableStorage, STORAGE_KEY);
}

const state = {
  cardOrder: [...VOCABULARY],
  cardIndex: 0,
  flipped: false,
  progress: store.load(validIds),
  quiz: null
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
  const pool = mistakesOnly
    ? state.progress.mistakes.map((id) => byId.get(id)).filter(Boolean)
    : VOCABULARY;
  if (pool.length === 0) {
    elements.quizStage.hidden = true;
    announce("There are no saved mistakes to retry.");
    return;
  }
  const entries = selectQuizEntries(pool);
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
elements.clearProgress.addEventListener("click", () => {
  if (!window.confirm("確定要清除所有熟悉度、錯題和測驗紀錄嗎？")) return;
  state.progress = defaultProgress();
  if (!store.clear()) storageAvailable = false;
  renderCard();
  renderMistakes();
  announce("Saved progress cleared.");
});

renderCard();
renderMistakes();
announce();
