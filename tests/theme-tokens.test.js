const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const css = fs.readFileSync(path.resolve(__dirname, "..", "css", "style.css"), "utf8").toLowerCase();

test("light and dark themes contain every Figma semantic color", () => {
  const figmaColors = [
    "#fafcff", "#0b1220", "#ffffff", "#151f30", "#f7f9fc", "#101a2a",
    "#080e19", "#202b3d", "#edf3fa", "#5d708a", "#a7b8cf", "#d2dce8",
    "#dfe7f1", "#2b3a50", "#1e3a8a", "#9db7ff", "#3554b6", "#f97316",
    "#eaf4ff", "#1c2d49", "#06b6d4", "#38d4eb", "#e7f7fc", "#143541",
    "#18263b", "#23334b", "#536781", "#6e83a0",
  ];

  figmaColors.forEach((color) => assert.ok(css.includes(color), `missing Figma token ${color}`));
});

test("theme switch uses Figma desktop and mobile dimensions", () => {
  assert.match(css, /width:\s*96px/);
  assert.match(css, /height:\s*36px/);
  assert.match(css, /width:\s*108px/);
  assert.match(css, /height:\s*38px/);
  assert.match(css, /border-radius:\s*9px/);
});
