# VR Mini-glossary Page 6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the supplied 12-term VR mini-glossary as study page 6 across flashcards, all-word quizzes, mistakes review, worksheet practice, the offline file, and the published GitHub Pages site.

**Architecture:** Extend the existing authoritative `VOCABULARY` and `WORKSHEET_GROUPS` arrays, preserving their current schemas so all existing card, quiz, mistake, persistence, and grading logic works without new branches. Update the one static word-count label, then use the existing build script to regenerate the classic-script bundle and self-contained offline HTML.

**Tech Stack:** Static HTML/CSS, JavaScript ES modules, Node.js built-in test runner, existing Node build script, Git, GitHub Pages.

## Global Constraints

- Treat the supplied image as study page 6.
- Add exactly 12 vocabulary records, increasing the total from 94 to 106.
- Add exactly one definition-matching group with 12 prompts, increasing the worksheet inventory from 9 groups / 96 prompts to 10 groups / 108 prompts.
- Preserve the supplied word-bank order and definition order.
- Do not remove or replace any existing vocabulary, worksheet, quiz mode, progress behavior, or navigation item.
- Keep the website fully offline-capable and free of runtime network requests.
- Update and publish both the normal website and `vocabulary-review-offline.html`.

## File Map

- `src/vocabulary.js`: authoritative vocabulary records used by cards, quizzes, and mistakes.
- `src/worksheet.js`: authoritative worksheet groups used by PDF Practice.
- `index.html`: static quiz-scope label shown before JavaScript starts.
- `tests/vocabulary.test.mjs`: exact vocabulary inventory, source, page, and VR-record assertions.
- `tests/worksheet.test.mjs`: exact worksheet inventory and page-6 answer-order assertions.
- `tests/static-page.test.mjs`: static word-count label and generated-artifact coverage.
- `src/app.bundle.js`: generated browser runtime; do not edit by hand.
- `vocabulary-review-offline.html`: generated self-contained offline website; do not edit by hand.

---

### Task 1: Lock the Page 6 Vocabulary Contract

**Files:**
- Modify: `tests/vocabulary.test.mjs`
- Modify: `src/vocabulary.js`

**Interfaces:**
- Consumes: the existing vocabulary record shape `{ id, term, definition, zh, page, source }`.
- Produces: 12 records with IDs beginning `p6-vr-`, `page: 6`, and `source: "vr-glossary"` for `VOCABULARY`.

- [ ] **Step 1: Write the failing inventory and record tests**

Update `EXPECTED_PAGE_SOURCE_TOTALS`, the total, page coverage, accepted ID/source rules, and add a page-6 order assertion:

```js
const EXPECTED_PAGE_SOURCE_TOTALS = {
  "1/exercise": 12,
  "2/exercise": 20,
  "2/article-highlight": 10,
  "3/exercise": 24,
  "4/exercise": 18,
  "5/exercise": 10,
  "6/vr-glossary": 12
};

// In assertExactCoverage:
assert.equal(items.length, 106);

// In assertIdSourceCorrespondence:
if (item.id.includes("-vr-")) {
  assert.equal(item.source, "vr-glossary", `${item.id} must use source vr-glossary`);
}

// In the completeness test:
assert.deepEqual([...new Set(VOCABULARY.map((item) => item.page))].sort(), [1, 2, 3, 4, 5, 6]);
assert.match(item.id, /^p[1-5]-(exercise|article)-[a-z0-9-]+$|^p6-vr-[a-z0-9-]+$/);
assert.ok(["exercise", "article-highlight", "vr-glossary"].includes(item.source));

test("page 6 preserves the supplied VR word-bank order and translations", () => {
  const page6 = VOCABULARY.filter(({ page }) => page === 6);
  assert.deepEqual(
    page6.map(({ term, zh }) => [term, zh]),
    [
      ["VR face", "VR 呆臉；戴頭戴裝置時的失神表情"],
      ["Simulator sickness", "模擬器暈動症"],
      ["Refresh rate", "更新率；畫面刷新率"],
      ["Stitching", "影像拼接"],
      ["Field of view (FOV)", "視野範圍；視場"],
      ["Head tracking", "頭部追蹤"],
      ["Latency", "延遲；反應延遲"],
      ["Head mounted display or HMD", "頭戴式顯示器"],
      ["Cinematic VR", "電影式虛擬實境；實景 VR"],
      ["Eye tracking", "眼球追蹤"],
      ["Judder", "畫面抖動；影像顫動"],
      ["Social VR", "社交虛擬實境"]
    ]
  );
  assert.ok(page6.every(({ definition }) => definition.trim().length > 0));
});
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/vocabulary.test.mjs`

