/** @type {import('tailwindcss').Config} */
module.exports = {
  prefix: "tw-",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      animation: {
        "fade-in": "twFadeIn 0.6s ease-out both",
        "bounce-in": "twBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both",
      },
      keyframes: {
        twFadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twBounceIn: {
          "0%": { opacity: "0", transform: "scale(0.8)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
