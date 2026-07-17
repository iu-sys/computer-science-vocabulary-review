import test from "node:test";
import assert from "node:assert/strict";
import { VOCABULARY } from "../src/vocabulary.js";

const EXPECTED_PAGE_SOURCE_TOTALS = {
  "1/exercise": 12,
  "2/exercise": 20,
  "2/article-highlight": 10,
  "3/exercise": 24,
  "4/exercise": 18,
  "5/exercise": 10
};

function assertExactCoverage(items) {
  assert.equal(items.length, 94);
  const totals = {};
  for (const item of items) {
    const key = `${item.page}/${item.source}`;
    totals[key] = (totals[key] ?? 0) + 1;
  }
  assert.deepEqual(totals, EXPECTED_PAGE_SOURCE_TOTALS);
}

function assertIdSourceCorrespondence(items) {
  for (const item of items) {
    if (item.id.includes("-article-")) {
      assert.equal(item.source, "article-highlight", `${item.id} must use source article-highlight`);
    }
    if (item.id.includes("-exercise-")) {
      assert.equal(item.source, "exercise", `${item.id} must use source exercise`);
    }
  }
}

test("dataset has the exact verified page and source totals", () => {
  assertExactCoverage(VOCABULARY);
});

test("each ID source segment corresponds to its source field", () => {
  assertIdSourceCorrespondence(VOCABULARY);
});

test("all records are complete, unique, and cover pages 1-5", () => {
  assert.equal(new Set(VOCABULARY.map((item) => item.id)).size, VOCABULARY.length);
  assert.deepEqual([...new Set(VOCABULARY.map((item) => item.page))].sort(), [1, 2, 3, 4, 5]);
  for (const item of VOCABULARY) {
    assert.match(item.id, /^p[1-5]-(exercise|article)-[a-z0-9-]+$/);
    assert.ok(item.term.trim() && item.definition.trim() && item.zh.trim());
    assert.ok(["exercise", "article-highlight"].includes(item.source));
  }
});

test("article records are highlighted page 2 items only", () => {
  const article = VOCABULARY.filter((item) => item.source === "article-highlight");
  assert.ok(article.length > 0);
  assert.ok(article.every((item) => item.page === 2));
  for (const term of ["backbone", "constant feedback loop", "contextual meaning"]) {
    assert.ok(article.some((item) => item.term.toLowerCase() === term));
  }
});

test("article records preserve the exact highlighted forms", () => {
  const terms = VOCABULARY
    .filter((item) => item.source === "article-highlight")
    .map((item) => item.term.toLowerCase())
    .sort();
  assert.deepEqual(terms, [
    "backbone",
    "constant feedback loop",
    "contextual meaning",
    "indistinguishable",
    "mountains of relevant data",
    "nuances",
    "overlooked",
    "self-sufficient",
    "uncover",
    "unpredictable"
  ].sort());
});

test("page 2 preserves the printed virtual assistant record", () => {
  const item = VOCABULARY.find(({ id }) => id === "p2-exercise-virtual-assistant");
  assert.deepEqual(item, {
    id: "p2-exercise-virtual-assistant",
    term: "virtual assistant",
    definition: "a computer program or device connected to the internet that can understand spoken questions and instructions, designed to help you make plans, find answers to questions, etc.",
    zh: "虛擬助理",
    page: 2,
    source: "exercise"
  });
});
