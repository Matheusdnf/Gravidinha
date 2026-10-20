/** @type {import('tailwindcss').Config} */
const { temas } = require("./constants/tema.ts");

// fundo -> --fundo, bordaForte -> --borda-forte; valor "r g b" para aceitar opacidade (bg-cartao/60)
const nomeCss = (k) => k.replace(/[A-Z0-9]/g, (c) => "-" + c.toLowerCase());
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");
const variaveis = (cores) =>
  Object.fromEntries(Object.entries(cores).map(([k, v]) => [`--${nomeCss(k)}`, rgb(v)]));

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // Na web o NativeWind observa a classe do <html> e quebra se o modo for "media"
  darkMode: "class",
  theme: {
    extend: {
      colors: Object.fromEntries(
        Object.keys(temas.claro).map((k) => [nomeCss(k), `rgb(var(--${nomeCss(k)}) / <alpha-value>)`]),
      ),
    },
  },
  plugins: [
    ({ addBase }) =>
      addBase({ ":root": variaveis(temas.claro), ".dark:root": variaveis(temas.escuro) }),
  ],
};
