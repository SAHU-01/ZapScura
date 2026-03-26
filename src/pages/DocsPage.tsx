/**
 * ZapScura Documentation Page.
 *
 * Comprehensive docs covering features, architecture, privacy stack,
 * IPFS usage, known issues, and technical details.
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Zap,
  Bot,
  Lock,
  Layers,
  Eye,
  EyeOff,
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  HardDrive,
  Globe,
  Code,
  Cpu,
  Target,
  ShieldCheck,
} from 'lucide-react';
import ZapScuraLogo, { logoStyles } from '../components/ZapScuraLogo';

/* ─── Scroll-reveal hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/* ─── Animated flow node ─── */
function FlowNode({ children, delay = 0, direction = 'up' as 'up' | 'left' | 'right', visible }: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  visible: boolean;
}) {
  const tx = direction === 'left' ? -40 : direction === 'right' ? 40 : 0;
  const ty = direction === 'up' ? 30 : 0;

  return (
    <div style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'translate(0, 0) scale(1)' : `translate(${tx}px, ${ty}px) scale(0.95)`,
      transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      willChange: 'opacity, transform',
    }}>
      {children}
    </div>
  );
}

/* ─── Animated connector ─── */
function FlowConnector({ visible, delay = 0, height = 28, color = 'rgba(139,92,246,0.5)' }: {
  visible: boolean;
  delay?: number;
  height?: number;
  color?: string;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height,
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        width: 2,
        height: visible ? height : 0,
        background: `linear-gradient(to bottom, ${color}, ${color.replace('0.5', '0.15')})`,
        transition: `height 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        position: 'relative',
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color.replace('0.5', '1'),
          position: 'absolute',
          left: '50%',
          bottom: -3,
          transform: 'translateX(-50%)',
          boxShadow: `0 0 8px ${color}`,
          opacity: visible ? 1 : 0,
          transition: `opacity 0.3s ease ${delay + 400}ms`,
        }} />
      </div>
    </div>
  );
}

/* ─── Animated SVG connector lines (fan merge) ─── */
function FanConnector({ visible, delay = 0 }: { visible: boolean; delay?: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '60%', height: 24, position: 'relative' }}>
        <svg width="100%" height="24" viewBox="0 0 400 24" preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(139,92,246,0.5)" />
              <stop offset="100%" stopColor="rgba(139,92,246,0.2)" />
            </linearGradient>
          </defs>
          {[
            { x1: 67, d: 0 },
            { x1: 200, d: 80 },
            { x1: 333, d: 160 },
          ].map(({ x1, d }) => (
            <line
              key={x1}
              x1={x1} y1="0" x2="200" y2="22"
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              strokeDasharray="200"
              strokeDashoffset={visible ? 0 : 200}
              style={{ transition: `stroke-dashoffset 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay + d}ms` }}
            />
          ))}
          <circle
            cx="200" cy="22" r="3" fill="#8b5cf6"
            opacity={visible ? 1 : 0}
            style={{ transition: `opacity 0.3s ease ${delay + 500}ms` }}
          />
        </svg>
      </div>
    </div>
  );
}

/* ─── Staggered action pills ─── */
function ActionPills({ visible, delay = 0 }: { visible: boolean; delay?: number }) {
  const actions = ['deposit', 'shield', 'stake', 'unshield', 'withdraw', 'open_cdp', 'lock', 'mint_susd', 'repay', 'close_cdp', 'faucet', 'check_balances', 'check_solvency'];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {actions.map((action, i) => (
        <span key={action} style={{
          padding: '3px 8px',
          borderRadius: 4,
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.15)',
          color: 'rgba(255,255,255,0.55)',
          fontSize: 9,
          fontFamily: "'Fira Code', monospace",
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
          transition: `opacity 0.4s ease ${delay + i * 50}ms, transform 0.4s ease ${delay + i * 50}ms`,
        }}>{action}</span>
      ))}
    </div>
  );
}

/* ─── Architecture Diagram ─── */
function ArchitectureDiagram() {
  const { ref: containerRef, visible: containerVisible } = useScrollReveal(0.05);
  const { ref: midRef, visible: midVisible } = useScrollReveal(0.2);
  const { ref: bottomRef, visible: bottomVisible } = useScrollReveal(0.2);

  const nodeBase: React.CSSProperties = {
    position: 'relative',
    borderRadius: 10,
    padding: '14px 18px',
    fontFamily: "'Fira Code', monospace",
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'center',
  };

  const glowBorder = (color: string) => ({
    border: `1px solid ${color}40`,
    boxShadow: `0 0 20px ${color}10, inset 0 1px 0 ${color}15`,
  });

  const badge = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "'Fira Code', monospace",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    marginBottom: 8,
  });

  return (
    <div ref={containerRef} style={{
      background: 'linear-gradient(135deg, rgba(15,10,30,0.8), rgba(20,15,40,0.6))',
      border: '1px solid rgba(139,92,246,0.15)',
      borderRadius: 16,
      padding: '32px 24px',
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      {/* Title */}
      <FlowNode visible={containerVisible} delay={0}>
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <span style={badge('#8b5cf6')}>System Architecture</span>
        </div>
      </FlowNode>

      {/* ── Browser Container ── */}
      <FlowNode visible={containerVisible} delay={150}>
        <div style={{
          border: '1px solid rgba(139,92,246,0.2)',
          borderRadius: 14,
          padding: '20px 16px 24px',
          background: 'linear-gradient(180deg, rgba(139,92,246,0.04), transparent)',
          position: 'relative',
          marginBottom: 0,
        }}>
          {/* Browser label */}
          <div style={{
            position: 'absolute',
            top: -10,
            left: 20,
            background: '#0f0a1e',
            padding: '2px 12px',
            borderRadius: 6,
            border: '1px solid rgba(139,92,246,0.25)',
          }}>
            <span style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 10,
              color: '#c4b5fd',
              letterSpacing: 1,
            }}>USER (Browser) — Client-Side Only</span>
          </div>

          {/* Top 3 modules — stagger left, up, right */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12,
            marginTop: 12,
            marginBottom: 16,
          }}>
            <FlowNode visible={containerVisible} delay={350} direction="left">
              <div style={{
                ...nodeBase,
                ...glowBorder('#f59e0b'),
                background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>
                  <Globe size={20} strokeWidth={1.5} color="#f59e0b" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12, marginBottom: 2 }}>Starkzap Social Login</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>OAuth + Wallet</div>
              </div>
            </FlowNode>

            <FlowNode visible={containerVisible} delay={500} direction="up">
              <div style={{
                ...nodeBase,
                ...glowBorder('#06b6d4'),
                background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(6,182,212,0.02))',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>
                  <Bot size={20} strokeWidth={1.5} color="#06b6d4" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ color: '#22d3ee', fontWeight: 600, fontSize: 12, marginBottom: 2 }}>AI Chat Agent</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>Natural Language UI</div>
              </div>
            </FlowNode>

            <FlowNode visible={containerVisible} delay={650} direction="right">
              <div style={{
                ...nodeBase,
                ...glowBorder('#8b5cf6'),
                background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
              }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>
                  <Shield size={20} strokeWidth={1.5} color="#8b5cf6" style={{ margin: '0 auto' }} />
                </div>
                <div style={{ color: '#a78bfa', fontWeight: 600, fontSize: 12, marginBottom: 2 }}>Privacy Engine</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 9 }}>ElGamal + Pedersen + Noir ZK</div>
              </div>
            </FlowNode>
          </div>

          {/* Fan connector lines */}
          <FanConnector visible={containerVisible} delay={850} />

          {/* Action Executor */}
          <FlowNode visible={containerVisible} delay={1100}>
            <div style={{
              ...nodeBase,
              ...glowBorder('#10b981'),
              background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(16,185,129,0.02))',
              padding: '16px 20px',
              marginBottom: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                <Zap size={16} strokeWidth={1.5} color="#10b981" />
                <span style={{ color: '#34d399', fontWeight: 600, fontSize: 13 }}>Action Executor</span>
                <span style={{
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 4,
                  padding: '1px 6px',
                  fontSize: 9,
                  color: '#6ee7b7',
                  fontFamily: "'Fira Code', monospace",
                }}>13 actions</span>
              </div>
              <ActionPills visible={containerVisible} delay={1300} />
            </div>
          </FlowNode>

          {/* Mid-section: IPFS + Gamification + Paymaster */}
          <div ref={midRef}>
            <FlowConnector visible={midVisible} delay={0} />

            <FlowNode visible={midVisible} delay={150}>
              <div style={{
                ...nodeBase,
                ...glowBorder('#06b6d4'),
                background: 'linear-gradient(135deg, rgba(6,182,212,0.06), rgba(6,182,212,0.02))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <HardDrive size={16} strokeWidth={1.5} color="#06b6d4" />
                <span style={{ color: '#22d3ee', fontWeight: 600, fontSize: 12 }}>IPFS Pinning</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>— proof archival</span>
              </div>
            </FlowNode>

            <FlowConnector visible={midVisible} delay={350} color="rgba(245,158,11,0.5)" />

            <FlowNode visible={midVisible} delay={500}>
              <div style={{
                ...nodeBase,
                ...glowBorder('#f59e0b'),
                background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(245,158,11,0.02))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <Target size={16} strokeWidth={1.5} color="#f59e0b" />
                <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12 }}>Gamification Engine</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>— XP + Levels + Quests</span>
              </div>
            </FlowNode>

            <FlowConnector visible={midVisible} delay={700} color="rgba(236,72,153,0.5)" />

            <FlowNode visible={midVisible} delay={850}>
              <div style={{
                ...nodeBase,
                ...glowBorder('#ec4899'),
                background: 'linear-gradient(135deg, rgba(236,72,153,0.06), rgba(236,72,153,0.02))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}>
                <Zap size={16} strokeWidth={1.5} color="#ec4899" />
                <span style={{ color: '#f472b6', fontWeight: 600, fontSize: 12 }}>Starkzap Paymaster</span>
                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>— gasless transactions</span>
              </div>
            </FlowNode>
          </div>
        </div>
      </FlowNode>

      {/* Connector from browser to Starknet */}
      <div ref={bottomRef}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0 auto',
          overflow: 'hidden',
        }}>
          <div style={{
            width: 2,
            height: bottomVisible ? 32 : 0,
            background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), rgba(236,72,153,0.5))',
            position: 'relative',
            transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0ms',
          }}>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: bottomVisible ? 1 : 0,
              transition: 'opacity 0.3s ease 400ms',
            }}>
              <ChevronRight size={10} color="#a78bfa" style={{ transform: 'rotate(90deg)' }} />
            </div>
          </div>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            margin: '4px 0',
            opacity: bottomVisible ? 1 : 0,
            transition: 'opacity 0.5s ease 300ms',
          }}>encrypted data + proofs</span>
          <div style={{
            width: 2,
            height: bottomVisible ? 16 : 0,
            background: 'linear-gradient(to bottom, rgba(236,72,153,0.3), rgba(16,185,129,0.5))',
            transition: 'height 0.4s ease 500ms',
          }} />
        </div>

        {/* ── Starknet Block ── */}
        <FlowNode visible={bottomVisible} delay={600}>
          <div style={{
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: 14,
            padding: '20px 16px',
            background: 'linear-gradient(180deg, rgba(16,185,129,0.04), transparent)',
            position: 'relative',
            maxWidth: 320,
            margin: '0 auto',
          }}>
            <div style={{
              position: 'absolute',
              top: -10,
              left: 20,
              background: '#0f0a1e',
              padding: '2px 12px',
              borderRadius: 6,
              border: '1px solid rgba(16,185,129,0.25)',
            }}>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                color: '#6ee7b7',
                letterSpacing: 1,
              }}>Starknet (Sepolia)</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginTop: 8,
            }}>
              {[
                { name: 'ShieldedVault', icon: Lock, color: '#8b5cf6' },
                { name: 'ShieldedCDP', icon: Layers, color: '#3b82f6' },
                { name: 'ProofVerifier', icon: ShieldCheck, color: '#10b981' },
                { name: 'Garaga Verifiers', icon: Cpu, color: '#f59e0b' },
                { name: 'SolvencyProver', icon: Eye, color: '#ec4899' },
              ].map(({ name, icon: I, color }, idx) => (
                <div key={name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: `${color}08`,
                  border: `1px solid ${color}18`,
                  opacity: bottomVisible ? 1 : 0,
                  transform: bottomVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `opacity 0.5s ease ${800 + idx * 120}ms, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${800 + idx * 120}ms`,
                }}>
                  <I size={14} strokeWidth={1.5} color={color} />
                  <span style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.7)',
                  }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </FlowNode>
      </div>
    </div>
  );
}

/* ─── IPFS Proof Flow Diagram ─── */
function IPFSProofFlowDiagram() {
  const { ref: containerRef, visible: containerVisible } = useScrollReveal(0.05);
  const { ref: midRef, visible: midVisible } = useScrollReveal(0.2);

  const nodeBase: React.CSSProperties = {
    position: 'relative',
    borderRadius: 10,
    padding: '14px 18px',
    fontFamily: "'Fira Code', monospace",
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'center',
  };

  const glowBorder = (color: string) => ({
    border: `1px solid ${color}40`,
    boxShadow: `0 0 20px ${color}10, inset 0 1px 0 ${color}15`,
  });

  const badge = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "'Fira Code', monospace",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    marginBottom: 8,
  });

  return (
    <div ref={containerRef} style={{
      background: 'linear-gradient(135deg, rgba(15,10,30,0.8), rgba(20,15,40,0.6))',
      border: '1px solid rgba(6,182,212,0.15)',
      borderRadius: 16,
      padding: '32px 24px',
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      <FlowNode visible={containerVisible} delay={0}>
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <span style={badge('#06b6d4')}>Proof → IPFS Pipeline</span>
        </div>
      </FlowNode>

      {/* Step 1: User Action */}
      <FlowNode visible={containerVisible} delay={150}>
        <div style={{
          ...nodeBase,
          ...glowBorder('#f59e0b'),
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.02))',
          maxWidth: 340,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Zap size={16} strokeWidth={1.5} color="#f59e0b" />
            <span style={{ color: '#fbbf24', fontWeight: 600, fontSize: 12 }}>1. User Action</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>shield, unshield, mint, lock, repay...</div>
        </div>
      </FlowNode>

      <FlowConnector visible={containerVisible} delay={350} color="rgba(139,92,246,0.5)" />

      {/* Step 2: ZK Proof Generation */}
      <FlowNode visible={containerVisible} delay={500}>
        <div style={{
          ...nodeBase,
          ...glowBorder('#8b5cf6'),
          background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
          maxWidth: 340,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <Shield size={16} strokeWidth={1.5} color="#8b5cf6" />
            <span style={{ color: '#a78bfa', fontWeight: 600, fontSize: 12 }}>2. ZK Proof Generation</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>In-browser via Noir + Barretenberg</div>
        </div>
      </FlowNode>

      <FlowConnector visible={containerVisible} delay={700} color="rgba(16,185,129,0.5)" />

      {/* Step 3: On-chain Verification */}
      <FlowNode visible={containerVisible} delay={850}>
        <div style={{
          ...nodeBase,
          ...glowBorder('#10b981'),
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.02))',
          maxWidth: 340,
          margin: '0 auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <ShieldCheck size={16} strokeWidth={1.5} color="#10b981" />
            <span style={{ color: '#34d399', fontWeight: 600, fontSize: 12 }}>3. On-chain Verification</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>Garaga verifier contract on Starknet</div>
        </div>
      </FlowNode>

      <FlowConnector visible={containerVisible} delay={1050} color="rgba(6,182,212,0.5)" />

      {/* Step 4: Post-verification fan-out */}
      <div ref={midRef}>
        <FlowNode visible={midVisible} delay={0}>
          <div style={{
            border: '1px solid rgba(6,182,212,0.2)',
            borderRadius: 14,
            padding: '20px 16px 16px',
            background: 'linear-gradient(180deg, rgba(6,182,212,0.04), transparent)',
            position: 'relative',
            maxWidth: 480,
            margin: '0 auto',
          }}>
            <div style={{
              position: 'absolute',
              top: -10,
              left: 20,
              background: '#0f0a1e',
              padding: '2px 12px',
              borderRadius: 6,
              border: '1px solid rgba(6,182,212,0.25)',
            }}>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                color: '#22d3ee',
                letterSpacing: 1,
              }}>4. After Successful Verification</span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
              marginTop: 12,
            }}>
              {[
                { label: 'Bundle JSON', sub: 'proof bytes + metadata', icon: FileText, color: '#06b6d4', dir: 'left' as const },
                { label: 'Pin to IPFS', sub: 'via pinning service', icon: HardDrive, color: '#8b5cf6', dir: 'up' as const },
                { label: 'Store CID', sub: 'localStorage + on-chain', icon: Database, color: '#10b981', dir: 'right' as const },
              ].map(({ label, sub, icon: I, color, dir }, idx) => (
                <FlowNode key={label} visible={midVisible} delay={200 + idx * 200} direction={dir}>
                  <div style={{
                    ...nodeBase,
                    ...glowBorder(color),
                    background: `linear-gradient(135deg, ${color}0d, ${color}03)`,
                    padding: '12px 10px',
                  }}>
                    <I size={18} strokeWidth={1.5} color={color} style={{ margin: '0 auto 6px' }} />
                    <div style={{ color, fontWeight: 600, fontSize: 11, marginBottom: 2 }}>{label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{sub}</div>
                  </div>
                </FlowNode>
              ))}
            </div>
          </div>
        </FlowNode>

        <FlowConnector visible={midVisible} delay={800} color="rgba(236,72,153,0.5)" />

        {/* Step 5: Retrieval */}
        <FlowNode visible={midVisible} delay={1000}>
          <div style={{
            ...nodeBase,
            ...glowBorder('#ec4899'),
            background: 'linear-gradient(135deg, rgba(236,72,153,0.08), rgba(236,72,153,0.02))',
            maxWidth: 380,
            margin: '0 auto',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
              <Globe size={16} strokeWidth={1.5} color="#ec4899" />
              <span style={{ color: '#f472b6', fontWeight: 600, fontSize: 12 }}>5. Public Retrieval</span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}>
              {['ipfs://<CID>', 'gateway.pinata.cloud/ipfs/<CID>'].map((url, i) => (
                <span key={i} style={{
                  padding: '3px 10px',
                  borderRadius: 4,
                  background: 'rgba(236,72,153,0.08)',
                  border: '1px solid rgba(236,72,153,0.15)',
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 9,
                  fontFamily: "'Fira Code', monospace",
                }}>{url}</span>
              ))}
            </div>
          </div>
        </FlowNode>
      </div>
    </div>
  );
}

/* ─── Staking Flow Diagram ─── */
function StakingFlowDiagram() {
  const { ref: containerRef, visible: containerVisible } = useScrollReveal(0.05);

  const nodeBase: React.CSSProperties = {
    position: 'relative',
    borderRadius: 10,
    padding: '14px 18px',
    fontFamily: "'Fira Code', monospace",
    fontSize: 11,
    lineHeight: 1.5,
    textAlign: 'center',
  };

  const glowBorder = (color: string) => ({
    border: `1px solid ${color}40`,
    boxShadow: `0 0 20px ${color}10, inset 0 1px 0 ${color}15`,
  });

  const badge = (color: string): React.CSSProperties => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 8,
    fontFamily: "'Fira Code', monospace",
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color,
    background: `${color}15`,
    border: `1px solid ${color}30`,
    marginBottom: 8,
  });

  const steps = [
    { label: 'BTC', sub: 'Native Bitcoin', color: '#f59e0b', icon: Globe },
    { label: 'wBTC', sub: 'Bridge to Starknet', color: '#06b6d4', icon: Layers },
    { label: 'xyBTC', sub: 'Staking — earns yield', color: '#10b981', icon: Zap },
    { label: 'sxyBTC', sub: 'Shielded — fully private', color: '#8b5cf6', icon: Lock },
  ];

  return (
    <div ref={containerRef} style={{
      background: 'linear-gradient(135deg, rgba(15,10,30,0.8), rgba(20,15,40,0.6))',
      border: '1px solid rgba(16,185,129,0.15)',
      borderRadius: 16,
      padding: '32px 24px',
      marginBottom: 28,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
      }} />

      <FlowNode visible={containerVisible} delay={0}>
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <span style={badge('#10b981')}>Token Flow</span>
        </div>
      </FlowNode>

      {/* Horizontal flow on larger screens, vertical on small */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        flexWrap: 'wrap',
        position: 'relative',
      }}>
        {steps.map(({ label, sub, color, icon: I }, idx) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
            <FlowNode visible={containerVisible} delay={200 + idx * 300}>
              <div style={{
                ...nodeBase,
                ...glowBorder(color),
                background: `linear-gradient(135deg, ${color}0d, ${color}03)`,
                minWidth: 110,
                padding: '16px 14px',
              }}>
                <I size={20} strokeWidth={1.5} color={color} style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ color, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{label}</div>
                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{sub}</div>
              </div>
            </FlowNode>
            {idx < steps.length - 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                opacity: containerVisible ? 1 : 0,
                transition: `opacity 0.5s ease ${400 + idx * 300}ms`,
              }}>
                <div style={{
                  width: 24,
                  height: 2,
                  background: `linear-gradient(to right, ${steps[idx].color}60, ${steps[idx + 1].color}60)`,
                  position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute',
                    right: -3,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderTop: '4px solid transparent',
                    borderBottom: '4px solid transparent',
                    borderLeft: `6px solid ${steps[idx + 1].color}80`,
                  }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Step descriptions below */}
      <div style={{ marginTop: 24, maxWidth: 420, margin: '24px auto 0' }}>
        {[
          { step: '1', text: 'Bridge BTC to Starknet as wrapped BTC', color: '#f59e0b' },
          { step: '2', text: 'Deposit into ShieldedVault → routes to staking, mints xyBTC', color: '#06b6d4' },
          { step: '3', text: 'Shield to sxyBTC → balance becomes ElGamal ciphertext', color: '#10b981' },
          { step: '4', text: 'Yield accrues silently — nobody can see your position', color: '#8b5cf6' },
        ].map(({ step, text, color }, idx) => (
          <FlowNode key={step} visible={containerVisible} delay={800 + idx * 150}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '6px 0',
            }}>
              <span style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontFamily: "'Fira Code', monospace",
                color,
                flexShrink: 0,
              }}>{step}</span>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.5)',
              }}>{text}</span>
            </div>
          </FlowNode>
        ))}
      </div>
    </div>
  );
}

/* ─── Section component ─── */
function DocSection({ id, icon: Icon, iconColor, tag, title, children }: {
  id: string;
  icon: typeof Shield;
  iconColor: string;
  tag: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{
          width: 36,
          height: 36,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${iconColor}10`,
          border: `1px solid ${iconColor}20`,
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}>
          <Icon size={18} strokeWidth={1.5} color={iconColor} />
        </div>
        <div>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: iconColor,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>{tag}</span>
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            letterSpacing: 0.5,
            margin: 0,
          }}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

