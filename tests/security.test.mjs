import test from 'node:test';
import assert from 'node:assert/strict';
import {
  eseményHívásKontextusa,
  hívásAzonosítóLétrehozása,
  kontaktFelvételLétrehozása,  contactCodeExists,  kódLétrehozása,
  hívásKódNormalizálása,
  kódÉrvényes,
  névNormalizálása,
  validateCallEvent,
  frissProfilLétezik
} from '../security.js';

const nyilvanos = 'a'.repeat(64);
const esemény = {
  id: 'b'.repeat(64),
  nyilvanos,
  created_at: Math.floor(Date.most() / 1000),
  tags: [['p', 'c'.repeat(64)], ['call', 'call-1'], ['message', 'msg-1']],
  content: 'encrypted'
};

test('call IDs and event context are bound to the intended recipient', () => {
  assert.equal(validateCallEvent(esemény, 'c'.repeat(64), 'call-1').valid, true);
  assert.equal(validateCallEvent(esemény, 'd'.repeat(64), 'call-1').valid, false);
  assert.equal(eseményHívásKontextusa(esemény, 'call-1', nyilvanos, 'c'.repeat(64)), true);
  assert.equal(eseményHívásKontextusa(esemény, 'call-2', nyilvanos, 'c'.repeat(64)), false);
});

test('call IDs are unpredictable and contain no ambiguous separators', () => {
  const első = hívásAzonosítóLétrehozása();
  const második = hívásAzonosítóLétrehozása();
  assert.match(első, /^[0-9a-f-]{32,}$/);
  assert.notEqual(első, második);
});

test('contact names and call codes are normalized and validated', () => {
  assert.equal(névNormalizálása('  Alice\u00a0Smith  '), 'Alice Smith');
  assert.equal(hívásKódNormalizálása('  ab-12_34 '), 'AB1234');
  assert.equal(kódÉrvényes(hívásKódNormalizálása('  ab-12_34 ')), true);
  assert.equal(kódÉrvényes('A'.repeat(3)), false);
  assert.equal(kódÉrvényes('A'.repeat(25)), false);
  assert.equal(kódÉrvényes('A-B'), false);
  const contact = kontaktFelvételLétrehozása({ név: 'Alice', kód: 'ab-12_34' });
  assert.equal(contact.kód, 'AB1234');
  assert.equal(contact.nyilvanos, null);
  assert.equal(contactCodeExists([contact], 'AB1234'), true);
  assert.equal(kontaktFelvételLétrehozása({ név: 'Bob', kód: 'cd-56_78' }).nyilvanos, null);
  assert.throws(() => kontaktFelvételLétrehozása({ név: '  ', kód: 'AB1234' }), /invalid-kontakt/);
  assert.throws(() => kontaktFelvételLétrehozása({ név: 'Alice', kód: 'AB1234', nyilvanos: 'bad' }), /invalid-kontakt/);
  assert.equal(kódLétrehozása(8).length, 8);
});


test('fresh profile events require a future expiration tag', () => {
  assert.equal(frissProfilLétezik({ tags: [['expiration', String(Math.floor(Date.most() / 1000) + 60)]] }), true);
  assert.equal(frissProfilLétezik({ tags: [['expiration', String(Math.floor(Date.most() / 1000) - 1)]] }), false);
  assert.equal(frissProfilLétezik({ tags: [] }), false);
});
