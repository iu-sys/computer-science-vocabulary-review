import test from "node:test";
import assert from "node:assert/strict";
import { VOCABULARY } from "../src/vocabulary.js";

const EXPECTED_PAGE_SOURCE_TOTALS = {
  "1/exercise": 12,
  "2/exercise": 20,
  "2/article-highlight": 10,
  "3/exercise": 24,
  "4/exercise": 18,
  "5/exercise": 10,
  "6/vr-glossary": 12
};

function assertExactCoverage(items) {
  assert.equal(items.length, 106);
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
    if (item.id.includes("-vr-")) {
      assert.equal(item.source, "vr-glossary", `${item.id} must use source vr-glossary`);
    }
  }
}

test("dataset has the exact verified page and source totals", () => {
  assertExactCoverage(VOCABULARY);
});

test("each ID source segment corresponds to its source field", () => {
  assertIdSourceCorrespondence(VOCABULARY);
});

test("all records are complete, unique, and cover pages 1-6", () => {
  assert.equal(new Set(VOCABULARY.map((item) => item.id)).size, VOCABULARY.length);
  assert.deepEqual([...new Set(VOCABULARY.map((item) => item.page))].sort(), [1, 2, 3, 4, 5, 6]);
  for (const item of VOCABULARY) {
    assert.match(item.id, /^p[1-5]-(exercise|article)-[a-z0-9-]+$|^p6-vr-[a-z0-9-]+$/);
    assert.ok(item.term.trim() && item.definition.trim() && item.zh.trim());
    assert.ok(["exercise", "article-highlight", "vr-glossary"].includes(item.source));
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

test("page 6 preserves the supplied exact English definitions", () => {
  const page6 = VOCABULARY.filter(({ page }) => page === 6);
  assert.deepEqual(
    page6.map(({ id, definition }) => [id, definition]),
    [
      ["p6-vr-vr-face", "The slightly embarrassing, slack-jawed look people get on their face when they wear an HMD!"],
      ["p6-vr-simulator-sickness", "During a VR experience, this is a conflict between what your brain and body think they're doing, when you feel sick. Your eyes say, \"We're moving!\" And your brain says \"Nope! Let's get nauseated!\". This is one of the big challenges for developers -- figuring out how to move people without making them feel nausea."],
      ["p6-vr-refresh-rate", "If you're looking at a television, or in this case, a virtual reality experience, you're looking at a series of images. This measurement defines how fast those images get updated. A higher reading cuts down on lag, and cutting down on lag means there's less of a chance of getting sick. It also means more responsive experiences. You definitely want to more than 60 frames per second."],
      ["p6-vr-stitching", "This is the process of taking footage from different cameras, like GoPro cameras that have been used in a 360 camera mount, and combining that footage into spherical video. The process usually involves reorienting video, placing seams, and generally editing it so that it looks like one continuous view, rather than a patchwork of angles."],
      ["p6-vr-field-of-view", "This is the angle of degrees in a visual field. Having a higher field of view is important because it contributes to the user having a feeling of immersion in a VR experience. The viewing angle for a healthy human eye is about 200 degrees. So, the bigger that angle is, the more immersive it feels."],
      ["p6-vr-head-tracking", "This term refers to the sensors that keep up with the movement of the user's head and move the images being displayed so that they match the position of the head. In short, if you're wearing an Oculus Rift, for example, head tracking is what lets you look to the left, right, up, or down, and see the world that's been built in those directions."],
      ["p6-vr-latency", "This describes the effect during a VR experience, when you turn your head, and you notice the visuals don't quite keep up. It's unpleasant, because that's not something that happens in the real world. That lag is an oft-cited complaint about VR experiences that aren't up to par for a variety of reasons."],
      ["p6-vr-head-mounted-display", "These are the current form of hardware delivering VR experiences to users. It's typically goggles or a helmet of some type, the kind you strap to your face or put on your head. That's where you're viewing the VR experience. Some have sensors for head tracking, some don't."],
      ["p6-vr-cinematic-vr", "For the most part, there are two types of VR you'll run into. There's the kind that's computer-generated graphics, and the kind made of real images. This term describes the second kind, and is made using cameras, whether rigs made of mounted GoPros or actual 360 cameras."],
      ["p6-vr-eye-tracking", "This term refers to the sensors that read the position of users' eyes versus their head. So for example, there's an HMD called FOVE that integrates eye tracking into their headset. In their demo, the user can aim a weapon by looking in a different direction."],
      ["p6-vr-judder", "In VR technology, this describes when there is a significant shaking in the images you see. In other words, they are not smooth, but moving in an unpleasant way."],
      ["p6-vr-social-vr", "This term refers to a type of app that aims to create a shared VR space where users can interact with each other and even participate in activities."]
    ]
  );
});
