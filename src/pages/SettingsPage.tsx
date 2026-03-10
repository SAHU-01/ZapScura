/**
 * Settings page — Privacy key management.
 */

import { useState } from 'react';
import { Key, Lock, Unlock, ShieldCheck, Wifi, WifiOff } from 'lucide-react';
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
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '32px 20px' }}>
      {/* Page glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: '20%',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse at center, rgba(245,158,11,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 20,
        fontWeight: 700,
        color: '#fff',
        marginBottom: 24,
        letterSpacing: 0.5,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <Key size={18} strokeWidth={1.5} color="#f59e0b" />
        Privacy Settings
      </div>

      {/* Auth info */}
      <div className="card" style={{ marginBottom: 16, padding: 16 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
        }}>
          {address ? <Wifi size={11} strokeWidth={1.5} color="rgba(255,255,255,0.35)" /> : <WifiOff size={11} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />}
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Connection
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8, height: 8,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            background: address ? '#10b981' : '#ef4444',
            boxShadow: address ? '0 0 8px rgba(16,185,129,0.6)' : undefined,
          }} />
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 }}>
            {address ? `${address.slice(0, 10)}...${address.slice(-6)}` : 'Not connected'}
          </span>
          {authMethod && (
            <span className="badge-shield" style={{ fontSize: 7, padding: '2px 6px' }}>
              {authMethod}
            </span>
          )}
        </div>
      </div>

      {/* Privacy key */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        }}>
          <ShieldCheck size={11} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 10,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Privacy Key (ElGamal)
          </span>
        </div>
        <p style={{
          fontSize: 12,
          fontFamily: "'Outfit', sans-serif",
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
          {isKeyUnlocked ? <Unlock size={14} strokeWidth={1.5} color="#10b981" /> : <Lock size={14} strokeWidth={1.5} color="rgba(255,255,255,0.25)" />}
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 13,
            color: isKeyUnlocked ? '#10b981' : 'rgba(255,255,255,0.4)',
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
                  style={{ fontSize: 10, padding: '10px 20px' }}
                >
                  <Key size={12} strokeWidth={2} />
                  Generate Privacy Key
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleUnlock}
                  disabled={!address || !password}
                  style={{ fontSize: 10, padding: '10px 20px' }}
                >
                  <Unlock size={12} strokeWidth={2} />
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
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.12)',
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
            fontSize: 11,
            color: '#10b981',
            fontFamily: "'Fira Code', monospace",
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
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
            fontSize: 11,
            color: '#ef4444',
            fontFamily: "'Fira Code', monospace",
          }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
