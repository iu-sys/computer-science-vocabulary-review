# PDF Practice Feature Design

Date: 2026-07-25

## Goal

Add a new interactive `PDF Practice` area that reproduces the worksheet-style exercises from the source PDF in a mobile-friendly offline webpage. The existing flashcards, full 94-word quiz, random 10-question quiz, mistake review, progress, and offline behavior must remain unchanged.

The previously discussed similar-word quiz is cancelled and is not part of this feature.

## Source of Truth

Exercise wording, word-bank membership, grouping, and order come from:

`D:\大學\交換學生\English of computer science\電腦科學_260717_144808.pdf`

The implementation must preserve the PDF's page and exercise order. The page 2 article exercise includes only the highlighted vocabulary already approved for the study guide.

## Navigation and Page Structure

Add a `PDF Practice` button to the existing top navigation beside `Flashcards`, `Quiz`, and `Mistakes`.

The new page contains two practice categories:

1. `Definition Matching`
2. `Sentence Completion`

Only one PDF exercise group is shown at a time. Each group has:

- A source label such as `PDF Page 3 · Definition Matching A`
- The original word bank in PDF order
- Numbered prompts in PDF order
- A selected-word indicator
- `Check answers`
- `Try again`
- Previous and next exercise-group controls where applicable
- A score summary after checking

## Exercise Content

### Definition Matching

Reproduce the PDF's word-bank and English-definition matching groups from pages 1 through 5. Page 2 includes its standard exercise and the highlighted-article vocabulary exercise. Duplicate vocabulary records in the flashcard dataset do not create duplicate worksheet questions unless the PDF itself presents a separate exercise occurrence.

Each prompt presents its English definition with an empty answer slot. The learner chooses a word from the bank and assigns it to the slot.

The required group inventory is:

| Stable group ID | Display label | Prompt count |
| --- | --- | ---: |
| `p1-definition-matching` | `PDF Page 1 · Definition Matching` | 12 |
| `p2-definition-matching` | `PDF Page 2 · Definition Matching` | 10 |
| `p2-article-definition-matching` | `PDF Page 2 · Highlighted Article Vocabulary` | 10 |
| `p3-definition-matching-a` | `PDF Page 3 · Definition Matching A` | 12 |
| `p3-definition-matching-b` | `PDF Page 3 · Definition Matching B` | 12 |
| `p4-definition-matching-a` | `PDF Page 4 · Definition Matching A` | 8 |
| `p4-definition-matching-b` | `PDF Page 4 · Definition Matching B` | 10 |
| `p5-definition-matching` | `PDF Page 5 · Definition Matching` | 10 |

This yields 84 definition-matching prompts across eight groups.

### Sentence Completion

Reproduce the 12 complete sentence-fill questions shown at the bottom of PDF page 1, including the original sentence wording, blanks, word bank, and order.

This is one group with stable ID `p1-sentence-completion` and display label `PDF Page 1 · Sentence Completion`. The complete feature therefore contains nine exercise groups and 96 prompts.

## Interaction Model

The interaction is optimized for both phones and computers:

1. The learner selects a word in the word bank.
2. The learner selects an answer slot.
3. The selected word is placed in that slot.

Rules:

- A word can occupy only one slot within an exercise group.
- Assigning a word that is already used moves it from its previous slot.
- Selecting a filled slot allows its answer to be replaced.
- The learner can remove an answer and return it to the word bank.
- Used words appear visually subdued but remain identifiable.
- Exercise order and word-bank order are not randomized.
- Keyboard users can select word-bank items and answer slots.

## Checking and Feedback

`Check answers` is available even when some slots are empty.

After checking:

- Correct answers show a success symbol and `Correct`.
- Incorrect answers show an error symbol, `Incorrect`, and the correct answer.
- Empty answers show `Not answered` and the correct answer.
- The page shows `Score: X / Y`.
- Incorrect and unanswered vocabulary items are added to the existing Mistakes record.
- Correct answers do not remove unrelated existing mistake records.

The learner can still revise answers after checking and check again. The latest result replaces the previous score for that exercise group.

