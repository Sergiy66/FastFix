document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem("fastfix-theme");
  const preferredTheme = window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    const toggle = document.querySelector("[data-theme-toggle]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(theme === "dark"));
      toggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Увімкнути світлу тему" : "Увімкнути темну тему",
      );
      toggle.querySelector("span").textContent = theme === "dark" ? "Світла тема" : "Темна тема";
    }
  };

  const headerBar = document.querySelector(".header-bar");
  if (headerBar) {
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";
    toggle.dataset.themeToggle = "";
    toggle.innerHTML = '<span aria-hidden="true"></span>';
    headerBar.insertBefore(toggle, headerBar.querySelector(".mobile-menu"));
    toggle.addEventListener("click", () => {
      const theme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("fastfix-theme", theme);
      setTheme(theme);
    });
  }
  setTheme(storedTheme === "dark" || storedTheme === "light" ? storedTheme : preferredTheme);

  const youtubePlayer = document.querySelector("[data-youtube-player]");
  const localVideoNote = document.querySelector("[data-video-local-note]");

  if (youtubePlayer && ["http:", "https:"].includes(window.location.protocol)) {
    const videoId = youtubePlayer.dataset.videoId;
    const iframe = document.createElement("iframe");

    iframe.className = "h-full w-full";
    iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0`;
    iframe.title = youtubePlayer.dataset.videoTitle;
    iframe.loading = "lazy";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    youtubePlayer.replaceChildren(iframe);
  } else {
    localVideoNote?.classList.remove("hidden");
  }

  const closeMenus = () =>
    document
      .querySelectorAll("header details[open]")
      .forEach((menu) => menu.removeAttribute("open"));
  document
    .querySelectorAll("header details a")
    .forEach((link) => link.addEventListener("click", closeMenus));

  const landingCalculator = document.querySelector("#landing-calculator");
  landingCalculator?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!landingCalculator.reportValidity()) return;

    const category = new FormData(landingCalculator).get("category");
    const estimates = {
      phone: {
        price: "2 000–3 000 грн",
        term: "Орієнтовний термін: 1–3 робочі дні",
      },
      laptop: {
        price: "3 000–6 000 грн",
        term: "Орієнтовний термін: 2–5 робочих днів",
      },
      computer: {
        price: "2 500–5 000 грн",
        term: "Орієнтовний термін: 2–4 робочі дні",
      },
    };
    const estimate = estimates[category] ?? estimates.phone;
    const output = landingCalculator.querySelector("#landing-estimate");

    output.querySelector("[data-estimate-price]").textContent = estimate.price;
    output.querySelector("[data-estimate-term]").textContent = estimate.term;
    output.classList.remove("hidden");
    output.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  const calculator = document.querySelector("#calculator-form");
  calculator?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!calculator.reportValidity()) return;
    document
      .querySelector(".estimate")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});
