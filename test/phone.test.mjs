import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePhone } from '../assets/phone.js';

const E164 = '+12315550199';

test('parens and dash', () => assert.equal(normalizePhone('(231) 555-0199'), E164));
test('dots', () => assert.equal(normalizePhone('231.555.0199'), E164));
test('leading 1 with spaces', () => assert.equal(normalizePhone('1 231 555 0199'), E164));
test('+1 with spaces', () => assert.equal(normalizePhone('+1 231 555 0199'), E164));
test('7 digits is rejected', () => assert.equal(normalizePhone('555-0199'), null));
test('empty is rejected', () => assert.equal(normalizePhone(''), null));
test('letters are rejected', () => assert.equal(normalizePhone('call me maybe'), null));
test('11 digits not starting with 1 is rejected', () => assert.equal(normalizePhone('22315550199'), null));
test('non-string is rejected', () => assert.equal(normalizePhone(undefined), null));
