import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const readProjectFile = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("page exposes the complete accessible study interface", async () => {
  const html = await readProjectFile("index.html");
  const requiredIds = [
    "cards-view", "quiz-view", "mistakes-view",
    "card-order", "card-count", "flashcard", "card-front", "card-back",
    "previous-card", "flip-card", "mark-review", "mark-familiar", "next-card",
    "quiz-mode", "quiz-scope", "start-quiz", "quiz-stage", "quiz-feedback",
    "next-question", "mistake-list", "retry-mistakes", "clear-progress",
    "status-message"
  ];

  for (const id of requiredIds) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  }
  assert.equal((html.match(/data-view-button=/g) || []).length, 3);
  assert.match(html, /<main\b/);
  assert.match(html, /aria-live=["']polite["']/);
  assert.match(html, /<link[^>]+href=["']\.\/styles\.css["']/);
  assert.match(html, /<script[^>]+src=["']\.\/src\/app\.bundle\.js["']/);
  assert.doesNotMatch(html, /https?:\/\//i);
});

test("styles provide responsive, touch-friendly, non-color-only presentation", async () => {
  const css = await readProjectFile("styles.css");

  assert.match(css, /:root\s*{[^}]*--(?:background|bg|surface|text|accent)/s);
  assert.match(css, /@media\s*\([^)]*max-width\s*:\s*600px\s*\)/);
  assert.match(css, /max-width\s*:\s*900px/);
  assert.match(css, /min-height\s*:\s*280px/);
  assert.match(css, /min-height\s*:\s*44px/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /flex-wrap\s*:\s*wrap/);
  assert.doesNotMatch(css, /height\s*:\s*100vh/);
  assert.doesNotMatch(css, /overflow-x\s*:\s*hidden/);
});

test("app source includes required state, quiz, persistence, and safe-rendering contracts", async () => {
  const app = await readProjectFile("src/app.js");

  assert.match(app, /import\s+{\s*VOCABULARY\s*}\s+from\s+["']\.\/vocabulary\.js["']/);
  assert.match(app, /from\s+["']\.\/core\.js["']/);
  assert.match(app, /cs-vocabulary-progress-v1/);
  assert.match(app, /term-to-zh/);
  assert.match(app, /definition-to-term/);
  assert.match(app, /spelling/);
  assert.match(app, /\.textContent\s*=/);
  assert.doesNotMatch(app, /\.innerHTML\s*=/);
  assert.match(app, /\.hidden\s*=/);
  assert.match(app, /aria-pressed/);
  assert.match(app, /localStorage/);
  assert.match(app, /confirm\(["']確定要清除所有熟悉度、錯題和測驗紀錄嗎？["']\)/);
  assert.match(app, /submitSpelling:\s*document\.querySelector\(["']#submit-spelling["']\)/);
  assert.match(app, /submitSpelling\.disabled\s*=\s*true/);
  assert.match(app, /submitSpelling\.disabled\s*=\s*false/);
});
