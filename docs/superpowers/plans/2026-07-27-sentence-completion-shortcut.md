# Page 1 Exercise 4 Shortcut Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a prominent one-click shortcut to the existing Page 1 Exercise 4 sentence-completion worksheet while preserving the separate Page 1 definition-matching exercise and all existing study behavior.

**Architecture:** Keep both existing worksheet groups and their saved-progress keys unchanged. Add one native button to PDF Practice that switches the current worksheet state to `p1-sentence-completion`, then use the existing selector, renderer, grading, mistakes, and persistence paths. Regenerate the browser bundle and self-contained offline HTML through the existing build script.

**Tech Stack:** Static HTML/CSS, JavaScript ES modules, Node.js built-in test runner, existing Node build script, Playwright CLI, Git, GitHub Pages.

## Global Constraints

- Preserve the original 12-question `p1-definition-matching` exercise unchanged.
- Preserve the separate 12-question `p1-sentence-completion` exercise unchanged.
- Do not delete, replace, merge, hide, or duplicate either Page 1 exercise.
- Keep each exercise’s assignments, score, and saved progress independent.
- Keep totals at exactly 106 vocabulary entries and 10 worksheet groups / 108 worksheet prompts.
- Add shortcut ID `open-sentence-completion` with visible copy `第 1 頁第 4 題 · 句子填空（12 題）`.
- Rename only the sentence group’s visible label to `PDF Page 1 · Exercise 4 · Sentence Completion`.
- Keep all existing selectors, navigation, grading, mistakes, persistence, and offline behavior.
- Introduce no dependency or runtime network request.
- Publish only after the complete branch passes final review and is merged to `main`.

## File Map

- `src/worksheet.js`: authoritative worksheet groups and the sentence exercise’s visible label.
- `tests/worksheet.test.mjs`: exact inventory, preservation, prompt order, and label contract.
- `index.html`: visible PDF Practice shortcut button.
- `src/app.js`: shortcut element mapping, state transition, rendering, and status announcement.
- `tests/interface-contract.test.mjs`: maintainable HTML/application control contract.
- `tests/static-page.test.mjs`: source and generated offline control coverage.
- `src/app.bundle.js`: generated classic-script runtime; never edit by hand.
- `vocabulary-review-offline.html`: generated self-contained site; never edit by hand.

---

### Task 1: Preserve Both Page 1 Exercises and Clarify the Sentence Label

**Files:**
- Modify: `tests/worksheet.test.mjs`
- Modify: `src/worksheet.js`

**Interfaces:**
- Consumes: existing worksheet group IDs `p1-definition-matching` and `p1-sentence-completion`.
- Produces: unchanged groups and prompt data, with only the sentence group label changed to `PDF Page 1 · Exercise 4 · Sentence Completion`.

- [ ] **Step 1: Write the failing preservation and label test**

Extend the existing sentence-completion test:

```js
test("both Page 1 exercises remain separate and sentence completion keeps image order", () => {
  const definitionGroup = WORKSHEET_GROUPS.find(
    ({ id }) => id === "p1-definition-matching"
  );
  const sentenceGroup = WORKSHEET_GROUPS.find(
    ({ id }) => id === "p1-sentence-completion"
  );

  assert.equal(definitionGroup.type, "definition-matching");
  assert.equal(definitionGroup.prompts.length, 12);
  assert.equal(sentenceGroup.type, "sentence-completion");
  assert.equal(sentenceGroup.prompts.length, 12);
  assert.notEqual(definitionGroup.id, sentenceGroup.id);
  assert.equal(
    sentenceGroup.label,
    "PDF Page 1 · Exercise 4 · Sentence Completion"
  );
  assert.deepEqual(sentenceGroup.wordBank.map(({ term }) => term), [
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
  for (const prompt of sentenceGroup.prompts) {
    assert.equal(prompt.text.split("{{blank}}").length, 2);
  }
});
```

Keep the existing inventory assertion at 10 groups / 108 prompts.

- [ ] **Step 2: Run the focused test and verify it fails for the label only**

Run: `node --test tests/worksheet.test.mjs`

Expected: FAIL because the current label is `PDF Page 1 · Sentence Completion`; the existing definition and sentence groups, counts, order, and blanks already pass.

- [ ] **Step 3: Change only the sentence group label**

In `src/worksheet.js`, replace:

```js
label: "PDF Page 1 · Sentence Completion",
```

with:

```js
label: "PDF Page 1 · Exercise 4 · Sentence Completion",
```

Do not change either group ID, word bank, prompt, answer ID, page, or type.

- [ ] **Step 4: Run vocabulary and worksheet tests**

