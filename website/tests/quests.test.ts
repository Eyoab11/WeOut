import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  applyPhotoPost,
  blankProgress,
  dailyQuest,
  generateQuest,
  questSchema,
  streakFor,
} from "../src/lib/quest-model.ts";
test("web and mobile use identical quest rules", () => {
  const mobile = readFileSync(
    new URL("../../mobile/src/features/sidequests/model.ts", import.meta.url),
    "utf8",
  );
  const web = readFileSync(
    new URL("../src/lib/quest-model.ts", import.meta.url),
    "utf8",
  );
  assert.equal(web.replace(/\r\n/g, "\n"), mobile.replace(/\r\n/g, "\n"));
});
test("completion requires enrollment and photo evidence; retries are idempotent", () => {
  const quest = dailyQuest("2026-09-30");
  const post = {
    id: "proof-1",
    caption: "A little green in the city",
    place: "My neighborhood",
    photoUri: "photo",
    createdAt: "2026-09-30T15:00:00Z",
    questId: quest.id,
  };
  assert.throws(
    () => applyPhotoPost(blankProgress(), post, quest),
    /Start the SideQuest/,
  );
  const joined = { ...blankProgress(), started: [quest.id] };
  assert.throws(
    () => applyPhotoPost(joined, { ...post, photoUri: "" }, quest),
    /Add a photo/,
  );
  const done = applyPhotoPost(joined, post, quest);
  assert.equal(done.completed[quest.id], post.id);
  assert.deepEqual(done.days, ["2026-09-30"]);
  assert.deepEqual(applyPhotoPost(done, post, quest), done);
});
test("expired daily challenges cannot be completed", () => {
  const quest = dailyQuest("2026-09-29");
  const progress = { ...blankProgress(), started: [quest.id] };
  assert.throws(
    () =>
      applyPhotoPost(
        progress,
        {
          id: "proof-2",
          caption: "A new view today",
          place: "Park",
          photoUri: "photo",
          createdAt: "2026-09-30T00:01:00Z",
          questId: quest.id,
        },
        quest,
      ),
    /ended/,
  );
});
test("streaks count unique UTC days and allow yesterday", () => {
  assert.deepEqual(
    streakFor(["2026-09-28", "2026-09-28", "2026-09-29"], "2026-09-30"),
    { current: 2, longest: 2, todayDone: false },
  );
  assert.equal(
    streakFor(["2026-09-27", "2026-09-28"], "2026-09-30").current,
    0,
  );
});
test("generated and custom quests share validation", () => {
  assert.equal(
    questSchema.safeParse(generateQuest("Nature", 30, 1)).success,
    true,
  );
  assert.equal(
    questSchema.safeParse({
      title: "A",
      description: "short",
      category: "Nature",
      minutes: 0,
    }).success,
    false,
  );
});
