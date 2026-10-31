import { storageKey, DEFAULT_STATE } from './store.js';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes) {
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}
function fromBase64(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function deriveKey(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Web Crypto is unavailable. Use HTTPS or localhost.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptBackup(state, password) {
  if (password.length < 10) throw new Error('Use a password with at least 10 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const payload = {
    format: 'private-rate-lab-vault',
    version: 1,
    createdAt: new Date().toISOString(),
    state
  };
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(payload)));
  return {
    format: 'PRIVATE-RATE-ENCRYPTED-BACKUP',
    version: 1,
    kdf: 'PBKDF2-SHA256-310000',
    cipher: 'AES-256-GCM',
    salt: toBase64(salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(encrypted))
  };
}

export async function decryptBackup(fileObject, password) {
  if (fileObject?.format !== 'PRIVATE-RATE-ENCRYPTED-BACKUP' || fileObject.version !== 1) {
    throw new Error('This backup format is not supported.');
  }
  const key = await deriveKey(password, fromBase64(fileObject.salt));
  let plain;
  try {
    plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(fileObject.iv) },
      key,
      fromBase64(fileObject.ciphertext)
    );
  } catch {
    throw new Error('Could not decrypt backup. Check your password or file.');
  }
  const payload = JSON.parse(decoder.decode(plain));
  if (payload?.format !== 'private-rate-lab-vault' || !payload.state || typeof payload.state !== 'object') {
    throw new Error('Backup contents are invalid.');
  }
  const merged = { ...DEFAULT_STATE, ...payload.state };
  localStorage.setItem(storageKey(), JSON.stringify(merged));
  return merged;
}

export function downloadText(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
