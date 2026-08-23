module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel", // <- aqui, dentro de presets
    ],
    plugins: [
      "react-native-reanimated/plugin",
    ],
  };
};
