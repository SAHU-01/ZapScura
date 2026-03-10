/**
 * Secure key storage using Web Crypto API (AES-GCM + PBKDF2).
 */

const STORAGE_PREFIX = 'zapscura_';

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encryptAndStore(key: string, data: string, password: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(data));
  const stored = {
    salt: Array.from(salt),
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  };
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(stored));
}

export async function decryptFromStorage(key: string, password: string): Promise<string | null> {
  const raw = localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw);
    const salt = new Uint8Array(stored.salt);
    const iv = new Uint8Array(stored.iv);
    const data = new Uint8Array(stored.data);
    const cryptoKey = await deriveKey(password, salt);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, data);
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export function hasStoredKey(key: string): boolean {
  return localStorage.getItem(STORAGE_PREFIX + key) !== null;
}

export function clearStoredKey(key: string): void {
  localStorage.removeItem(STORAGE_PREFIX + key);
}
