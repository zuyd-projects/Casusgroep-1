/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode with class strategy
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
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-geist-mono)', 'ui-monospace'],
      },
    },
  },
  plugins: [],
};