/* ─── Styled table ─── */
function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 20 }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: "'Outfit', sans-serif",
        fontSize: 13,
      }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left',
                padding: '10px 14px',
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 9,
                fontWeight: 600,
                color: 'rgba(59,130,246,0.7)',
                letterSpacing: 1,
                textTransform: 'uppercase',
                borderBottom: '1px solid rgba(59,130,246,0.1)',
                background: 'rgba(59,130,246,0.02)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={{
                  padding: '10px 14px',
                  color: ci === 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  fontFamily: ci === 0 ? "'Fira Code', monospace" : "'Outfit', sans-serif",
                  fontSize: ci === 0 ? 12 : 13,
                }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Code block ─── */
function CodeBlock({ children, label }: { children: string; label?: string }) {
  return (
    <div style={{
      background: 'rgba(4,6,11,0.8)',
      border: '1px solid rgba(59,130,246,0.08)',
      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
      marginBottom: 20,
      overflow: 'hidden',
    }}>
      {label && (
        <div style={{
          padding: '8px 16px',
          borderBottom: '1px solid rgba(59,130,246,0.06)',
          fontFamily: "'Fira Code', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.3)',
          letterSpacing: 1,
        }}>{label}</div>
      )}
      <pre style={{
        padding: 16,
        margin: 0,
        fontFamily: "'Fira Code', monospace",
        fontSize: 12,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.5)',
        overflowX: 'auto',
      }}>{children}</pre>
    </div>
  );
}

