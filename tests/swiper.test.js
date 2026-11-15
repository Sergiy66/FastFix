const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");

test("loads Swiper v11 bundle from CDN", () => {
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.css/);
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.js/);
});

test("slider has six slides, arrows, autoplay, and clickable pagination", () => {
  const dom = new JSDOM(html);
  const slider = dom.window.document.querySelector(".service-swiper");

  assert.ok(slider);
  assert.equal(slider.querySelectorAll(".swiper-slide").length, 6);
  assert.ok(slider.querySelector(".swiper-button-prev"));
  assert.ok(slider.querySelector(".swiper-button-next"));
  assert.ok(slider.querySelector(".swiper-pagination"));
  assert.match(script, /autoplay:\s*\{/);
  assert.match(script, /clickable:\s*true/);
  assert.match(script, /breakpoints:\s*\{/);
});
