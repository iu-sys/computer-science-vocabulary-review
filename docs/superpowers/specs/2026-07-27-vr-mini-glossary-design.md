# VR Mini-glossary Page 6 Design

Date: 2026-07-27

## Goal

Add the supplied 12-term virtual-reality mini-glossary to the existing study website without replacing or removing any current feature. The new material must be available in flashcards, the all-words quiz, mistakes review, and a worksheet-style definition-matching exercise that follows the supplied page.

## Scope

- Treat the supplied image as study page 6.
- Add 12 vocabulary records, increasing the vocabulary total from 94 to 106.
- Add one definition-matching worksheet group with 12 prompts, increasing the worksheet inventory from 9 groups / 96 prompts to 10 groups / 108 prompts.
- Keep the supplied word-bank order and definition order.
- Update both the multi-file website and the downloadable offline HTML.
- Publish the completed update to the existing GitHub repository and GitHub Pages site.

No existing vocabulary, worksheet, quiz mode, progress behavior, or navigation item will be removed or replaced.

## Vocabulary Data

Each entry uses the supplied English definition, a concise Traditional Chinese meaning, `page: 6`, and a VR-page source marker.

| Order | Term | Traditional Chinese meaning |
| --- | --- | --- |
| 1 | VR face | VR 呆臉；戴頭戴裝置時的失神表情 |
| 2 | Simulator sickness | 模擬器暈動症 |
| 3 | Refresh rate | 更新率；畫面刷新率 |
| 4 | Stitching | 影像拼接 |
| 5 | Field of view (FOV) | 視野範圍；視場 |
| 6 | Head tracking | 頭部追蹤 |
| 7 | Latency | 延遲；反應延遲 |
| 8 | Head mounted display or HMD | 頭戴式顯示器 |
| 9 | Cinematic VR | 電影式虛擬實境；實景 VR |
| 10 | Eye tracking | 眼球追蹤 |
| 11 | Judder | 畫面抖動；影像顫動 |
| 12 | Social VR | 社交虛擬實境 |

The flashcard front remains the English term. Its back shows the Chinese meaning and the English explanation, consistent with existing cards.

## Worksheet Exercise

Add a group labeled `Page 6 · VR Mini-glossary` under the existing definition-matching worksheet type.

- The word bank contains all 12 supplied terms in the image order.
- The 12 definitions appear in the image order.
- The correct answers are:
  1. Head mounted display or HMD
  2. Head tracking
  3. Eye tracking
  4. Field of view (FOV)
  5. Latency
  6. Simulator sickness
  7. Judder
  8. Refresh rate
  9. Social VR
  10. Cinematic VR
  11. Stitching
  12. VR face
- The exercise reuses the existing interaction: select a word, place it in a blank, clear or change an answer, submit for grading, retry, and add incorrect vocabulary to Mistakes.
- Worksheet progress persists using the current local-storage format.

## Quiz and Review Behavior

- The “all words” label and quiz inventory change from 94 to 106.
- “Quiz all words” includes every existing entry plus all 12 VR entries.
- Existing term-to-Chinese, definition-to-term, and spelling modes work for the new entries.
- Flashcards include the 12 entries in source order when not shuffled.
- The page indicator identifies these entries as page 6.
- Incorrect worksheet and quiz answers map to the same VR vocabulary IDs so they appear in Mistakes.

## Offline and Published Builds

The normal source files remain authoritative. The existing build process regenerates:

- the browser bundle used by GitHub Pages;
- `vocabulary-review-offline.html`, with all styles, scripts, vocabulary, and worksheet content embedded.

The offline file must work when opened directly without a network connection.

## Verification

Automated checks must verify:

- exactly 106 vocabulary entries and unique IDs;
- pages 1 through 6 are represented;
- the 12 VR entries have non-empty term, English definition, and Chinese meaning fields;
- worksheet inventory is exactly 10 groups / 108 prompts;
- the new group has 12 unique word-bank entries and 12 prompts;
- every worksheet answer and vocabulary mapping is valid;
- the new all-words label says 106;
- source, generated bundle, and offline HTML contain the new group;
- the complete existing test suite still passes.

Manual checks must verify on desktop and a narrow mobile viewport:

- all 12 VR terms appear in flashcards;
- an all-words quiz can include the new entries;
- every page-6 matching answer can be placed and graded;
- a wrong answer appears in Mistakes;
- progress survives a reload;
- the offline HTML opens and behaves the same as the hosted page.

## Acceptance Criteria

The change is complete when the hosted and offline versions both expose all 12 VR terms across flashcards, all-words quiz, mistakes review, and the new page-6 matching exercise; all old features remain available; automated and manual checks pass; and the update is pushed to the existing GitHub project.
