const test = require("node:test");
const assert = require("node:assert/strict");
const { validateFeedbackValues } = require("../js/feedback-form.js");

const validValues = {
  name: "Олена",
  email: "olena@example.com",
  phone: "+380671234567",
  message: "Потрібна консультація щодо ремонту.",
  consent: true,
};

test("accepts valid feedback values", () => {
  assert.deepEqual(validateFeedbackValues(validValues), {
    name: "",
    email: "",
    phone: "",
    message: "",
    consent: "",
  });
});

test("accepts a two-letter Unicode name", () => {
  assert.equal(validateFeedbackValues({ ...validValues, name: "Ян" }).name, "");
});

test("rejects a one-letter name and digits", () => {
  assert.notEqual(validateFeedbackValues({ ...validValues, name: "Я" }).name, "");
  assert.notEqual(validateFeedbackValues({ ...validValues, name: "Олена2" }).name, "");
});

test("rejects malformed email addresses", () => {
  for (const email of ["user", "user@", "@example.com", "user@example"]) {
    assert.notEqual(validateFeedbackValues({ ...validValues, email }).email, "");
  }
});

test("requires exact Ukrainian phone format", () => {
  for (const phone of ["380671234567", "+380 67 123 45 67", "+38067123456", "+3806712345678"]) {
    assert.notEqual(validateFeedbackValues({ ...validValues, phone }).phone, "");
  }
});

test("trims message and requires ten characters", () => {
  assert.notEqual(validateFeedbackValues({ ...validValues, message: "123456789" }).message, "");
  assert.equal(validateFeedbackValues({ ...validValues, message: " 1234567890 " }).message, "");
});

test("requires consent", () => {
  assert.notEqual(validateFeedbackValues({ ...validValues, consent: false }).consent, "");
});
