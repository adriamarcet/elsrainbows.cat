import test from "node:test";
import assert from "node:assert/strict";

import {
  setupMobileMenu,
  setupHeaderScroll,
  setupSlideshow,
  setFooterYear,
} from "../main.mjs";

function createClassList(initial = []) {
  const set = new Set(initial);
  return {
    add(name) {
      set.add(name);
    },
    remove(name) {
      set.delete(name);
    },
    contains(name) {
      return set.has(name);
    },
    toggle(name, force) {
      if (typeof force === "boolean") {
        if (force) set.add(name);
        else set.delete(name);
        return force;
      }

      if (set.has(name)) {
        set.delete(name);
        return false;
      }

      set.add(name);
      return true;
    },
  };
}

function createElement({ attrs = {}, classes = [] } = {}) {
  const listeners = new Map();
  const attributes = new Map(Object.entries(attrs));

  return {
    classList: createClassList(classes),
    textContent: "",
    addEventListener(event, handler) {
      listeners.set(event, handler);
    },
    trigger(event) {
      const handler = listeners.get(event);
      if (handler) handler();
    },
    getAttribute(name) {
      return attributes.get(name);
    },
    setAttribute(name, value) {
      attributes.set(name, value);
    },
  };
}

test("1) mobile nav menu toggles visibility and aria-expanded on click", () => {
  const toggle = createElement({ attrs: { "aria-expanded": "false" } });
  const menu = createElement();

  setupMobileMenu(toggle, menu);

  toggle.trigger("click");
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(menu.classList.contains("is-open"), true);

  toggle.trigger("click");
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(menu.classList.contains("is-open"), false);
});

test("2) header is-scrolled class is toggled based on scroll position", () => {
  const header = createElement();
  const win = {
    scrollY: 0,
    requestAnimationFrame: (cb) => cb(),
    addEventListener(event, handler) {
      this._handler = event === "scroll" ? handler : null;
    },
  };

  setupHeaderScroll(header, win, 24);
  assert.equal(header.classList.contains("is-scrolled"), false);

  win.scrollY = 30;
  win._handler();
  assert.equal(header.classList.contains("is-scrolled"), true);

  win.scrollY = 0;
  win._handler();
  assert.equal(header.classList.contains("is-scrolled"), false);
});

test("3) slideshow auto-advances every 4s unless reduced motion is preferred", () => {
  const slides = [
    createElement({ classes: ["is-active"] }),
    createElement(),
    createElement(),
  ];
  const dots = [
    createElement({ classes: ["is-active"] }),
    createElement(),
    createElement(),
  ];

  let intervalMs = null;
  let intervalCb = null;
  const setIntervalFn = (cb, ms) => {
    intervalCb = cb;
    intervalMs = ms;
    return 1;
  };

  const slideshow = setupSlideshow({
    slides,
    dots,
    prefersReducedMotion: false,
    setIntervalFn,
  });

  slideshow.start();
  assert.equal(intervalMs, 4000);
  assert.equal(typeof intervalCb, "function");

  intervalCb();
  assert.equal(slides[1].classList.contains("is-active"), true);

  let reducedMotionIntervals = 0;
  const reducedMotionShow = setupSlideshow({
    slides: [createElement({ classes: ["is-active"] }), createElement()],
    dots: [createElement({ classes: ["is-active"] }), createElement()],
    prefersReducedMotion: true,
    setIntervalFn: () => {
      reducedMotionIntervals += 1;
      return 1;
    },
  });

  reducedMotionShow.start();
  assert.equal(reducedMotionIntervals, 0);
});

test("4) slideshow updates active dot indicator when slide changes", () => {
  const slides = [
    createElement({ classes: ["is-active"] }),
    createElement(),
  ];
  const dots = [
    createElement({ classes: ["is-active"] }),
    createElement(),
  ];

  let cb;
  const slideshow = setupSlideshow({
    slides,
    dots,
    prefersReducedMotion: false,
    setIntervalFn: (intervalCallback) => {
      cb = intervalCallback;
      return 1;
    },
  });

  slideshow.start();
  cb();

  assert.equal(dots[0].classList.contains("is-active"), false);
  assert.equal(dots[1].classList.contains("is-active"), true);
});

test("5) footer displays the current year", () => {
  const year = createElement();
  const date = new Date("2026-03-09T12:00:00Z");

  setFooterYear(year, date);

  assert.equal(year.textContent, "2026");
});
