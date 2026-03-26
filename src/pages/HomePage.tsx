/**
 * ZapScura Home / Marketing Landing Page.
 *
 * Full marketing page with hero, features, how-it-works, and CTA.
 * "Launch App" button takes users to /login for authentication.
 */

import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Zap,
  Bot,
  Target,
  Lock,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Layers,
  Eye,
  EyeOff,
  TrendingUp,
  Shield,
  Cpu,
  Wallet,
  CreditCard,
  Globe,
  Code,
  Network,
  Trophy,
  Flame,
  Star,
  Swords,
  Atom,
  Github,
  FileText,
  ExternalLink,
} from 'lucide-react';
import ZapScuraLogo, { logoStyles } from '../components/ZapScuraLogo';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Scroll-reveal wrapper. Children fade/slide up when scrolled into view.
 * `delay` staggers multiple items. `direction` controls slide origin.
 */
function Reveal({ children, delay = 0, direction = 'up', className = '' }: {
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
  className?: string;
}) {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();
  const transforms: Record<string, string> = {
    up: 'translateY(40px)',
    left: 'translateX(-40px)',
    right: 'translateX(40px)',
    scale: 'scale(0.92)',
  };
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : transforms[direction],
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/* ─── Typing animation sequences ─── */
const DEMO_SEQUENCES = [
  {
    userText: 'Stake 0.5 BTC privately and earn yield',
    aiSteps: [
      { text: 'Connecting to Starknet L2...', delay: 400 },
      { text: 'Generating ZK range proof for 0.5 BTC...', delay: 600 },
      { text: 'Shielding with ElGamal encryption...', delay: 500 },
      { text: 'Deposited into Endur vault at 5.2% APR.', delay: 400 },
    ],
    badges: [
      { label: 'PROOF VERIFIED', type: 'green' as const },
      { label: 'SHIELDED', type: 'shield' as const },
    ],
  },
  {
    userText: 'Open a CDP with 2 ETH as collateral',
    aiSteps: [
      { text: 'Encrypting collateral amount...', delay: 400 },
      { text: 'Generating Pedersen commitment...', delay: 600 },
      { text: 'Verifying on Garaga verifier contract...', delay: 500 },
      { text: 'CDP opened. Minted 1,200 sUSD privately.', delay: 400 },
    ],
    badges: [
      { label: 'CDP ACTIVE', type: 'green' as const },
      { label: 'COLLATERAL HIDDEN', type: 'shield' as const },
    ],
  },
  {
    userText: 'Show my shielded portfolio balance',
    aiSteps: [
      { text: 'Decrypting ElGamal ciphertext...', delay: 400 },
      { text: 'Verifying ownership proof...', delay: 500 },
      { text: 'Portfolio: 0.5 BTC + 1,200 sUSD + 2 ETH', delay: 300 },
      { text: 'Total value: $48,320 — visible only to you.', delay: 400 },
    ],
    badges: [
      { label: 'DECRYPTED', type: 'green' as const },
      { label: 'PRIVATE VIEW', type: 'shield' as const },
    ],
  },
];

function useTypingAnimation() {
  const [seqIdx, setSeqIdx] = useState(0);
  const [userText, setUserText] = useState('');
  const [aiLines, setAiLines] = useState<string[]>([]);
  const [badges, setBadges] = useState<typeof DEMO_SEQUENCES[0]['badges']>([]);
  const [isTypingUser, setIsTypingUser] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutRef.current.forEach(clearTimeout);
    timeoutRef.current = [];
  }, []);

  useEffect(() => {
    clearTimeouts();
    const seq = DEMO_SEQUENCES[seqIdx];
    setUserText('');
    setAiLines([]);
    setBadges([]);
    setIsTypingUser(true);
    setIsProcessing(false);
    setShowCursor(true);

    let totalDelay = 300;

    // Type user message character by character
    for (let i = 0; i < seq.userText.length; i++) {
      const charDelay = 30 + Math.random() * 25;
      totalDelay += charDelay;
      const t = setTimeout(() => {
        setUserText(seq.userText.slice(0, i + 1));
      }, totalDelay);
      timeoutRef.current.push(t);
    }

    // Pause after typing, then start AI response
    totalDelay += 600;
    const t1 = setTimeout(() => {
      setIsTypingUser(false);
      setIsProcessing(true);
    }, totalDelay);
    timeoutRef.current.push(t1);

    // AI response lines appear one by one
    for (let i = 0; i < seq.aiSteps.length; i++) {
      totalDelay += seq.aiSteps[i].delay + 400;
      const t = setTimeout(() => {
        setAiLines(prev => [...prev, seq.aiSteps[i].text]);
        if (i === seq.aiSteps.length - 1) setIsProcessing(false);
      }, totalDelay);
      timeoutRef.current.push(t);
    }

    // Show badges
    totalDelay += 500;
    const t2 = setTimeout(() => {
      setBadges(seq.badges);
      setShowCursor(false);
    }, totalDelay);
    timeoutRef.current.push(t2);

    // Move to next sequence
    totalDelay += 3500;
    const t3 = setTimeout(() => {
      setSeqIdx((seqIdx + 1) % DEMO_SEQUENCES.length);
    }, totalDelay);
    timeoutRef.current.push(t3);

    return clearTimeouts;
  }, [seqIdx, clearTimeouts]);

  return { userText, aiLines, badges, isTypingUser, showCursor, isProcessing };
}

