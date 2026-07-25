import test from "node:test";
import assert from "node:assert/strict";
import { VOCABULARY } from "../src/vocabulary.js";
import { WORKSHEET_GROUPS } from "../src/worksheet.js";

const expectedGroups = [
  ["p1-definition-matching", "definition-matching", 1, 12],
  ["p2-definition-matching", "definition-matching", 2, 10],
  ["p2-article-definition-matching", "definition-matching", 2, 10],
  ["p3-definition-matching-a", "definition-matching", 3, 12],
  ["p3-definition-matching-b", "definition-matching", 3, 12],
  ["p4-definition-matching-a", "definition-matching", 4, 8],
  ["p4-definition-matching-b", "definition-matching", 4, 10],
  ["p5-definition-matching", "definition-matching", 5, 10],
  ["p1-sentence-completion", "sentence-completion", 1, 12]
];

test("worksheet inventory preserves PDF grouping, order, and 96 prompts", () => {
  assert.deepEqual(
    WORKSHEET_GROUPS.map((group) => [
      group.id, group.type, group.page, group.prompts.length
    ]),
    expectedGroups
  );
  assert.equal(
    WORKSHEET_GROUPS.reduce((total, group) => total + group.prompts.length, 0),
    96
  );
});

test("every prompt answer and vocabulary mapping is valid and unique", () => {
  const vocabularyIds = new Set(VOCABULARY.map((entry) => entry.id));
  for (const group of WORKSHEET_GROUPS) {
    const wordIds = group.wordBank.map((word) => word.id);
    assert.equal(new Set(wordIds).size, wordIds.length, `${group.id} word IDs`);
    assert.ok(group.wordBank.every((word) => vocabularyIds.has(word.vocabularyId)));
    assert.ok(group.prompts.every((prompt) => wordIds.includes(prompt.answerId)));
    assert.equal(
      new Set(group.prompts.map((prompt) => prompt.id)).size,
      group.prompts.length,
      `${group.id} prompt IDs`
    );
  }
});

test("page 2 article group contains only the approved highlighted forms", () => {
  const group = WORKSHEET_GROUPS.find(
    ({ id }) => id === "p2-article-definition-matching"
  );
  assert.deepEqual(group.wordBank.map(({ term }) => term), [
    "self-sufficient",
    "backbone",
    "constant feedback loop",
    "overlooked",
    "unpredictable",
    "nuances",
    "indistinguishable",
    "uncover",
    "mountains of relevant data",
    "contextual meaning"
  ]);
});

test("sentence completion has 12 single-blank prompts in PDF order", () => {
  const group = WORKSHEET_GROUPS.find(
    ({ id }) => id === "p1-sentence-completion"
  );
  assert.deepEqual(group.wordBank.map(({ term }) => term), [
    "machine learning",
    "Turing Test",
    "natural language processing",
    "Internet of Things (IoT)",
    "deep learning",
    "big data",
    "neural networks",
    "data mining",
    "chatbot",
    "algorithm",
    "automation",
    "artificial intelligence"
  ]);
  for (const prompt of group.prompts) {
    assert.equal(prompt.text.split("{{blank}}").length, 2);
  }
});