Run: `node --test tests/vocabulary.test.mjs tests/worksheet.test.mjs`

Expected: all tests PASS with 106 vocabulary entries and 10 groups / 108 prompts.

- [ ] **Step 5: Commit the data-contract clarification**

```bash
git add src/worksheet.js tests/worksheet.test.mjs
git commit -m "fix: clarify Page 1 sentence exercise label"
```

---

### Task 2: Add the Accessible One-Click Shortcut

**Files:**
- Modify: `tests/interface-contract.test.mjs`
- Modify: `tests/static-page.test.mjs`
- Modify: `index.html`
- Modify: `src/app.js`

**Interfaces:**
- Consumes: group ID `p1-sentence-completion`, existing `worksheetById`, `state.worksheet`, `renderWorksheetSelectors()`, `renderWorksheet()`, and `announce(message)`.
- Produces: native button `#open-sentence-completion` and function `openSentenceCompletion()` that selects the existing group without touching saved progress.

- [ ] **Step 1: Write the failing HTML control tests**

Add `"open-sentence-completion"` to the `requiredIds` array in `tests/interface-contract.test.mjs` and to the source-HTML control array in the first test of `tests/static-page.test.mjs`. Do not add it to the offline-artifact control array yet; Task 3 adds that assertion immediately before regeneration. Add this assertion to the accessible-interface test:

```js
assert.match(
  html,
  /<button[^>]+id=["']open-sentence-completion["'][^>]*>第 1 頁第 4 題 · 句子填空（12 題）<\/button>/
);
```

- [ ] **Step 2: Run the two interface test files and verify they fail**

Run:

```powershell
node --test tests/interface-contract.test.mjs tests/static-page.test.mjs
```

Expected: FAIL because `index.html` does not yet contain `#open-sentence-completion`.

- [ ] **Step 3: Add the shortcut button to `index.html`**

Immediately after the PDF Practice section heading and before `.worksheet-setup`, add:

```html
      <div class="action-row" aria-label="Quick worksheet access">
        <button id="open-sentence-completion" type="button" class="primary">第 1 頁第 4 題 · 句子填空（12 題）</button>
      </div>
```

This reuses the existing responsive `.action-row`, `.primary`, button focus, and 44-pixel touch-target styles; do not add new CSS.

- [ ] **Step 4: Run the HTML control tests and verify the HTML half passes**

Run:

```powershell
node --test tests/interface-contract.test.mjs tests/static-page.test.mjs
```

Expected: the new ID and copy assertions PASS. Any application-contract assertions added in the next step are not present yet.

- [ ] **Step 5: Write the failing application-contract assertions**

In `tests/interface-contract.test.mjs`, extend the application-source test:

```js
assert.match(
  app,
  /openSentenceCompletion:\s*document\.querySelector\(["']#open-sentence-completion["']\)/
);
assert.match(app, /function\s+openSentenceCompletion\s*\(\)/);
assert.match(
  app,
  /openSentenceCompletion\.addEventListener\(["']click["'],\s*openSentenceCompletion\)/
);
assert.match(app, /Opened Page 1 Exercise 4 sentence completion\./);
```

- [ ] **Step 6: Run the interface-contract test and verify it fails**

Run: `node --test tests/interface-contract.test.mjs`

Expected: FAIL because the application has not mapped the button or implemented its handler.

- [ ] **Step 7: Map the button and implement the state transition**

Add to the `elements` map in `src/app.js`:

```js
openSentenceCompletion: document.querySelector("#open-sentence-completion"),
```

Add after `renderWorksheetSelectors()`:

```js
function openSentenceCompletion() {
  const group = worksheetById.get("p1-sentence-completion");
  if (!group) {
    announce("Page 1 Exercise 4 sentence completion is unavailable.");
    return;
  }
  state.worksheet.type = group.type;
  state.worksheet.groupId = group.id;
  state.worksheet.selectedWordId = null;
  state.worksheet.grade = null;
  renderWorksheetSelectors();
  renderWorksheet();
  announce("Opened Page 1 Exercise 4 sentence completion.");
}
```

Register the native click handler with the other worksheet listeners:

```js
elements.openSentenceCompletion.addEventListener(
  "click",
  openSentenceCompletion
);
```

Do not overwrite `state.worksheet.progress`; the group’s existing saved assignments and score must remain intact.

- [ ] **Step 8: Run interface, static, worksheet, and core tests**

Run:

```powershell
node --test tests/interface-contract.test.mjs tests/static-page.test.mjs tests/worksheet.test.mjs tests/core.test.mjs
```

Expected: all selected tests PASS. The original definition group remains the initial selection and both groups retain separate IDs.

- [ ] **Step 9: Commit the shortcut source**

