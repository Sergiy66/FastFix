const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
const css = fs.readFileSync(path.join(root, "css", "style.css"), "utf8");

test("loads Typed.js through a pinned CDN", () => {
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/typed\.js@3\.0\.0\/dist\/typed\.umd\.js/);
});

test("Hero has FastFix slogans and reduced-motion protection", () => {
  const dom = new JSDOM(html);
  const target = dom.window.document.querySelector(".hero-image [data-typed-hero]");
  assert.ok(target);
  assert.match(script, /ОНЛАЙН-ОЦІНКА РЕМОНТУ/);
  assert.match(script, /ЧЕСНА ЦІНА БЕЗ СЮРПРИЗІВ/);
  assert.match(script, /ШВИДКИЙ СЕРВІС FASTFIX/);
  assert.match(script, /prefers-reduced-motion:\s*reduce/);
  assert.match(script, /typeSpeed:\s*42/);
  assert.match(script, /backDelay:\s*2400/);
  assert.match(script, /showCursor:\s*false/);
  assert.match(css, /width:\s*min\(290px/);
  assert.match(css, /min-height:\s*42px/);
});
