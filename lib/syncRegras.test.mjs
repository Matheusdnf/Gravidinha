// Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deveAplicar, linhaMudou, normalizarHorario } from './syncRegras.ts';

test('deveAplicar', () => {
  assert.equal(deveAplicar(null), true); // linha nova
  assert.equal(deveAplicar({ pendente: 0 }), true); // local sincronizada
  assert.equal(deveAplicar({ pendente: 1 }), false); // local pendente vence até o push
});

test('normalizarHorario', () => {
  assert.equal(normalizarHorario('14:30'), '14:30:00');
  assert.equal(normalizarHorario('9:05'), '09:05:00');
  assert.equal(normalizarHorario('14:30:00'), '14:30:00');
});

test('linhaMudou', () => {
  const colunas = ['id', 'nome', 'updated_at'];
  const local = { id: '1', nome: 'Ana', updated_at: '2026-10-09T10:00:00.000Z', pendente: 0 };
  assert.equal(linhaMudou(null, { id: '1', nome: 'Ana' }, colunas), true); // linha nova
  assert.equal(linhaMudou(local, { id: '1', nome: 'Ana', updated_at: '2026-10-09T10:00:01+00:00' }, colunas), false); // só o eco do push
  assert.equal(linhaMudou(local, { id: '1', nome: 'Bia', updated_at: '2026-10-09T10:00:01+00:00' }, colunas), true);
});
