# PDF Practice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add nine PDF-ordered worksheet groups with 96 click-to-fill prompts while preserving every existing flashcard, quiz, mistake-review, offline, and GitHub Pages feature.

**Architecture:** Keep the worksheet content in a dedicated `src/worksheet.js` data module, place immutable assignment/grading/persistence rules in `src/core.js`, and render the new `PDF Practice` view from `src/app.js`. Extend the current build script so the modular website and self-contained offline HTML are generated from the same four source modules.

**Tech Stack:** Semantic HTML, responsive CSS, vanilla JavaScript ES modules as maintainable sources, generated classic-script bundle, Node.js built-in test runner, GitHub Pages.

## Global Constraints

- Preserve the existing Flashcards, all-94 quiz, random-10 quiz, mistake review, progress, and offline behavior.
- The similar-word quiz is cancelled and must not be implemented.
- Use the source PDF at `D:\大學\交換學生\English of computer science\電腦科學_260717_144808.pdf` as the authority for wording, grouping, and order.
- Definition Matching contains eight groups and 84 prompts; Sentence Completion contains one group and 12 prompts.
- Page 2 article content is limited to the ten approved highlighted terms.
- Worksheet order and word-bank order are never randomized.
- Use click-word-then-slot interaction; do not add drag-and-drop or typed worksheet answers.
- Persist worksheet work locally without any network requests.
- Keep `src/app.bundle.js` and `vocabulary-review-offline.html` generated and synchronized.
- Do not add third-party runtime dependencies or remote assets.

---

## File Structure

- Create `src/worksheet.js`: the nine immutable PDF worksheet groups and their vocabulary mappings.
- Create `tests/worksheet.test.mjs`: dataset inventory, source-order, answer integrity, and highlighted-article tests.
- Modify `src/core.js`: pure worksheet assignment, removal, grading, and saved-progress sanitization helpers.
- Modify `tests/core.test.mjs`: unit tests for every worksheet state rule.
- Modify `index.html`: fourth navigation button and the complete accessible PDF Practice view.
- Modify `styles.css`: paper-like responsive word-bank, prompt-row, answer-state, and mobile styles.
- Modify `src/app.js`: worksheet state, rendering, click/keyboard actions, scoring, Mistakes integration, and persistence.
- Modify `tests/interface-contract.test.mjs`: source HTML, CSS, and app wiring contracts.
- Modify `scripts/build-bundle.mjs`: include `src/worksheet.js` in the generated bundle.
- Modify `tests/static-page.test.mjs`: modular/offline equivalence and no-network contracts.
- Regenerate `src/app.bundle.js` and `vocabulary-review-offline.html`.

---

### Task 1: Add the PDF worksheet dataset

**Files:**
- Create: `src/worksheet.js`
- Create: `tests/worksheet.test.mjs`

**Interfaces:**
- Consumes: vocabulary IDs exported by `src/vocabulary.js`.
- Produces: `WORKSHEET_GROUPS: WorksheetGroup[]`.
- `WorksheetGroup` shape:

```js
{
  id: "p1-definition-matching",
  label: "PDF Page 1 · Definition Matching",
  page: 1,
  type: "definition-matching",
  wordBank: [
    {
      id: "algorithm",
      term: "algorithm",
      vocabularyId: "p1-exercise-algorithm"
    }
  ],
  prompts: [
    {
      id: "p1-definition-01",
      text: "A procedure, instructions, or formula for solving a problem or completing a task.",
      answerId: "algorithm"
    }
  ]
}
```

- Sentence prompts use one literal `{{blank}}` token:

```js
{
  id: "p1-sentence-01",
  text: "Netflix’s {{blank}} programming looks at what I watch, and gives me personalized recommendations of other shows I might enjoy.",
  answerId: "machine-learning"
}
```

- [ ] **Step 1: Write the failing inventory and integrity tests**

