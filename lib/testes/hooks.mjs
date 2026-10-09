// Hooks do carregador do Node para rodar lib/*.ts nos testes (registrados por registrar.mjs):
// - módulos nativos/React Native e o cliente Supabase → fakes.mjs
// - imports sem extensão ("./db") → "./db.ts", como o Metro resolve
// - .json importado sem "with { type: 'json' }"
const FAKES = new URL('./fakes.mjs', import.meta.url).href;
const SUBSTITUIDOS = new Set([
  'expo-sqlite',
  'expo-crypto',
  'react',
  'react-native',
  '@react-native-async-storage/async-storage',
  './supabase',
]);

export async function resolve(especificador, contexto, proximo) {
  if (SUBSTITUIDOS.has(especificador)) return { url: FAKES, shortCircuit: true };
  try {
    return await proximo(especificador, contexto);
  } catch (e) {
    if (especificador.startsWith('.')) return proximo(especificador + '.ts', contexto);
    throw e;
  }
}

export async function load(url, contexto, proximo) {
  if (url.endsWith('.json')) return proximo(url, { ...contexto, importAttributes: { type: 'json' } });
  return proximo(url, contexto);
}
