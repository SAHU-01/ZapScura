/**
 * ZapScura Landing Page — Social login onboarding.
 *
 * This is the first thing users see. Key goals:
 * 1. Communicate "Private DeFi Yield powered by AI"
 * 2. One-tap social login (Google/Apple/email)
 * 3. Zero mention of seed phrases, gas fees, or wallet setup
 */

import { useNavigate } from 'react-router-dom';
import { useWallet, type AuthMethod } from '../hooks/useWallet';
import ZapScuraLogo, { logoStyles } from '../components/ZapScuraLogo';

export default function LandingPage() {
  const navigate = useNavigate();
  const { connect, isConnecting, error } = useWallet();

  const handleLogin = async (method: AuthMethod) => {
    await connect(method);
    navigate('/app');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{logoStyles}{landingStyles}</style>

      {/* Background effects */}
      <div className="landing-bg-orb landing-bg-orb-1" />
      <div className="landing-bg-orb landing-bg-orb-2" />
      <div className="landing-bg-orb landing-bg-orb-3" />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ZapScuraLogo size={36} glow animated />
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
            letterSpacing: 1,
          }}>
            ZapScura
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge-zap">Powered by Starkzap</span>
          <span className="badge-purple">Sepolia Testnet</span>
        </div>
      </header>

      {/* Hero */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 10,
        padding: '0 24px 60px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 600, marginBottom: 48 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 20,
          }}>
            <span className="gradient-text">Private DeFi Yield</span>
            <br />
            <span style={{ color: '#fff' }}>powered by AI</span>
          </div>

          <p style={{
            fontSize: 17,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            marginBottom: 32,
            maxWidth: 480,
            margin: '0 auto 32px',
          }}>
            Stake BTC privately, earn yield, manage shielded positions — all through natural language chat. No seed phrases. No gas fees. Just tell the AI what you want.
          </p>

          {/* Social Login Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 360,
            margin: '0 auto',
          }}>
            <button
              className="btn-social"
              onClick={() => handleLogin('google')}
              disabled={isConnecting}
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.12)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isConnecting ? 'Connecting...' : 'Continue with Google'}
            </button>

            <button
              className="btn-social"
              onClick={() => handleLogin('apple')}
              disabled={isConnecting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>

            <button
              className="btn-social"
              onClick={() => handleLogin('email')}
              disabled={isConnecting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 7L2 7" />
              </svg>
              Continue with Email
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '4px 0',
            }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontFamily: "'Inter', sans-serif" }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <button
              className="btn-social"
              onClick={() => handleLogin('wallet')}
              disabled={isConnecting}
              style={{ opacity: 0.6 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
              </svg>
              Connect Existing Wallet
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: 16,
              padding: '10px 16px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: 12,
              color: '#f87171',
              fontSize: 13,
              fontFamily: "'Inter', sans-serif",
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Feature badges */}
        <div style={{
          display: 'flex',
          gap: 24,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {[
            { icon: '🔒', label: 'ZK Privacy', desc: 'Balances encrypted on-chain' },
            { icon: '⚡', label: 'Gasless', desc: 'Starkzap Paymaster' },
            { icon: '🤖', label: 'AI Agent', desc: 'Natural language DeFi' },
            { icon: '🎯', label: 'One-Tap', desc: 'No seed phrases' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.04)',
              borderRadius: 12,
            }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{f.label}</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '16px 32px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 0.5,
        }}>
          ZapScura v0.1 — Built with Starkzap SDK on Starknet
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.15)',
        }}>
          NOIR + GARAGA + STARKZAP
        </span>
      </footer>
    </div>
  );
}

const landingStyles = `
  .landing-bg-orb {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(120px);
  }
  .landing-bg-orb-1 {
    width: 600px;
    height: 600px;
    background: rgba(14,165,233,0.08);
    top: -200px;
    left: -100px;
  }
  .landing-bg-orb-2 {
    width: 500px;
    height: 500px;
    background: rgba(217,70,239,0.06);
    bottom: -150px;
    right: -100px;
  }
  .landing-bg-orb-3 {
    width: 300px;
    height: 300px;
    background: rgba(34,211,238,0.04);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;
