const requestMessages = {
  name: "Введіть ім’я: 2–50 літер, без цифр.",
  phone: "Введіть український номер у форматі +380 XX XXX XX XX.",
  email: "Введіть коректну email-адресу.",
  device: "Вкажіть тип і модель пристрою: щонайменше 3 символи.",
  delivery: "Оберіть спосіб передачі пристрою.",
  date: "Оберіть сьогоднішню або майбутню дату.",
  consent: "Підтвердьте згоду на обробку персональних даних.",
};

function localDateValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function validateRequestValues(values, today = localDateValue()) {
  const name = String(values.name ?? "").trim();
  const phone = String(values.phone ?? "").replace(/[\s()-]/g, "");
  const email = String(values.email ?? "").trim();
  const device = String(values.device ?? "").trim();
  const delivery = String(values.delivery ?? "");
  const date = String(values.date ?? "");

  return {
    name: /^[\p{L}][\p{L}\p{M}'’ -]{1,49}$/u.test(name) ? "" : requestMessages.name,
    phone: /^\+380\d{9}$/.test(phone) ? "" : requestMessages.phone,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : requestMessages.email,
    device: device.length >= 3 && device.length <= 80 ? "" : requestMessages.device,
    delivery: ["self", "courier", "master"].includes(delivery) ? "" : requestMessages.delivery,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today ? "" : requestMessages.date,
    consent: values.consent === true ? "" : requestMessages.consent,
  };
}

function initRequestForm() {
  const form = document.querySelector("#request-form");
  if (!form) return;

  const dateInput = form.elements.date;
  const today = localDateValue();
  dateInput.min = today;

  const controls = [...form.elements].filter((element) => element.name);
  const values = () => ({
    name: form.elements.name.value,
    phone: form.elements.phone.value,
    email: form.elements.email.value,
    device: form.elements.device.value,
    delivery: form.elements.delivery.value,
    date: dateInput.value,
    consent: form.elements.consent.checked,
  });

  const render = (control, error) => {
    const field = control.closest(".form-field");
    const errorElement = field.querySelector(".field-error");
    const hasValue = control.type === "checkbox" ? control.checked : control.value.trim() !== "";
    control.setAttribute("aria-invalid", String(Boolean(error)));
    field.classList.toggle("is-error", Boolean(error));
    field.classList.toggle("is-success", !error && hasValue);
    errorElement.textContent = error;
  };

  const validateControl = (control) => {
    const errors = validateRequestValues(values(), today);
    render(control, errors[control.name]);
  };

  controls.forEach((control) => {
    const eventName = control.type === "checkbox" || control.tagName === "SELECT" || control.type === "date" ? "change" : "input";
    control.addEventListener(eventName, () => {
      if (control.dataset.touched === "true") validateControl(control);
    });
    control.addEventListener("blur", () => {
      control.dataset.touched = "true";
      validateControl(control);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const errors = validateRequestValues(values(), today);
    controls.forEach((control) => {
      control.dataset.touched = "true";
      render(control, errors[control.name]);
    });
    const firstInvalid = controls.find((control) => errors[control.name]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }
    form.querySelector(".form-status").textContent =
      "Демонстраційна заявка перевірена. Для надсилання потрібен сервер.";
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initRequestForm);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { localDateValue, validateRequestValues };
}
