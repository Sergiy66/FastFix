const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

function createPage() {
  const root = path.resolve(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "request.html"), "utf8");
  const appScript = fs.readFileSync(path.join(root, "js", "app.js"), "utf8");
  const script = fs.readFileSync(path.join(root, "js", "feedback-form.js"), "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", url: "https://fastfix.test/request.html" });

  dom.window.eval(appScript);
  dom.window.eval(script);
  dom.window.document.dispatchEvent(new dom.window.Event("DOMContentLoaded"));
  return dom;
}

function submit(dom, form) {
  form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
}

test("blur and input update error and success states", () => {
  const dom = createPage();
  const input = dom.window.document.querySelector("#feedback-name");
  const field = input.closest(".form-field");

  input.value = "1";
  input.dispatchEvent(new dom.window.Event("blur"));
  assert.equal(input.getAttribute("aria-invalid"), "true");
  assert.equal(field.classList.contains("is-error"), true);
  assert.notEqual(field.querySelector(".field-error").textContent, "");

  input.value = "Олена";
  input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  assert.equal(input.getAttribute("aria-invalid"), "false");
  assert.equal(field.classList.contains("is-success"), true);
});

test("invalid submit focuses first invalid control", () => {
  const dom = createPage();
  const { document } = dom.window;
  const form = document.querySelector("#feedback-form");

  submit(dom, form);
  assert.equal(document.activeElement, form.elements.name);
  assert.equal(form.elements.name.getAttribute("aria-invalid"), "true");
  assert.equal(form.elements.consent.getAttribute("aria-invalid"), "true");
});

test("valid submit resets form, opens modal, and Escape closes it", () => {
  const dom = createPage();
  const { document } = dom.window;
  const form = document.querySelector("#feedback-form");
  const modal = document.querySelector("#feedback-success-modal");

  form.elements.name.value = "Олена";
  form.elements.email.value = "olena@example.com";
  form.elements.phone.value = "+380671234567";
  form.elements.message.value = "Потрібна консультація щодо ремонту.";
  form.elements.consent.checked = true;
  submit(dom, form);

  assert.equal(form.elements.name.value, "");
  assert.equal(form.elements.consent.checked, false);
  assert.equal(modal.hidden, false);
  assert.equal(document.body.classList.contains("modal-open"), true);

  modal.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert.equal(modal.hidden, true);
  assert.equal(document.body.classList.contains("modal-open"), false);
});
