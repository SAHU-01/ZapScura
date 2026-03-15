/**
 * ZapScura Dashboard — AI-first DeFi interface.
 *
 * The main app view after login. Features:
 * - AI chat as the primary interface (left panel)
 * - Shielded portfolio dashboard (right panel)
 * - Proof history
 */

import { useState, useEffect } from 'react';
import { TrendingUp, Zap, Clock } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import AIChat from '../components/AIChat';
import BalanceDisplay from '../components/BalanceDisplay';
import { loadProofHistory, type ProofRecord } from '../lib/proofHistory';

export default function DashboardPage() {
  const { address } = useWallet();
  const [proofs, setProofs] = useState<ProofRecord[]>([]);

  // Poll proof history every 3 seconds to stay in sync
  useEffect(() => {
    if (!address) { setProofs([]); return; }
    const refresh = () => setProofs(loadProofHistory(address));
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [address]);

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
        borderRight: '1px solid rgba(59,130,246,0.06)',
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
        background: 'rgba(4,6,11,0.5)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(59,130,246,0.1) transparent',
      }}>
        {/* Portfolio card */}
        <BalanceDisplay />

        {/* Yield info card */}
        <div className="card" style={{ padding: 16 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
          }}>
            <TrendingUp size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Yield Sources
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                background: 'rgba(255,255,255,0.015)',
                clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
              }}>
                <div style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.55)',
                }}>
                  {source.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#10b981',
                  }}>
                    {source.apr}
                  </span>
                  <span className={source.status === 'active' ? 'badge-green' : source.status === 'available' ? 'badge-shield' : 'badge-amber'}
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
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 12,
          }}>
            <Clock size={12} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Proof History
            </span>
          </div>
          {proofs.length === 0 ? (
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              fontFamily: "'Outfit', sans-serif",
              textAlign: 'center',
              padding: '20px 0',
            }}>
              No proofs generated yet. Ask the AI to shield your balance!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {proofs.slice(0, 8).map((proof: ProofRecord) => (
                <div key={proof.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  background: 'rgba(255,255,255,0.015)',
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: proof.status === 'verified' ? '#10b981' : proof.status === 'pending' ? '#f59e0b' : '#ef4444',
                    }} />
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.45)',
                    }}>
                      {proof.circuit.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 9,
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: 0.5,
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
          background: 'rgba(59,130,246,0.02)',
          border: '1px solid rgba(59,130,246,0.06)',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
          }}>
            <Zap size={12} strokeWidth={1.5} color="#3b82f6" />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: 0.5,
            }}>
              Starkzap Integration
            </span>
          </div>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.2)',
            lineHeight: 1.8,
            letterSpacing: 0.5,
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