/* ─── Paragraph ─── */
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'Outfit', sans-serif",
      fontSize: 14,
      lineHeight: 1.8,
      color: 'rgba(255,255,255,0.45)',
      marginBottom: 16,
    }}>{children}</p>
  );
}

/* ─── Callout ─── */
function Callout({ type, children }: { type: 'warning' | 'info'; children: React.ReactNode }) {
  const isWarning = type === 'warning';
  const color = isWarning ? '#f59e0b' : '#3b82f6';
  const Icon = isWarning ? AlertTriangle : CheckCircle;
  return (
    <div style={{
      padding: '14px 18px',
      background: `${color}08`,
      border: `1px solid ${color}15`,
      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
      marginBottom: 20,
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
    }}>
      <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
      <div style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: 13,
        lineHeight: 1.7,
        color: 'rgba(255,255,255,0.5)',
      }}>{children}</div>
    </div>
  );
}

export default function DocsPage() {
  const navigate = useNavigate();

  const sidebarLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'features', label: 'Features' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'privacy-stack', label: 'Privacy Stack' },
    { id: 'ipfs', label: 'IPFS Integration' },
    { id: 'staking', label: 'Staking Flow' },
    { id: 'shielding', label: 'Shielding Protocol' },
    { id: 'cdp', label: 'Lending (CDP)' },
    { id: 'actions', label: 'All Actions' },
    { id: 'proofs', label: 'Proof Generation' },
    { id: 'solvency', label: 'Solvency Proofs' },
    { id: 'gamification', label: 'Gamification' },
    { id: 'starkzap', label: 'Starkzap SDK' },
    { id: 'contracts', label: 'Smart Contracts' },
    { id: 'known-issues', label: 'Known Issues' },
    { id: 'tech-stack', label: 'Tech Stack' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      background: '#04060b',
    }}>
      <style>{logoStyles}{docsStyles}</style>

      {/* Background effects */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 1000,
        height: 500,
        background: 'radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.015) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* Header */}
      <header className="docs-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="docs-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={14} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
            <span className="badge-shield" style={{ fontSize: 8 }}>
              <FileText size={8} />
              DOCS
            </span>
          </div>
        </div>
        <span className="badge-purple" style={{ fontSize: 8 }}>v0.1.0-alpha</span>
      </header>

      {/* Main content */}
      <div className="docs-layout">
        {/* Sidebar */}
        <nav className="docs-sidebar">
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            color: 'rgba(59,130,246,0.5)',
            letterSpacing: 2,
            marginBottom: 16,
            textTransform: 'uppercase',
          }}>
            Documentation
          </div>
          {sidebarLinks.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="docs-sidebar-link"
            >
              <ChevronRight size={10} strokeWidth={1.5} />
              {link.label}
            </a>
          ))}
        </nav>

        {/* Content */}
        <main className="docs-content">

          {/* ═══════ OVERVIEW ═══════ */}
          <DocSection id="overview" icon={Globe} iconColor="#3b82f6" tag="Introduction" title="What is ZapScura?">
            <P>
              ZapScura is a privacy-preserving AI DeFi agent built on Starknet (currently on Sepolia testnet). It lets users manage shielded Bitcoin and STRK positions through natural language chat — stake BTC via liquid staking, shield balances using ElGamal encryption, open private CDPs to mint stablecoins, and prove solvency — all without revealing actual amounts on-chain.
            </P>
            <P>
              What makes ZapScura different: an AI-first interface replaces complex DeFi UIs with natural language, zero-friction onboarding via Starkzap social login removes seed phrases and gas fees, and a full gamification layer turns privacy into a game with XP, levels, achievements, and streaks.
            </P>

            <DocTable
              headers={['Problem', 'ZapScura Solution']}
              rows={[
                ['Complex DeFi UIs', 'AI chat agent — describe what you want in plain English'],
                ['Visible on-chain balances', 'ElGamal encryption + Pedersen commitments + ZK proofs'],
                ['Seed phrase friction', 'Starkzap social login (Google/Apple/email)'],
                ['Gas fee barriers', 'Starkzap Paymaster — gasless transactions'],
                ['Privacy tools feel dry', 'Gamification — XP, levels, achievements, streaks'],
                ['No private solvency checks', 'On-chain solvency proofs via Garaga verifiers'],
              ]}
            />
          </DocSection>

          {/* ═══════ FEATURES ═══════ */}
          <DocSection id="features" icon={Zap} iconColor="#00e5ff" tag="Capabilities" title="Core Features">
            <div className="docs-feature-grid">
              {[
                { icon: Bot, color: '#8b5cf6', title: 'AI-First Interface', desc: 'No complex UIs. Type what you want in plain English. The AI handles deposits, staking, CDPs, and all 13 executable actions.' },
                { icon: EyeOff, color: '#3b82f6', title: 'Shielded Balances', desc: 'On-chain balances encrypted with ElGamal on Baby JubJub curve. Only the private key holder can decrypt.' },
                { icon: Zap, color: '#00e5ff', title: 'Gasless Transactions', desc: 'Starkzap Paymaster sponsors all gas fees. Users never need STRK tokens for transactions.' },
                { icon: Target, color: '#10b981', title: 'One-Tap Onboarding', desc: 'Social login via Google, Apple, or email. No seed phrases, no wallet setup, no browser extensions.' },
                { icon: Shield, color: '#f59e0b', title: 'ZK Proof Pipeline', desc: '7 specialized Noir circuits for range proofs, balance sufficiency, collateral ratios, and solvency attestation.' },
                { icon: Layers, color: '#ef4444', title: 'Private Lending (CDP)', desc: 'Borrow sUSD against encrypted collateral. Collateral ratio enforced via ZK proofs — amounts never revealed.' },
                { icon: HardDrive, color: '#06b6d4', title: 'IPFS Proof Storage', desc: 'ZK proofs are pinned to IPFS for permanent, decentralized, tamper-proof archival and auditability.' },
                { icon: Eye, color: '#a855f7', title: 'Solvency Proofs', desc: 'Protocol-wide vault and CDP solvency verified on-chain. Anyone can check — no individual positions revealed.' },
              ].map((f, i) => (
                <div key={i} className="docs-feature-card">
                  <div style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `${f.color}10`,
                    border: `1px solid ${f.color}20`,
                    clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
                    flexShrink: 0,
                  }}>
                    <f.icon size={15} strokeWidth={1.5} color={f.color} />
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: 0.5,
                      marginBottom: 4,
                    }}>{f.title}</div>
                    <div style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.35)',
                      lineHeight: 1.6,
                    }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </DocSection>

          {/* ═══════ ARCHITECTURE ═══════ */}
          <DocSection id="architecture" icon={Cpu} iconColor="#8b5cf6" tag="System Design" title="Architecture">
            <P>
              ZapScura runs entirely in-browser. The privacy engine, ZK proof generation, and encryption all happen client-side. Only encrypted data and proofs are sent to the Starknet blockchain.
            </P>
            <ArchitectureDiagram />
          </DocSection>

          {/* ═══════ PRIVACY STACK ═══════ */}
          <DocSection id="privacy-stack" icon={Lock} iconColor="#3b82f6" tag="Cryptography" title="Privacy Stack — Three Layers">

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>Layer 1: ElGamal Encrypted Balances</h3>
            <P>
              Balances are stored on-chain as ElGamal ciphertexts on the Baby JubJub curve. The scheme is additively homomorphic — the contract can update encrypted balances without decrypting them.
            </P>
            <CodeBlock label="ELGAMAL ENCRYPTION">{`Ciphertext = (C1, C2) where:
  C1 = r × G              (ephemeral public key)
  C2 = amount × G + r × PK (encrypted amount)

Key Generation:   sk = randomScalar(), pk = G × sk
Encryption:       r = randomScalar(), C1 = r × G, C2 = r × PK + amount × G
Decryption:       shared = sk × C1, encoded = C2 - shared, amount = discreteLog(encoded)
Homomorphic Add:  (a.C1 + b.C1, a.C2 + b.C2) = Enc(a + b)`}</CodeBlock>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              marginTop: 28,
              letterSpacing: 0.5,
            }}>Layer 2: Pedersen Commitments</h3>
            <P>
              Every balance operation produces a Pedersen commitment used as a public input to ZK proofs. The contract stores commitments — not amounts. Commitments bind the value (can't change after committing) while the blinding factor keeps it hidden.
            </P>
            <CodeBlock label="PEDERSEN COMMITMENT">{`commitment = PedersenHash(value, blinding_factor)

Properties:
  - Binding: can't change the committed value
  - Hiding: blinding factor keeps value secret
  - Public input to ZK circuits`}</CodeBlock>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              marginTop: 28,
              letterSpacing: 0.5,
            }}>Layer 3: Zero-Knowledge Proofs (Noir + Garaga)</h3>
            <P>
              Seven specialized circuits prove different properties about encrypted state. All circuits are written in Noir, compiled to ACIR, and proven using Barretenberg's UltraKeccakZKHonk proving system. Proofs are generated entirely in-browser.
            </P>
            <DocTable
              headers={['Circuit', 'Purpose']}
              rows={[
                ['range_proof', 'Proves shielded amount is within valid range'],
                ['balance_sufficiency', 'Proves unshield/withdrawal won\'t cause underflow'],
                ['collateral_ratio', 'Proves CDP health (≥200% collateralization)'],
                ['debt_update_validity', 'Validates borrow/repay arithmetic correctness'],
                ['zero_debt', 'Proves CDP debt is exactly zero for closure'],
                ['vault_solvency', 'Protocol-wide vault solvency attestation'],
                ['cdp_safety_bound', 'Protocol-wide CDP coverage proof'],
              ]}
            />
          </DocSection>

          {/* ═══════ IPFS ═══════ */}
          <DocSection id="ipfs" icon={HardDrive} iconColor="#06b6d4" tag="Decentralized Storage" title="IPFS Integration">
            <P>
              ZapScura uses IPFS (InterPlanetary File System) for permanent, decentralized storage of ZK proofs and proof metadata. This ensures that proof history remains tamper-proof, publicly auditable, and accessible even if ZapScura's servers go offline.
            </P>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>Why IPFS?</h3>
            <div className="docs-feature-grid" style={{ marginBottom: 24 }}>
              {[
                { title: 'Permanence', desc: 'Content-addressed storage means proofs are identified by their hash. Once pinned, they can\'t be modified or deleted.' },
                { title: 'Decentralization', desc: 'No single server holds your proof history. IPFS nodes worldwide can serve the data, eliminating single points of failure.' },
                { title: 'Auditability', desc: 'Anyone can retrieve a proof by its CID (Content Identifier) and verify it independently — enabling trustless audits.' },
                { title: 'Tamper-Proof', desc: 'If any byte of the proof changes, the CID changes. This makes proof records immutable by design.' },
              ].map((f, i) => (
                <div key={i} className="docs-feature-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <div style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#06b6d4',
                    letterSpacing: 0.5,
                  }}>{f.title}</div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.35)',
                    lineHeight: 1.6,
                  }}>{f.desc}</div>
                </div>
              ))}
            </div>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>What Gets Stored on IPFS</h3>
            <DocTable
              headers={['Data', 'Purpose', 'Privacy']}
              rows={[
                ['ZK Proof Bytes', 'The raw proof output from Barretenberg', 'Safe — proofs reveal nothing about inputs'],
                ['Public Inputs', 'Pedersen commitments, nullifiers', 'Safe — commitments hide actual values'],
                ['Proof Metadata', 'Circuit type, timestamp, verification status', 'Public metadata only'],
                ['Verification Key Hash', 'Links proof to specific circuit version', 'Public'],
              ]}
            />

            <Callout type="info">
              ZK proofs are zero-knowledge by definition — storing them on IPFS does not compromise privacy. The proof bytes reveal nothing about the underlying amounts, balances, or positions. Only commitments and nullifiers are included, which are cryptographically hiding.
            </Callout>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>IPFS Proof Flow</h3>
            <IPFSProofFlowDiagram />

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>IPFS Data Format</h3>
            <CodeBlock label="PROOF RECORD (JSON)">{`{
  "version": "1.0",
  "circuit": "range_proof",
  "prover": "ultrakeccak_zk_honk",
  "proof": "0x1a2b3c...",          // raw proof bytes (hex)
  "publicInputs": [
    "0xabc...",                      // Pedersen commitment
    "0xdef..."                       // nullifier
  ],
  "verificationKeyHash": "0x789...",
  "timestamp": 1711234567,
  "chain": "starknet-sepolia",
  "txHash": "0x456...",
  "status": "verified"
}`}</CodeBlock>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>Proof History & Retrieval</h3>
            <P>
              Each proof's IPFS CID is stored locally and can be linked to on-chain transaction hashes. Users can browse their full proof history in the dashboard, with each entry showing the circuit type, timestamp, verification status, and IPFS CID for independent verification.
            </P>
            <P>
              The proof history is cached locally (up to 50 proofs per address) and optionally synced to Supabase for cross-device access. IPFS provides the canonical, immutable source of truth.
            </P>
          </DocSection>

          {/* ═══════ STAKING FLOW ═══════ */}
          <DocSection id="staking" icon={Layers} iconColor="#10b981" tag="Yield" title="Staking Flow — Private BTC Yield">
            <P>
              ZapScura integrates liquid staking so users never interact with validators directly. The staking infrastructure is fully abstracted.
            </P>
            <StakingFlowDiagram />
            <Callout type="info">
              After shielding, the xyBTC exchange rate continues to appreciate as staking rewards accrue. Your yield grows invisibly behind the encryption layer.
            </Callout>
          </DocSection>

          {/* ═══════ SHIELDING ═══════ */}
          <DocSection id="shielding" icon={EyeOff} iconColor="#3b82f6" tag="Privacy" title="Shielding Protocol">
            <P>
              Shielding converts a public on-chain balance into an encrypted balance that only you can read. It's the core privacy primitive of ZapScura.
            </P>
            <CodeBlock label="SHIELD OPERATION">{`shield(amount, commitment, ciphertext, proof) → encrypted balance

1. Client: Build Pedersen commitment = Hash(amount, randomness)
2. Client: Encrypt amount with ElGamal → ciphertext (C1, C2)
3. Client: Generate ZK proof (RANGE_PROOF or DEBT_UPDATE_VALIDITY)
4. Client: Encode proof via Garaga → Starknet calldata
5. Contract: Verify proof on-chain → Garaga library_call
6. Contract: Store ciphertext, consume nullifier, emit event`}</CodeBlock>
            <CodeBlock label="UNSHIELD OPERATION">{`unshield(amount, commitment, ciphertext, proof) → public balance

1. Client: Decrypt current balance using private key
2. Client: Generate BALANCE_SUFFICIENCY proof
3. Contract: Verify proof, update ciphertext, return public xyBTC`}</CodeBlock>

            <Callout type="warning">
              All encryption keys are managed client-side. If you lose your encryption key, you lose access to your shielded balances forever — there is no recovery mechanism.
            </Callout>
          </DocSection>

          {/* ═══════ CDP ═══════ */}
          <DocSection id="cdp" icon={Database} iconColor="#f59e0b" tag="Lending" title="ShieldedCDP — Private Lending">
            <P>
              The ShieldedCDP lets users borrow sUSD stablecoins against encrypted sxyBTC collateral. Every value — collateral amount, debt amount, collateral ratio — stays hidden behind Pedersen commitments and ZK proofs.
            </P>
            <DocTable
              headers={['Parameter', 'Value']}
              rows={[
                ['Min Collateral Ratio', '200%'],
                ['Liquidation Threshold', '150%'],
                ['Stability Fee', '2% APR'],
                ['Max Debt per CDP', 'Protocol-limited'],
              ]}
            />
            <CodeBlock label="CDP LIFECYCLE">{`1. open_cdp()         → Create new position (no proof needed)
2. lock_collateral()   → Transfer sxyBTC to CDP (BALANCE_SUFFICIENCY proof)
3. mint_susd()         → Borrow against collateral (COLLATERAL_RATIO proof)
4. repay()             → Burn sUSD to reduce debt (DEBT_UPDATE_VALIDITY proof)
5. close_cdp()         → Close position when repaid (ZERO_DEBT proof)`}</CodeBlock>
          </DocSection>

          {/* ═══════ ALL ACTIONS ═══════ */}
          <DocSection id="actions" icon={Code} iconColor="#a855f7" tag="Reference" title="All 13 Executable Actions">
            <DocTable
              headers={['Action', 'Description', 'ZK Proof Required']}
              rows={[
                ['faucet', 'Mint test xyBTC tokens', 'No'],
                ['deposit', 'Deposit xyBTC into ShieldedVault', 'No'],
                ['shield', 'Convert public → encrypted balance', 'RANGE_PROOF'],
                ['unshield', 'Convert encrypted → public balance', 'BALANCE_SUFFICIENCY'],
                ['withdraw', 'Withdraw public xyBTC from vault', 'No'],
                ['open_cdp', 'Create new CDP position', 'No'],
                ['lock_collateral', 'Lock sxyBTC as CDP collateral', 'BALANCE_SUFFICIENCY'],
                ['mint_susd', 'Borrow sUSD against collateral', 'COLLATERAL_RATIO'],
                ['repay', 'Repay sUSD debt', 'DEBT_UPDATE_VALIDITY'],
                ['close_cdp', 'Close CDP (must be debt-free)', 'ZERO_DEBT'],
                ['submit_solvency', 'Submit vault solvency proof', 'VAULT_SOLVENCY'],
                ['check_balances', 'View decrypted balances', 'No'],
                ['check_solvency', 'Check protocol solvency status', 'No'],
              ]}
            />
          </DocSection>

          {/* ═══════ PROOF GENERATION ═══════ */}
          <DocSection id="proofs" icon={ShieldCheck} iconColor="#10b981" tag="ZK Pipeline" title="Proof Generation (In-Browser)">
            <P>
              Every private operation follows this pipeline. Proofs are generated entirely in the browser using Noir and Barretenberg — no trusted setup server.
            </P>
            <CodeBlock label="PROOF PIPELINE">{`1. [LOADING  — 10%]  Load circuit artifact JSON from /public/circuits/
2. [WITNESS  — 30%]  Generate witness inputs (amounts, blindings, commitments)
3. [PROVING  — 50%]  Generate UltraKeccakZKHonk proof (~5-15 seconds)
4. [ENCODING — 85%]  Load verification key (1888-byte pre-compiled VK)
5. [DONE     — 100%] Return proof + public inputs → encode as Starknet calldata`}</CodeBlock>
            <P>
              Proofs are cached in localStorage (max 50 per address) with full history: circuit type, status (verified/pending/failed), timestamp, transaction hash, and IPFS CID.
            </P>
          </DocSection>

          {/* ═══════ SOLVENCY ═══════ */}
          <DocSection id="solvency" icon={Eye} iconColor="#06b6d4" tag="Protocol Health" title="Solvency Proofs">
            <P>
              ZapScura maintains two independent solvency domains. This isolation prevents issues in one domain from affecting the other.
            </P>
            <CodeBlock label="SOLVENCY DOMAINS">{`Vault Solvency:
  Proves: Sum(UserDepositsCipher) == VaultReserveCipher
  → All user deposits are backed by actual reserves
  → No individual position is revealed

CDP Solvency:
  Proves: TotalDebt <= TotalCollateral × Price / MIN_CR
  → All minted sUSD is overcollateralized
  → No individual CDP amounts disclosed`}</CodeBlock>
          </DocSection>

          {/* ═══════ GAMIFICATION ═══════ */}
          <DocSection id="gamification" icon={Target} iconColor="#f59e0b" tag="Progression" title="Gamification System">
            <P>
              ZapScura turns private DeFi into a progression system. Every action earns XP, unlocks achievements, and levels up your agent profile.
            </P>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>8-Level Progression</h3>
            <DocTable
              headers={['Level', 'Title', 'XP Required']}
              rows={[
                ['1', 'Shadow Initiate', '0 XP'],
                ['2', 'Cipher Apprentice', '100 XP'],
                ['3', 'Proof Runner', '300 XP'],
                ['4', 'Shield Bearer', '600 XP'],
                ['5', 'Vault Guardian', '1,000 XP'],
                ['6', 'Privacy Phantom', '1,500 XP'],
                ['7', 'ZK Master', '2,100 XP'],
                ['8', 'Shadow Sovereign', '2,800 XP'],
              ]}
            />

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              marginTop: 28,
              letterSpacing: 0.5,
            }}>Streak System</h3>
            <P>
              Daily activity tracking with compounding rewards. +10% bonus XP per consecutive day (caps at +50%). A 5-day streak means every action gives 1.5x XP. Streaks reset if you miss a day.
            </P>

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              marginTop: 28,
              letterSpacing: 0.5,
            }}>Privacy Score</h3>
            <CodeBlock label="PRIVACY SCORE">{`Privacy Score = (shieldedBalance / totalBalance) × 100%

80%+    → High privacy   (Green)
50–79%  → Moderate        (Amber)
<50%    → Low privacy     (Red)`}</CodeBlock>
          </DocSection>

          {/* ═══════ STARKZAP ═══════ */}
          <DocSection id="starkzap" icon={Zap} iconColor="#00e5ff" tag="Integration" title="Starkzap SDK">
            <P>
              ZapScura leverages the Starkzap SDK to eliminate every onboarding barrier.
            </P>
            <DocTable
              headers={['Module', 'What It Does']}
              rows={[
                ['Wallets', 'Social login via Privy + Cartridge Controller — Google, Apple, email. No seed phrase.'],
                ['Paymaster', 'Gasless transactions via AVNU / Cartridge. Users never need STRK for gas.'],
                ['DeFi', 'Access to staking, token operations, balance checking.'],
              ]}
            />
            <CodeBlock label="ONBOARDING FLOW">{`Sign in with Google → Chat with AI → DeFi happens. That's it.`}</CodeBlock>
          </DocSection>

          {/* ═══════ SMART CONTRACTS ═══════ */}
          <DocSection id="contracts" icon={Cpu} iconColor="#8b5cf6" tag="On-Chain" title="Smart Contracts">
            <P>
              All contracts are deployed on Starknet Sepolia. On-chain verification uses a universal UltraKeccakZKHonk Garaga verifier. All 7 circuits share the same verifier, differentiated by circuit-specific verification keys.
            </P>
            <DocTable
              headers={['Contract', 'Purpose']}
              rows={[
                ['ShieldedVault', 'Deposit/withdraw xyBTC, shield/unshield with ZK proofs'],
                ['ShieldedCDP', 'Open/close CDPs, lock collateral, mint sUSD, repay debt'],
                ['ProofVerifier', 'Verifies all 7 ZK proof types via Garaga verifier contracts'],
                ['SolvencyProver', 'Public vault + CDP solvency verification'],
                ['xyBTC Token', 'ERC20 test token with faucet'],
                ['PriceFeed', 'Oracle for collateral ratio calculations'],
              ]}
            />

            <h3 style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 12,
              letterSpacing: 0.5,
            }}>What's Visible vs Hidden On-Chain</h3>
            <DocTable
              headers={['Data', 'Visibility']}
              rows={[
                ['Wallet address', 'Visible'],
                ['Transaction type', 'Visible'],
                ['Pedersen commitments', 'Visible (hides value)'],
                ['ElGamal ciphertexts', 'Visible (encrypted)'],
                ['Nullifiers', 'Visible (prevents replay)'],
                ['ZK proof bytes', 'Visible (reveals nothing)'],
                ['Actual balances', 'HIDDEN'],
                ['Collateral amounts', 'HIDDEN'],
                ['Debt amounts', 'HIDDEN'],
                ['Privacy score', 'HIDDEN (client-only)'],
                ['XP / Level / Achievements', 'HIDDEN (client-only)'],
              ]}
            />
          </DocSection>

          {/* ═══════ KNOWN ISSUES ═══════ */}
          <DocSection id="known-issues" icon={AlertTriangle} iconColor="#ef4444" tag="Status" title="Known Issues & Limitations">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { title: 'Testnet Only', desc: 'ZapScura is currently deployed on Starknet Sepolia testnet. Mainnet deployment is pending security audits and formal verification.', severity: 'high' },
                { title: 'Key Recovery', desc: 'There is no recovery mechanism for lost encryption keys. If you lose your privacy key, your shielded balances are permanently inaccessible.', severity: 'high' },
                { title: 'Proof Generation Time', desc: 'In-browser ZK proof generation takes 5-15 seconds depending on circuit complexity and device performance. Lower-end devices may experience longer times.', severity: 'medium' },
                { title: 'Browser Memory Usage', desc: 'The Barretenberg proving system requires significant memory (~500MB). Some mobile browsers may struggle with proof generation.', severity: 'medium' },
                { title: 'Oracle Dependency', desc: 'CDP collateral ratio calculations depend on the PriceFeed oracle. Stale prices can temporarily block minting operations.', severity: 'medium' },
                { title: 'LocalStorage Limits', desc: 'Proof history is cached locally (max 50 per address). Older proofs are evicted but remain accessible via IPFS CID.', severity: 'low' },
                { title: 'AI Model Dependency', desc: 'The chat agent uses DeepSeek API via Vercel serverless proxy. API downtime affects the conversational interface but not direct contract interactions.', severity: 'low' },
                { title: 'No Liquidation Bot', desc: 'CDPs below the liquidation threshold (150%) are not automatically liquidated. This is planned for mainnet.', severity: 'medium' },
              ].map((issue, i) => (
                <div key={i} style={{
                  padding: '14px 18px',
                  background: issue.severity === 'high' ? 'rgba(239,68,68,0.04)' : issue.severity === 'medium' ? 'rgba(245,158,11,0.04)' : 'rgba(59,130,246,0.04)',
                  border: `1px solid ${issue.severity === 'high' ? 'rgba(239,68,68,0.1)' : issue.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)'}`,
                  clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.7)',
                      letterSpacing: 0.5,
                    }}>{issue.title}</span>
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 7,
                      letterSpacing: 1,
                      padding: '2px 6px',
                      background: issue.severity === 'high' ? 'rgba(239,68,68,0.1)' : issue.severity === 'medium' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.08)',
                      color: issue.severity === 'high' ? '#f87171' : issue.severity === 'medium' ? '#fbbf24' : '#60a5fa',
                      borderRadius: 3,
                      textTransform: 'uppercase',
                    }}>{issue.severity}</span>
                  </div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.35)',
                    lineHeight: 1.6,
                  }}>{issue.desc}</div>
                </div>
              ))}
            </div>
          </DocSection>

          {/* ═══════ TECH STACK ═══════ */}
          <DocSection id="tech-stack" icon={Code} iconColor="#10b981" tag="Stack" title="Tech Stack">
            <DocTable
              headers={['Layer', 'Technology']}
              rows={[
                ['Frontend', 'React 18 + TypeScript + Vite + TailwindCSS'],
                ['Wallet', 'Starkzap SDK (Social Login + Paymaster)'],
                ['AI', 'DeepSeek API (via Vercel serverless proxy)'],
                ['ZK Proofs', 'Noir 1.0.0-beta.16 + bb.js (UltraKeccakZKHonk, in-browser)'],
                ['On-chain Verification', 'Garaga verifier contracts (7 circuits)'],
                ['Privacy', 'ElGamal encryption (Baby JubJub) + Pedersen commitments'],
                ['Contracts', 'Cairo (Starknet) — deployed on Sepolia'],
                ['Proof Storage', 'IPFS (decentralized, content-addressed)'],
                ['Gamification', 'Custom XP engine + Supabase leaderboard'],
                ['Hosting', 'Vercel'],
              ]}
            />
          </DocSection>

          {/* Bottom spacer */}
          <div style={{ height: 64 }} />
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '16px 32px',
        borderTop: '1px solid rgba(59,130,246,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.2)',
          letterSpacing: 1,
        }}>
          ZAPSCURA DOCS v0.1
        </span>
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 8,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: 1.5,
        }}>
          NOIR + GARAGA + IPFS + STARKZAP
        </span>
      </footer>
    </div>
  );
}