```bash
git add index.html src/app.js tests/interface-contract.test.mjs tests/static-page.test.mjs
git commit -m "feat: add sentence completion shortcut"
```

---

### Task 3: Generate and Verify the Online and Offline Builds

**Files:**
- Modify: `tests/static-page.test.mjs`
- Generate: `src/app.bundle.js`
- Generate: `vocabulary-review-offline.html`

**Interfaces:**
- Consumes: Task 1’s exact label and Task 2’s `#open-sentence-completion` markup and handler.
- Produces: generated browser/offline artifacts with identical shortcut copy and behavior.

- [ ] **Step 1: Write the failing generated-artifact assertions**

First, add `"open-sentence-completion"` to the offline-artifact required-control array in `offline artifact exposes every required study control`.

Then extend `generated runtime includes the complete worksheet dataset`:

```js
for (const source of [bundle, offline]) {
  assert.match(source, /open-sentence-completion/);
  assert.match(source, /PDF Page 1 · Exercise 4 · Sentence Completion/);
}
assert.match(
  offline,
  /<button[^>]+id="open-sentence-completion"[^>]*>第 1 頁第 4 題 · 句子填空（12 題）<\/button>/
);
```

- [ ] **Step 2: Run the static-page test and verify it fails before regeneration**

Run: `node --test tests/static-page.test.mjs`

Expected: FAIL because the committed generated bundle/offline HTML do not yet contain the shortcut and new label.

- [ ] **Step 3: Regenerate artifacts from authoritative sources**

Run: `npm run build`

Expected: `src/app.bundle.js` and `vocabulary-review-offline.html` are regenerated; never hand-edit either file.

- [ ] **Step 4: Run the complete automated verification**

Run:

```powershell
npm test
npm run check
git diff --check
```

Expected:

- 47 or more tests PASS with 0 failures;
- static/syntax checks PASS;
- no whitespace error is reported;
- totals remain 106 entries and 10 groups / 108 prompts.

- [ ] **Step 5: Commit generated artifacts and assertions**

```bash
git add tests/static-page.test.mjs src/app.bundle.js vocabulary-review-offline.html
git commit -m "build: include sentence shortcut offline"
```

---

### Task 4: Verify Real User Flows Before Final Review

**Files:**
- Verify: `index.html`
- Verify: `vocabulary-review-offline.html`
- Verify: browser and repository state

**Interfaces:**
- Consumes: the complete generated build from Task 3.
- Produces: local evidence for desktop, 390-pixel mobile, persistence, and direct-file offline behavior. This task does not push.

- [ ] **Step 1: Start a local static server**

Run:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

If 4173 is occupied, use the next free local port and record it.

- [ ] **Step 2: Verify the original exercise remains unchanged**

Open PDF Practice at a 1280×800 viewport.

Expected:

- initial `Practice type` is `Definition Matching`;
- `PDF Page 1 · Definition Matching` remains selectable;
- its 12-word bank and 12 definitions remain present;
- the existing assignment and grading flow still works.

- [ ] **Step 3: Verify the shortcut and separate saved progress**

Activate `第 1 頁第 4 題 · 句子填空（12 題）` with a mouse, then repeat with keyboard Enter or Space.

Expected:

- type changes to `Sentence Completion`;
- exercise changes to `PDF Page 1 · Exercise 4 · Sentence Completion`;
- all 12 image sentences appear in order;
- the live status says `Opened Page 1 Exercise 4 sentence completion.`;
- assigning and grading one sentence does not alter the original definition-matching group;
- after reload, reopening through the shortcut restores the sentence group’s own assignment/score.

- [ ] **Step 4: Verify mobile and direct-file offline behavior**

At 390×844, verify the shortcut is visible, touch-operable, and causes no horizontal page overflow. Open `vocabulary-review-offline.html` directly and repeat the shortcut activation.

Expected:

- source and offline behavior match;
- both Page 1 exercises remain available;
- the shortcut text and exact sentence group label render correctly;
- console has no errors;
- the direct-file build makes no HTTP(S) request.

- [ ] **Step 5: Run final local verification and stop the server**

Run:

```powershell
npm test
npm run check
git status --short
```

Expected: all checks PASS and the tracked worktree is clean. Stop only the local server started for this task.

## Post-Review Release

After all task reviews and the final whole-branch review pass:

1. merge the feature branch into `main`;
2. rerun `npm test` and `npm run check` on merged `main`;
3. push `main` to `origin`;
4. verify `https://iu-sys.github.io/computer-science-vocabulary-review/` exposes the shortcut, both Page 1 exercises, and the exact sentence-completion label;
5. confirm the downloadable offline HTML contains the same behavior.
