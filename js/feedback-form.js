const feedbackPatterns = {
  name: /^[\p{L}][\p{L}\p{M}'’ -]{1,49}$/u,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
  phone: /^\+380\d{9}$/,
  message: /^[\s\S]{10,1000}$/,
};

const feedbackMessages = {
  name: "Введіть ім’я: від 2 символів, без цифр.",
  email: "Введіть коректну email-адресу.",
  phone: "Введіть телефон у форматі +380XXXXXXXXX.",
  message: "Повідомлення має містити щонайменше 10 символів.",
  consent: "Підтвердьте згоду на обробку персональних даних.",
};

function validateFeedbackValues(values) {
  const normalized = {
    name: String(values.name ?? "").trim(),
    email: String(values.email ?? "").trim(),
    phone: String(values.phone ?? "").trim(),
    message: String(values.message ?? "").trim(),
    consent: values.consent === true,
  };

  return {
    name: feedbackPatterns.name.test(normalized.name) ? "" : feedbackMessages.name,
    email: feedbackPatterns.email.test(normalized.email) ? "" : feedbackMessages.email,
    phone: feedbackPatterns.phone.test(normalized.phone) ? "" : feedbackMessages.phone,
    message: feedbackPatterns.message.test(normalized.message) ? "" : feedbackMessages.message,
    consent: normalized.consent ? "" : feedbackMessages.consent,
  };
}

function initFeedbackForm() {
  const form = document.querySelector("#feedback-form");
  const modal = document.querySelector("#feedback-success-modal");
  if (!form || !modal) return;

  const controls = [...form.elements].filter((element) => element.name);
  const clearButton = form.querySelector("[data-feedback-clear]");
  let returnFocus = null;

  const getValues = () => ({
    name: form.elements.name.value,
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    message: form.elements.message.value,
    consent: form.elements.consent.checked,
  });

  const renderField = (control, error) => {
    const field = control.closest(".form-field");
    const errorElement = field.querySelector(".field-error");
    const hasValue = control.type === "checkbox" ? control.checked : control.value.trim() !== "";

    control.setAttribute("aria-invalid", String(Boolean(error)));
    field.classList.toggle("is-error", Boolean(error));
    field.classList.toggle("is-success", !error && hasValue);
    errorElement.textContent = error;
  };

  const validateField = (control) => {
    const errors = validateFeedbackValues(getValues());
    renderField(control, errors[control.name]);
    return !errors[control.name];
  };

  controls.forEach((control) => {
    control.addEventListener("input", () => {
      if (control.dataset.touched === "true") validateField(control);
    });
    control.addEventListener("blur", () => {
      control.dataset.touched = "true";
      validateField(control);
    });
  });

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    returnFocus?.focus();
  };

  const openModal = () => {
    returnFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    modal.querySelector(".feedback-modal-card").focus();
  };

  modal.querySelectorAll("[data-modal-close]").forEach((element) => {
    element.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      event.preventDefault();
      modal.querySelector("button").focus();
    }
  });

  clearButton?.addEventListener("click", () => {
    form.reset();
    controls.forEach((control) => {
      delete control.dataset.touched;
      renderField(control, "");
    });
    form.elements.name.focus();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const errors = validateFeedbackValues(getValues());

    controls.forEach((control) => {
      control.dataset.touched = "true";
      renderField(control, errors[control.name]);
    });

    const firstInvalid = controls.find((control) => errors[control.name]);
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    openModal();
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initFeedbackForm);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { feedbackPatterns, validateFeedbackValues };
}
