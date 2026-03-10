/**
 * ZapScura Dashboard — AI-first DeFi interface.
 *
 * The main app view after login. Features:
 * - AI chat as the primary interface (left panel)
 * - Shielded portfolio dashboard (right panel)
 * - Proof history
 */

import { useWallet } from '../hooks/useWallet';
import AIChat from '../components/AIChat';
import BalanceDisplay from '../components/BalanceDisplay';
import { loadProofHistory, type ProofRecord } from '../lib/proofHistory';

export default function DashboardPage() {
  const { address } = useWallet();
  const proofs = address ? loadProofHistory(address) : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 380px',
      gap: 0,
      height: 'calc(100vh - 64px)',
      minHeight: 0,
    }}>
      {/* Left: AI Chat (primary interface) */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        borderRight: '1px solid rgba(14,165,233,0.06)',
      }}>
        <AIChat />
      </div>

      {/* Right: Portfolio sidebar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 20,
        overflowY: 'auto',
        background: 'rgba(3,7,18,0.5)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(14,165,233,0.1) transparent',
      }}>
        {/* Portfolio card */}
        <BalanceDisplay />

        {/* Yield info card */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Yield Sources
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { name: 'Endur (staking)', apr: '5.2%', status: 'active' },
              { name: 'Vesu (lending)', apr: '3.8%', status: 'available' },
              { name: 'Nostra (money market)', apr: '4.1%', status: 'available' },
              { name: 'strkBTC (shielded)', apr: '~6%', status: 'coming soon' },
            ].map((source, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 10px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 8,
              }}>
                <div>
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.6)',
                  }}>
                    {source.name}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#34d399',
                  }}>
                    {source.apr}
                  </span>
                  <span className={source.status === 'active' ? 'badge-green' : source.status === 'available' ? 'badge-zap' : 'badge-amber'}
                    style={{ fontSize: 7, padding: '2px 6px' }}>
                    {source.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof History */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}>
            Proof History
          </div>
          {proofs.length === 0 ? (
            <div style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.2)',
              fontFamily: "'Inter', sans-serif",
              textAlign: 'center',
              padding: '20px 0',
            }}>
              No proofs generated yet. Ask the AI to shield your balance!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {proofs.slice(0, 8).map((proof: ProofRecord) => (
                <div key={proof.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: proof.status === 'verified' ? '#34d399' : proof.status === 'pending' ? '#fbbf24' : '#f87171',
                    }} />
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {proof.circuit.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.25)',
                  }}>
                    {new Date(proof.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Starkzap info */}
        <div style={{
          padding: '12px 14px',
          background: 'rgba(14,165,233,0.03)',
          border: '1px solid rgba(14,165,233,0.06)',
          borderRadius: 12,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
          }}>
            <span style={{ fontSize: 14 }}>⚡</span>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
            }}>
              Starkzap Integration
            </span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.25)',
            lineHeight: 1.6,
          }}>
            Social login (Privy + Cartridge)<br />
            Gasless tx (Paymaster)<br />
            DeFi modules (Stake, Send, Balance)
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