Expected: FAIL because the current dataset has 94 entries, no page 6, and no `vr-glossary` source.

- [ ] **Step 3: Add the 12 records to `VOCABULARY`**

Append these records after the page-5 entries, keeping the supplied word-bank order:

```js
  { id: "p6-vr-vr-face", term: "VR face", definition: "The slightly embarrassing, slack-jawed look people get on their face when they wear an HMD!", zh: "VR 呆臉；戴頭戴裝置時的失神表情", page: 6, source: "vr-glossary" },
  { id: "p6-vr-simulator-sickness", term: "Simulator sickness", definition: "During a VR experience, this is a conflict between what your brain and body think they're doing, when you feel sick. Your eyes say, \"We're moving!\" And your brain says \"Nope! Let's get nauseated!\". This is one of the big challenges for developers -- figuring out how to move people without making them feel nausea.", zh: "模擬器暈動症", page: 6, source: "vr-glossary" },
  { id: "p6-vr-refresh-rate", term: "Refresh rate", definition: "If you're looking at a television, or in this case, a virtual reality experience, you're looking at a series of images. This measurement defines how fast those images get updated. A higher reading cuts down on lag, and cutting down on lag means there's less of a chance of getting sick. It also means more responsive experiences. You definitely want to more than 60 frames per second.", zh: "更新率；畫面刷新率", page: 6, source: "vr-glossary" },
  { id: "p6-vr-stitching", term: "Stitching", definition: "This is the process of taking footage from different cameras, like GoPro cameras that have been used in a 360 camera mount, and combining that footage into spherical video. The process usually involves reorienting video, placing seams, and generally editing it so that it looks like one continuous view, rather than a patchwork of angles.", zh: "影像拼接", page: 6, source: "vr-glossary" },
  { id: "p6-vr-field-of-view", term: "Field of view (FOV)", definition: "This is the angle of degrees in a visual field. Having a higher field of view is important because it contributes to the user having a feeling of immersion in a VR experience. The viewing angle for a healthy human eye is about 200 degrees. So, the bigger that angle is, the more immersive it feels.", zh: "視野範圍；視場", page: 6, source: "vr-glossary" },
  { id: "p6-vr-head-tracking", term: "Head tracking", definition: "This term refers to the sensors that keep up with the movement of the user's head and move the images being displayed so that they match the position of the head. In short, if you're wearing an Oculus Rift, for example, head tracking is what lets you look to the left, right, up, or down, and see the world that's been built in those directions.", zh: "頭部追蹤", page: 6, source: "vr-glossary" },
  { id: "p6-vr-latency", term: "Latency", definition: "This describes the effect during a VR experience, when you turn your head, and you notice the visuals don't quite keep up. It's unpleasant, because that's not something that happens in the real world. That lag is an oft-cited complaint about VR experiences that aren't up to par for a variety of reasons.", zh: "延遲；反應延遲", page: 6, source: "vr-glossary" },
  { id: "p6-vr-head-mounted-display", term: "Head mounted display or HMD", definition: "These are the current form of hardware delivering VR experiences to users. It's typically goggles or a helmet of some type, the kind you strap to your face or put on your head. That's where you're viewing the VR experience. Some have sensors for head tracking, some don't.", zh: "頭戴式顯示器", page: 6, source: "vr-glossary" },
  { id: "p6-vr-cinematic-vr", term: "Cinematic VR", definition: "For the most part, there are two types of VR you'll run into. There's the kind that's computer-generated graphics, and the kind made of real images. This term describes the second kind, and is made using cameras, whether rigs made of mounted GoPros or actual 360 cameras.", zh: "電影式虛擬實境；實景 VR", page: 6, source: "vr-glossary" },
  { id: "p6-vr-eye-tracking", term: "Eye tracking", definition: "This term refers to the sensors that read the position of users' eyes versus their head. So for example, there's an HMD called FOVE that integrates eye tracking into their headset. In their demo, the user can aim a weapon by looking in a different direction.", zh: "眼球追蹤", page: 6, source: "vr-glossary" },
  { id: "p6-vr-judder", term: "Judder", definition: "In VR technology, this describes when there is a significant shaking in the images you see. In other words, they are not smooth, but moving in an unpleasant way.", zh: "畫面抖動；影像顫動", page: 6, source: "vr-glossary" },
  { id: "p6-vr-social-vr", term: "Social VR", definition: "This term refers to a type of app that aims to create a shared VR space where users can interact with each other and even participate in activities.", zh: "社交虛擬實境", page: 6, source: "vr-glossary" }
```

