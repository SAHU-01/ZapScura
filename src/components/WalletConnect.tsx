/**
 * Starkzap-powered wallet connection button.
 * Shows social login options when not connected.
 */

import { useWallet } from '../hooks/useWallet';

export default function WalletConnect() {
  const { address, isConnecting, error, connect, disconnect, authMethod } = useWallet();

  if (address) {
    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;
    const methodLabel = authMethod === 'devnet' ? 'Devnet' :
                        authMethod === 'google' ? 'Google' :
                        authMethod === 'apple' ? 'Apple' :
                        authMethod === 'email' ? 'Email' : 'Wallet';

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 14px',
          background: 'rgba(14,165,233,0.06)',
          border: '1px solid rgba(14,165,233,0.15)',
          borderRadius: 12,
        }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#34d399',
            boxShadow: '0 0 8px rgba(52,211,153,0.6)',
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
          }}>
            {shortAddr}
          </span>
          <span className="badge-zap" style={{ fontSize: 8, padding: '2px 6px' }}>
            {methodLabel}
          </span>
        </div>
        <button
          onClick={disconnect}
          style={{
            padding: '6px 12px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            borderRadius: 10,
            color: '#f87171',
            cursor: 'pointer',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 500,
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {error && (
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: '#f87171',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {error}
        </span>
      )}
      <button
        className="btn-primary"
        onClick={() => connect('google')}
        disabled={isConnecting}
        style={{ padding: '8px 20px', fontSize: 12 }}
      >
        {isConnecting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 12,
              height: 12,
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: '#fff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Connecting...
          </span>
        ) : (
          'Sign In'
        )}
      </button>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
