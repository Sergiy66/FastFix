/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./docs/tailwind-components.md"],
  theme: {
    extend: {
      colors: {
        fastfix: {
          primary: "#1E3A8A",
          orange: "#F97316",
          cyan: "#06B6D4",
          dark: "#0B1220",
          text: "#1F2937",
          muted: "#64748B",
          light: "#CBD5E1",
          surface: "#F3F6FA",
          border: "#D9E2EC",
        },
      },
      fontFamily: {
        inter: ["Inter", "Arial", "sans-serif"],
        manrope: ["Manrope", "Inter", "sans-serif"],
      },
      maxWidth: { content: "1320px" },
      boxShadow: { card: "0 1px 3px rgb(15 23 42 / 0.08)" },
    },
  },
  plugins: [],
};
