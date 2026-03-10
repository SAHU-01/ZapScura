/**
 * Shielded balance display card for ZapScura dashboard.
 */

import { useWallet } from '../hooks/useWallet';
import { useBalance } from '../hooks/useBalance';
import { getLocalShieldedBalance, getLocalCDPCollateral, getLocalCDPDebt } from '../lib/shieldedBalance';

export default function BalanceDisplay() {
  const { address } = useWallet();
  const { balances } = useBalance();

  if (!address) return null;

  const pubBal = balances.publicBalance ?? BigInt(0);
  const shieldedBal = getLocalShieldedBalance(address);
  const cdpCol = getLocalCDPCollateral(address);
  const cdpDebt = getLocalCDPDebt(address);
  const totalBal = pubBal + shieldedBal;
  const privacyScore = totalBal > BigInt(0)
    ? Number((shieldedBal * BigInt(100)) / totalBal)
    : 0;

  const fmt = (v: bigint, decimals = 18) => {
    const whole = Number(v) / 10 ** decimals;
    return whole.toFixed(4);
  };

  const yieldEstimate = Number(shieldedBal) / 1e18 * 0.052; // ~5.2% APR estimate

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Privacy gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        background: `linear-gradient(90deg, #0ea5e9, #d946ef)`,
        opacity: privacyScore > 50 ? 1 : 0.3,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Shielded Portfolio
          </div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#fff',
          }}>
            {fmt(shieldedBal)} <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>sxyBTC</span>
          </div>
        </div>
        <div style={{
          padding: '8px 14px',
          background: privacyScore >= 80 ? 'rgba(52,211,153,0.1)' : privacyScore >= 50 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${privacyScore >= 80 ? 'rgba(52,211,153,0.2)' : privacyScore >= 50 ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}`,
          borderRadius: 12,
          textAlign: 'center' as const,
        }}>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 20,
            fontWeight: 700,
            color: privacyScore >= 80 ? '#34d399' : privacyScore >= 50 ? '#fbbf24' : '#f87171',
          }}>
            {privacyScore}%
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
            Privacy
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>
            Public Balance
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
            {fmt(pubBal)} xyBTC
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>
            Est. Yield (APR)
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#34d399' }}>
            {yieldEstimate.toFixed(4)} BTC
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>
            CDP Status
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: balances.hasCDP ? '#0ea5e9' : 'rgba(255,255,255,0.3)' }}>
            {balances.hasCDP ? `${Number(cdpCol) / 1e8} / ${Number(cdpDebt) / 1e8}` : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
