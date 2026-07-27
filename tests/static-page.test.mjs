import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("page exposes required controls and no remote resources", async () => {
  const html = await readProjectFile("index.html");
  for (const id of [
    "cards-view", "quiz-view", "mistakes-view", "flashcard",
    "quiz-mode", "quiz-scope", "start-quiz", "clear-progress",
    "pdf-practice-view", "worksheet-type", "worksheet-group",
    "worksheet-bank", "worksheet-prompts", "worksheet-score",
    "check-worksheet", "reset-worksheet", "open-sentence-completion"
  ]) {
    assert.ok(html.includes(`id="${id}"`), `missing #${id}`);
  }
  assert.doesNotMatch(html, /https?:\/\//i);
});

test("runtime makes no network requests", async () => {
  const sources = await Promise.all([
    readProjectFile("src/app.js"),
    readProjectFile("src/app.bundle.js")
  ]);
  assert.doesNotMatch(sources.join("\n"), /\b(fetch|XMLHttpRequest|WebSocket)\b/);
});

test("direct-file entry point uses one local classic script", async () => {
  const html = await readProjectFile("index.html");
  assert.match(html, /<script\s+src="\.\/src\/app\.bundle\.js"><\/script>/);
  assert.doesNotMatch(html, /<script[^>]+type=["']module["']/);
});

test("quiz scope defaults to all words and retains short practice options", async () => {
  const html = await readProjectFile("index.html");
  const allIndex = html.indexOf('<option value="all">All 106 words</option>');
  const randomIndex = html.indexOf('<option value="random">10 random questions</option>');
  const mistakesIndex = html.indexOf('<option value="mistakes">Up to 10 mistakes</option>');

  assert.ok(allIndex >= 0);
  assert.ok(randomIndex > allIndex);
  assert.ok(mistakesIndex > randomIndex);
});

test("page prevents an implicit favicon network request", async () => {
  const html = await readProjectFile("index.html");
  assert.match(html, /<link rel="icon" href="data:,">/);
});

test("offline artifact is one self-contained classic-script document", async () => {
  const html = await readProjectFile("vocabulary-review-offline.html");

  assert.match(html, /<style>[\s\S]*<\/style>/);
  assert.match(html, /<script>[\s\S]*<\/script>/);
  assert.doesNotMatch(html, /<link[^>]+rel=["']stylesheet["']/i);
  assert.doesNotMatch(html, /<script[^>]+src=/i);
  assert.doesNotMatch(html, /<script[^>]+type=["']module["']/i);
});

test("offline artifact has no imports, network APIs, or remote URLs", async () => {
  const html = await readProjectFile("vocabulary-review-offline.html");

  assert.doesNotMatch(html, /\bimport\s+(?:[({*]|[\w$])/);
  assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|WebSocket)\b/);
  assert.doesNotMatch(html, /https?:\/\//i);
});

test("offline artifact exposes every required study control", async () => {
  const html = await readProjectFile("vocabulary-review-offline.html");
  for (const id of [
    "cards-view", "quiz-view", "mistakes-view", "flashcard",
    "quiz-mode", "quiz-scope", "start-quiz", "clear-progress",
    "pdf-practice-view", "worksheet-type", "worksheet-group",
    "worksheet-bank", "worksheet-prompts", "worksheet-score",
    "check-worksheet", "reset-worksheet", "open-sentence-completion"
  ]) {
    assert.ok(html.includes(`id="${id}"`), `offline artifact missing #${id}`);
  }
});

test("generated runtime includes the complete worksheet dataset", async () => {
  const bundle = await readProjectFile("src/app.bundle.js");
  const offline = await readProjectFile("vocabulary-review-offline.html");
  for (const source of [bundle, offline]) {
    assert.match(source, /p1-definition-matching/);
    assert.match(source, /p2-article-definition-matching/);
    assert.match(source, /p1-sentence-completion/);
    assert.match(source, /open-sentence-completion/);
    assert.match(source, /PDF Page 1 \\u00b7 Exercise 4 \\u00b7 Sentence Completion/);
    assert.match(source, /cs-pdf-practice-v1/);
    assert.match(source, /p6-vr-definition-matching/);
    assert.match(source, /p6-vr-head-mounted-display/);
    assert.match(source, /Page 6 · VR Mini-glossary/);
    assert.doesNotMatch(source, /Page 6 繚 VR Mini-glossary/);
  }
  assert.match(
    offline,
    /<button[^>]+id="open-sentence-completion"[^>]*>第 1 頁第 4 題 · 句子填空（12 題）<\/button>/
  );
});
