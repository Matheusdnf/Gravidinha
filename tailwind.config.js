/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // Na web o NativeWind observa a classe do <html> e quebra se o modo for "media"
  darkMode: "class",
  theme: {
    extend: {},
  },
  plugins: [],
};
