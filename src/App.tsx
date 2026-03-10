/**
 * ZapScura App — Privacy-Preserving AI DeFi Agent.
 *
 * Built with Starkzap SDK for seamless onboarding:
 * - Social login (Google/Apple/email) via Starkzap Wallets module
 * - Gasless transactions via Starkzap Paymaster
 * - AI-first interface for natural language DeFi
 */

import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { WalletProvider, useWallet } from './hooks/useWallet';
import { ToastProvider } from './components/Toast';
import WalletConnect from './components/WalletConnect';
import ZapScuraLogo, { logoStyles } from './components/ZapScuraLogo';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

function RedirectIfNotConnected({ children }: { children: React.ReactNode }) {
  const { address } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (!address) {
      navigate('/');
    }
  }, [address, navigate]);

  if (!address) return null;
  return <>{children}</>;
}

function AppLayout() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      <style>{appStyles}{logoStyles}</style>

      {/* Top ambient glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1000,
        height: 400,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(14,165,233,0.04) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 20,
        backdropFilter: 'blur(16px)',
        background: 'rgba(3,7,18,0.9)',
        borderBottom: '1px solid rgba(14,165,233,0.06)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <NavLink to="/app" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <ZapScuraLogo size={28} glow />
              <span style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                fontSize: 16,
                color: '#fff',
                letterSpacing: 0.5,
              }}>
                ZapScura
              </span>
              <span style={{
                fontSize: 9,
                color: 'rgba(14,165,233,0.4)',
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                v0.1
              </span>
            </NavLink>

            <nav style={{ display: 'flex', gap: 4 }}>
              <NavLink
                to="/app"
                end
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/app/settings"
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                Settings
              </NavLink>
            </nav>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10 }}>
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '12px 24px',
        borderTop: '1px solid rgba(14,165,233,0.04)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.2)',
          }}>
            ZapScura v0.1 — PRIVACY-PRESERVING AI DEFI ON STARKNET
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge-zap" style={{ fontSize: 8 }}>Starkzap SDK</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              color: 'rgba(255,255,255,0.15)',
            }}>
              NOIR + GARAGA
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app/*" element={
          <ToastProvider>
            <RedirectIfNotConnected>
              <AppLayout />
            </RedirectIfNotConnected>
          </ToastProvider>
        } />
      </Routes>
    </WalletProvider>
  );
}

const appStyles = `
  .nav-item {
    padding: 8px 16px;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 13px;
    font-weight: 500;
    border-radius: 10px;
    transition: all 0.2s;
    text-decoration: none;
  }
  .nav-item-active {
    background: rgba(14,165,233,0.1);
    color: #0ea5e9;
  }
  .nav-item-inactive {
    color: rgba(255,255,255,0.4);
  }
  .nav-item-inactive:hover {
    background: rgba(14,165,233,0.04);
    color: rgba(255,255,255,0.7);
  }
`;
