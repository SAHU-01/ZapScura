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
} from 'lucide-react';
import ZapScuraLogo, { logoStyles } from '../components/ZapScuraLogo';

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

  // Animate lines appearing one by one
  useEffect(() => {
    if (!isVisible) return;
    if (visibleLines >= CODE_LINES.length) return;
    const delay = CODE_LINES[visibleLines].type === 'blank' ? 80 : 120 + Math.random() * 80;
    const t = setTimeout(() => setVisibleLines(v => v + 1), delay);
    return () => clearTimeout(t);
  }, [isVisible, visibleLines]);

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
          {isVisible && visibleLines < CODE_LINES.length && (
            <span className="terminal-processing">
              <span className="processing-dot" />
              TYPING
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
          {isVisible && visibleLines < CODE_LINES.length && (
            <span className="typing-cursor" style={{ color: '#8b5cf6' }}>▌</span>
          )}
          {visibleLines >= CODE_LINES.length && (
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
            <a href="#starkzap" className="home-nav-link">Starkzap</a>
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
          <div className="home-section-header">
            <span className="home-section-tag">FEATURES</span>
            <h2 className="home-section-title">
              DeFi Without The <span className="gradient-text">Complexity</span>
            </h2>
            <p className="home-section-desc">
              Everything you need to earn yield privately — wrapped in a conversational interface
            </p>
          </div>

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
              <div key={i} className="home-feature-card">
                <div className="home-feature-icon" style={{
                  background: `${f.color}08`,
                  border: `1px solid ${f.color}18`,
                }}>
                  <f.Icon size={20} strokeWidth={1.5} color={f.color} />
                </div>
                <h3 className="home-feature-title">{f.title}</h3>
                <p className="home-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="home-section" style={{ background: 'rgba(59,130,246,0.01)' }}>
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-section-tag">HOW IT WORKS</span>
            <h2 className="home-section-title">
              Three Steps to <span className="gradient-text">Private Yield</span>
            </h2>
          </div>

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
              <div key={i} className="home-step-card">
                <div className="home-step-number">{s.step}</div>
                <div className="home-step-icon">
                  <s.Icon size={24} strokeWidth={1.2} color="#3b82f6" />
                </div>
                <h3 className="home-step-title">{s.title}</h3>
                <p className="home-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TECHNOLOGY ═══════ */}
      <section id="tech" className="home-section">
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-section-tag">TECHNOLOGY</span>
            <h2 className="home-section-title">
              Powered by <span className="gradient-text">Cutting-Edge ZK</span>
            </h2>
            <p className="home-section-desc">
              State-of-the-art cryptography and zero-knowledge proofs ensure your privacy
            </p>
          </div>

          <div className="home-tech-grid">
            {[
              { label: 'Noir Circuits', desc: 'ZK proof generation', Icon: Cpu },
              { label: 'Garaga Verifiers', desc: 'On-chain verification', Icon: Shield },
              { label: 'ElGamal Encryption', desc: 'Homomorphic balance privacy', Icon: Lock },
              { label: 'Starkzap SDK', desc: 'Social login & gasless', Icon: Zap },
              { label: 'Starknet', desc: 'L2 scalability', Icon: Layers },
              { label: 'Pedersen Commitments', desc: 'Amount hiding', Icon: Eye },
            ].map((t, i) => (
              <div key={i} className="home-tech-item">
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
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ STARKZAP SDK ═══════ */}
      <section id="starkzap" className="home-section" style={{ background: 'rgba(139,92,246,0.01)' }}>
        <div className="home-section-inner">
          <div className="home-section-header">
            <span className="home-section-tag">BUILT WITH STARKZAP</span>
            <h2 className="home-section-title">
              Powered by the <span className="gradient-text">Starkzap SDK</span>
            </h2>
            <p className="home-section-desc">
              Starkzap provides the infrastructure that makes ZapScura seamless — from social login to gasless execution
            </p>
          </div>

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
              <div key={i} className="starkzap-card">
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
            ))}
          </div>

          {/* Starkzap integration code snippet */}
          <AnimatedCodeBlock />
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="home-cta-section">
        <div className="home-cta-inner">
          <h2 style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: 1,
          }}>
            <span className="gradient-text">Start Earning Privately</span>
          </h2>
          <p style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 15,
            color: 'rgba(255,255,255,0.4)',
            textAlign: 'center',
            maxWidth: 400,
            margin: '16px auto 32px',
            lineHeight: 1.6,
          }}>
            No seed phrases. No gas fees. Just tell the AI what you want.
          </p>
          <button className="btn-primary" onClick={() => navigate('/login')} style={{ padding: '14px 40px', fontSize: 12 }}>
            Launch App
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer style={{
        position: 'relative',
        zIndex: 10,
        padding: '24px 32px',
        borderTop: '1px solid rgba(59,130,246,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ZapScuraLogo size={20} />
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: 1,
          }}>
            ZAPSCURA v0.1 — BUILT WITH STARKZAP SDK ON STARKNET
          </span>
        </div>
        <span style={{
          fontFamily: "'Fira Code', monospace",
          fontSize: 8,
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: 1.5,
        }}>
          NOIR + GARAGA + STARKZAP
        </span>
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
    padding: 80px 24px 100px;
  }
  .home-cta-inner {
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 40px;
    background: rgba(59,130,246,0.03);
    border: 1px solid rgba(59,130,246,0.08);
    border-radius: 20px;
    position: relative;
    overflow: hidden;
  }
  .home-cta-inner::before {
    content: '';
    position: absolute;
    top: -50%;
    left: 50%;
    transform: translateX(-50%);
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
    pointer-events: none;
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
  }
`;
