import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { getRemaining } from "../public/js/countdown.mjs";
import { getFinaleState, FINAL_HOUR_MS, MUSIC_LEAD_MS } from "../public/js/finale.mjs";

test("real countdown keeps requesting frames through the hold and zoom, then stops at zero without preview controls", () => {
  let now = 0;
  let nextId = 0;
  const frames = new Map();
  const elements = new Map();
  const phases = [];
  let tick;
  const source = readFileSync(new URL("../public/js/main.js", import.meta.url), "utf8")
    .replace(/^import .*;\r?\n/gm, "");
  class Clock extends Date { static now() { return now; } }
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      textContent: "", dataset: {}, listeners: {},
      addEventListener(type, callback) { this.listeners[type] = callback; },
    });
    return elements.get(id);
  };
  vm.runInNewContext(source, {
    Date: Clock, URLSearchParams, location: { hostname: "localhost", search: "" },
    document: { getElementById: element, querySelectorAll: () => [] },
    release: { target: new Date(MUSIC_LEAD_MS).toISOString(), sourceUrl: "" },
    getRemaining, FINAL_HOUR_MS, MUSIC_LEAD_MS,
    createFinaleAudio: () => ({ update() {}, reset() {}, prepare() {} }),
    createFinaleScene: () => (distance) => {
      const { phase } = getFinaleState(distance);
      phases.push(phase);
      return phase;
    },
    setInterval: (callback) => { tick = callback; return 1; }, clearInterval() {},
    requestAnimationFrame(callback) { frames.set(++nextId, callback); return nextId; },
    cancelAnimationFrame(id) { frames.delete(id); },
  });
  for (let i = 0; i < MUSIC_LEAD_MS * 60 / 1000; i++) {
    now = i * 1000 / 60;
    if (i % 60 === 0) {
      const previousUpdates = phases.length;
      tick();
      assert.equal(phases.length, previousUpdates, "timer tick must not redraw a running scene");
    }
    assert.equal(frames.size, 1, "exactly one frame loop stays alive");
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback();
  }
  assert.ok(phases.includes("masked"));
  assert.ok(phases.includes("zooming"));
  now = MUSIC_LEAD_MS;
  const [id, callback] = frames.entries().next().value;
  frames.delete(id);
  callback();
  assert.equal(phases.at(-1), "complete");
  assert.equal(frames.size, 0);
  assert.equal(elements.has("preview-finale"), false);
  assert.equal(elements.has("preview-hour"), false);
});
