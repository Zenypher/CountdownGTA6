import test from "node:test";
import assert from "node:assert/strict";
import { createFinaleAudio } from "../public/js/finale-audio.mjs";

import { MUSIC_LEAD_MS } from "../public/js/finale.mjs";

test("audio prepares once near the deadline or on demand, without starting playback", () => {
  let loads = 0;
  let plays = 0;
  const audio = { load() { loads++; }, play() { plays++; return Promise.resolve(); }, pause() {} };
  const controller = createFinaleAudio(audio);
  controller.update(3600000);
  assert.equal(loads, 0);
  controller.update(60000);
  controller.prepare();
  controller.update(30000);
  assert.equal(loads, 1);
  assert.equal(plays, 0);
  controller.update(MUSIC_LEAD_MS);
  assert.equal(plays, 1);
});

test("music starts at the configured lead time once and can be replayed after resetting the preview", () => {
  let plays = 0;
  let pauses = 0;
  const audio = {
    currentTime: 0,
    play() { plays++; return Promise.resolve(); },
    pause() { pauses++; },
  };
  const controller = createFinaleAudio(audio);
  controller.update(MUSIC_LEAD_MS + 1);
  assert.equal(plays, 0);
  controller.update(MUSIC_LEAD_MS);
  controller.update(9000);
  controller.update(1);
  controller.update(0);
  assert.equal(plays, 1);
  assert.equal(audio.loop, false);
  audio.currentTime = 4;
  controller.reset();
  assert.equal(pauses, 1);
  assert.equal(audio.currentTime, 0);
  controller.update(0);
  controller.update(-1);
  assert.equal(plays, 1);
  controller.update(MUSIC_LEAD_MS);
  assert.equal(plays, 2);
});