- [ ] **Step 4: Run the focused vocabulary tests**

Run: `node --test tests/vocabulary.test.mjs`

Expected: all vocabulary tests PASS with 106 complete, unique entries across pages 1–6.

- [ ] **Step 5: Commit the vocabulary increment**

```bash
git add src/vocabulary.js tests/vocabulary.test.mjs
git commit -m "feat: add VR mini-glossary vocabulary"
```

---

### Task 2: Add the Page 6 Definition-Matching Exercise

**Files:**
- Modify: `tests/worksheet.test.mjs`
- Modify: `src/worksheet.js`

**Interfaces:**
- Consumes: the 12 `p6-vr-*` vocabulary IDs from Task 1 and the existing worksheet group shape `{ id, label, page, type, wordBank, prompts }`.
- Produces: group ID `p6-vr-definition-matching`, selectable by the existing worksheet UI and gradeable by the existing core functions.

- [ ] **Step 1: Write the failing worksheet inventory and answer-order tests**

Insert the page-6 group before the sentence-completion group in `expectedGroups`, change the total to 108, and add:

```js
  ["p6-vr-definition-matching", "definition-matching", 6, 12],
```

```js
test("page 6 VR group preserves the supplied word and answer order", () => {
  const group = WORKSHEET_GROUPS.find(
    ({ id }) => id === "p6-vr-definition-matching"
  );
  assert.deepEqual(group.wordBank.map(({ term }) => term), [
    "VR face",
    "Simulator sickness",
    "Refresh rate",
    "Stitching",
    "Field of view (FOV)",
    "Head tracking",
    "Latency",
    "Head mounted display or HMD",
    "Cinematic VR",
    "Eye tracking",
    "Judder",
    "Social VR"
  ]);
  assert.deepEqual(group.prompts.map(({ answerId }) => answerId), [
    "head-mounted-display",
    "head-tracking",
    "eye-tracking",
    "field-of-view",
    "latency",
    "simulator-sickness",
    "judder",
    "refresh-rate",
    "social-vr",
    "cinematic-vr",
    "stitching",
    "vr-face"
  ]);
});
```

Rename the inventory test to `worksheet inventory preserves grouping, order, and 108 prompts` and change its final expected total from `96` to `108`.

- [ ] **Step 2: Run the focused worksheet test and verify it fails**

Run: `node --test tests/worksheet.test.mjs`

Expected: FAIL because `p6-vr-definition-matching` does not exist and the current total is 96.

- [ ] **Step 3: Add the page-6 worksheet group**

Insert this group after `p5-definition-matching` and before `p1-sentence-completion`:

