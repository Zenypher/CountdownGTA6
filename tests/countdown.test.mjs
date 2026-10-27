import test from "node:test";
import assert from "node:assert/strict";
import { getRemaining } from "../public/js/countdown.mjs";

const target = Date.parse("2026-11-19T00:00:00Z");

test("counts actual elapsed days across a month boundary", () => {
    const now = Date.parse("2026-10-19T00:00:00Z");
    assert.equal(getRemaining(target, now).days, 31);
});

test("keeps the final partial second visible", () => {
    assert.equal(getRemaining(target, target - 1).seconds, 1);
});

test("expires at the exact target", () => {
    assert.equal(getRemaining(target, target).expired, true);
})

test("clamps past targets to zero", () => {
    assert.deepEqual(getRemaining(target, target + 1000), {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true,
    });
});

test("rejects invalid timestamps", () => {
    assert.throws(() => getRemaining(NaN, 0), TypeError);
})