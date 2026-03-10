/**
 * ZapScura App — Privacy-Preserving AI DeFi Agent.
 *
 * Built with Starkzap SDK for seamless onboarding:
 * - Social login (Google/Apple/email) via Starkzap Wallets module
 * - Gasless transactions via Starkzap Paymaster
 * - AI-first interface for natural language DeFi
 */

import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Shield, Settings, LayoutDashboard } from 'lucide-react';
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
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
      }} />

      {/* Header */}
      <header style={{
        position: 'relative',
        zIndex: 20,
        backdropFilter: 'blur(16px)',
        background: 'rgba(4,6,11,0.92)',
        borderBottom: '1px solid rgba(59,130,246,0.08)',
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
            <NavLink to="/app" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <ZapScuraLogo size={28} glow />
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: '#fff',
                letterSpacing: 1,
              }}>
                ZapScura
              </span>
              <span style={{
                fontSize: 8,
                color: 'rgba(59,130,246,0.4)',
                fontFamily: "'Fira Code', monospace",
                letterSpacing: 1,
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
                <LayoutDashboard size={13} strokeWidth={1.5} />
                Dashboard
              </NavLink>
              <NavLink
                to="/app/settings"
                className={({ isActive }) =>
                  `nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                <Settings size={13} strokeWidth={1.5} />
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
        borderTop: '1px solid rgba(59,130,246,0.06)',
      }}>
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: 1,
          }}>
            ZAPSCURA v0.1 — PRIVACY-PRESERVING AI DEFI ON STARKNET
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="badge-shield" style={{ fontSize: 8 }}>
              <Shield size={8} strokeWidth={2} />
              Starkzap SDK
            </span>
            <span style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: 1.5,
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
    padding: 8px 14px;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.5px;
    transition: all 0.2s;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  }
  .nav-item-active {
    background: rgba(59,130,246,0.1);
    color: #3b82f6;
  }
  .nav-item-inactive {
    color: rgba(255,255,255,0.35);
  }
  .nav-item-inactive:hover {
    background: rgba(59,130,246,0.04);
    color: rgba(255,255,255,0.7);
  }
`;
