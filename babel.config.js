module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      "babel-preset-expo",
      "nativewind/babel", // <- aqui, dentro de presets
    ],
    // plugins: [] -> remova "nativewind/babel" daqui se estiver
  };
};