`Try again` clears only the answers and result for the current exercise group. It does not clear flashcard status, other PDF groups, the existing quiz score, or the global Mistakes record.

## Persistence

PDF Practice progress is stored locally on the current device using the same defensive storage approach as existing progress:

- Answers and latest scores are stored per exercise-group ID.
- Returning to the offline HTML or hosted page restores unfinished work.
- Invalid or obsolete stored answers are ignored safely.
- Storage failure must not prevent practice from working during the current session.
- No data is sent over the network.

## Data and Architecture

Keep worksheet data separate from the 94-record flashcard vocabulary dataset.

Introduce a dedicated worksheet-data module containing:

- Stable exercise-group IDs
- PDF page and exercise labels
- Exercise type
- Ordered word-bank entries
- Ordered prompts
- Correct answer IDs
- A vocabulary-record ID for every answer so incorrect and unanswered work can integrate with the existing Mistakes record

Add pure core helpers for:

- Validating and assigning a word to a slot
- Moving a previously used word
- Removing an assignment
- Grading an exercise group
- Sanitizing saved worksheet progress

The UI layer renders the exercise groups and delegates state rules and grading to these helpers. Generated files (`src/app.bundle.js` and `vocabulary-review-offline.html`) remain build outputs and must be regenerated from their source files.

## Responsive and Accessible Presentation

The visual structure follows the PDF's worksheet pattern without copying handwritten annotations:

- Word bank above the prompts
- Numbered prompt rows below
- Clear bordered answer slots
- Compact paper-like grouping on larger screens
- Wrapping word-bank buttons and stacked prompt rows on narrow screens
- Touch targets remain comfortably tappable

Correctness is never communicated by color alone. Status text, symbols, focus indicators, semantic buttons, labels, and status announcements are required.

## Compatibility and Non-Goals

Required:

- Hosted GitHub Pages site
- Directly opened modular `index.html`
- Self-contained `vocabulary-review-offline.html`
- Current mobile and desktop browsers

Not included:

- Similar-word quiz mode
- Drag-and-drop interaction
- Typed spelling mode inside PDF Practice
- Randomized worksheet order
- Editing the original PDF
- Reproducing handwritten answers, check marks, or personal notes as visual decoration

## Error Handling

- An exercise group with invalid data is skipped and reports a readable unavailable message.
- A word bank with fewer or more items than prompts is supported as long as answer IDs are valid.
- Missing saved exercise IDs or invalid word IDs are discarded during load.
- Checking an entirely blank group produces a zero score and marks every item `Not answered`.

## Test Plan

Automated tests must verify:

- The expected exercise groups, page labels, prompt counts, word banks, and source order
- The 12 sentence-completion prompts from PDF page 1
- Page 2 article content is restricted to the approved highlighted vocabulary
- One word cannot remain assigned to two slots
- Reassignment, replacement, and removal behavior
- Correct, incorrect, and unanswered grading
- Score recalculation after revision
- Mistake-record integration
- Current-group-only reset behavior
- Safe persistence and invalid stored-data filtering
- Required controls and accessible status labels
- Responsive layout contracts
- No remote resources or runtime network requests
- Modular and self-contained offline versions expose equivalent functionality

Manual browser verification must cover:

- Phone-sized and desktop-sized layouts
- Both exercise categories
- Moving a word between slots
- Checking a partially completed group
- Restoring progress after reload
- Existing Flashcards, Quiz, and Mistakes behavior remains functional
- Direct offline opening and deployed GitHub Pages behavior

## Acceptance Criteria

The feature is complete when:

1. `PDF Practice` is available without removing or changing existing study modes.
2. Both approved PDF exercise types are present in original page and exercise order.
3. Click-word-then-slot interaction works on phones, computers, and keyboards.
4. Scoring distinguishes correct, incorrect, and unanswered responses.
5. Wrong and unanswered items integrate with Mistakes.
6. Progress survives reload without any network dependency.
7. The modular and single-file offline builds remain synchronized.
8. Automated tests and manual browser verification pass.
9. The updated `main` branch is deployed successfully to GitHub Pages.
