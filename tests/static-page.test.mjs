import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("page exposes required controls and no remote resources", async () => {
  const html = await readProjectFile("index.html");
  for (const id of [
    "cards-view", "quiz-view", "mistakes-view", "flashcard",
    "quiz-mode", "quiz-scope", "start-quiz", "clear-progress"
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

test("mistake quiz scope accurately describes the ten-question cap", async () => {
  const html = await readProjectFile("index.html");
  assert.match(html, /<option value="mistakes">Up to 10 mistakes<\/option>/);
});

test("page prevents an implicit favicon network request", async () => {
  const html = await readProjectFile("index.html");
  assert.match(html, /<link rel="icon" href="data:,">/);
});
