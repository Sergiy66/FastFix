const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "about.html"), "utf8");
const script = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");

test("loads Fancybox v5 from CDN", () => {
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/@fancyapps\/ui@5\.0\/dist\/fancybox\/fancybox\.css/);
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/@fancyapps\/ui@5\.0\/dist\/fancybox\/fancybox\.umd\.js/);
});

test("groups local FastFix images with transition and zoom", () => {
  const dom = new JSDOM(html);
  const items = [...dom.window.document.querySelectorAll('[data-fancybox="fastfix-team"]')];

  assert.equal(items.length, 3);
  items.forEach((item) => {
    assert.match(item.getAttribute("href"), /^assets\/images\//);
    assert.ok(item.querySelector("img"));
    assert.ok(item.dataset.caption);
  });
  assert.match(script, /transition:\s*"fade"/);
  assert.match(script, /zoom:\s*true/);
  assert.match(script, /contentClick:\s*"toggleZoom"/);
});
