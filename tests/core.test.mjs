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

test("quiz selection can use every entry when the requested limit is the pool size", () => {
  const entries = Array.from({ length: 94 }, (_, index) => ({ id: index }));

  const selected = core.selectQuizEntries(entries, () => 0.25, entries.length);

  assert.equal(selected.length, 94);
  assert.deepEqual(new Set(selected), new Set(entries));
});

test("worksheet assignment moves a word instead of duplicating it", () => {
  const first = core.assignWorksheetAnswer({}, "p1", "word-a");
  const moved = core.assignWorksheetAnswer(first, "p2", "word-a");
  assert.deepEqual(moved, { p2: "word-a" });
  assert.deepEqual(first, { p1: "word-a" });
});

test("worksheet assignment replaces and removes answers immutably", () => {
  const original = { p1: "word-a", p2: "word-b" };
  assert.deepEqual(
    core.assignWorksheetAnswer(original, "p1", "word-c"),
    { p1: "word-c", p2: "word-b" }
  );
  assert.deepEqual(
    core.removeWorksheetAnswer(original, "p1"),
    { p2: "word-b" }
  );
  assert.deepEqual(original, { p1: "word-a", p2: "word-b" });
});

test("worksheet grading distinguishes correct incorrect and unanswered", () => {
  const group = {
    prompts: [
      { id: "p1", answerId: "word-a" },
      { id: "p2", answerId: "word-b" },
      { id: "p3", answerId: "word-c" }
    ]
  };
  assert.deepEqual(
    core.gradeWorksheetGroup(group, { p1: "word-a", p2: "word-c" }),
    {
      correct: 1,
      total: 3,
      results: [
        { promptId: "p1", status: "correct", answerId: "word-a" },
        { promptId: "p2", status: "incorrect", answerId: "word-b" },
        { promptId: "p3", status: "unanswered", answerId: "word-c" }
      ]
    }
  );
});

test("worksheet group validation accepts the supported schema", () => {
  assert.equal(core.isValidWorksheetGroup({
    id: "g1",
    label: "PDF Page 1 · Definition Matching",
    page: 1,
    type: "definition-matching",
    wordBank: [{
      id: "word-a",
      term: "algorithm",
      vocabularyId: "vocab-a"
    }],
    prompts: [{
      id: "p1",
      text: "A procedure.",
      answerId: "word-a"
    }]
  }), true);
});

test("worksheet group validation rejects duplicate IDs and unknown answers", () => {
  const base = {
    id: "g1",
    label: "PDF Page 1 · Definition Matching",
    page: 1,
    type: "definition-matching",
    wordBank: [
      { id: "word-a", term: "algorithm", vocabularyId: "vocab-a" },
      { id: "word-b", term: "automation", vocabularyId: "vocab-b" }
    ],
    prompts: [
      { id: "p1", text: "A procedure.", answerId: "word-a" },
      { id: "p2", text: "Automatic operation.", answerId: "word-b" }
    ]
  };

  assert.equal(core.isValidWorksheetGroup({
    ...base,
    wordBank: [base.wordBank[0], { ...base.wordBank[1], id: "word-a" }]
  }), false);
  assert.equal(core.isValidWorksheetGroup({
    ...base,
    prompts: [base.prompts[0], { ...base.prompts[1], id: "p1" }]
  }), false);
  assert.equal(core.isValidWorksheetGroup({
    ...base,
    prompts: [base.prompts[0], { ...base.prompts[1], answerId: "missing-word" }]
  }), false);
  assert.equal(core.isValidWorksheetGroup({
    ...base,
    wordBank: [],
    prompts: []
  }), false);
});

test("worksheet group validation requires one blank in sentence prompts", () => {
  const group = {
    id: "g1",
    label: "PDF Page 1 · Sentence Completion",
    page: 1,
    type: "sentence-completion",
    wordBank: [{
      id: "word-a",
      term: "algorithm",
      vocabularyId: "vocab-a"
    }],
    prompts: [{
      id: "p1",
      text: "Choose an algorithm.",
      answerId: "word-a"
    }]
  };

  assert.equal(core.isValidWorksheetGroup(group), false);
  assert.equal(core.isValidWorksheetGroup({
    ...group,
    prompts: [{ ...group.prompts[0], text: "Choose {{blank}} now." }]
  }), true);
});

