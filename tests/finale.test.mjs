import test from "node:test";
import assert from "node:assert/strict";
import { getFinaleState, getPortalLayout, getPortalMatrix, FINAL_HOUR_MS, MUSIC_LEAD_MS, TRANSITION_MS } from "../public/js/finale.mjs";

test("masked scene starts exactly one hour before the release target", () => {
  assert.equal(getFinaleState(FINAL_HOUR_MS + 1).phase, "normal");
  assert.equal(getFinaleState(FINAL_HOUR_MS).phase, "masked");
  assert.equal(getFinaleState(MUSIC_LEAD_MS + 1).phase, "masked");
});

test("zoom progress follows time remaining, including delayed frames", () => {
  assert.deepEqual(getFinaleState(MUSIC_LEAD_MS), { phase: "masked", progress: 0 });
  assert.deepEqual(getFinaleState(TRANSITION_MS + 1), { phase: "masked", progress: 0 });
  assert.deepEqual(getFinaleState(TRANSITION_MS), { phase: "zooming", progress: 0 });
  assert.deepEqual(getFinaleState(TRANSITION_MS / 2), { phase: "zooming", progress: 0.5 });
  assert.deepEqual(getFinaleState(0), { phase: "complete", progress: 1 });
  assert.equal(getFinaleState(-1000).phase, "complete");
});

test("native vector transform keeps the resting logo centered at different viewport sizes", () => {
  for (const [width, height] of [[1440, 1000], [390, 844], [844, 390]]) {
    const layout = getPortalLayout(width, height);
    const [scale, , , , x, y] = getPortalMatrix(layout, 0);
    assert.ok(Math.abs(500 * scale + x - width / 2) < 0.001);
    assert.ok(Math.abs(400 * scale + y - height / 2) < 0.01);
  }
});

test("zoom transforms the e counter toward the viewport center with finite vector coordinates", () => {
  const layout = getPortalLayout(390, 844);
  for (const progress of [0, 0.2, 0.5, 0.8, 1]) {
    assert.ok(getPortalMatrix(layout, progress).every(Number.isFinite));
  }
  const [scale, , , , x, y] = getPortalMatrix(layout, 1);
  assert.ok(Math.abs(643.64682 * scale + x - 195) < 1);
  assert.ok(Math.abs(357.82529 * scale + y - 422) < 1);
});

test("the e hole fully covers portrait and landscape viewports at zero", () => {
  for (const [width, height] of [[390, 844], [1440, 1000], [844, 390]]) {
    const layout = getPortalLayout(width, height);
    const [scale, , , , x, y] = getPortalMatrix(layout, 1);
    assert.ok(638.50537 * scale + x < 0);
    assert.ok(648.78827 * scale + x > width);
    assert.ok(349.66931 * scale + y < 0);
    assert.ok(365.98126 * scale + y > height);
    const halfway = getPortalMatrix(layout, getFinaleState(5000).progress)[0];
    const nearEnd = getPortalMatrix(layout, getFinaleState(1000).progress)[0];
    assert.ok(halfway < nearEnd && nearEnd < scale);
  }
});
