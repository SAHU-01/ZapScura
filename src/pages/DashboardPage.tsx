/**
 * ZapScura Dashboard — AI-first DeFi interface.
 *
 * The main app view after login. Features:
 * - Desktop: AI chat + inline togglable side panel (shares space, no overlay)
 * - Mobile: AI chat full-width, side panel as slide-over drawer with overlay
 * - Proof history
 */

import { useState } from 'react';
import { TrendingUp, Clock, Target, PanelRightOpen, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import AIChat from '../components/AIChat';
import BalanceDisplay from '../components/BalanceDisplay';
import PlayerCard from '../components/PlayerCard';
import { loadProofHistory, type ProofRecord } from '../lib/proofHistory';
import { getAvailableQuests, type Quest } from '../lib/gamification';
import GamificationIcon from '../components/GamificationIcon';

/* Panel content shared between desktop sidebar and mobile drawer */
function PanelContent({ address, proofs }: { address: string | null; proofs: ProofRecord[] }) {
  return (
    <>
      <PlayerCard />
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

      {/* Active Quests Mini Tracker */}
      {address && (() => {
        const quests = getAvailableQuests(address);
        if (quests.length === 0) return null;
        const diffColors: Record<string, string> = { starter: '#10b981', intermediate: '#f59e0b', advanced: '#ef4444' };
        return (
          <div className="card" style={{ padding: 16 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 12,
            }}>
              <Target size={12} strokeWidth={1.5} color="#8b5cf6" />
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 10,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}>
                Active Quests
              </span>
              <span style={{
                marginLeft: 'auto',
                fontFamily: "'Fira Code', monospace",
                fontSize: 9,
                color: '#8b5cf6',
                fontWeight: 600,
              }}>
                {quests.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {quests.slice(0, 4).map((quest: Quest) => (
                <div key={quest.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  background: 'rgba(139,92,246,0.02)',
                  border: '1px solid rgba(139,92,246,0.06)',
                  clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                }}>
                  <GamificationIcon name={quest.icon} size={12} color="#8b5cf6" />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 9,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: 0.3,
                    }}>
                      {quest.title}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 9,
                      fontWeight: 600,
                      color: '#8b5cf6',
                    }}>
                      +{quest.xpReward}
                    </span>
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 7,
                      color: diffColors[quest.difficulty],
                      letterSpacing: 0.5,
                      padding: '1px 4px',
                      background: `${diffColors[quest.difficulty]}10`,
                      clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)',
                    }}>
                      {quest.difficulty === 'starter' ? 'S' : quest.difficulty === 'intermediate' ? 'M' : 'H'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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
    </>
  );
}

export default function DashboardPage() {
  const { address } = useWallet();
  const proofs = address ? loadProofHistory(address) : [];
  const [panelOpen, setPanelOpen] = useState(false);

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 64px)',
      minHeight: 0,
      overflow: 'hidden',
      display: 'flex',
    }}>
      {/* AI Chat — flex:1, shrinks when desktop panel opens */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        minWidth: 0,
        position: 'relative',
        transition: 'flex 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <AIChat />

        {/* Toggle button — always visible, toggles panel open/close */}
        <button
          onClick={() => setPanelOpen(prev => !prev)}
          className="panel-toggle-btn"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(59,130,246,0.1)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: 10,
            color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            zIndex: 20,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.2)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }}
          title={panelOpen ? 'Close portfolio panel' : 'Open portfolio panel'}
        >
          <PanelRightOpen size={18} />
        </button>
      </div>

      {/* ===== DESKTOP: Inline side panel (no overlay, shares flex row) ===== */}
      <div
        className="desktop-panel"
        style={{
          width: panelOpen ? 380 : 0,
          flexShrink: 0,
          height: '100%',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          borderLeft: panelOpen ? '1px solid rgba(59,130,246,0.1)' : 'none',
          background: 'rgba(4,6,11,0.97)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{
          width: 380,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(59,130,246,0.06)',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 11,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Portfolio & Stats
            </span>
          </div>

          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(59,130,246,0.1) transparent',
          }}>
            <PanelContent address={address} proofs={proofs} />
          </div>
        </div>
      </div>

      {/* ===== MOBILE: Backdrop overlay ===== */}
      {panelOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setPanelOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(2px)',
            zIndex: 30,
            transition: 'opacity 0.3s',
          }}
        />
      )}

      {/* ===== MOBILE: Slide-over drawer ===== */}
      <div
        className="mobile-drawer"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          transform: panelOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(4,6,11,0.97)',
          borderLeft: '1px solid rgba(59,130,246,0.1)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(59,130,246,0.06)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Portfolio & Stats
          </span>
          <button
            onClick={() => setPanelOpen(false)}
            style={{
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 6,
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Drawer scrollable content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(59,130,246,0.1) transparent',
        }}>
          <PanelContent address={address} proofs={proofs} />
        </div>
      </div>

      <style>{`
        /* Desktop: show inline panel, hide mobile drawer & backdrop */
        .desktop-panel {
          display: block;
        }
        .mobile-drawer,
        .mobile-backdrop {
          display: none !important;
        }

        .desktop-panel::-webkit-scrollbar {
          width: 4px;
        }
        .desktop-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .desktop-panel::-webkit-scrollbar-thumb {
          background: rgba(59,130,246,0.15);
          border-radius: 2px;
        }
        .desktop-panel::-webkit-scrollbar-thumb:hover {
          background: rgba(59,130,246,0.3);
        }

        /* Mobile: hide inline panel, show drawer & backdrop */
        @media (max-width: 768px) {
          .desktop-panel {
            display: none !important;
          }
          .mobile-drawer {
            display: flex !important;
          }
          .mobile-backdrop {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