Create `tests/worksheet.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the worksheet tests and confirm the missing module failure**

Run:

```powershell
node --test tests/worksheet.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/worksheet.js`.

- [ ] **Step 3: Transcribe the nine approved groups into the data module**

Create `src/worksheet.js` using the exact schema above. Populate groups in the `expectedGroups` order. Copy each printed English definition and each of the 12 complete sentence prompts from the source PDF; use the rendered PDF, not handwritten answers, as the wording authority.

Use stable slug IDs. Every word-bank item must map to the matching existing vocabulary record, including the article-highlight record for `p2-article-definition-matching`. Export the completed nine-object array as `WORKSHEET_GROUPS`.

The implementation is complete only when the array contains 96 concrete prompt objects and no generated filler, placeholder, or handwritten annotation text.

- [ ] **Step 4: Run data tests and the existing vocabulary tests**

Run:

```powershell
node --test tests/worksheet.test.mjs tests/vocabulary.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the verified worksheet data**

```powershell
git add src/worksheet.js tests/worksheet.test.mjs
git commit -m "feat: add PDF worksheet data"
```

---

### Task 2: Implement pure worksheet state and grading rules

**Files:**
- Modify: `src/core.js`
- Modify: `tests/core.test.mjs`

**Interfaces:**
- Produces:
  - `assignWorksheetAnswer(assignments, promptId, wordId): Record<string, string>`
  - `removeWorksheetAnswer(assignments, promptId): Record<string, string>`
  - `gradeWorksheetGroup(group, assignments): WorksheetGrade`
  - `defaultWorksheetProgress(): { groups: Record<string, WorksheetGroupProgress> }`
  - `mergeWorksheetProgress(value, groups): WorksheetProgress`
  - `worksheetProgressStorage(storage, key, groups): { load, save, clear }`
  - `worksheetMistakeVocabularyIds(group, grade): string[]`
- `WorksheetGrade`:

```js
{
  correct: 1,
  total: 3,
  results: [
    { promptId: "one", status: "correct", answerId: "a" },
    { promptId: "two", status: "incorrect", answerId: "b" },
    { promptId: "three", status: "unanswered", answerId: "c" }
  ]
}
```

- `WorksheetGroupProgress`:

```js
{
  assignments: { "prompt-id": "word-id" },
  score: { correct: 1, total: 2 }
}
```

- [ ] **Step 1: Add failing assignment, grading, and sanitization tests**

Append to `tests/core.test.mjs`:

```js
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
    prompts: [{ id: "p1" }, { id: "p2" }]
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
```

- [ ] **Step 2: Run the focused tests and confirm missing exports**

Run:

```powershell
node --test tests/core.test.mjs
```

Expected: FAIL because `assignWorksheetAnswer` and the other worksheet helpers do not exist.

- [ ] **Step 3: Implement immutable worksheet helpers**

Add to `src/core.js`:

```js
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
    const score = saved.score
      && Number.isInteger(saved.score.correct)
      && saved.score.correct >= 0
      && saved.score.total === group.prompts.length
      ? { correct: saved.score.correct, total: saved.score.total }
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
```

- [ ] **Step 4: Run the complete core test file**

Run:

