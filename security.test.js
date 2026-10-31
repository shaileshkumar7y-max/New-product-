import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { encryptBackup, decryptBackup } from '../security.js';

test('encrypted backup round-trips demo state without exposing plaintext', async () => {
  const store = new Map();
  globalThis.localStorage = {
    setItem(key, value) { store.set(key, String(value)); },
    getItem(key) { return store.get(key) ?? null; },
    removeItem(key) { store.delete(key); }
  };
  const original = { version: 1, privateDemoNote: 'synthetic sample value', permissions: { view: false } };
  const encrypted = await encryptBackup(original, 'strong-demo-passphrase');
  assert.equal(encrypted.cipher, 'AES-256-GCM');
  assert.equal(JSON.stringify(encrypted).includes('synthetic sample value'), false);
  const restored = await decryptBackup(encrypted, 'strong-demo-passphrase');
  assert.equal(restored.privateDemoNote, 'synthetic sample value');
  assert.equal(restored.permissions.view, false);
  assert.ok(store.size > 0);
});

test('encrypted backup rejects a wrong password', async () => {
  const store = new Map();
  globalThis.localStorage = { setItem(k,v) { store.set(k,String(v)); }, getItem(k) { return store.get(k); }, removeItem(k) { store.delete(k); } };
  const encrypted = await encryptBackup({ value: 'demo' }, 'right-password-123');
  await assert.rejects(() => decryptBackup(encrypted, 'wrong-password-123'), /Could not decrypt backup/);
});
