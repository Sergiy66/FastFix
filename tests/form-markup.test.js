const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");
const pages = fs.readdirSync(root).filter((file) => file.endsWith(".html"));

test("all submitted form controls have names and required constraints", () => {
  for (const page of pages) {
    const dom = new JSDOM(fs.readFileSync(path.join(root, page), "utf8"));
    const forms = [...dom.window.document.forms];

    for (const form of forms) {
      const controls = [...form.querySelectorAll("input, select, textarea")].filter(
        (control) => control.type !== "submit" && control.type !== "button",
      );
      controls.forEach((control) => {
        assert.ok(control.name, `${page}#${form.id}: control has no name`);
      });

      form.querySelectorAll('input[type="text"][required], textarea[required]').forEach((control) => {
        assert.ok(control.minLength > 0, `${page}#${form.id}: ${control.name} has no minlength`);
        assert.ok(control.maxLength > 0, `${page}#${form.id}: ${control.name} has no maxlength`);
      });
    }
  }
});