```powershell
node --test tests/core.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the worksheet domain rules**

```powershell
git add src/core.js tests/core.test.mjs
git commit -m "feat: add worksheet grading rules"
```

---

### Task 3: Add the accessible PDF Practice structure and responsive styles

**Files:**
- Modify: `index.html`
- Modify: `styles.css`
- Modify: `tests/interface-contract.test.mjs`

**Interfaces:**
- Produces the following DOM IDs for Task 4:
  - `pdf-practice-view`
  - `worksheet-type`
  - `worksheet-group`
  - `worksheet-label`
  - `worksheet-progress`
  - `worksheet-bank`
  - `worksheet-prompts`
  - `worksheet-score`
  - `check-worksheet`
  - `reset-worksheet`
  - `previous-worksheet`
  - `next-worksheet`

- [ ] **Step 1: Extend interface tests with the fourth view and worksheet controls**

Update `tests/interface-contract.test.mjs`:

```js
const requiredIds = [
  "cards-view", "quiz-view", "mistakes-view", "pdf-practice-view",
  "card-order", "card-count", "flashcard", "card-front", "card-back",
  "previous-card", "flip-card", "mark-review", "mark-familiar", "next-card",
  "quiz-mode", "quiz-scope", "start-quiz", "quiz-stage", "quiz-feedback",
  "next-question", "mistake-list", "retry-mistakes", "clear-progress",
  "worksheet-type", "worksheet-group", "worksheet-label", "worksheet-progress",
  "worksheet-bank", "worksheet-prompts", "worksheet-score",
  "check-worksheet", "reset-worksheet",
  "previous-worksheet", "next-worksheet", "status-message"
];
```

Change the view-button assertion to:

```js
assert.equal((html.match(/data-view-button=/g) || []).length, 4);
```

Extend the style contract:

```js
assert.match(css, /\.worksheet-bank[\s\S]*flex-wrap\s*:\s*wrap/);
assert.match(css, /\.worksheet-slot[\s\S]*min-height\s*:\s*44px/);
assert.match(css, /\[data-status=["']correct["']\]/);
assert.match(css, /\[data-status=["']incorrect["']\]/);
assert.match(css, /\[data-status=["']unanswered["']\]/);
```

- [ ] **Step 2: Run the interface tests and confirm missing markup**

Run:

```powershell
node --test tests/interface-contract.test.mjs
```

Expected: FAIL for `#pdf-practice-view` and the new worksheet IDs.

- [ ] **Step 3: Add the fourth navigation view and worksheet skeleton**

Add this navigation button in `index.html`:

```html
<button type="button"
        data-view-button="pdf-practice-view"
        aria-controls="pdf-practice-view"
        aria-pressed="false">PDF Practice</button>
```

Add this section after `quiz-view`:

```html
<section id="pdf-practice-view"
         class="view"
         aria-labelledby="pdf-practice-heading"
         hidden>
  <div class="section-heading">
    <div>
      <p class="eyebrow">Worksheet</p>
      <h2 id="pdf-practice-heading">PDF Practice</h2>
    </div>
  </div>

  <div class="worksheet-setup">
    <label for="worksheet-type">Practice type
      <select id="worksheet-type">
        <option value="definition-matching">Definition Matching</option>
        <option value="sentence-completion">Sentence Completion</option>
      </select>
    </label>
    <label for="worksheet-group">PDF exercise
      <select id="worksheet-group"></select>
    </label>
  </div>

  <article class="worksheet-sheet" aria-labelledby="worksheet-label">
    <p id="worksheet-progress" class="count"></p>
    <h3 id="worksheet-label"></h3>
    <p class="worksheet-instructions">
      Select a word, then select an answer slot.
    </p>
    <div id="worksheet-bank"
         class="worksheet-bank"
         role="group"
         aria-label="Word bank"></div>
    <ol id="worksheet-prompts" class="worksheet-prompts"></ol>
    <p id="worksheet-score"
       class="worksheet-score"
       role="status"
       aria-live="polite"></p>
  </article>

  <div class="action-row worksheet-actions">
    <button id="previous-worksheet" type="button">Previous exercise</button>
    <button id="check-worksheet" type="button" class="primary">Check answers</button>
    <button id="reset-worksheet" type="button">Try again</button>
    <button id="next-worksheet" type="button">Next exercise</button>
  </div>
</section>
```

- [ ] **Step 4: Add paper-like responsive and state styles**

Add focused rules to `styles.css`:

```css
.worksheet-setup,
.worksheet-bank,
.worksheet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.worksheet-sheet {
  margin-top: 1rem;
  padding: clamp(1rem, 3vw, 2rem);
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: var(--surface);
}

.worksheet-bank button {
  min-height: 44px;
}

.worksheet-bank button[aria-pressed="true"] {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.worksheet-bank button[data-used="true"] {
  opacity: 0.58;
}

.worksheet-prompts {
  display: grid;
  gap: 0.75rem;
  padding-left: 1.5rem;
}

.worksheet-prompt {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
}

.worksheet-slot {
  min-height: 44px;
  min-width: min(100%, 14rem);
  margin: 0.35rem;
  border: 2px dashed var(--accent);
}

.worksheet-prompt[data-status="correct"] .worksheet-result::before {
  content: "✓ ";
}

.worksheet-prompt[data-status="incorrect"] .worksheet-result::before,
.worksheet-prompt[data-status="unanswered"] .worksheet-result::before {
  content: "✗ ";
}

@media (max-width: 600px) {
  .worksheet-prompt {
    display: grid;
  }

  .worksheet-slot {
    width: 100%;
    margin-inline: 0;
  }
}
```

Use the project’s existing CSS variable names for border and status colors. Add explicit text styles for `.worksheet-result`; status must remain readable without color.

- [ ] **Step 5: Run interface tests**

Run:

```powershell
node --test tests/interface-contract.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 6: Commit the worksheet interface**

```powershell
git add index.html styles.css tests/interface-contract.test.mjs
git commit -m "feat: add PDF practice interface"
```

---

### Task 4: Wire worksheet rendering, interaction, scoring, and persistence

**Files:**
- Modify: `src/app.js`
- Modify: `tests/interface-contract.test.mjs`

**Interfaces:**
- Consumes `WORKSHEET_GROUPS` from Task 1.
- Consumes all seven worksheet helpers from Task 2.
- Uses storage key `cs-pdf-practice-v1`.
- Keeps existing vocabulary progress under `cs-vocabulary-progress-v1`.

- [ ] **Step 1: Add failing app-wiring contract assertions**

Append to the app-source test in `tests/interface-contract.test.mjs`:

```js
assert.match(app, /from\s+["']\.\/worksheet\.js["']/);
assert.match(app, /cs-pdf-practice-v1/);
assert.match(app, /assignWorksheetAnswer/);
assert.match(app, /removeWorksheetAnswer/);
assert.match(app, /gradeWorksheetGroup/);
assert.match(app, /mergeWorksheetProgress/);
assert.match(app, /worksheetProgressStorage/);
assert.match(app, /worksheetMistakeVocabularyIds/);
assert.match(app, /worksheetScore\.textContent\s*=/);
assert.doesNotMatch(app, /\.innerHTML\s*=/);
```

- [ ] **Step 2: Run the focused interface test and confirm failure**

Run:

```powershell
node --test tests/interface-contract.test.mjs
```

Expected: FAIL because `src/app.js` does not import or render worksheets.

- [ ] **Step 3: Add worksheet imports, element references, storage, and state**

At the top of `src/app.js`, import:

```js
import { WORKSHEET_GROUPS } from "./worksheet.js";
```

Extend the core import with:

```js
assignWorksheetAnswer,
defaultWorksheetProgress,
gradeWorksheetGroup,
mergeWorksheetProgress,
removeWorksheetAnswer,
worksheetMistakeVocabularyIds,
worksheetProgressStorage
```

Add:

```js
const WORKSHEET_STORAGE_KEY = "cs-pdf-practice-v1";
const worksheetById = new Map(WORKSHEET_GROUPS.map((group) => [group.id, group]));
```

Add all Task 3 worksheet IDs to `elements`. In the existing storage availability `try`/`catch`, create both stores from the same tested storage object:

```js
let worksheetStore;
try {
  const storage = window.localStorage;
  const probeKey = `${STORAGE_KEY}-probe`;
  storage.setItem(probeKey, "1");
  storage.removeItem(probeKey);
  store = progressStorage(storage, STORAGE_KEY);
  worksheetStore = worksheetProgressStorage(
    storage,
    WORKSHEET_STORAGE_KEY,
    WORKSHEET_GROUPS
  );
} catch {
  storageAvailable = false;
  store = progressStorage(unavailableStorage, STORAGE_KEY);
  worksheetStore = worksheetProgressStorage(
    unavailableStorage,
    WORKSHEET_STORAGE_KEY,
    WORKSHEET_GROUPS
  );
}
```

Extend state:

```js
worksheet: {
  type: "definition-matching",
  groupId: "p1-definition-matching",
  selectedWordId: null,
  progress: worksheetStore.load(),
  grade: null
}
```

- [ ] **Step 4: Implement group selection and safe worksheet rendering**

Add functions with no `innerHTML`:

```js
function worksheetGroupsForType(type) {
  return WORKSHEET_GROUPS.filter((group) => group.type === type);
}

function currentWorksheetGroup() {
  return worksheetById.get(state.worksheet.groupId) || null;
}

function currentWorksheetProgress() {
  const group = currentWorksheetGroup();
  if (!group) return { assignments: {}, score: null };
  return state.worksheet.progress.groups[group.id] || {
    assignments: {},
    score: null
  };
}

function saveWorksheetProgress(message = "") {
  if (!worksheetStore.save(state.worksheet.progress)) storageAvailable = false;
  announce(message);
}
```

Implement `renderWorksheetSelectors()` so type selection filters group choices and preserves PDF order. Implement `renderWorksheet()` so it:

- reports an unavailable message if the group is missing;
- renders one button per word-bank item with `aria-pressed` and `data-used`;
- renders prompts with a button `.worksheet-slot`;
- splits sentence text once on `{{blank}}` and places the slot between two text nodes;
- renders definitions as prompt text followed by the slot;
- attaches visible `Correct`, `Incorrect`, or `Not answered` text when a grade exists;
- prints the correct word for incorrect/unanswered rows;
- regrades restored assignments for row feedback when a saved score exists, and displays the saved `Score: X / Y`;
- sets previous/next disabled states at the filtered group boundaries.

- [ ] **Step 5: Implement click-to-fill, removal, checking, reset, and navigation**

Use these state transitions:

```js
function selectWorksheetWord(wordId) {
  state.worksheet.selectedWordId =
    state.worksheet.selectedWordId === wordId ? null : wordId;
  renderWorksheet();
}

function activateWorksheetSlot(promptId) {
  const group = currentWorksheetGroup();
  const saved = currentWorksheetProgress();
  const assignments = state.worksheet.selectedWordId
    ? assignWorksheetAnswer(
        saved.assignments,
        promptId,
        state.worksheet.selectedWordId
      )
    : removeWorksheetAnswer(saved.assignments, promptId);
  state.worksheet.progress.groups[group.id] = { assignments, score: null };
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  saveWorksheetProgress();
  renderWorksheet();
}
```

Implement `checkWorksheet()`:

1. Grade the group.
2. Store `{ correct, total }` for this group.
3. Call `worksheetMistakeVocabularyIds(group, grade)` and add every returned ID to the existing `state.progress.mistakes` set.
4. Do not remove any existing mistake IDs.
5. Save both stores.
6. Render `Score: X / Y`.

Implement `resetWorksheet()` to replace only the current group with `{ assignments: {}, score: null }`. Implement previous/next movement within the current type. A type change selects that type’s first group.

- [ ] **Step 6: Connect events and global clearing**

Add listeners for type/group changes, check, reset, previous, and next. When `setView("pdf-practice-view")` runs, render selectors and the current worksheet.

Extend the existing confirmed `Clear saved progress` action to:

```js
state.worksheet.progress = defaultWorksheetProgress();
state.worksheet.grade = null;
state.worksheet.selectedWordId = null;
if (!worksheetStore.clear()) storageAvailable = false;
```

Do not change the confirmation wording or existing vocabulary reset behavior.

- [ ] **Step 7: Run interface and core tests**

Run:

```powershell
node --test tests/interface-contract.test.mjs tests/core.test.mjs tests/worksheet.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 8: Commit the interactive worksheet**

```powershell
git add src/app.js tests/interface-contract.test.mjs
git commit -m "feat: make PDF worksheets interactive"
```

---

### Task 5: Synchronize the bundle and self-contained offline HTML

**Files:**
- Modify: `scripts/build-bundle.mjs`
- Modify: `tests/static-page.test.mjs`
- Regenerate: `src/app.bundle.js`
- Regenerate: `vocabulary-review-offline.html`

**Interfaces:**
- Build order must be `vocabulary.js`, `worksheet.js`, `core.js`, then `app.js`.
- The app import-removal expression must strip both data-module imports and the core import.

- [ ] **Step 1: Add failing static build and offline-equivalence tests**

Update required IDs in `tests/static-page.test.mjs` to include:

```js
"pdf-practice-view", "worksheet-type", "worksheet-group",
"worksheet-bank", "worksheet-prompts", "worksheet-score",
"check-worksheet", "reset-worksheet"
```

Add:

```js
test("generated runtime includes the complete worksheet dataset", async () => {
  const bundle = await readProjectFile("src/app.bundle.js");
  const offline = await readProjectFile("vocabulary-review-offline.html");
  for (const source of [bundle, offline]) {
    assert.match(source, /p1-definition-matching/);
    assert.match(source, /p2-article-definition-matching/);
    assert.match(source, /p1-sentence-completion/);
    assert.match(source, /cs-pdf-practice-v1/);
  }
});
```

- [ ] **Step 2: Run static tests and confirm the generated outputs are missing worksheets**

Run:

```powershell
node --test tests/static-page.test.mjs
```

Expected: FAIL because the generated bundle does not contain worksheet data.

- [ ] **Step 3: Include the worksheet module in the build**

Change the build source reads:

```js
const [
  vocabularySource,
  worksheetSource,
  coreSource,
  appSource,
  indexSource,
  stylesSource
] = await Promise.all([
  readSource("src/vocabulary.js"),
  readSource("src/worksheet.js"),
  readSource("src/core.js"),
  readSource("src/app.js"),
  readSource("index.html"),
  readSource("styles.css")
]);
```

Convert the worksheet export and add it between vocabulary and core:

```js
const worksheet = worksheetSource.replace(/^export\s+/m, "");
const bundle = `${banner}(() => {\n"use strict";\n${vocabulary}\n${worksheet}\n${core}\n${app}\n})();\n`;
```

Replace the current app import-removal expression with one that explicitly strips:

```js
const app = appSource
  .replace(/^import\s+{\s*VOCABULARY\s*}\s+from\s+["']\.\/vocabulary\.js["'];\r?\n/, "")
  .replace(/^import\s+{\s*WORKSHEET_GROUPS\s*}\s+from\s+["']\.\/worksheet\.js["'];\r?\n/, "")
  .replace(/^import\s+{[\s\S]*?}\s+from\s+["']\.\/core\.js["'];\r?\n/, "");
```

- [ ] **Step 4: Build and run static tests**

Run:

```powershell
npm run build
node --test tests/static-page.test.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Run syntax and no-network checks**

Run:

```powershell
npm run check
```

Expected: build succeeds, JavaScript syntax checks pass, all nine static tests pass, and no remote resource check fails.

- [ ] **Step 6: Commit source and generated artifacts**

```powershell
git add scripts/build-bundle.mjs tests/static-page.test.mjs src/app.bundle.js vocabulary-review-offline.html
git commit -m "build: include PDF practice offline"
```

---

### Task 6: Full regression and browser verification

**Files:**
- Modify only if verification exposes a defect in files already owned by Tasks 1–5.

**Interfaces:**
- Verifies the acceptance criteria; produces no new runtime API.

- [ ] **Step 1: Run the complete automated suite**

Run:

```powershell
npm test
npm run check
```

Expected: every test passes with zero failures.

- [ ] **Step 2: Audit generated and repository content**

Run:

```powershell
git diff --check
git status --short
rg -n "https?://|fetch|XMLHttpRequest|WebSocket" index.html src styles.css vocabulary-review-offline.html
```

Expected:

- `git diff --check` has no output.
- Only intentional feature files are modified.
- No runtime network API or remote asset appears.

- [ ] **Step 3: Verify the modular site in a real browser**

Start the existing static site locally and use the Playwright CLI:

```powershell
npx --yes --package http-server http-server . -p 4173 -c-1
npx --yes --package @playwright/cli playwright-cli -s=pdf-practice open http://127.0.0.1:4173/
```

Snapshot before each referenced click. Verify:

1. The navigation contains four modes.
2. Existing Flashcards still shows `1 / 94`.
3. Existing Quiz starts at `Question 1 / 94`.
4. PDF Practice defaults to `Definition Matching` and page 1.
5. Selecting a word then a slot fills the slot.
6. Moving the same word to another slot clears its first slot.
7. Clicking a filled slot with no selected word removes the answer.
8. Partial checking shows Correct/Incorrect/Not answered text and a score.
9. `Try again` clears only the current group.
10. Sentence Completion shows 12 numbered sentences with inline slots.
11. Reload restores saved worksheet answers.
12. Browser console contains zero errors.

- [ ] **Step 4: Verify phone layout**

Resize the same browser session to `390 × 844`. Confirm:

- word-bank controls wrap without horizontal scrolling;
- prompt rows stack;
- every word and slot button remains at least 44px high;
- score and correctness labels are readable without relying on color.

- [ ] **Step 5: Verify the self-contained offline HTML**

Open `vocabulary-review-offline.html` directly in the browser. Repeat one definition assignment, one sentence assignment, checking, and reload persistence. Confirm the Network panel contains no external requests.

- [ ] **Step 6: Clean temporary browser artifacts and run a final fresh suite**

Remove only the Playwright snapshots and local test artifacts created by this task, then run:

```powershell
npm test
npm run check
git status --short
```

Expected: all tests pass and the worktree contains only intentional changes or is clean after commits.

- [ ] **Step 7: Commit any verification-only fixes**

If a defect required a source change, commit only that fix:

```powershell
git add src/worksheet.js src/core.js src/app.js src/app.bundle.js index.html styles.css scripts/build-bundle.mjs tests/worksheet.test.mjs tests/core.test.mjs tests/interface-contract.test.mjs tests/static-page.test.mjs vocabulary-review-offline.html
git commit -m "fix: polish PDF practice behavior"
```

If no source change was required, do not create an empty commit.

---

### Task 7: Review, merge, publish, and verify GitHub Pages

**Files:**
- No new feature files.

**Interfaces:**
- Publishes the reviewed commit to `origin/main`.

- [ ] **Step 1: Request a whole-branch code review**

Review the complete diff against `docs/superpowers/specs/2026-07-25-pdf-practice-design.md`. Resolve every Critical or Important issue, rerun the affected tests, and commit fixes before continuing.

- [ ] **Step 2: Confirm final branch health**

Run:

```powershell
npm test
npm run check
git diff --check
git status --short
```

Expected: all tests pass, no whitespace errors, and the worktree is clean.

- [ ] **Step 3: Merge with the user-approved finishing method**

Use `superpowers:finishing-a-development-branch`. If the user again selects local merge, fast-forward `main` from the isolated implementation branch and rerun:

```powershell
npm test
npm run check
```

- [ ] **Step 4: Push the exact verified main commit**

```powershell
git push origin main
```

- [ ] **Step 5: Verify GitHub Pages deployed the pushed SHA**

Compare:

```powershell
git rev-parse HEAD
git rev-parse origin/main
gh api repos/iu-sys/computer-science-vocabulary-review/pages/builds/latest --jq '{status: .status, commit: .commit, error: .error.message}'
```

Expected: local `HEAD`, `origin/main`, and the Pages build commit are identical; Pages status is `built` and error is `null`.

- [ ] **Step 6: Verify production behavior**

Use Playwright CLI on:

`https://iu-sys.github.io/computer-science-vocabulary-review/`

Confirm PDF Practice is available, one click-to-fill answer works, Sentence Completion contains 12 prompts, the console has zero errors, and both the hosted index and hosted `vocabulary-review-offline.html` return HTTP 200.
