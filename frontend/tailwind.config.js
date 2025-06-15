module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: "#7b2ff7",
          pink: "#f107a3",
          cyan: "#22D3EE",
          light: "#F3F4F6",
          card: "#fff",
        },
      },
      boxShadow: {
        card: "0 4px 24px 0 rgba(80, 63, 205, 0.08)",
      },
    },
  },
  darkMode: "media",
  plugins: [],
};
