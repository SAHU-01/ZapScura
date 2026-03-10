/**
 * Starkzap-powered wallet connection button.
 * Shows social login options when not connected.
 */

import { LogOut, LogIn } from 'lucide-react';
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
          background: 'rgba(59,130,246,0.04)',
          border: '1px solid rgba(59,130,246,0.12)',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
        }}>
          <div style={{
            width: 6,
            height: 6,
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            background: '#10b981',
            boxShadow: '0 0 8px rgba(16,185,129,0.6)',
          }} />
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            letterSpacing: 0.5,
          }}>
            {shortAddr}
          </span>
          <span className="badge-shield" style={{ fontSize: 7, padding: '2px 6px' }}>
            {methodLabel}
          </span>
        </div>
        <button
          onClick={disconnect}
          className="btn-danger"
          style={{
            padding: '6px 12px',
            fontSize: 9,
          }}
        >
          <LogOut size={10} strokeWidth={2} />
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {error && (
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 9,
          color: '#ef4444',
          maxWidth: 200,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          letterSpacing: 0.5,
        }}>
          {error}
        </span>
      )}
      <button
        className="btn-primary"
        onClick={() => connect('google')}
        disabled={isConnecting}
        style={{ padding: '8px 20px', fontSize: 10 }}
      >
        {isConnecting ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="zap-connect-spinner" />
            Connecting...
          </span>
        ) : (
          <>
            <LogIn size={11} strokeWidth={2} />
            Sign In
          </>
        )}
      </button>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .zap-connect-spinner {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.2);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
      `}</style>
    </div>
  );
}
