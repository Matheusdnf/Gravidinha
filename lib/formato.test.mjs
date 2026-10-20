import { test } from 'node:test';
import assert from 'node:assert/strict';
import { idade } from './formato.ts';

test('idade conta só anos completos', () => {
  const hoje = new Date(2026, 9, 10); // 10/10/2026
  assert.equal(idade('1995-10-10', hoje), 31); // aniversário hoje
  assert.equal(idade('1995-10-11', hoje), 30); // amanhã
  assert.equal(idade('1995-09-30', hoje), 31);
  assert.equal(idade('1995-12-01', hoje), 30);
});
