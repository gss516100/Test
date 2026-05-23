const test = require('node:test');
const assert = require('node:assert/strict');
const {hashPassword, verifyPassword} = require('../dist/utils/hash');
const {signToken, verifyToken} = require('../dist/utils/jwt');

test('hashPassword and verifyPassword round-trip a password', async () => {
  const password = 'StrongPass123!';
  const hash = await hashPassword(password);
  assert.ok(typeof hash === 'string');
  assert.ok(hash.length > 0);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword('wrong-password', hash), false);
});

test('signToken and verifyToken preserve claims', () => {
  const token = signToken({id: 'user-1', email: 'user@example.com'});
  const payload = verifyToken(token);

  assert.ok(payload && typeof payload === 'object');
  assert.equal(payload.id, 'user-1');
  assert.equal(payload.email, 'user@example.com');
});
