export const normalizeAnswer = (value) =>
  String(value).trim().toLocaleLowerCase("en").replace(/\s+/g, " ");

export const gradeSpelling = (input, term) =>
  normalizeAnswer(input) === normalizeAnswer(term);

const shuffled = (values, random = Math.random) => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

export const selectQuizEntries = (pool, random = Math.random, limit = 10) =>
  shuffled(pool, random).slice(0, limit);

export function createChoiceQuestion(entry, pool, mode, random = Math.random) {
  const toChinese = mode === "term-to-zh";
  const prompt = toChinese ? entry.term : entry.definition;
  const answer = toChinese ? entry.zh : entry.term;
  const distractors = pool
    .filter((item) => item.id !== entry.id)
    .map((item) => toChinese ? item.zh : item.term)
    .filter((value, index, values) => value !== answer && values.indexOf(value) === index);
  return {
    entryId: entry.id,
    prompt,
    answer,
    options: shuffled([answer, ...shuffled(distractors, random).slice(0, 3)], random)
  };
}

export const defaultProgress = () =>
  ({ familiar: [], review: [], mistakes: [], lastScore: null });

export function mergeProgress(value, validIds) {
  const safe = value && typeof value === "object" ? value : {};
  const ids = (list) => [
    ...new Set(Array.isArray(list) ? list.filter((id) => validIds.has(id)) : [])
  ];
  const score = safe.lastScore
    && Number.isInteger(safe.lastScore.correct)
    && Number.isInteger(safe.lastScore.total)
    ? { correct: safe.lastScore.correct, total: safe.lastScore.total }
    : null;
  return {
    familiar: ids(safe.familiar),
    review: ids(safe.review),
    mistakes: ids(safe.mistakes),
    lastScore: score
  };
}

export function progressStorage(storage, key) {
  return {
    load(validIds) {
      try {
        return mergeProgress(JSON.parse(storage.getItem(key) || "null"), validIds);
      } catch {
        return defaultProgress();
      }
    },
    save(progress) {
      try {
        storage.setItem(key, JSON.stringify(progress));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}

export function assignWorksheetAnswer(assignments, promptId, wordId) {
  const next = Object.fromEntries(
    Object.entries(assignments).filter(
      ([existingPrompt, existingWord]) =>
        existingPrompt !== promptId && existingWord !== wordId
    )
  );
  next[promptId] = wordId;
  return next;
}

export function removeWorksheetAnswer(assignments, promptId) {
  return Object.fromEntries(
    Object.entries(assignments).filter(([existingPrompt]) => existingPrompt !== promptId)
  );
}

export function gradeWorksheetGroup(group, assignments) {
  const results = group.prompts.map((prompt) => ({
    promptId: prompt.id,
    status: assignments[prompt.id] == null
      ? "unanswered"
      : assignments[prompt.id] === prompt.answerId
        ? "correct"
        : "incorrect",
    answerId: prompt.answerId
  }));
  return {
    correct: results.filter(({ status }) => status === "correct").length,
    total: results.length,
    results
  };
}

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const hasUniqueStringIds = (items) => {
  const ids = items.map(({ id }) => id);
  return ids.every(isNonEmptyString) && new Set(ids).size === ids.length;
};

export function isValidWorksheetGroup(group) {
  if (
    !group
    || typeof group !== "object"
    || !isNonEmptyString(group.id)
    || !isNonEmptyString(group.label)
    || !Number.isInteger(group.page)
    || group.page < 1
    || !["definition-matching", "sentence-completion"].includes(group.type)
    || !Array.isArray(group.wordBank)
    || !Array.isArray(group.prompts)
    || group.wordBank.length === 0
    || group.prompts.length === 0
    || !hasUniqueStringIds(group.wordBank)
    || !hasUniqueStringIds(group.prompts)
  ) {
    return false;
  }

  const wordIds = new Set(group.wordBank.map(({ id }) => id));
  const wordsAreValid = group.wordBank.every(
    ({ term, vocabularyId }) =>
      isNonEmptyString(term) && isNonEmptyString(vocabularyId)
  );
  const promptsAreValid = group.prompts.every(({ text, answerId }) => {
    if (!isNonEmptyString(text) || !wordIds.has(answerId)) return false;
    if (group.type !== "sentence-completion") return true;
    return text.split("{{blank}}").length === 2;
  });
  return wordsAreValid && promptsAreValid;
}

export const defaultWorksheetProgress = () => ({ groups: {} });

export function mergeWorksheetProgress(value, groups) {
  const savedGroups = value?.groups && typeof value.groups === "object"
    ? value.groups
    : {};
  const cleanGroups = {};
  for (const group of groups) {
    const saved = savedGroups[group.id];
    if (!saved || typeof saved !== "object") continue;
    const promptIds = new Set(group.prompts.map(({ id }) => id));
    const wordIds = new Set(group.wordBank.map(({ id }) => id));
    const usedWords = new Set();
    const assignments = {};
    for (const [promptId, wordId] of Object.entries(saved.assignments || {})) {
      if (
        promptIds.has(promptId)
        && wordIds.has(wordId)
        && !usedWords.has(wordId)
      ) {
        assignments[promptId] = wordId;
        usedWords.add(wordId);
      }
    }
    const hasValidSavedScore = saved.score
      && Number.isInteger(saved.score.correct)
      && saved.score.correct >= 0
      && saved.score.correct <= group.prompts.length
      && saved.score.total === group.prompts.length;
    const grade = hasValidSavedScore
      ? gradeWorksheetGroup(group, assignments)
      : null;
    const score = grade
      ? { correct: grade.correct, total: grade.total }
      : null;
    cleanGroups[group.id] = { assignments, score };
  }
  return { groups: cleanGroups };
}

export function worksheetProgressStorage(storage, key, groups) {
  return {
    load() {
      try {
        return mergeWorksheetProgress(
          JSON.parse(storage.getItem(key) || "null"),
          groups
        );
      } catch {
        return defaultWorksheetProgress();
      }
    },
    save(progress) {
      try {
        storage.setItem(key, JSON.stringify(progress));
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}

export function worksheetMistakeVocabularyIds(group, grade) {
  const vocabularyByWord = new Map(
    group.wordBank.map(({ id, vocabularyId }) => [id, vocabularyId])
  );
  return [...new Set(
    grade.results
      .filter(({ status }) => status !== "correct")
      .map(({ answerId }) => vocabularyByWord.get(answerId))
      .filter(Boolean)
  )];
}
