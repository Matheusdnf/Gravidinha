const http = require("http");
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// expo-sqlite na web: carrega o wa-sqlite (.wasm) e precisa de SharedArrayBuffer, que o navegador
// só libera com os cabeçalhos abaixo (cross-origin isolation). O index.html sai de um middleware
// do Expo que roda antes do server.enhanceMiddleware, por isso os cabeçalhos entram no writeHead.
// ponytail: vale só para o servidor de desenvolvimento (expo start --web, inclusive o Docker);
// um build estático (expo export) precisa que a hospedagem envie os mesmos cabeçalhos.
config.resolver.assetExts.push("wasm");
const writeHead = http.ServerResponse.prototype.writeHead;
http.ServerResponse.prototype.writeHead = function (...args) {
  if (!this.headersSent) {
    this.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
    this.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  }
  return writeHead.apply(this, args);
};

module.exports = withNativeWind(config, { input: "./app/global.css" });