test("blank worksheets score zero and map every answer to mistake vocabulary", () => {
  const group = {
    wordBank: [
      { id: "word-a", vocabularyId: "vocab-a" }
    ],
    prompts: [
      { id: "p1", answerId: "word-a" },
      { id: "p2", answerId: "word-a" }
    ]
  };
  const grade = core.gradeWorksheetGroup(group, {});
  assert.equal(grade.correct, 0);
  assert.equal(grade.total, 2);
  assert.ok(grade.results.every(({ status }) => status === "unanswered"));
  assert.deepEqual(
    core.worksheetMistakeVocabularyIds(group, grade),
    ["vocab-a"]
  );
});

test("worksheet saved progress discards unknown groups prompts and words", () => {
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }, { id: "word-b" }],
    prompts: [
      { id: "p1", answerId: "word-a" },
      { id: "p2", answerId: "word-b" }
    ]
  }];
  assert.deepEqual(
    core.mergeWorksheetProgress({
      groups: {
        g1: {
          assignments: {
            p1: "word-a",
            missingPrompt: "word-b",
            p2: "missingWord"
          },
          score: { correct: 1, total: 2 }
        },
        missingGroup: { assignments: { p1: "word-a" }, score: null }
      }
    }, groups),
    {
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: { correct: 1, total: 2 }
        }
      }
    }
  );
});

test("worksheet saved progress recalculates a structurally valid inconsistent score", () => {
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }, { id: "word-b" }],
    prompts: [
      { id: "p1", answerId: "word-a" },
      { id: "p2", answerId: "word-b" }
    ]
  }];

  assert.deepEqual(
    core.mergeWorksheetProgress({
      groups: {
        g1: {
          assignments: { p1: "word-b", p2: "word-a" },
          score: { correct: 2, total: 2 }
        }
      }
    }, groups),
    {
      groups: {
        g1: {
          assignments: { p1: "word-b", p2: "word-a" },
          score: { correct: 0, total: 2 }
        }
      }
    }
  );
});

test("worksheet saved progress recalculates score after invalid assignments are removed", () => {
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }, { id: "word-b" }],
    prompts: [
      { id: "p1", answerId: "word-a" },
      { id: "p2", answerId: "word-b" }
    ]
  }];

  assert.deepEqual(
    core.mergeWorksheetProgress({
      groups: {
        g1: {
          assignments: { p1: "word-a", p2: "missing-word" },
          score: { correct: 2, total: 2 }
        }
      }
    }, groups),
    {
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: { correct: 1, total: 2 }
        }
      }
    }
  );
});

test("worksheet saved progress preserves an unchecked null score", () => {
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }],
    prompts: [{ id: "p1", answerId: "word-a" }]
  }];

  assert.deepEqual(
    core.mergeWorksheetProgress({
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: null
        }
      }
    }, groups),
    {
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: null
        }
      }
    }
  );
});

test("worksheet saved progress discards scores greater than the prompt total", () => {
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }],
    prompts: [{ id: "p1" }, { id: "p2" }]
  }];

  assert.deepEqual(
    core.mergeWorksheetProgress({
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: { correct: 3, total: 2 }
        }
      }
    }, groups),
    {
      groups: {
        g1: {
          assignments: { p1: "word-a" },
          score: null
        }
      }
    }
  );
});

test("worksheet storage failure falls back safely", () => {
  const broken = {
    getItem() { throw Error("blocked"); },
    setItem() { throw Error("blocked"); },
    removeItem() { throw Error("blocked"); }
  };
  const groups = [{
    id: "g1",
    wordBank: [{ id: "word-a" }],
    prompts: [{ id: "p1" }]
  }];
  const storage = core.worksheetProgressStorage(broken, "worksheets", groups);
  assert.deepEqual(storage.load(), core.defaultWorksheetProgress());
  assert.equal(storage.save(core.defaultWorksheetProgress()), false);
  assert.equal(storage.clear(), false);
});
