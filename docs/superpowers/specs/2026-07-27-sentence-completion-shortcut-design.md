# Page 1 Exercise 4 Sentence-Completion Shortcut Design

Date: 2026-07-27

## Finding

The supplied page is not missing from the dataset. All 12 sentences, answers, vocabulary mappings, grading behavior, mistake integration, and saved progress already exist in the `p1-sentence-completion` worksheet group.

The page is difficult to discover because PDF Practice defaults to `Definition Matching`. The user must first change the `Practice type` selector to `Sentence Completion` before the group becomes visible.

## Goal

Make the supplied Page 1 Exercise 4 sentence-completion worksheet directly visible and reachable from PDF Practice without duplicating its data or changing vocabulary and worksheet totals.

The Page 1 vocabulary is intentionally used by two different exercises, and both remain available:

- the original 12-question `PDF Page 1 · Definition Matching` exercise;
- the separate 12-question `PDF Page 1 · Exercise 4 · Sentence Completion` exercise shown in the supplied image.

Adding the shortcut must not delete, replace, merge, or hide the original definition-matching exercise. Each exercise keeps its own answers, score, and saved progress.

## Interface

Add a prominent native button immediately below the PDF Practice heading and above the existing worksheet selectors.

Button copy:

`第 1 頁第 4 題 · 句子填空（12 題）`

The existing `Practice type` and `PDF exercise` selectors remain available. The shortcut supplements them; it does not replace them.

The worksheet group label changes from:

`PDF Page 1 · Sentence Completion`

to:

`PDF Page 1 · Exercise 4 · Sentence Completion`

No visual mockup is required because this is one button within the existing PDF Practice layout and reuses the existing button and spacing styles.

## Behavior

Activating the shortcut:

1. changes the worksheet type to `sentence-completion`;
2. selects group `p1-sentence-completion`;
3. clears any transient selected word or in-memory grade from the previously visible worksheet;
4. refreshes both selectors and the worksheet;
5. announces `Opened Page 1 Exercise 4 sentence completion.` through the existing live status region.

The native button supports mouse, touch, Enter, and Space without custom keyboard handling. Existing saved assignments and scores for `p1-sentence-completion` are preserved and shown when the shortcut opens the group.

## Data and Totals

The existing 12 prompts and answers remain authoritative:

1. machine learning
2. Turing Test
3. natural language processing
4. Internet of Things (IoT)
5. deep learning
6. big data
7. neural networks
8. data mining
9. chatbot
10. algorithm
11. automation
12. artificial intelligence

No vocabulary or worksheet record is added. Totals remain:

- 106 vocabulary entries;
- 10 worksheet groups;
- 108 worksheet prompts.

Those 108 prompts already count both Page 1 exercises: 12 definition-matching prompts and 12 sentence-completion prompts. The shortcut only exposes the existing second exercise more clearly, so it does not add another duplicate set of 12.

## Online and Offline Builds

The shortcut is added to the maintainable HTML and application source. The existing build process regenerates `src/app.bundle.js` and `vocabulary-review-offline.html`, so the same shortcut and behavior are available on GitHub Pages and when the offline file is opened directly.

No runtime network request or new dependency is introduced.

## Verification

Automated checks verify:

- the shortcut button exists with stable ID `open-sentence-completion`;
- the button text is present in the source and offline HTML;
- application source maps the button and registers its click behavior;
- the group label is exactly `PDF Page 1 · Exercise 4 · Sentence Completion`;
- the group still has the same 12 prompts and answer order;
- the original `p1-definition-matching` group still exists with its original 12 prompts;
- `p1-definition-matching` and `p1-sentence-completion` retain separate saved-progress records;
- vocabulary and worksheet totals remain 106 entries and 10 groups / 108 prompts;
- generated online and offline artifacts contain the shortcut and its behavior;
- the complete existing test suite passes.

Manual checks on desktop and a 390-pixel mobile viewport verify:

- PDF Practice initially still opens Definition Matching;
- the original Page 1 Definition Matching exercise remains selectable and unchanged;
- the shortcut is clearly visible without changing the selector;
- clicking or keyboard-activating it selects Sentence Completion and the Page 1 group;
- all 12 supplied sentences appear in order;
- a correct completion can be placed and graded;
- saved sentence-completion work is restored after reload and reopening through the shortcut;
- direct-file offline behavior matches the normal website;
- no horizontal page overflow or console error appears.

## Acceptance Criteria

The change is complete when a user can open PDF Practice and reach the supplied 12-question page with one clearly labeled action, while all original selectors and study features remain intact, no data is duplicated, totals remain unchanged, and both hosted and offline builds expose the same working shortcut.