```js
  {
    id: "p6-vr-definition-matching",
    label: "Page 6 · VR Mini-glossary",
    page: 6,
    type: "definition-matching",
    wordBank: [
      { id: "vr-face", term: "VR face", vocabularyId: "p6-vr-vr-face" },
      { id: "simulator-sickness", term: "Simulator sickness", vocabularyId: "p6-vr-simulator-sickness" },
      { id: "refresh-rate", term: "Refresh rate", vocabularyId: "p6-vr-refresh-rate" },
      { id: "stitching", term: "Stitching", vocabularyId: "p6-vr-stitching" },
      { id: "field-of-view", term: "Field of view (FOV)", vocabularyId: "p6-vr-field-of-view" },
      { id: "head-tracking", term: "Head tracking", vocabularyId: "p6-vr-head-tracking" },
      { id: "latency", term: "Latency", vocabularyId: "p6-vr-latency" },
      { id: "head-mounted-display", term: "Head mounted display or HMD", vocabularyId: "p6-vr-head-mounted-display" },
      { id: "cinematic-vr", term: "Cinematic VR", vocabularyId: "p6-vr-cinematic-vr" },
      { id: "eye-tracking", term: "Eye tracking", vocabularyId: "p6-vr-eye-tracking" },
      { id: "judder", term: "Judder", vocabularyId: "p6-vr-judder" },
      { id: "social-vr", term: "Social VR", vocabularyId: "p6-vr-social-vr" }
    ],
    prompts: [
      { id: "p6-vr-definition-01", text: "These are the current form of hardware delivering VR experiences to users. It's typically goggles or a helmet of some type, the kind you strap to your face or put on your head. That's where you're viewing the VR experience. Some have sensors for head tracking, some don't.", answerId: "head-mounted-display" },
      { id: "p6-vr-definition-02", text: "This term refers to the sensors that keep up with the movement of the user's head and move the images being displayed so that they match the position of the head. In short, if you're wearing an Oculus Rift, for example, head tracking is what lets you look to the left, right, up, or down, and see the world that's been built in those directions.", answerId: "head-tracking" },
      { id: "p6-vr-definition-03", text: "This term refers to the sensors that read the position of users' eyes versus their head. So for example, there's an HMD called FOVE that integrates eye tracking into their headset. In their demo, the user can aim a weapon by looking in a different direction.", answerId: "eye-tracking" },
      { id: "p6-vr-definition-04", text: "This is the angle of degrees in a visual field. Having a higher field of view is important because it contributes to the user having a feeling of immersion in a VR experience. The viewing angle for a healthy human eye is about 200 degrees. So, the bigger that angle is, the more immersive it feels.", answerId: "field-of-view" },
      { id: "p6-vr-definition-05", text: "This describes the effect during a VR experience, when you turn your head, and you notice the visuals don't quite keep up. It's unpleasant, because that's not something that happens in the real world. That lag is an oft-cited complaint about VR experiences that aren't up to par for a variety of reasons.", answerId: "latency" },
      { id: "p6-vr-definition-06", text: "During a VR experience, this is a conflict between what your brain and body think they're doing, when you feel sick. Your eyes say, \"We're moving!\" And your brain says \"Nope! Let's get nauseated!\". This is one of the big challenges for developers -- figuring out how to move people without making them feel nausea.", answerId: "simulator-sickness" },
      { id: "p6-vr-definition-07", text: "In VR technology, this describes when there is a significant shaking in the images you see. In other words, they are not smooth, but moving in an unpleasant way.", answerId: "judder" },
      { id: "p6-vr-definition-08", text: "If you're looking at a television, or in this case, a virtual reality experience, you're looking at a series of images. This measurement defines how fast those images get updated. A higher reading cuts down on lag, and cutting down on lag means there's less of a chance of getting sick. It also means more responsive experiences. You definitely want to more than 60 frames per second.", answerId: "refresh-rate" },
      { id: "p6-vr-definition-09", text: "This term refers to a type of app that aims to create a shared VR space where users can interact with each other and even participate in activities.", answerId: "social-vr" },
      { id: "p6-vr-definition-10", text: "For the most part, there are two types of VR you'll run into. There's the kind that's computer-generated graphics, and the kind made of real images. This term describes the second kind, and is made using cameras, whether rigs made of mounted GoPros or actual 360 cameras.", answerId: "cinematic-vr" },
      { id: "p6-vr-definition-11", text: "This is the process of taking footage from different cameras, like GoPro cameras that have been used in a 360 camera mount, and combining that footage into spherical video. The process usually involves reorienting video, placing seams, and generally editing it so that it looks like one continuous view, rather than a patchwork of angles.", answerId: "stitching" },
      { id: "p6-vr-definition-12", text: "The slightly embarrassing, slack-jawed look people get on their face when they wear an HMD!", answerId: "vr-face" }
    ]
  },
```

- [ ] **Step 4: Run vocabulary and worksheet tests**

Run: `node --test tests/vocabulary.test.mjs tests/worksheet.test.mjs`

Expected: all tests PASS, including valid vocabulary mappings for all 12 page-6 words.

- [ ] **Step 5: Commit the worksheet increment**

```bash
git add src/worksheet.js tests/worksheet.test.mjs
git commit -m "feat: add VR definition-matching practice"
```

---

### Task 3: Update the All-Words Label and Generated Offline Artifacts

**Files:**
- Modify: `tests/static-page.test.mjs`
- Modify: `index.html`
- Generate: `src/app.bundle.js`
- Generate: `vocabulary-review-offline.html`

**Interfaces:**
- Consumes: `VOCABULARY` and `WORKSHEET_GROUPS` from Tasks 1–2 through `scripts/build-bundle.mjs`.
- Produces: a UI that labels the full quiz as 106 words and generated artifacts containing `p6-vr-definition-matching`.

