const test = require("node:test");
const assert = require("node:assert/strict");
const { validateRequestValues } = require("../js/request-form.js");

const validValues = {
  name: "Олена",
  phone: "+380671234567",
  email: "olena@example.com",
  device: "Samsung Galaxy S24",
  delivery: "courier",
  date: "2026-11-16",
  consent: true,
};

test("accepts a valid repair request", () => {
  assert.deepEqual(validateRequestValues(validValues, "2026-11-15"), {
    name: "",
    phone: "",
    email: "",
    device: "",
    delivery: "",
    date: "",
    consent: "",
  });
});

test("rejects every invalid request field", () => {
  const errors = validateRequestValues(
    {
      name: "1",
      phone: "123",
      email: "bad@",
      device: "x",
      delivery: "post",
      date: "2026-11-14",
      consent: false,
    },
    "2026-11-15",
  );

  Object.values(errors).forEach((error) => assert.notEqual(error, ""));
});

test("normalizes phone separators and rejects future-invalid dates", () => {
  assert.equal(
    validateRequestValues({ ...validValues, phone: "+380 (67) 123-45-67" }, "2026-11-15").phone,
    "",
  );
  assert.notEqual(
    validateRequestValues({ ...validValues, date: "not-a-date" }, "2026-11-15").date,
    "",
  );
});