const docsStyles = `
  .docs-header {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 16px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    backdrop-filter: blur(16px);
    background: rgba(4,6,11,0.92);
    border-bottom: 1px solid rgba(59,130,246,0.08);
  }
  .docs-back-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59,130,246,0.06);
    border: 1px solid rgba(59,130,246,0.1);
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s;
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  }
  .docs-back-btn:hover {
    background: rgba(59,130,246,0.12);
    color: #fff;
  }
  .docs-layout {
    display: flex;
    flex: 1;
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  .docs-sidebar {
    position: sticky;
    top: 65px;
    width: 220px;
    height: fit-content;
    max-height: calc(100vh - 65px);
    overflow-y: auto;
    padding: 32px 20px;
    border-right: 1px solid rgba(59,130,246,0.06);
    flex-shrink: 0;
  }
  .docs-sidebar-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    text-decoration: none;
    transition: all 0.2s;
    border-left: 2px solid transparent;
    margin-left: -2px;
  }
  .docs-sidebar-link:hover {
    color: rgba(255,255,255,0.7);
    background: rgba(59,130,246,0.04);
    border-left-color: rgba(59,130,246,0.3);
  }
  .docs-content {
    flex: 1;
    padding: 48px 48px 0;
    min-width: 0;
  }
  .docs-feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 24px;
  }
  .docs-feature-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
    transition: all 0.3s;
  }
  .docs-feature-card:hover {
    background: rgba(59,130,246,0.05);
    border-color: rgba(59,130,246,0.12);
  }

  /* ═══════ MOBILE ═══════ */
  @media (max-width: 768px) {
    .docs-header {
      padding: 12px 16px;
    }
    .docs-sidebar {
      display: none;
    }
    .docs-content {
      padding: 24px 16px 0;
    }
    .docs-feature-grid {
      grid-template-columns: 1fr;
    }
  }
`;
