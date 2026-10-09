// Rodar com: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deveAplicar, deveLimparPendente, normalizarHorario } from './syncRegras.ts';

test('deveAplicar', () => {
  assert.equal(deveAplicar(null), true); // linha nova
  assert.equal(deveAplicar({ pendente: 0 }), true); // local sincronizada
  assert.equal(deveAplicar({ pendente: 1 }), false); // local pendente vence até o push
});

test('deveLimparPendente', () => {
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', '2026-10-09T10:00:00.000Z'), true);
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', '2026-10-09T10:00:05.000Z'), false); // editada durante o envio
  assert.equal(deveLimparPendente('2026-10-09T10:00:00.000Z', null), false);
});

test('normalizarHorario', () => {
  assert.equal(normalizarHorario('14:30'), '14:30:00');
  assert.equal(normalizarHorario('9:05'), '09:05:00');
  assert.equal(normalizarHorario('14:30:00'), '14:30:00');
});
