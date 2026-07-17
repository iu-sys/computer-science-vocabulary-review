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

export const selectQuizEntries = (pool, random = Math.random) =>
  shuffled(pool, random).slice(0, 10);

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
