/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f1efff",
          100: "#e4e0ff",
          200: "#c9c1ff",
          300: "#a99cff",
          400: "#8b78fb",
          500: "#6d54f0",
          600: "#5b3fe0",
          700: "#4a30c2",
          800: "#3d2896",
          900: "#241a5c",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.1)",
      },
    },
  },
  plugins: [],
};
