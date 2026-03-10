/**
 * Settings page — Privacy key management.
 */

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { generateKeyPair, serializeKeyPair, deserializeKeyPair } from '../lib/privacy/keygen';
import { encryptAndStore, decryptFromStorage, hasStoredKey } from '../lib/privacy/storage';

export default function SettingsPage() {
  const { address, setPrivacyKey, isKeyUnlocked, authMethod } = useWallet();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasKey = address ? hasStoredKey(`privkey_${address.slice(0, 10)}`) : false;

  const handleGenerate = async () => {
    if (!address || !password) return;
    setError(null);
    try {
      const kp = generateKeyPair();
      const serialized = serializeKeyPair(kp);
      await encryptAndStore(`privkey_${address.slice(0, 10)}`, serialized, password);
      setPrivacyKey(kp.privateKey);
      setStatus('Privacy key generated and encrypted. Your shielded balances are now accessible.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key');
    }
  };

  const handleUnlock = async () => {
    if (!address || !password) return;
    setError(null);
    try {
      const serialized = await decryptFromStorage(`privkey_${address.slice(0, 10)}`, password);
      if (!serialized) {
        setError('Wrong password or no key found.');
        return;
      }
      const kp = deserializeKeyPair(serialized);
      setPrivacyKey(kp.privateKey);
      setStatus('Privacy key unlocked! You can now shield/unshield balances.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unlock');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: '#fff',
        marginBottom: 24,
      }}>
        Privacy Settings
      </div>

      {/* Auth info */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.5,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          Connection
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: address ? '#34d399' : '#f87171',
            boxShadow: address ? '0 0 8px rgba(52,211,153,0.6)' : undefined,
          }} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : 'Not connected'}
          </span>
          {authMethod && (
            <span className="badge-zap" style={{ fontSize: 8, padding: '2px 6px' }}>
              {authMethod}
            </span>
          )}
        </div>
      </div>

      {/* Privacy key */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: 0.5,
          marginBottom: 4,
          textTransform: 'uppercase',
        }}>
          Privacy Key (ElGamal)
        </div>
        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          marginBottom: 16,
          lineHeight: 1.6,
        }}>
          Your privacy key encrypts shielded balances. It's stored locally, encrypted with your password. Never shared with anyone.
        </p>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: isKeyUnlocked ? '#34d399' : 'rgba(255,255,255,0.15)',
            boxShadow: isKeyUnlocked ? '0 0 8px rgba(52,211,153,0.6)' : undefined,
          }} />
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: isKeyUnlocked ? '#34d399' : 'rgba(255,255,255,0.4)',
            fontWeight: 500,
          }}>
            {isKeyUnlocked ? 'Key Unlocked' : hasKey ? 'Key Locked' : 'No Key Generated'}
          </span>
        </div>

        {!isKeyUnlocked && (
          <>
            <input
              type="password"
              className="input-field"
              placeholder="Enter password to encrypt/unlock key"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              {!hasKey ? (
                <button
                  className="btn-primary"
                  onClick={handleGenerate}
                  disabled={!address || !password}
                  style={{ fontSize: 12, padding: '10px 20px' }}
                >
                  Generate Privacy Key
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleUnlock}
                  disabled={!address || !password}
                  style={{ fontSize: 12, padding: '10px 20px' }}
                >
                  Unlock Key
                </button>
              )}
            </div>
          </>
        )}

        {status && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(52,211,153,0.06)',
            border: '1px solid rgba(52,211,153,0.12)',
            borderRadius: 10,
            fontSize: 12,
            color: '#34d399',
            fontFamily: "'Inter', sans-serif",
          }}>
            {status}
          </div>
        )}

        {error && (
          <div style={{
            marginTop: 12,
            padding: '10px 14px',
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.12)',
            borderRadius: 10,
            fontSize: 12,
            color: '#f87171',
            fontFamily: "'Inter', sans-serif",
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
