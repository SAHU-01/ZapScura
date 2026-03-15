/**
 * ZapScura AI Chat — Full-screen AI agent interface.
 *
 * Unlike Obscura's floating widget, ZapScura makes the AI chat
 * the PRIMARY interface. Users interact with DeFi through conversation.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Shield, Send, CheckCircle2, AlertTriangle, Zap, Lock, Clock } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';
import { useProof } from '../hooks/useProof';
import { sendChatMessage, type ChatMessage } from '../lib/ai/client';
import { parseActions, executeAction, type AIAction, type ActionResult } from '../lib/ai/executor';
import { getLocalShieldedBalance, getLocalCDPCollateral, getLocalCDPDebt } from '../lib/shieldedBalance';
import { loadProofHistory, type ProofRecord } from '../lib/proofHistory';
import { CONTRACT_ADDRESSES } from '../lib/contracts/config';

interface ProofMeta {
  circuit: string;
  timeMs: number;
  status: 'verified' | 'failed';
}

interface UIMessage {
  id: string;
  role: 'user' | 'assistant' | 'status' | 'action-confirm' | 'action-result';
  content: string;
  timestamp: number;
  action?: AIAction;
  actionResult?: ActionResult;
  proofMeta?: ProofMeta;
}

const PROOF_ACTIONS = new Set(['shield', 'unshield', 'lock_collateral', 'mint_susd', 'repay', 'close_cdp', 'submit_solvency']);

const CIRCUIT_LABELS: Record<string, string> = {
  range_proof: 'Range Proof',
  balance_sufficiency: 'Balance Sufficiency',
  collateral_ratio: 'Collateral Ratio',
  debt_update_validity: 'Debt Update Validity',
  zero_debt: 'Zero Debt',
  vault_solvency: 'Vault Solvency',
  cdp_safety_bound: 'CDP Safety Bound',
};

const SUGGESTED_PROMPTS = [
  { label: 'Stake BTC Privately', prompt: 'I want to stake 1 BTC privately and earn yield' },
  { label: 'Check My Portfolio', prompt: 'What are my current balances and positions?' },
  { label: 'Privacy Analysis', prompt: 'Analyze my privacy score and what\'s visible on-chain' },
  { label: 'Get Test Tokens', prompt: 'Get me some test BTC tokens from the faucet' },
  { label: 'How It Works', prompt: 'How does ZapScura\'s privacy-preserving DeFi work?' },
  { label: 'Open a CDP', prompt: 'I want to open a CDP and mint sUSD against my collateral' },
];

export default function AIChat() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { address, account, privacyKey } = useWallet();
  const { balances, refresh: refreshBalances } = useBalance();
  const { prove, isProving, progress: proofProgress } = useProof();
  const proofStartRef = useRef<number>(0);
  const [recentProofs, setRecentProofs] = useState<ProofRecord[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Load proof history on mount and when address changes
  useEffect(() => {
    if (address) {
      setRecentProofs(loadProofHistory(address).slice(0, 5));
    }
  }, [address]);

  const buildWalletContext = useCallback((): string => {
    if (!address) return 'User not signed in yet.';
    const shieldedBal = getLocalShieldedBalance(address);
    const cdpCollateral = getLocalCDPCollateral(address);
    const cdpDebt = getLocalCDPDebt(address);
    const pubBal = balances.publicBalance ?? BigInt(0);
    const totalBalance = pubBal + shieldedBal;
    const privacyScore = totalBalance > 0 ? Number((shieldedBal * BigInt(100)) / totalBalance) : 0;

    const fmt = (v: bigint, d = 18) => `${(Number(v) / 10 ** d).toFixed(4)}`;

    return [
      `- Wallet: ${address.slice(0, 8)}...${address.slice(-4)}`,
      `- Auth: Starkzap Social Login (gasless transactions enabled)`,
      `- Public vault balance: ${fmt(pubBal)} xyBTC`,
      `- Shielded balance: ${fmt(shieldedBal)} xyBTC`,
      `- Privacy score: ${privacyScore}%`,
      `- Has CDP: ${balances.hasCDP ? 'Yes' : 'No'}`,
      balances.hasCDP ? `- CDP collateral: ${(Number(cdpCollateral) / 1e8).toFixed(4)} xyBTC` : null,
      balances.hasCDP ? `- CDP debt: ${(Number(cdpDebt) / 1e8).toFixed(4)} sUSD` : null,
      `- Network: Starknet Sepolia`,
      `- Contracts: Vault=${CONTRACT_ADDRESSES.shieldedVault.slice(0, 8)}...`,
    ].filter(Boolean).join('\n');
  }, [address, balances]);

  const stripActionBlocks = (text: string): string => {
    return text
      .replace(/```action\s*\n[\s\S]*?\n```/g, '')
      .replace(/\{"action"\s*:\s*"\w+"(?:\s*,\s*"amount"\s*:\s*\d+(?:\.\d+)?)?\s*\}/g, '')
      .replace(/TX_HASH:\s*0x[a-fA-F0-9]+/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const formatAction = (action: AIAction): string => {
    const labels: Record<string, string> = {
      faucet: 'Mint 100 test xyBTC',
      deposit: `Deposit ${action.amount} xyBTC`,
      shield: `Shield ${action.amount} xyBTC (ZK proof)`,
      unshield: `Unshield ${action.amount} xyBTC (ZK proof)`,
      withdraw: `Withdraw ${action.amount} xyBTC`,
      open_cdp: 'Open CDP',
      lock_collateral: `Lock ${action.amount} xyBTC as collateral`,
      mint_susd: `Mint ${action.amount} sUSD`,
      repay: `Repay ${action.amount} sUSD`,
      close_cdp: 'Close CDP',
      check_balances: 'Check balances',
      check_solvency: 'Check solvency',
      submit_solvency: 'Submit solvency proofs',
      initialize_verifier: 'Initialize ProofVerifier',
    };
    return labels[action.action] || action.action;
  };

  const handleExecuteAction = useCallback(async (action: AIAction, confirmMsgId: string) => {
    if (!account || !address) {
      setError('Please sign in first.');
      return;
    }

    setIsExecuting(true);
    setMessages(prev => prev.filter(m => m.id !== confirmMsgId));

    const isProofAction = PROOF_ACTIONS.has(action.action);
    if (isProofAction) proofStartRef.current = Date.now();

    const statusId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: statusId,
      role: 'status' as const,
      content: `Executing: ${formatAction(action)}...`,
      timestamp: Date.now(),
      action,
    }]);

    const onStatus = (status: string) => {
      setMessages(prev => prev.map(m =>
        m.id === statusId ? { ...m, content: status } : m
      ));
    };

    try {
      const result = await executeAction(
        action, account, address, privacyKey,
        (input) => prove(input as Parameters<typeof prove>[0]),
        onStatus,
      );

      // Build proof metadata from proof history
      let proofMeta: ProofMeta | undefined;
      if (isProofAction && result.success && address) {
        const latestProof = loadProofHistory(address)[0];
        proofMeta = {
          circuit: latestProof?.circuit ?? action.action,
          timeMs: Date.now() - proofStartRef.current,
          status: 'verified',
        };
      } else if (isProofAction && !result.success) {
        proofMeta = {
          circuit: action.action,
          timeMs: Date.now() - proofStartRef.current,
          status: 'failed',
        };
      }

      setMessages(prev => prev.map(m =>
        m.id === statusId ? {
          ...m,
          role: 'action-result' as const,
          content: result.message,
          actionResult: result,
          proofMeta,
        } : m
      ));

      if (result.success) {
        refreshBalances().catch(() => {});
        // Refresh proof history for inline display
        if (address) {
          setRecentProofs(loadProofHistory(address).slice(0, 5));
        }
      }

      if (result.txHash) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant' as const,
          content: `TX_HASH:${result.txHash}`,
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Action failed';
      setMessages(prev => prev.map(m =>
        m.id === statusId ? {
          ...m,
          role: 'action-result' as const,
          content: `Failed: ${errMsg}`,
          actionResult: { success: false, message: errMsg },
          proofMeta: isProofAction ? {
            circuit: action.action,
            timeMs: Date.now() - proofStartRef.current,
            status: 'failed' as const,
          } : undefined,
        } : m
      ));
    } finally {
      setIsExecuting(false);
    }
  }, [account, address, privacyKey, prove, refreshBalances]);

  const handleDismissAction = useCallback((confirmMsgId: string) => {
    setMessages(prev => prev.filter(m => m.id !== confirmMsgId));
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: 'Got it, action cancelled. What else would you like to do?',
      timestamp: Date.now(),
    }]);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const msgText = text || input.trim();
    if (!msgText || isLoading || isExecuting) return;
    setInput('');
    setError(null);

    const userMsg: UIMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: msgText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const historyForApi: ChatMessage[] = [...messages.slice(-10), userMsg]
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const reply = await sendChatMessage(historyForApi, buildWalletContext());
      const actions = parseActions(reply);
      const displayText = stripActionBlocks(reply);

      if (displayText) {
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: displayText,
          timestamp: Date.now(),
        }]);
      }

      if (actions.length > 0) {
        const action = actions[0];
        setMessages(prev => [...prev, {
          id: crypto.randomUUID(),
          role: 'action-confirm',
          content: formatAction(action),
          timestamp: Date.now(),
          action,
        }]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isExecuting, messages, buildWalletContext]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sanitize = (html: string): string => {
    return html.replace(/<(?!\/?(?:strong|code|span)\b)[^>]*>/gi, '');
  };

  const renderTxCard = (txHash: string) => (
    <div style={{
      padding: '12px 16px',
      background: 'rgba(16,185,129,0.04)',
      border: '1px solid rgba(16,185,129,0.15)',
      clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
      marginTop: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <CheckCircle2 size={13} strokeWidth={2} color="#10b981" />
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 9,
          fontWeight: 700,
          color: '#10b981',
          letterSpacing: 1,
        }}>
          TRANSACTION CONFIRMED
        </span>
        <span className="badge-shield" style={{ fontSize: 7, padding: '1px 5px', marginLeft: 'auto' }}>
          <Zap size={7} strokeWidth={2} />
          GASLESS
        </span>
      </div>
      <div style={{
        fontFamily: "'Fira Code', monospace",
        fontSize: 10,
        color: 'rgba(255,255,255,0.55)',
        background: 'rgba(255,255,255,0.02)',
        padding: '6px 10px',
        clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        letterSpacing: 0.5,
      }}>
        {txHash.slice(0, 10)}...{txHash.slice(-8)}
      </div>
      <div style={{
        fontFamily: "'Fira Code', monospace",
        fontSize: 8,
        color: 'rgba(255,255,255,0.2)',
        marginTop: 4,
        letterSpacing: 1,
      }}>
        STARKNET SEPOLIA
      </div>
    </div>
  );

  const renderContent = (content: string) => {
    if (content.startsWith('TX_HASH:')) {
      return [renderTxCard(content.slice(8))];
    }

    return content.split('\n').map((line, i) => {
      let escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      let processed = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/`(.*?)`/g, '<code style="background:rgba(59,130,246,0.1);padding:1px 5px;clip-path:polygon(2px 0,100% 0,100% calc(100% - 2px),calc(100% - 2px) 100%,0 100%,0 2px);font-size:11px;font-family:Fira Code,monospace;letter-spacing:0.3px">$1</code>');
      if (processed.startsWith('- ') || processed.startsWith('* ')) {
        processed = '<span style="color:rgba(59,130,246,0.5);margin-right:6px">&#9670;</span>' + processed.slice(2);
      }
      if (processed.match(/^\d+\.\s/)) {
        const num = processed.match(/^(\d+)\.\s/)?.[1];
        processed = `<span style="color:#3b82f6;font-weight:600;margin-right:4px;font-family:Orbitron,sans-serif;font-size:11px">${num}.</span>` + processed.replace(/^\d+\.\s/, '');
      }
      if (processed.startsWith('## ')) {
        return <div key={i} style={{ fontFamily: "'Orbitron', sans-serif", fontSize: 12, fontWeight: 700, color: '#3b82f6', marginTop: 8, marginBottom: 4, letterSpacing: 0.5 }}>{processed.slice(3)}</div>;
      }
      return <div key={i} dangerouslySetInnerHTML={{ __html: sanitize(processed) }} style={{ minHeight: line.trim() ? undefined : 6 }} />;
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 0,
    }}>
      <style>{chatStyles}</style>

      {/* Messages area */}
      <div className="zap-chat-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              background: 'rgba(59,130,246,0.06)',
              border: '1px solid rgba(59,130,246,0.15)',
              clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
            }}>
              <Shield size={24} strokeWidth={1.5} color="#3b82f6" />
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: '#fff',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}>
              Welcome to ZapScura
            </div>
            <p style={{
              fontSize: 13,
              fontFamily: "'Outfit', sans-serif",
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 24,
              lineHeight: 1.6,
              maxWidth: 400,
              margin: '0 auto 24px',
            }}>
              Your private DeFi agent. Stake BTC, earn yield, manage positions — all through natural language, with zero-knowledge privacy.
            </p>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
              justifyContent: 'center',
              maxWidth: 500,
              margin: '0 auto',
            }}>
              {SUGGESTED_PROMPTS.map((item, i) => (
                <button
                  key={i}
                  className="zap-suggestion-btn"
                  onClick={() => handleSend(item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          if (msg.role === 'action-confirm' && msg.action) {
            return (
              <div key={msg.id} className="zap-action-confirm">
                <div className="zap-msg-label" style={{ color: '#f59e0b' }}>
                  <AlertTriangle size={10} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  CONFIRM ACTION
                </div>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#f59e0b',
                  margin: '6px 0 12px',
                  letterSpacing: 0.5,
                }}>
                  {msg.content}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="zap-action-btn zap-btn-execute"
                    onClick={() => handleExecuteAction(msg.action!, msg.id)}
                    disabled={isExecuting}
                  >
                    Execute
                  </button>
                  <button
                    className="zap-action-btn zap-btn-cancel"
                    onClick={() => handleDismissAction(msg.id)}
                    disabled={isExecuting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          if (msg.role === 'status') {
            const showProofProgress = isProving && proofProgress && msg.action && PROOF_ACTIONS.has(msg.action.action);
            return (
              <div key={msg.id} className="zap-msg zap-msg-status">
                <div className="zap-msg-label" style={{ color: '#3b82f6' }}>
                  {showProofProgress ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Lock size={9} strokeWidth={2} />
                      ZK PROOF GENERATION
                    </span>
                  ) : 'EXECUTING'}
                </div>
                <div className="zap-msg-content" style={{ color: '#3b82f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: showProofProgress ? 12 : 0 }}>
                    <span className="zap-spinner" />
                    {msg.content}
                  </div>
                  {showProofProgress && proofProgress && (
                    <div className="zap-proof-progress-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{
                          fontFamily: "'Fira Code', monospace",
                          fontSize: 9,
                          color: 'rgba(59,130,246,0.7)',
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                        }}>
                          {proofProgress.stage}
                        </span>
                        <span style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#3b82f6',
                        }}>
                          {proofProgress.percent ?? 0}%
                        </span>
                      </div>
                      <div className="zap-proof-bar">
                        <div className="zap-proof-bar-fill" style={{ width: `${proofProgress.percent ?? 0}%` }} />
                      </div>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 8,
                      }}>
                        <span style={{
                          fontFamily: "'Fira Code', monospace",
                          fontSize: 9,
                          color: 'rgba(255,255,255,0.3)',
                        }}>
                          {proofProgress.message}
                        </span>
                        <span style={{
                          fontFamily: "'Fira Code', monospace",
                          fontSize: 8,
                          color: 'rgba(255,255,255,0.2)',
                          letterSpacing: 0.5,
                        }}>
                          Noir + Barretenberg
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (msg.role === 'action-result') {
            const ok = msg.actionResult?.success;
            const pm = msg.proofMeta;
            return (
              <div key={msg.id} className={`zap-msg ${ok ? 'zap-result-ok' : 'zap-result-fail'}`}>
                <div className="zap-msg-label" style={{ color: ok ? '#10b981' : '#ef4444' }}>
                  {ok ? 'SUCCESS' : 'FAILED'}
                </div>
                <div className="zap-msg-content">{renderContent(msg.content)}</div>
                {pm && (
                  <div className={`zap-proof-verified-card ${pm.status === 'verified' ? 'zap-proof-ok' : 'zap-proof-fail'}`}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      {pm.status === 'verified' ? (
                        <CheckCircle2 size={12} strokeWidth={2} color="#10b981" />
                      ) : (
                        <AlertTriangle size={12} strokeWidth={2} color="#ef4444" />
                      )}
                      <span style={{
                        fontFamily: "'Orbitron', sans-serif",
                        fontSize: 9,
                        fontWeight: 700,
                        color: pm.status === 'verified' ? '#10b981' : '#ef4444',
                        letterSpacing: 1,
                      }}>
                        {pm.status === 'verified' ? 'ZK PROOF VERIFIED ON-CHAIN' : 'PROOF GENERATION FAILED'}
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: 8,
                    }}>
                      <div className="zap-proof-stat">
                        <div className="zap-proof-stat-label">CIRCUIT</div>
                        <div className="zap-proof-stat-value">
                          {CIRCUIT_LABELS[pm.circuit] ?? pm.circuit.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="zap-proof-stat">
                        <div className="zap-proof-stat-label">TIME</div>
                        <div className="zap-proof-stat-value">
                          {(pm.timeMs / 1000).toFixed(1)}s
                        </div>
                      </div>
                      <div className="zap-proof-stat">
                        <div className="zap-proof-stat-label">VERIFIER</div>
                        <div className="zap-proof-stat-value">Garaga</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={msg.id} className={`zap-msg zap-msg-${msg.role}`}>
              <div className="zap-msg-label">
                {msg.role === 'user' ? 'YOU' : 'ZAPSCURA AI'}
              </div>
              <div className="zap-msg-content">
                {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="zap-msg zap-msg-assistant">
            <div className="zap-msg-label">ZAPSCURA AI</div>
            <div className="zap-msg-content" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="zap-dot" />
              <span className="zap-dot" style={{ animationDelay: '0.2s' }} />
              <span className="zap-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '10px 14px',
            fontSize: 11,
            fontFamily: "'Fira Code', monospace",
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.15)',
            clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
            color: '#ef4444',
            margin: '0 0 12px',
            letterSpacing: 0.5,
          }}>
            {error}
          </div>
        )}

        {/* Inline Proof History */}
        {recentProofs.length > 0 && messages.length > 0 && (
          <div className="zap-proof-history-inline">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
            }}>
              <Clock size={10} strokeWidth={1.5} color="rgba(59,130,246,0.5)" />
              <span style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 9,
                fontWeight: 700,
                color: 'rgba(59,130,246,0.5)',
                letterSpacing: 1,
              }}>
                RECENT PROOFS
              </span>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 8,
                color: 'rgba(255,255,255,0.2)',
                marginLeft: 'auto',
              }}>
                {recentProofs.length} proof{recentProofs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentProofs.map((proof: ProofRecord) => (
                <div key={proof.id} className="zap-proof-history-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 6,
                      height: 6,
                      clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                      background: proof.status === 'verified' ? '#10b981' : proof.status === 'pending' ? '#f59e0b' : '#ef4444',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.5)',
                    }}>
                      {CIRCUIT_LABELS[proof.circuit] ?? proof.circuit.replace(/_/g, ' ')}
                    </span>
                    <span className={proof.status === 'verified' ? 'badge-green' : 'badge-amber'}
                      style={{ fontSize: 7, padding: '1px 5px' }}>
                      {proof.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {proof.txHash && (
                      <span style={{
                        fontFamily: "'Fira Code', monospace",
                        fontSize: 8,
                        color: 'rgba(59,130,246,0.4)',
                      }}>
                        {proof.txHash.slice(0, 6)}...{proof.txHash.slice(-4)}
                      </span>
                    )}
                    <span style={{
                      fontFamily: "'Fira Code', monospace",
                      fontSize: 8,
                      color: 'rgba(255,255,255,0.2)',
                    }}>
                      {new Date(proof.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="zap-chat-input-area">
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            className="zap-chat-input"
            placeholder={address
              ? 'Tell me what you want to do... "Stake 1 BTC privately"'
              : 'Sign in to start using ZapScura AI...'
            }
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isExecuting}
          />
        </div>
        <button
          className="zap-send-btn"
          onClick={() => handleSend()}
          disabled={isLoading || isExecuting || !input.trim()}
        >
          <Send size={16} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

const chatStyles = `
  @keyframes zap-bounce {
    0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  .zap-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    scrollbar-width: thin;
    scrollbar-color: rgba(59,130,246,0.1) transparent;
  }
  .zap-chat-messages::-webkit-scrollbar { width: 4px; }
  .zap-chat-messages::-webkit-scrollbar-thumb {
    background: rgba(59,130,246,0.15);
    border-radius: 2px;
  }

  .zap-suggestion-btn {
    padding: 8px 14px;
    font-size: 11px;
    font-family: 'Orbitron', sans-serif;
    font-weight: 500;
    letter-spacing: 0.3px;
    background: rgba(59,130,246,0.04);
    border: 1px solid rgba(59,130,246,0.1);
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    transition: all 0.2s;
  }
  .zap-suggestion-btn:hover {
    background: rgba(59,130,246,0.1);
    border-color: rgba(59,130,246,0.25);
    color: #3b82f6;
    transform: translateY(-1px);
  }

  .zap-msg { margin-bottom: 16px; }
  .zap-msg-label {
    font-family: 'Orbitron', sans-serif;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 1.5px;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .zap-msg-user .zap-msg-label { color: rgba(255,255,255,0.25); }
  .zap-msg-assistant .zap-msg-label { color: rgba(59,130,246,0.5); }

  .zap-msg-content {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    line-height: 1.7;
    padding: 14px 18px;
  }
  .zap-msg-user .zap-msg-content {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }
  .zap-msg-assistant .zap-msg-content {
    background: rgba(59,130,246,0.03);
    border: 1px solid rgba(59,130,246,0.08);
    color: rgba(255,255,255,0.7);
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }

  .zap-dot {
    width: 6px;
    height: 6px;
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
    background: #3b82f6;
    animation: zap-bounce 1.4s ease-in-out infinite;
  }

  @keyframes zap-spin { to { transform: rotate(360deg); } }
  .zap-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(59,130,246,0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: zap-spin 0.8s linear infinite;
    flex-shrink: 0;
  }

  .zap-action-confirm {
    margin-bottom: 16px;
    padding: 16px 18px;
    background: rgba(245,158,11,0.03);
    border: 1px solid rgba(245,158,11,0.12);
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  }
  .zap-action-btn {
    padding: 8px 18px;
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid;
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  }
  .zap-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .zap-btn-execute {
    background: rgba(16,185,129,0.1);
    border-color: rgba(16,185,129,0.2);
    color: #10b981;
  }
  .zap-btn-execute:hover:not(:disabled) {
    background: rgba(16,185,129,0.18);
    border-color: rgba(16,185,129,0.35);
  }
  .zap-btn-cancel {
    background: rgba(239,68,68,0.06);
    border-color: rgba(239,68,68,0.12);
    color: #f87171;
  }
  .zap-btn-cancel:hover:not(:disabled) {
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.25);
  }

  .zap-result-ok .zap-msg-content {
    background: rgba(16,185,129,0.03) !important;
    border-color: rgba(16,185,129,0.1) !important;
  }
  .zap-result-fail .zap-msg-content {
    background: rgba(239,68,68,0.03) !important;
    border-color: rgba(239,68,68,0.1) !important;
  }

  .zap-chat-input-area {
    display: flex;
    gap: 10px;
    padding: 16px 20px;
    border-top: 1px solid rgba(59,130,246,0.06);
    background: rgba(4,6,11,0.8);
    backdrop-filter: blur(12px);
  }

  .zap-chat-input {
    width: 100%;
    background: rgba(255,255,255,0.02);
    border: 1px solid rgba(59,130,246,0.08);
    clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
    padding: 14px 18px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    color: #fff;
    outline: none;
    transition: all 0.2s;
  }
  .zap-chat-input:focus {
    border-color: rgba(59,130,246,0.25);
    box-shadow: 0 0 20px rgba(59,130,246,0.05);
  }
  .zap-chat-input::placeholder {
    color: rgba(255,255,255,0.18);
    font-family: 'Outfit', sans-serif;
  }

  .zap-send-btn {
    width: 48px;
    height: 48px;
    background: rgba(59,130,246,0.1);
    border: 1px solid rgba(59,130,246,0.2);
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
    color: #3b82f6;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .zap-send-btn:hover:not(:disabled) {
    background: rgba(59,130,246,0.18);
    border-color: rgba(59,130,246,0.35);
    box-shadow: 0 0 15px rgba(59,130,246,0.15);
  }
  .zap-send-btn:disabled {
    opacity: 0.25;
    cursor: not-allowed;
  }

  /* Proof progress bar */
  .zap-proof-progress-card {
    margin-top: 4px;
    padding: 12px 14px;
    background: rgba(59,130,246,0.04);
    border: 1px solid rgba(59,130,246,0.1);
    clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  }

  .zap-proof-bar {
    width: 100%;
    height: 4px;
    background: rgba(59,130,246,0.1);
    overflow: hidden;
    clip-path: polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px);
  }
  .zap-proof-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    transition: width 0.5s ease;
  }

  /* Proof verified card */
  .zap-proof-verified-card {
    margin-top: 8px;
    padding: 12px 16px;
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  }
  .zap-proof-ok {
    background: rgba(16,185,129,0.04);
    border: 1px solid rgba(16,185,129,0.12);
  }
  .zap-proof-fail {
    background: rgba(239,68,68,0.04);
    border: 1px solid rgba(239,68,68,0.12);
  }
  .zap-proof-stat {
    padding: 6px 8px;
    background: rgba(255,255,255,0.02);
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
  }
  .zap-proof-stat-label {
    font-family: 'Fira Code', monospace;
    font-size: 7px;
    color: rgba(255,255,255,0.25);
    letter-spacing: 1px;
    margin-bottom: 3px;
    text-transform: uppercase;
  }
  .zap-proof-stat-value {
    font-family: 'Orbitron', sans-serif;
    font-size: 10px;
    font-weight: 600;
    color: rgba(255,255,255,0.6);
    letter-spacing: 0.3px;
  }

  /* Inline proof history */
  .zap-proof-history-inline {
    margin: 8px 0 16px;
    padding: 14px 16px;
    background: rgba(59,130,246,0.02);
    border: 1px solid rgba(59,130,246,0.06);
    clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
  }
  .zap-proof-history-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: rgba(255,255,255,0.015);
    clip-path: polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px);
  }

  @media (max-width: 768px) {
    .zap-chat-messages { padding: 12px; }
    .zap-chat-input-area { padding: 12px; }
  }
`;