- [ ] **Step 1: Write the failing static-page assertions**

Change the quiz-scope assertion to:

```js
const allIndex = html.indexOf('<option value="all">All 106 words</option>');
```

Extend `generated runtime includes the complete worksheet dataset`:

```js
assert.match(source, /p6-vr-definition-matching/);
assert.match(source, /p6-vr-head-mounted-display/);
```

- [ ] **Step 2: Run the static test and verify it fails**

Run: `node --test tests/static-page.test.mjs`

Expected: FAIL because `index.html` still says 94 and the generated files do not yet contain page 6.

- [ ] **Step 3: Update the source HTML label**

In `index.html`, replace:

```html
<option value="all">All 94 words</option>
```

with:

```html
<option value="all">All 106 words</option>
```

- [ ] **Step 4: Regenerate the browser bundle and offline HTML**

Run: `npm run build`

Expected: `src/app.bundle.js` and `vocabulary-review-offline.html` are rewritten from the authoritative source modules and both contain all page-6 data.

- [ ] **Step 5: Run the entire automated suite**

Run: `npm test`

Expected: all tests PASS; pretest rebuilds the generated artifacts once more.

- [ ] **Step 6: Run syntax, generated-file, and whitespace checks**

Run: `npm run check`

Expected: bundle generation, JavaScript syntax checks, and static-page tests PASS.

Run: `git diff --check`

Expected: no output.

- [ ] **Step 7: Commit the UI and generated artifacts**

```bash
git add index.html tests/static-page.test.mjs src/app.bundle.js vocabulary-review-offline.html
git commit -m "build: include VR glossary in offline site"
```

---

### Task 4: Verify the User Flows and Publish

**Files:**
- Verify: `index.html`
- Verify: `vocabulary-review-offline.html`
- Verify: repository state and GitHub Pages deployment

**Interfaces:**
- Consumes: the complete browser and offline builds from Task 3.
- Produces: evidence that the hosted and offline interfaces expose all requested page-6 functions.

- [ ] **Step 1: Start a local static server**

Run from the repository root:

```powershell
python -m http.server 4173
```

Expected: a local server exposes the website at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Verify desktop flashcards and the 106-word quiz**

Open the local site in a 1280×800 browser viewport.

Expected:

- the quiz selector displays `All 106 words`;
- non-shuffled flashcards reach page-6 entries after the original 94;
- `VR face` shows its Chinese meaning and English explanation;
- starting “All 106 words” creates a 106-question session;
- original navigation and all three quiz modes remain usable.

- [ ] **Step 3: Verify the page-6 matching workflow**

Open PDF Practice, keep `Definition Matching`, and choose `Page 6 · VR Mini-glossary`.

Expected:

- 12 word-bank buttons and 12 numbered definitions appear in supplied order;
- selecting each word and placing it in the corresponding blank works;
- submitting the correct mapping scores `12 / 12`;
- resetting clears every answer.

- [ ] **Step 4: Verify mistakes and persistence**

Place at least one deliberately incorrect page-6 answer, grade it, reload, and open Mistakes.

Expected:

- worksheet selections/results survive reload under the existing PDF-practice storage key;
- the incorrectly mapped VR vocabulary appears in Mistakes;
- clearing progress still clears saved progress through the existing confirmation flow.

- [ ] **Step 5: Verify mobile and direct-file offline behavior**

Repeat the essential card and worksheet checks at a 390×844 viewport, then open `vocabulary-review-offline.html` directly as a local file.

Expected:

- controls remain readable and operable without horizontal page overflow;
- the offline file shows `All 106 words`;
- page-6 cards and all 12 worksheet prompts work;
- no runtime network request is made.

- [ ] **Step 6: Run final verification immediately before publishing**

Run:

```powershell
npm test
npm run check
git status --short
```

Expected: all checks PASS and the worktree has no uncommitted generated changes.

- [ ] **Step 7: Push the completed commits**

Run:

```powershell
git push origin main
```

Expected: the remote `main` branch advances to the local final commit.

- [ ] **Step 8: Verify GitHub Pages**

Open `https://iu-sys.github.io/computer-science-vocabulary-review/` after deployment completes.

Expected: the live site displays `All 106 words`, includes page-6 VR flashcards, and offers `Page 6 · VR Mini-glossary` with 12 working definition-matching questions.
