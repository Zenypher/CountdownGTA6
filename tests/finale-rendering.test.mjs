import test from "node:test";
import assert from "node:assert/strict";
import { createFinaleScene, FINAL_HOUR_MS } from "../public/js/finale.mjs";

test("hidden and stationary scenes skip vector redraws, but resizing invalidates the cache", () => {
  const names = ["document", "matchMedia", "addEventListener", "innerWidth", "innerHeight"];
  const saved = names.map((name) => Object.getOwnPropertyDescriptor(globalThis, name));
  let draws = 0;
  let styles = 0;
  let resize;
  const overlay = { hidden: true, style: { setProperty() { styles++; } } };
  const geometry = { setAttribute() { draws++; } };
  try {
    globalThis.innerWidth = 390;
    globalThis.innerHeight = 844;
    globalThis.document = {
      body: { dataset: {} },
      getElementById: (id) => id === "finale-overlay" ? overlay : geometry,
      querySelector: () => ({}), querySelectorAll: () => [],
    };
    globalThis.matchMedia = () => ({ matches: false, addEventListener() {} });
    globalThis.addEventListener = (_event, callback) => { resize = callback; };
    const update = createFinaleScene();
    update(FINAL_HOUR_MS + 2000);
    const initialStyles = styles;
    update(FINAL_HOUR_MS + 1000);
    assert.equal(draws, 0);
    assert.equal(styles, initialStyles);
    update(FINAL_HOUR_MS);
    assert.equal(draws, 1);
    update(FINAL_HOUR_MS - 1000);
    assert.equal(draws, 1);
    update(4000);
    assert.equal(draws, 2);
    update(4000);
    assert.equal(draws, 2);
    globalThis.innerWidth = 800;
    resize();
    assert.equal(draws, 3);
    update(0);
    assert.equal(draws, 3);
  } finally {
    names.forEach((name, index) => {
      if (saved[index]) Object.defineProperty(globalThis, name, saved[index]);
      else delete globalThis[name];
    });
  }
});
