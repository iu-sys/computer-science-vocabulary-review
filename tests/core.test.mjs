import test from "node:test";
import assert from "node:assert/strict";
import * as core from "../src/core.js";
import {
  normalizeAnswer,
  createChoiceQuestion,
  gradeSpelling,
  defaultProgress,
  mergeProgress,
  progressStorage
} from "../src/core.js";

const pool = [
  { id: "a", term: "deep learning", definition: "A neural-network method.", zh: "深度學習" },
  { id: "b", term: "algorithm", definition: "A procedure.", zh: "演算法" },
  { id: "c", term: "ledger", definition: "A record book.", zh: "帳本" },
  { id: "d", term: "node", definition: "A joining point.", zh: "節點" }
];

test("spelling ignores outer whitespace and case but preserves spaces", () => {
  assert.equal(normalizeAnswer("  Deep Learning "), "deep learning");
  assert.equal(gradeSpelling(" DEEP LEARNING ", "deep learning"), true);
  assert.equal(gradeSpelling("deeplearning", "deep learning"), false);
});

test("choice question has one answer and four unique options", () => {
  const q = createChoiceQuestion(pool[0], pool, "term-to-zh", () => 0.25);
  assert.equal(q.prompt, "deep learning");
  assert.equal(q.answer, "深度學習");
  assert.equal(q.options.length, 4);
  assert.equal(new Set(q.options).size, 4);
  assert.equal(q.options.filter((value) => value === q.answer).length, 1);
});

test("definition-to-term questions use the definition prompt and term answer", () => {
  const q = createChoiceQuestion(pool[0], pool, "definition-to-term", () => 0.25);

  assert.equal(q.prompt, pool[0].definition);
  assert.equal(q.answer, pool[0].term);
  assert.equal(q.options.filter((value) => value === q.answer).length, 1);
});

test("spelling preserves hyphens", () => {
  assert.equal(gradeSpelling("real-time", "real-time"), true);
  assert.equal(gradeSpelling("real time", "real-time"), false);
});

test("saved progress is filtered and storage failure is harmless", () => {
  assert.deepEqual(defaultProgress(), { familiar: [], review: [], mistakes: [], lastScore: null });
  assert.deepEqual(
    mergeProgress({ familiar: ["a", "missing"], mistakes: ["b"] }, new Set(["a", "b"])),
    { familiar: ["a"], review: [], mistakes: ["b"], lastScore: null }
  );
  const broken = {
    getItem() { throw Error(); },
    setItem() { throw Error(); },
    removeItem() { throw Error(); }
  };
  const store = progressStorage(broken, "study");
  assert.deepEqual(store.load(new Set(["a"])), defaultProgress());
  assert.equal(store.save(defaultProgress()), false);
  assert.equal(store.clear(), false);
});

test("absent saved storage loads default progress", () => {
  const storage = {
    getItem() { return null; },
    setItem() {},
    removeItem() {}
  };

  assert.deepEqual(progressStorage(storage, "study").load(new Set(["a"])), defaultProgress());
});

test("quiz selection caps randomized pools at 10 entries", () => {
  assert.equal(typeof core.selectQuizEntries, "function");
  const entries = Array.from({ length: 11 }, (_, index) => ({ id: index }));

  const selected = core.selectQuizEntries(entries, () => 0);

  assert.equal(selected.length, 10);
  assert.equal(new Set(selected).size, 10);
  assert.ok(selected.every((entry) => entries.includes(entry)));
});

test("quiz selection uses every entry when the pool has fewer than 10", () => {
  assert.equal(typeof core.selectQuizEntries, "function");
  const entries = Array.from({ length: 6 }, (_, index) => ({ id: index }));

  const selected = core.selectQuizEntries(entries, () => 0.5);

  assert.equal(selected.length, entries.length);
  assert.deepEqual(new Set(selected), new Set(entries));
});
