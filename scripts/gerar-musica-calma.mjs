// Gera assets/audio/lofi.wav: um beat lo-fi calmo (piano elétrico com acordes de jazz, baixo, bateria suave e chiado de vinil),
// sintetizado aqui, sem direitos autorais. Loop sem emenda: o que passa do fim volta para o começo.
// Uso: node scripts/gerar-musica-calma.mjs
import { writeFileSync } from 'node:fs';

const TAXA = 22050;
const BPM = 72;
const BATIDA = 60 / BPM;
const COMPASSOS = 8;
const n = Math.round(TAXA * BATIDA * 4 * COMPASSOS);
const mix = new Float64Array(n);

let semente = 7;
const rand = () => {
  semente = (semente + 0x6d2b79f5) | 0;
  let t = Math.imul(semente ^ (semente >>> 15), 1 | semente);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const adicionar = (inicioSeg, dur, gerar) => {
  const i0 = Math.round(inicioSeg * TAXA);
  const len = Math.round(dur * TAXA);
  for (let k = 0; k < len; k++) mix[(i0 + k) % n] += gerar(k / TAXA);
};

// Dm9 | G13 | Cmaj9 | Am9, dois compassos cada. [baixo, ...notas do acorde]
const ACORDES = [
  [38, 53, 57, 60, 64],
  [43, 53, 59, 64, 67],
  [36, 52, 55, 59, 62],
  [33, 52, 55, 59, 60],
];

const piano = (inicio, midi, vel) =>
  adicionar(inicio, 2.4, (t) => {
    const f = hz(midi) * (1 + 0.0015 * Math.sin(2 * Math.PI * 0.6 * (t + inicio))); // balanço de fita
    const env = Math.min(1, t / 0.012) * Math.exp(-t * 1.5);
    const sino = Math.exp(-t * 7) * 0.25 * Math.sin(2 * Math.PI * f * 4 * t);
    return vel * env * (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(2 * Math.PI * f * 2 * t) + sino);
  });

const baixo = (inicio, midi, vel) =>
  adicionar(inicio, 1.2, (t) => vel * Math.min(1, t / 0.01) * Math.exp(-t * 2.8) * Math.sin(2 * Math.PI * hz(midi) * t));

const bumbo = (inicio, vel) => {
  let fase = 0;
  adicionar(inicio, 0.3, (t) => {
    fase += (2 * Math.PI * (45 + 90 * Math.exp(-t * 30))) / TAXA;
    return vel * Math.exp(-t * 11) * Math.sin(fase);
  });
};

const caixa = (inicio, vel) => {
  let ruido = 0;
  adicionar(inicio, 0.25, (t) => {
    ruido = ruido * 0.55 + (rand() * 2 - 1) * 0.45;
    return vel * Math.exp(-t * 22) * (ruido * 0.8 + 0.5 * Math.sin(2 * Math.PI * 190 * t));
  });
};

const chimbal = (inicio, vel) => {
  let anterior = 0;
  adicionar(inicio, 0.06, (t) => {
    const r = rand() * 2 - 1;
    const alto = r - anterior; // passa-altas simples
    anterior = r;
    return vel * Math.exp(-t * 70) * alto;
  });
};

const SWING = 0.16 * BATIDA; // colcheias de trás atrasadas: o "balanço" do lo-fi
for (let c = 0; c < COMPASSOS; c++) {
  const t0 = c * 4 * BATIDA;
  const [grave, ...notas] = ACORDES[Math.floor(c / 2)];
  // acorde em arpejo curtinho no 1 e uma repetição suave no "e" do 3
  notas.forEach((m, i) => piano(t0 + i * 0.03, m, 0.16));
  notas.forEach((m, i) => piano(t0 + 2.5 * BATIDA + SWING + i * 0.025, m, 0.09));
  baixo(t0, grave, 0.5);
  baixo(t0 + 2.5 * BATIDA + SWING, grave + (c % 2 ? 7 : 0), 0.35);
  bumbo(t0, 0.7);
  bumbo(t0 + 2.5 * BATIDA + SWING, 0.5);
  caixa(t0 + BATIDA, 0.28);
  caixa(t0 + 3 * BATIDA, 0.3);
  for (let i = 0; i < 8; i++) chimbal(t0 + i * 0.5 * BATIDA + (i % 2 ? SWING : 0), i % 2 ? 0.05 : 0.09);
}

// chiado e estalos de vinil
for (let i = 0; i < n; i++) mix[i] += (rand() * 2 - 1) * 0.012;
for (let p = 0; p < 90; p++) adicionar(rand() * (n / TAXA), 0.004, (t) => (rand() * 2 - 1) * 0.12 * Math.exp(-t * 900));

// passa-baixas (som abafado) + saturação suave
let y = 0;
const a = 1 - Math.exp((-2 * Math.PI * 3200) / TAXA);
for (let i = 0; i < n; i++) {
  y += a * (mix[i] - y);
  mix[i] = Math.tanh(y * 1.6);
}
const pico = mix.reduce((m, x) => Math.max(m, Math.abs(x)), 0);
const dados = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) dados.writeInt16LE(Math.round((mix[i] / pico) * 0.75 * 32767), i * 2);

const h = Buffer.alloc(44);
h.write('RIFF', 0); h.writeUInt32LE(36 + dados.length, 4); h.write('WAVEfmt ', 8);
h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
h.writeUInt32LE(TAXA, 24); h.writeUInt32LE(TAXA * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
h.write('data', 36); h.writeUInt32LE(dados.length, 40);
writeFileSync(new URL('../assets/audio/lofi.wav', import.meta.url), Buffer.concat([h, dados]));
