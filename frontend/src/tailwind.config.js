/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brandPurple: "#7b2ff7",
        brandPink: "#f107a3",
        brandCyan: "#22D3EE",
        brandLight: "#F3F4F6",
      },
    },
  },
  plugins: [],
};