function HeroTerminal() {
  const { userText, aiLines, badges, isTypingUser, showCursor, isProcessing } = useTypingAnimation();

  return (
    <div className="home-hero-preview">
      {/* Scan line effect */}
      <div className="terminal-scanline" />

      <div className="home-preview-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={14} color="#3b82f6" />
          <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 9, color: 'rgba(255,255,255,0.5)', letterSpacing: 1 }}>
            ZAPSCURA AI
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isProcessing && (
            <span className="terminal-processing">
              <span className="processing-dot" />
              PROCESSING
            </span>
          )}
          <span className="badge-green terminal-live-pulse" style={{ fontSize: 7 }}>LIVE</span>
        </div>
      </div>

      <div className="home-preview-messages">
        {/* User message with typing */}
        <div className="home-preview-user" style={{ minHeight: 36 }}>
          <MessageSquare size={10} color="rgba(255,255,255,0.3)" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            {userText}
            {isTypingUser && showCursor && <span className="typing-cursor">|</span>}
          </span>
        </div>

        {/* AI response lines */}
        {aiLines.length > 0 && (
          <div className="home-preview-ai terminal-ai-appear">
            <Bot size={10} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              {aiLines.map((line, i) => (
                <div key={i} className="terminal-ai-line" style={{
                  color: i === aiLines.length - 1 ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
                  marginBottom: i < aiLines.length - 1 ? 4 : 0,
                }}>
                  {i < aiLines.length - 1 && <span style={{ color: '#10b981', marginRight: 6 }}>✓</span>}
                  {i === aiLines.length - 1 && badges.length === 0 && <span className="typing-cursor" style={{ color: '#3b82f6' }}>▌</span>}
                  {line}
                </div>
              ))}
              {badges.length > 0 && (
                <div className="terminal-badges-appear" style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  {badges.map((b, i) => (
                    <span key={i} className={b.type === 'green' ? 'badge-green' : 'badge-shield'} style={{ fontSize: 7 }}>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && aiLines.length === 0 && (
          <div className="home-preview-ai">
            <Bot size={10} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
            <div className="terminal-thinking">
              <span className="thinking-dot" /><span className="thinking-dot" /><span className="thinking-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Terminal input bar */}
      <div className="terminal-input-bar">
        <span style={{ color: 'rgba(59,130,246,0.4)', fontSize: 10 }}>›</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontFamily: "'Fira Code', monospace" }}>
          Type a command...
        </span>
      </div>
    </div>
  );
}

const CODE_LINES = [
  { text: '// Initialize Starkzap for social login + gasless', type: 'comment' as const },
  { text: "import { StarkzapWallet, Paymaster } from '@starkzap/sdk';", type: 'import' as const },
  { text: '', type: 'blank' as const },
  { text: 'const wallet = await StarkzapWallet.create({', type: 'code' as const },
  { text: "  provider: 'google',     // Social login", type: 'code' as const },
  { text: "  network: 'starknet',    // L2 network", type: 'code' as const },
  { text: '});', type: 'code' as const },
  { text: '', type: 'blank' as const },
  { text: '// All transactions are gasless via Paymaster', type: 'comment' as const },
  { text: 'const tx = await Paymaster.sponsor({', type: 'code' as const },
  { text: '  calls: [shieldDeposit(amount, zkProof)],', type: 'code' as const },
  { text: '  wallet: wallet.address,', type: 'code' as const },
  { text: '});', type: 'code' as const },
];

function AnimatedCodeBlock() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [phase, setPhase] = useState<'typing' | 'done' | 'resetting'>('typing');
  const blockRef = useRef<HTMLDivElement>(null);

  // Intersection observer to trigger animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (blockRef.current) observer.observe(blockRef.current);
    return () => observer.disconnect();
  }, [isVisible]);

  // Animate lines appearing one by one, then loop
  useEffect(() => {
    if (!isVisible) return;

    if (phase === 'typing') {
      if (visibleLines >= CODE_LINES.length) {
        // All lines shown — move to done phase
        setPhase('done');
        return;
      }
      const delay = CODE_LINES[visibleLines].type === 'blank' ? 80 : 120 + Math.random() * 80;
      const t = setTimeout(() => setVisibleLines(v => v + 1), delay);
      return () => clearTimeout(t);
    }

    if (phase === 'done') {
      // Pause 3 seconds then reset
      const t = setTimeout(() => setPhase('resetting'), 3000);
      return () => clearTimeout(t);
    }

    if (phase === 'resetting') {
      // Reset and start over
      setVisibleLines(0);
      const t = setTimeout(() => setPhase('typing'), 600);
      return () => clearTimeout(t);
    }
  }, [isVisible, visibleLines, phase]);

  const getLineColor = (type: string) => {
    switch (type) {
      case 'comment': return 'rgba(255,255,255,0.25)';
      case 'import': return 'rgba(139,92,246,0.7)';
      default: return 'rgba(255,255,255,0.5)';
    }
  };

  return (
    <div ref={blockRef} className="starkzap-code-block">
      <div className="starkzap-code-header">
        <span style={{ color: 'rgba(255,255,255,0.3)', fontFamily: "'Fira Code', monospace", fontSize: 9, letterSpacing: 1 }}>
          INTEGRATION EXAMPLE
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isVisible && phase === 'typing' && visibleLines < CODE_LINES.length && (
            <span className="terminal-processing">
              <span className="processing-dot" />
              TYPING
            </span>
          )}
          {phase === 'done' && (
            <span className="terminal-processing" style={{ color: 'rgba(16,185,129,0.6)' }}>
              <span className="processing-dot" style={{ background: '#10b981' }} />
              LOOPING
            </span>
          )}
          <span style={{ color: 'rgba(59,130,246,0.4)', fontFamily: "'Fira Code', monospace", fontSize: 8 }}>
            zapscura.ts
          </span>
        </div>
      </div>
      <pre className="starkzap-code-content" style={{ minHeight: 220 }}>
        <code>
          {CODE_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              className="code-line-animate"
              style={{
                color: getLineColor(line.type),
                animationDelay: '0s',
              }}
            >
              {line.text}
              {'\n'}
            </div>
          ))}
          {phase === 'typing' && visibleLines < CODE_LINES.length && (
            <span className="typing-cursor" style={{ color: '#8b5cf6' }}>▌</span>
          )}
          {phase === 'done' && (
            <div className="code-complete-badge">
              <span className="badge-green" style={{ fontSize: 7 }}>READY TO INTEGRATE</span>
            </div>
          )}
        </code>
      </pre>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      background: '#04060b',
    }}>
      <style>{logoStyles}{homeStyles}</style>

      {/* Background effects */}
      <div className="home-glow-1" />
      <div className="home-glow-2" />
      <div className="home-glow-3" />

      {/* Grid overlay */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
        zIndex: 1,
      }} />

      {/* ═══════ NAVBAR ═══════ */}
      <header className="home-nav">
        <div className="home-nav-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ZapScuraLogo size={32} glow animated />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontWeight: 700,
              fontSize: 15,
              color: '#fff',
              letterSpacing: 1.5,
            }}>
              ZapScura
            </span>
          </div>

          <nav className="home-nav-links">
            <a href="#features" className="home-nav-link">Features</a>
            <a href="#how-it-works" className="home-nav-link">How It Works</a>
            <a href="#tech" className="home-nav-link">Technology</a>
            <a href="#gamification" className="home-nav-link">Gamification</a>
            <a href="#starkzap" className="home-nav-link">Starkzap</a>
            <span className="home-nav-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/docs')}>Docs</span>
          </nav>

          <button className="btn-primary" onClick={() => navigate('/login')} style={{ padding: '8px 20px', fontSize: 10 }}>
            Launch App
            <ArrowRight size={12} />
          </button>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="home-hero">
        <div className="home-hero-badge">
          <Zap size={10} strokeWidth={2.5} color="#3b82f6" />
          <span>Built on Starknet with Starkzap SDK</span>
        </div>

        <h1 className="home-hero-title">
          <span className="gradient-text">Private DeFi Yield</span>
          <br />
          <span style={{ color: '#fff' }}>In One Sentence</span>
        </h1>

        <p className="home-hero-subtitle">
          Just tell the AI what you want. Stake BTC privately, earn yield, manage
          shielded positions — all through natural language. No seed phrases.
          No gas fees. No complexity.
        </p>

        <div className="home-hero-actions">
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ padding: '14px 36px', fontSize: 12 }}>
            Launch App
            <ArrowRight size={14} />
          </button>
          <a href="#how-it-works" className="home-hero-secondary">
            See How It Works
            <ChevronRight size={14} />
          </a>
        </div>

        {/* Hero visual — AI chat preview with typing animation */}
        <HeroTerminal />

        {/* Trust badges */}
        <div className="home-trust-row">
          {[
            { Icon: ShieldCheck, label: 'ZK Privacy' },
            { Icon: Zap, label: 'Gasless' },
            { Icon: Bot, label: 'AI Agent' },
            { Icon: Target, label: 'One-Tap Login' },
          ].map((t, i) => (
            <div key={i} className="home-trust-badge">
              <t.Icon size={12} strokeWidth={1.5} color="#3b82f6" />
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section id="features" className="home-section">
        <div className="home-section-inner">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag">FEATURES</span>
              <h2 className="home-section-title">
                DeFi Without The <span className="gradient-text">Complexity</span>
              </h2>
              <p className="home-section-desc">
                Everything you need to earn yield privately — wrapped in a conversational interface
              </p>
            </div>
          </Reveal>

          <div className="home-features-grid">
            {[
              {
                Icon: MessageSquare,
                title: 'AI-First Interface',
                desc: 'No complex UIs. Just type what you want in plain English. The AI handles deposits, staking, CDPs, and more.',
                color: '#8b5cf6',
              },
              {
                Icon: EyeOff,
                title: 'Shielded Balances',
                desc: 'Your on-chain balances are encrypted with ElGamal. Only you can see your actual amounts — not even block explorers.',
                color: '#3b82f6',
              },
              {
                Icon: Zap,
                title: 'Gasless Transactions',
                desc: 'Starkzap Paymaster covers all gas fees. You never need to hold ETH or worry about gas prices.',
                color: '#00e5ff',
              },
              {
                Icon: Target,
                title: 'Social Login',
                desc: 'Sign in with Google, Apple, or email. No seed phrases, no browser extensions, no wallet setup required.',
                color: '#10b981',
              },
              {
                Icon: TrendingUp,
                title: 'Multi-Protocol Yield',
                desc: 'Access Endur (5.2% APR), Vesu (3.8%), and Nostra (4.1%) — all through a single private interface.',
                color: '#f59e0b',
              },
              {
                Icon: Lock,
                title: 'Shielded CDPs',
                desc: 'Open collateralized debt positions with hidden collateral amounts. Mint sUSD stablecoins privately.',
                color: '#ef4444',
              },
            ].map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="home-feature-card">
                  <div className="home-feature-icon" style={{
                    background: `${f.color}08`,
                    border: `1px solid ${f.color}18`,
                  }}>
                    <f.Icon size={20} strokeWidth={1.5} color={f.color} />
                  </div>
                  <h3 className="home-feature-title">{f.title}</h3>
                  <p className="home-feature-desc">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="home-section" style={{ background: 'rgba(59,130,246,0.01)' }}>
        <div className="home-section-inner">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag">HOW IT WORKS</span>
              <h2 className="home-section-title">
                Three Steps to <span className="gradient-text">Private Yield</span>
              </h2>
            </div>
          </Reveal>

          <div className="home-steps">
            {[
              {
                step: '01',
                title: 'Sign In',
                desc: 'One-tap login with Google, Apple, or email. A smart contract wallet is created for you automatically.',
                Icon: Target,
              },
              {
                step: '02',
                title: 'Tell The AI',
                desc: '"Stake 1 BTC privately" — the AI parses your intent, generates ZK proofs, and executes shielded transactions.',
                Icon: MessageSquare,
              },
              {
                step: '03',
                title: 'Earn Privately',
                desc: 'Your yield accrues in shielded vaults. Only you can view balances. Withdraw anytime with a simple command.',
                Icon: TrendingUp,
              },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.15} direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                <div className="home-step-card">
                  <div className="home-step-number">{s.step}</div>
                  <div className="home-step-icon">
                    <s.Icon size={24} strokeWidth={1.2} color="#3b82f6" />
                  </div>
                  <h3 className="home-step-title">{s.title}</h3>
                  <p className="home-step-desc">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TECHNOLOGY ═══════ */}
      <section id="tech" className="home-section">
        <div className="home-section-inner">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag">TECHNOLOGY</span>
              <h2 className="home-section-title">
                Powered by <span className="gradient-text">Cutting-Edge ZK</span>
              </h2>
              <p className="home-section-desc">
                State-of-the-art cryptography and zero-knowledge proofs ensure your privacy
              </p>
            </div>
          </Reveal>

          <div className="home-tech-grid">
            {[
              { label: 'Noir Circuits', desc: 'ZK proof generation', Icon: Cpu },
              { label: 'Garaga Verifiers', desc: 'On-chain verification', Icon: Shield },
              { label: 'ElGamal Encryption', desc: 'Homomorphic balance privacy', Icon: Lock },
              { label: 'Starkzap SDK', desc: 'Social login & gasless', Icon: Zap },
              { label: 'Starknet', desc: 'L2 scalability', Icon: Layers },
              { label: 'Pedersen Commitments', desc: 'Amount hiding', Icon: Eye },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 0.08} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="home-tech-item">
                  <t.Icon size={16} strokeWidth={1.5} color="#3b82f6" />
                  <div>
                    <div style={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontSize: 10,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.8)',
                      letterSpacing: 0.5,
                    }}>{t.label}</div>
                    <div style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.3)',
                      marginTop: 2,
                    }}>{t.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GAMIFICATION ═══════ */}
      <section id="gamification" className="home-section" style={{ background: 'rgba(139,92,246,0.015)' }}>
        <div className="home-section-inner">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag">GAMIFICATION</span>
              <h2 className="home-section-title">
                Privacy is a <span className="gradient-text">Game You Win</span>
              </h2>
              <p className="home-section-desc">
                Earn XP, level up your agent, unlock achievements, and compete on the leaderboard — all while protecting your assets
              </p>
            </div>
          </Reveal>

          {/* XP progression visual */}
          <div className="gamification-showcase">
            <div className="gamification-levels">
              {[
                { rank: 1, title: 'Initiate', color: '#6b7280', xp: '0 XP' },
                { rank: 2, title: 'Cipher', color: '#3b82f6', xp: '100 XP' },
                { rank: 3, title: 'Shadow', color: '#8b5cf6', xp: '500 XP' },
                { rank: 4, title: 'Phantom', color: '#f59e0b', xp: '1500 XP' },
                { rank: 5, title: 'Spectre', color: '#ef4444', xp: '5000 XP' },
              ].map((level, i) => (
                <Reveal key={i} delay={i * 0.1} direction="left">
                  <div className="gamification-level-card" style={{ '--level-color': level.color } as React.CSSProperties}>
                    <div className="level-rank" style={{ color: level.color }}>Lv.{level.rank}</div>
                    <div className="level-title" style={{ color: level.color }}>{level.title}</div>
                    <div className="level-xp">{level.xp}</div>
                    <div className="level-bar">
                      <div className="level-bar-fill" style={{
                        width: `${(i + 1) * 20}%`,
                        background: `linear-gradient(90deg, ${level.color}80, ${level.color})`,
                        boxShadow: `0 0 12px ${level.color}40`,
                      }} />
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="gamification-features">
              {[
                {
                  Icon: Star,
                  title: 'XP & Leveling',
                  desc: 'Every action earns XP — staking, shielding, generating proofs. Level up to unlock new titles and abilities.',
                  color: '#f59e0b',
                },
                {
                  Icon: Trophy,
                  title: 'Achievement Badges',
                  desc: 'Collect rare badges like "First Shield", "CDP Master", and "Shadow Protocol" by hitting privacy milestones.',
                  color: '#8b5cf6',
                },
                {
                  Icon: Flame,
                  title: 'Daily Streaks',
                  desc: 'Maintain your streak by using ZapScura daily. Longer streaks multiply your XP gains up to 3x.',
                  color: '#ef4444',
                },
                {
                  Icon: Swords,
                  title: 'Quest System',
                  desc: 'Complete quests like "Go Dark" and "Trust Verifier" to earn bonus XP and unlock exclusive rewards.',
                  color: '#10b981',
                },
              ].map((f, i) => (
                <Reveal key={i} delay={i * 0.12} direction="right">
                  <div className="gamification-feature-card">
                    <div className="gamification-feature-icon" style={{
                      background: `${f.color}0a`,
                      border: `1px solid ${f.color}18`,
                    }}>
                      <f.Icon size={18} strokeWidth={1.5} color={f.color} />
                    </div>
                    <div>
                      <h3 className="gamification-feature-title">{f.title}</h3>
                      <p className="gamification-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FUTURE SCOPE — QUANTUM RESISTANCE ═══════ */}
      <section id="quantum" className="home-section quantum-section">
        {/* Animated background grid for quantum feel */}
        <div className="quantum-bg-grid" />
        <div className="quantum-bg-glow" />

        <div className="home-section-inner" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag" style={{ color: '#00e5ff' }}>FUTURE SCOPE</span>
              <h2 className="home-section-title">
                Building Towards <span style={{
                  background: 'linear-gradient(135deg, #00e5ff 0%, #8b5cf6 50%, #3b82f6 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 4s ease infinite',
                }}>Quantum Resistance</span>
              </h2>
              <p className="home-section-desc" style={{ maxWidth: 560 }}>
                Today's encryption won't survive tomorrow's quantum computers. ZapScura's architecture is designed to evolve — and STARKs are already quantum-safe.
              </p>
            </div>
          </Reveal>

          {/* Progress connector line */}
          <Reveal delay={0.2}>
            <div className="quantum-progress-bar">
              <div className="quantum-progress-fill" />
              <div className="quantum-progress-dot quantum-progress-dot-1" />
              <div className="quantum-progress-dot quantum-progress-dot-2" />
              <div className="quantum-progress-dot quantum-progress-dot-3" />
            </div>
          </Reveal>

          <div className="quantum-timeline">
            {[
              {
                phase: 'NOW',
                title: 'Classical ZK Privacy',
                desc: 'ElGamal encryption, Pedersen commitments, Noir ZK circuits, and Garaga on-chain verification — production-grade privacy today.',
                icon: Shield,
                color: '#3b82f6',
                active: true,
                detail: 'Noir + Garaga + ElGamal',
              },
              {
                phase: 'NEXT',
                title: 'Lattice-Based Commitments',
                desc: 'Migrating Pedersen commitments to lattice-based schemes (RLWE). Resistant to Shor\'s algorithm. Drop-in replacement for our proof circuits.',
                icon: Layers,
                color: '#8b5cf6',
                active: false,
                detail: 'RLWE + Module-LWE',
              },
              {
                phase: 'HORIZON',
                title: 'Post-Quantum ZK Proofs',
                desc: 'STARKs are already quantum-resistant by design. As Starknet\'s prover evolves, ZapScura inherits PQ security natively.',
                icon: Atom,
                color: '#00e5ff',
                active: false,
                detail: 'Hash-based STARKs',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={0.15 + i * 0.2} direction="up">
                <div className={`quantum-card ${item.active ? 'quantum-card-active' : ''}`}
                  style={{ '--q-color': item.color } as React.CSSProperties}>
                  <div className="quantum-phase" style={{ color: item.color }}>{item.phase}</div>
                  <div className="quantum-icon" style={{
                    background: `${item.color}0a`,
                    border: `1px solid ${item.color}20`,
                  }}>
                    <item.icon size={24} strokeWidth={1.2} color={item.color} />
                    {item.active && <div className="quantum-icon-pulse" style={{ borderColor: `${item.color}30` }} />}
                  </div>
                  <h3 className="quantum-title">{item.title}</h3>
                  <p className="quantum-desc">{item.desc}</p>
                  <div className="quantum-detail" style={{ color: `${item.color}80` }}>{item.detail}</div>
                  {item.active && (
                    <div className="quantum-live-badge">
                      <div className="quantum-live-dot" />
                      LIVE
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.8}>
            <div className="quantum-note">
              <div className="quantum-note-icon">
                <Atom size={16} strokeWidth={1.5} color="#00e5ff" />
              </div>
              <div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'rgba(0,229,255,0.6)',
                  letterSpacing: 1,
                  marginBottom: 6,
                }}>WHY STARKs ARE QUANTUM-SAFE</div>
                <span>
                  STARKs use hash-based cryptography (no elliptic curves) — inherently resistant to quantum attacks via Shor's and Grover's algorithms. ZapScura on Starknet is future-proof by architecture, not by patch.
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ STARKZAP SDK ═══════ */}
      <section id="starkzap" className="home-section" style={{ background: 'rgba(139,92,246,0.01)' }}>
        <div className="home-section-inner">
          <Reveal>
            <div className="home-section-header">
              <span className="home-section-tag">BUILT WITH STARKZAP</span>
              <h2 className="home-section-title">
                Powered by the <span className="gradient-text">Starkzap SDK</span>
              </h2>
              <p className="home-section-desc">
                Starkzap provides the infrastructure that makes ZapScura seamless — from social login to gasless execution
              </p>
            </div>
          </Reveal>

          <div className="starkzap-grid">
            {[
              {
                Icon: Wallet,
                title: 'Starkzap Wallets',
                desc: 'Smart contract wallets created instantly via social login. Google, Apple, or email — no seed phrases, no extensions.',
                tag: 'AUTHENTICATION',
                color: '#8b5cf6',
              },
              {
                Icon: CreditCard,
                title: 'Starkzap Paymaster',
                desc: 'All gas fees are sponsored. Users never need ETH for transactions. Frictionless DeFi from day one.',
                tag: 'GASLESS',
                color: '#3b82f6',
              },
              {
                Icon: Code,
                title: 'Starkzap Sessions',
                desc: 'Pre-approved transaction sessions let the AI agent execute multiple operations without repeated signing.',
                tag: 'UX',
                color: '#00e5ff',
              },
              {
                Icon: Globe,
                title: 'Starkzap Deploy',
                desc: 'One-command deployment of smart contract wallets on Starknet. Fully abstracted account creation flow.',
                tag: 'INFRA',
                color: '#10b981',
              },
              {
                Icon: Network,
                title: 'Starkzap RPC',
                desc: 'Optimized Starknet RPC endpoints with built-in caching and retry logic for reliable on-chain interactions.',
                tag: 'NETWORK',
                color: '#f59e0b',
              },
              {
                Icon: Shield,
                title: 'Starkzap Security',
                desc: 'Hardware-backed key storage, transaction simulation, and multi-sig support for enterprise-grade security.',
                tag: 'SECURITY',
                color: '#ef4444',
              },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1} direction={i < 3 ? 'up' : 'scale'}>
                <div className="starkzap-card">
                  <div className="starkzap-card-tag" style={{ color: item.color }}>{item.tag}</div>
                  <div className="starkzap-card-header">
                    <div className="starkzap-icon" style={{
                      background: `${item.color}0a`,
                      border: `1px solid ${item.color}20`,
                    }}>
                      <item.Icon size={18} strokeWidth={1.5} color={item.color} />
                    </div>
                    <h3 className="starkzap-card-title">{item.title}</h3>
                  </div>
                  <p className="starkzap-card-desc">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Starkzap integration code snippet */}
          <AnimatedCodeBlock />
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="home-cta-section">
        {/* Animated orbiting rings */}
        <div className="cta-orbit cta-orbit-1" />
        <div className="cta-orbit cta-orbit-2" />
        <div className="cta-orbit cta-orbit-3" />

        <div className="home-cta-inner">
          {/* Floating particle dots */}
          <div className="cta-particles">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="cta-particle" style={{
                left: `${8 + (i * 7.5) % 84}%`,
                top: `${12 + ((i * 13) % 76)}%`,
                animationDelay: `${i * 0.4}s`,
                animationDuration: `${3 + (i % 3)}s`,
              }} />
            ))}
          </div>

          {/* Shield icon */}
          <div className="cta-icon-wrap">
            <Shield size={28} strokeWidth={1.2} color="#3b82f6" />
            <div className="cta-icon-ring" />
            <div className="cta-icon-ring cta-icon-ring-2" />
          </div>

          {/* Tagline */}
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 10,
            color: '#3b82f6',
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            Your Privacy Awaits
          </div>

          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(28px, 5vw, 44px)',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: 1,
            marginBottom: 8,
          }}>
            <span className="gradient-text">Start Earning</span>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.9)' }}>Privately</span>
          </h2>

          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15,
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            maxWidth: 420,
            margin: '0 auto 16px',
            lineHeight: 1.7,
          }}>
            No seed phrases. No gas fees. No exposed balances.
            <br />
            Just tell the AI what you want.
          </p>

          {/* Stats row */}
          <div className="cta-stats">
            {[
              { value: '5.2%', label: 'Max APR' },
              { value: '<2s', label: 'Proof Time' },
              { value: '$0', label: 'Gas Fees' },
            ].map((stat, i) => (
              <div key={i} className="cta-stat">
                <div className="cta-stat-value">{stat.value}</div>
                <div className="cta-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <button className="cta-launch-btn" onClick={() => navigate('/login')}>
            <span className="cta-btn-glow" />
            <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              Launch App
              <ArrowRight size={16} />
            </span>
          </button>

          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.15)',
            letterSpacing: 1.5,
            marginTop: 20,
          }}>
            POWERED BY STARKNET + STARKZAP + NOIR
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="home-footer">
        <div className="home-footer-inner">
          {/* Top section */}
          <div className="footer-top">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <ZapScuraLogo size={28} />
                <span style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  letterSpacing: 1,
                }}>
                  ZapScura
                </span>
              </div>
              <p style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
                lineHeight: 1.7,
                maxWidth: 300,
              }}>
                AI-powered privacy-preserving DeFi on Starknet. Stake, earn, and transact with zero-knowledge proofs — no one sees your balances.
              </p>

              {/* Tech stack badges */}
              <div style={{ display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
                {['Noir', 'Garaga', 'Starkzap', 'Starknet', 'ElGamal', 'STARKs'].map((tech) => (
                  <span key={tech} style={{
                    fontFamily: "'Fira Code', monospace",
                    fontSize: 8,
                    color: 'rgba(59,130,246,0.6)',
                    letterSpacing: 1,
                    padding: '3px 8px',
                    background: 'rgba(59,130,246,0.04)',
                    border: '1px solid rgba(59,130,246,0.08)',
                    borderRadius: 4,
                  }}>
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div className="footer-links-group">
              <div className="footer-col">
                <h4 className="footer-col-title">Protocol</h4>
                <a href="#features" className="footer-link">Features</a>
                <a href="#how-it-works" className="footer-link">How It Works</a>
                <a href="#tech" className="footer-link">Technology</a>
                <a href="#gamification" className="footer-link">Gamification</a>
              </div>
              <div className="footer-col">
                <h4 className="footer-col-title">Ecosystem</h4>
                <a href="#starkzap" className="footer-link">
                  Starkzap SDK
                  <ExternalLink size={8} />
                </a>
                <a href="#tech" className="footer-link">
                  Noir Circuits
                </a>
                <a href="#tech" className="footer-link">
                  Garaga Verifiers
                </a>
                <a href="#tech" className="footer-link">
                  Starknet L2
                </a>
              </div>
              <div className="footer-col">
                <h4 className="footer-col-title">Resources</h4>
                <span className="footer-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/docs')}>
                  <FileText size={10} />
                  Documentation
                </span>
                <span className="footer-link footer-link-muted">
                  <Github size={10} />
                  GitHub (coming soon)
                </span>
                <span className="footer-link footer-link-muted">
                  Whitepaper (coming soon)
                </span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="footer-divider" />

          {/* Bottom section */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <span className="footer-copyright">
                &copy; 2026 ZapScura. Privacy-first DeFi.
              </span>
              <span className="footer-version">v0.1.0-alpha</span>
            </div>
            <div className="footer-bottom-right">
              <span className="footer-tagline">
                Built with <span style={{ color: '#3b82f6' }}>&#9889;</span> on Starknet
              </span>
              <span className="footer-quantum-badge">
                <Atom size={10} strokeWidth={1.5} color="#00e5ff" />
                Quantum-Ready Architecture
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const homeStyles = `
  /* ═══════ BACKGROUND GLOWS ═══════ */
  .home-glow-1 {
    position: fixed;
    width: 900px;
    height: 700px;
    top: -250px;
    left: 50%;
    transform: translateX(-50%);
    background: radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .home-glow-2 {
    position: fixed;
    width: 600px;
    height: 600px;
    bottom: -200px;
    right: -100px;
    background: radial-gradient(ellipse at center, rgba(139,92,246,0.04) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
  .home-glow-3 {
    position: fixed;
    width: 500px;
    height: 500px;
    top: 40%;
    left: -150px;
    background: radial-gradient(ellipse at center, rgba(0,229,255,0.03) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  /* ═══════ NAVBAR ═══════ */
  .home-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    backdrop-filter: blur(20px);
    background: rgba(4,6,11,0.85);
    border-bottom: 1px solid rgba(59,130,246,0.06);
  }
  .home-nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .home-nav-links {
    display: flex;
    gap: 6px;
  }
  .home-nav-link {
    padding: 8px 16px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 400;
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    transition: color 0.2s;
    letter-spacing: 0.3px;
  }
  .home-nav-link:hover {
    color: rgba(255,255,255,0.8);
  }

  /* ═══════ HERO ═══════ */
  .home-hero {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 100px 24px 80px;
  }
  .home-hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(59,130,246,0.06);
    border: 1px solid rgba(59,130,246,0.12);
    border-radius: 100px;
    font-family: 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 0.5px;
    margin-bottom: 32px;
  }
  .home-hero-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(36px, 6vw, 60px);
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 1px;
    margin-bottom: 24px;
  }
  .home-hero-subtitle {
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 400;
    color: rgba(255,255,255,0.4);
    line-height: 1.7;
    max-width: 520px;
    margin-bottom: 40px;
  }
  .home-hero-actions {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 60px;
  }
  .home-hero-secondary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.4);
    text-decoration: none;
    transition: color 0.2s;
  }
  .home-hero-secondary:hover {
    color: rgba(255,255,255,0.7);
  }

  /* Hero preview card */
  .home-hero-preview {
    position: relative;
    width: 100%;
    max-width: 560px;
    background: rgba(10,17,40,0.8);
    border: 1px solid rgba(59,130,246,0.1);
    border-radius: 14px;
    overflow: hidden;
    backdrop-filter: blur(12px);
    box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(59,130,246,0.05);
    margin-bottom: 48px;
    transition: box-shadow 0.3s;
  }
  .home-hero-preview:hover {
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(59,130,246,0.08);
  }
  .home-preview-header {
    padding: 12px 16px;
    border-bottom: 1px solid rgba(59,130,246,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .home-preview-messages {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .home-preview-user {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.6);
  }
  .home-preview-ai {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 14px;
    background: rgba(59,130,246,0.03);
    border: 1px solid rgba(59,130,246,0.08);
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
  }

  /* Trust row */
  .home-trust-row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .home-trust-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
  }

  /* ═══════ SECTIONS ═══════ */
  .home-section {
    position: relative;
    z-index: 10;
    padding: 100px 24px;
  }
  .home-section-inner {
    max-width: 1100px;
    margin: 0 auto;
  }
  .home-section-header {
    text-align: center;
    margin-bottom: 64px;
  }
  .home-section-tag {
    display: inline-block;
    font-family: 'Fira Code', monospace;
    font-size: 10px;
    font-weight: 500;
    color: #3b82f6;
    letter-spacing: 3px;
    margin-bottom: 16px;
  }
  .home-section-title {
    font-family: 'Orbitron', sans-serif;
    font-size: clamp(24px, 4vw, 36px);
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
    letter-spacing: 0.5px;
  }
  .home-section-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    color: rgba(255,255,255,0.35);
    margin-top: 16px;
    line-height: 1.6;
  }

  /* ═══════ FEATURES GRID ═══════ */
  .home-features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  @media (max-width: 900px) {
    .home-features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .home-features-grid {
      grid-template-columns: 1fr;
    }
  }
  .home-feature-card {
    padding: 28px 24px;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 14px;
    transition: all 0.3s;
  }
  .home-feature-card:hover {
    background: rgba(59,130,246,0.04);
    border-color: rgba(59,130,246,0.15);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  }
  .home-feature-icon {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    margin-bottom: 16px;
  }
  .home-feature-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .home-feature-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    line-height: 1.6;
  }

  /* ═══════ STEPS ═══════ */
  .home-steps {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
  @media (max-width: 768px) {
    .home-steps {
      grid-template-columns: 1fr;
      max-width: 400px;
      margin: 0 auto;
    }
  }
  .home-step-card {
    position: relative;
    padding: 32px 24px;
    text-align: center;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 14px;
    transition: all 0.3s;
  }
  .home-step-card:hover {
    border-color: rgba(59,130,246,0.15);
    transform: translateY(-2px);
  }
  .home-step-number {
    font-family: 'Orbitron', sans-serif;
    font-size: 32px;
    font-weight: 800;
    color: rgba(59,130,246,0.1);
    margin-bottom: 8px;
  }
  .home-step-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(59,130,246,0.05);
    border: 1px solid rgba(59,130,246,0.1);
    border-radius: 50%;
    margin: 0 auto 16px;
  }
  .home-step-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  .home-step-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
    line-height: 1.6;
  }

  /* ═══════ TECH GRID ═══════ */
  .home-tech-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media (max-width: 768px) {
    .home-tech-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .home-tech-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 10px;
    transition: all 0.2s;
  }
  .home-tech-item:hover {
    border-color: rgba(59,130,246,0.15);
    background: rgba(59,130,246,0.04);
  }

  /* ═══════ CTA ═══════ */
  .home-cta-section {
    position: relative;
    z-index: 10;
    padding: 100px 24px 120px;
    overflow: hidden;
  }
  .home-cta-inner {
    max-width: 640px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 72px 48px 56px;
    background: linear-gradient(165deg, rgba(59,130,246,0.06) 0%, rgba(139,92,246,0.03) 50%, rgba(4,6,11,0.8) 100%);
    border: 1px solid rgba(59,130,246,0.12);
    border-radius: 28px;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(20px);
    box-shadow:
      0 0 80px rgba(59,130,246,0.06),
      0 40px 80px rgba(0,0,0,0.4),
      inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .home-cta-inner::before {
    content: '';
    position: absolute;
    top: -60%;
    left: 50%;
    transform: translateX(-50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.03) 40%, transparent 70%);
    pointer-events: none;
    animation: cta-glow-pulse 6s ease-in-out infinite;
  }
  .home-cta-inner::after {
    content: '';
    position: absolute;
    bottom: -40%;
    right: -20%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(0,229,255,0.04) 0%, transparent 70%);
    pointer-events: none;
  }
  @keyframes cta-glow-pulse {
    0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.15); }
  }

  /* Orbiting rings */
  .cta-orbit {
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(59,130,246,0.06);
    pointer-events: none;
    z-index: 5;
  }
  .cta-orbit-1 {
    width: 700px;
    height: 700px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: cta-spin 40s linear infinite;
  }
  .cta-orbit-2 {
    width: 500px;
    height: 500px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: rgba(139,92,246,0.05);
    animation: cta-spin 30s linear infinite reverse;
  }
  .cta-orbit-3 {
    width: 300px;
    height: 300px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: rgba(0,229,255,0.04);
    animation: cta-spin 20s linear infinite;
  }
  @keyframes cta-spin {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Floating particles */
  .cta-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .cta-particle {
    position: absolute;
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: rgba(59,130,246,0.3);
    animation: cta-float ease-in-out infinite;
  }
  .cta-particle:nth-child(odd) {
    background: rgba(139,92,246,0.25);
  }
  .cta-particle:nth-child(3n) {
    background: rgba(0,229,255,0.2);
    width: 2px;
    height: 2px;
  }
  @keyframes cta-float {
    0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
    20% { opacity: 1; transform: translateY(-8px) scale(1); }
    80% { opacity: 0.6; transform: translateY(-20px) scale(0.8); }
  }

  /* Shield icon */
  .cta-icon-wrap {
    position: relative;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    z-index: 2;
  }
  .cta-icon-ring {
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    border: 1px solid rgba(59,130,246,0.15);
    animation: cta-ring-pulse 3s ease-in-out infinite;
  }
  .cta-icon-ring-2 {
    inset: -12px;
    border-color: rgba(59,130,246,0.08);
    animation-delay: 1s;
    animation-duration: 4s;
  }
  @keyframes cta-ring-pulse {
    0%, 100% { opacity: 0.5; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.08); }
  }

  /* Stats row */
  .cta-stats {
    display: flex;
    gap: 32px;
    margin: 24px 0 36px;
    position: relative;
    z-index: 2;
  }
  .cta-stat {
    text-align: center;
    padding: 12px 20px;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 12px;
    transition: all 0.3s;
  }
  .cta-stat:hover {
    background: rgba(59,130,246,0.04);
    border-color: rgba(59,130,246,0.12);
    transform: translateY(-2px);
  }
  .cta-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: #fff;
    letter-spacing: 0.5px;
  }
  .cta-stat-label {
    font-family: 'Fira Code', monospace;
    font-size: 8px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-top: 4px;
  }

  /* Launch button */
  .cta-launch-btn {
    position: relative;
    z-index: 2;
    padding: 16px 48px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: #fff;
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    transition: all 0.3s;
    overflow: hidden;
  }
  .cta-launch-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 40px rgba(59,130,246,0.4), 0 8px 32px rgba(59,130,246,0.2);
    filter: brightness(1.1);
  }
  .cta-launch-btn:active {
    transform: translateY(0);
  }
  .cta-btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
    animation: cta-btn-shine 3s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes cta-btn-shine {
    0%, 100% { left: -100%; }
    50% { left: 150%; }
  }

  /* ═══════ TERMINAL ANIMATION ═══════ */
  .typing-cursor {
    color: #3b82f6;
    animation: blink 0.6s infinite;
    font-weight: 300;
  }
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  .terminal-scanline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.15), transparent);
    animation: scanline 3s linear infinite;
    z-index: 2;
    pointer-events: none;
  }
  @keyframes scanline {
    0% { top: 0; }
    100% { top: 100%; }
  }

  .terminal-live-pulse {
    animation: livePulse 2s ease-in-out infinite;
  }
  @keyframes livePulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(16,185,129,0.3); }
    50% { opacity: 0.7; box-shadow: 0 0 8px rgba(16,185,129,0.5); }
  }

  .terminal-processing {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'Fira Code', monospace;
    font-size: 7px;
    color: rgba(59,130,246,0.6);
    letter-spacing: 1px;
  }
  .processing-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #3b82f6;
    animation: processingPulse 1s ease-in-out infinite;
  }
  @keyframes processingPulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 1; }
  }

  .terminal-ai-appear {
    animation: fadeSlideUp 0.3s ease-out;
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .terminal-ai-line {
    font-family: 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.6;
    animation: lineAppear 0.4s ease-out;
  }
  @keyframes lineAppear {
    from { opacity: 0; transform: translateX(-4px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .terminal-badges-appear {
    animation: badgePop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  @keyframes badgePop {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  .terminal-thinking {
    display: flex;
    gap: 4px;
    padding: 4px 0;
  }
  .thinking-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: rgba(59,130,246,0.5);
    animation: thinking 1.2s ease-in-out infinite;
  }
  .thinking-dot:nth-child(2) { animation-delay: 0.15s; }
  .thinking-dot:nth-child(3) { animation-delay: 0.3s; }
  @keyframes thinking {
    0%, 100% { opacity: 0.2; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.1); }
  }

  .terminal-input-bar {
    padding: 10px 16px;
    border-top: 1px solid rgba(59,130,246,0.06);
    display: flex;
    align-items: center;
    gap: 8px;
    background: rgba(0,0,0,0.2);
  }

  /* ═══════ STARKZAP SDK SECTION ═══════ */
  .starkzap-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 48px;
  }
  @media (max-width: 900px) {
    .starkzap-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  @media (max-width: 600px) {
    .starkzap-grid {
      grid-template-columns: 1fr;
    }
  }
  .starkzap-card {
    padding: 24px 20px;
    background: rgba(139,92,246,0.02);
    border: 1px solid rgba(139,92,246,0.06);
    border-radius: 14px;
    transition: all 0.3s;
  }
  .starkzap-card:hover {
    background: rgba(139,92,246,0.04);
    border-color: rgba(139,92,246,0.15);
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  }
  .starkzap-card-tag {
    font-family: 'Fira Code', monospace;
    font-size: 8px;
    font-weight: 600;
    letter-spacing: 2px;
    margin-bottom: 12px;
    opacity: 0.7;
  }
  .starkzap-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
  }
  .starkzap-icon {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .starkzap-card-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.5px;
  }
  .starkzap-card-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    line-height: 1.6;
  }
  .starkzap-code-block {
    max-width: 560px;
    margin: 0 auto;
    background: rgba(10,17,40,0.8);
    border: 1px solid rgba(59,130,246,0.1);
    border-radius: 12px;
    overflow: hidden;
    backdrop-filter: blur(12px);
  }
  .starkzap-code-header {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(59,130,246,0.06);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .starkzap-code-content {
    padding: 16px 20px;
    margin: 0;
    font-family: 'Fira Code', monospace;
    font-size: 11px;
    line-height: 1.8;
    color: rgba(255,255,255,0.5);
    overflow-x: auto;
  }
  .starkzap-code-content code {
    font-family: inherit;
    display: block;
  }

  .code-line-animate {
    animation: codeLineReveal 0.3s ease-out forwards;
    white-space: pre;
  }
  @keyframes codeLineReveal {
    from {
      opacity: 0;
      transform: translateX(-8px);
      filter: blur(2px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
      filter: blur(0);
    }
  }

  .code-complete-badge {
    margin-top: 12px;
    animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* ═══════ GAMIFICATION ═══════ */
  .gamification-showcase {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .gamification-showcase {
      grid-template-columns: 1fr;
    }
  }
  .gamification-levels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .gamification-level-card {
    display: grid;
    grid-template-columns: 48px 1fr 60px;
    grid-template-rows: auto auto;
    gap: 2px 12px;
    align-items: center;
    padding: 14px 18px;
    background: rgba(255,255,255,0.015);
    border: 1px solid rgba(255,255,255,0.04);
    border-radius: 12px;
    transition: all 0.3s;
  }
  .gamification-level-card:hover {
    background: rgba(255,255,255,0.03);
    border-color: var(--level-color, rgba(59,130,246,0.2));
    transform: translateX(4px);
  }
  .level-rank {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 800;
    grid-row: 1;
  }
  .level-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.5px;
    grid-row: 1;
  }
  .level-xp {
    font-family: 'Fira Code', monospace;
    font-size: 9px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 1px;
    text-align: right;
    grid-row: 1;
  }
  .level-bar {
    grid-column: 1 / -1;
    height: 4px;
    background: rgba(255,255,255,0.04);
    border-radius: 2px;
    overflow: hidden;
    margin-top: 4px;
  }
  .level-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .gamification-features {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .gamification-feature-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 20px;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 14px;
    transition: all 0.3s;
  }
  .gamification-feature-card:hover {
    background: rgba(59,130,246,0.04);
    border-color: rgba(59,130,246,0.15);
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  }
  .gamification-feature-icon {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    flex-shrink: 0;
  }
  .gamification-feature-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .gamification-feature-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    line-height: 1.6;
  }

  /* ═══════ QUANTUM SECTION ═══════ */
  .quantum-section {
    position: relative;
    overflow: hidden;
    background: rgba(0,10,30,0.5);
  }
  .quantum-bg-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: quantum-grid-drift 20s linear infinite;
    pointer-events: none;
  }
  @keyframes quantum-grid-drift {
    0% { transform: translate(0, 0); }
    100% { transform: translate(60px, 60px); }
  }
  .quantum-bg-glow {
    position: absolute;
    top: 20%;
    left: 50%;
    width: 600px;
    height: 600px;
    transform: translateX(-50%);
    background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, rgba(139,92,246,0.03) 40%, transparent 70%);
    pointer-events: none;
    animation: quantum-glow-pulse 6s ease-in-out infinite;
  }
  @keyframes quantum-glow-pulse {
    0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); }
    50% { opacity: 1; transform: translateX(-50%) scale(1.1); }
  }

  /* Progress bar connector */
  .quantum-progress-bar {
    position: relative;
    max-width: 700px;
    height: 2px;
    margin: 0 auto 40px;
    background: rgba(59,130,246,0.08);
    border-radius: 2px;
  }
  .quantum-progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 33%;
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 2px;
    animation: quantum-fill-pulse 3s ease-in-out infinite;
  }
  @keyframes quantum-fill-pulse {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 1; }
  }
  .quantum-progress-dot {
    position: absolute;
    top: 50%;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    transform: translateY(-50%);
    border: 2px solid rgba(59,130,246,0.3);
    background: #0a1128;
  }
  .quantum-progress-dot-1 {
    left: 16%;
    background: #3b82f6;
    border-color: #3b82f6;
    box-shadow: 0 0 8px rgba(59,130,246,0.4);
  }
  .quantum-progress-dot-2 {
    left: 50%;
    transform: translate(-50%, -50%);
    border-color: rgba(139,92,246,0.4);
  }
  .quantum-progress-dot-3 {
    right: 16%;
    border-color: rgba(0,229,255,0.3);
  }

  /* Quantum icon pulse for active card */
  .quantum-icon-pulse {
    position: absolute;
    inset: -6px;
    border-radius: 18px;
    border: 1.5px solid;
    animation: q-icon-ring 2.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes q-icon-ring {
    0%, 100% { opacity: 0; transform: scale(0.95); }
    50% { opacity: 1; transform: scale(1.08); }
  }

  /* Detail tag */
  .quantum-detail {
    font-family: 'Fira Code', monospace;
    font-size: 9px;
    letter-spacing: 1.5px;
    margin-top: 12px;
    text-transform: uppercase;
  }

  /* Note icon */
  .quantum-note-icon {
    width: 36px;
    height: 36px;
    min-width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,229,255,0.06);
    border: 1px solid rgba(0,229,255,0.12);
    border-radius: 10px;
  }

  /* Gradient shift for title */
  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .quantum-timeline {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
    position: relative;
    margin-bottom: 40px;
  }
  @media (max-width: 768px) {
    .quantum-timeline {
      grid-template-columns: 1fr;
      max-width: 420px;
      margin: 0 auto 40px;
    }
    .quantum-line {
      display: none !important;
    }
  }
  .quantum-line {
    position: absolute;
    top: 80px;
    left: 10%;
    right: 10%;
    height: 1px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #00e5ff);
    opacity: 0.2;
    z-index: 0;
  }
  .quantum-card {
    position: relative;
    z-index: 1;
    padding: 28px 24px;
    text-align: center;
    background: rgba(10,17,40,0.6);
    border: 1px solid rgba(59,130,246,0.06);
    border-radius: 16px;
    transition: all 0.3s;
    backdrop-filter: blur(8px);
  }
  .quantum-card:hover {
    border-color: rgba(59,130,246,0.15);
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  }
  .quantum-card-active {
    border-color: rgba(59,130,246,0.2);
    box-shadow: 0 0 30px rgba(59,130,246,0.06);
  }
  .quantum-phase {
    font-family: 'Fira Code', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 3px;
    margin-bottom: 16px;
  }
  .quantum-icon {
    position: relative;
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 14px;
    margin: 0 auto 16px;
  }
  .quantum-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: rgba(255,255,255,0.85);
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }
  .quantum-desc {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    line-height: 1.7;
  }
  .quantum-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 4px 12px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.2);
    border-radius: 100px;
    font-family: 'Fira Code', monospace;
    font-size: 8px;
    font-weight: 600;
    color: #10b981;
    letter-spacing: 2px;
  }
  .quantum-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    animation: livePulse 2s ease-in-out infinite;
  }
  .quantum-note {
    display: flex;
    align-items: center;
    gap: 12px;
    max-width: 700px;
    margin: 0 auto;
    padding: 16px 24px;
    background: rgba(0,229,255,0.02);
    border: 1px solid rgba(0,229,255,0.08);
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    color: rgba(255,255,255,0.4);
    line-height: 1.6;
  }

  /* ═══════ FOOTER ═══════ */
  .home-footer {
    position: relative;
    z-index: 10;
    border-top: 1px solid rgba(59,130,246,0.06);
    background: rgba(4,6,11,0.8);
    backdrop-filter: blur(12px);
  }
  .home-footer-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 60px 32px 32px;
  }
  .footer-top {
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    gap: 60px;
    margin-bottom: 40px;
  }
  @media (max-width: 768px) {
    .footer-top {
      grid-template-columns: 1fr;
      gap: 40px;
    }
  }
  .footer-brand {}
  .footer-links-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
  @media (max-width: 600px) {
    .footer-links-group {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  .footer-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .footer-col-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    font-weight: 700;
    color: rgba(255,255,255,0.5);
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .footer-link {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: rgba(255,255,255,0.3);
    text-decoration: none;
    transition: color 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
  .footer-link:hover {
    color: rgba(255,255,255,0.7);
  }
  .footer-link-muted {
    cursor: default;
    opacity: 0.5;
  }
  .footer-link-muted:hover {
    color: rgba(255,255,255,0.3);
  }
  .footer-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(59,130,246,0.1), rgba(139,92,246,0.08), transparent);
    margin-bottom: 24px;
  }
  .footer-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .footer-bottom-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .footer-copyright {
    font-family: 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.5px;
  }
  .footer-version {
    font-family: 'Fira Code', monospace;
    font-size: 9px;
    color: rgba(59,130,246,0.4);
    padding: 2px 8px;
    background: rgba(59,130,246,0.04);
    border: 1px solid rgba(59,130,246,0.08);
    border-radius: 4px;
    letter-spacing: 1px;
  }
  .footer-bottom-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .footer-tagline {
    font-family: 'Fira Code', monospace;
    font-size: 10px;
    color: rgba(255,255,255,0.2);
    letter-spacing: 0.5px;
  }
  .footer-quantum-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: 'Fira Code', monospace;
    font-size: 8px;
    color: rgba(0,229,255,0.5);
    letter-spacing: 1px;
    padding: 4px 10px;
    background: rgba(0,229,255,0.03);
    border: 1px solid rgba(0,229,255,0.08);
    border-radius: 100px;
  }

  /* ═══════ RESPONSIVE ═══════ */
  @media (max-width: 600px) {
    .home-hero {
      padding: 60px 20px 60px;
    }
    .home-hero-actions {
      flex-direction: column;
      gap: 12px;
    }
    .home-nav-links {
      display: none;
    }
    .home-section {
      padding: 60px 20px;
    }
    .home-footer-inner {
      padding: 40px 20px 24px;
    }
    .footer-bottom {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
