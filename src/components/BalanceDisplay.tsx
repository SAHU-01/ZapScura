/**
 * Shielded balance display card for ZapScura dashboard.
 */

import { Shield } from 'lucide-react';
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

  const yieldEstimate = Number(shieldedBal) / 1e18 * 0.052;

  const scoreColor = privacyScore >= 80 ? '#10b981' : privacyScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Privacy gradient overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: '#3b82f6',
        opacity: privacyScore > 50 ? 1 : 0.3,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 6,
          }}>
            <Shield size={11} strokeWidth={1.5} color="rgba(255,255,255,0.35)" />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Shielded Portfolio
            </span>
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 24,
            fontWeight: 800,
            color: '#fff',
          }}>
            {fmt(shieldedBal)} <span style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
              fontWeight: 500,
            }}>sxyBTC</span>
          </div>
        </div>
        <div style={{
          padding: '8px 14px',
          background: `${scoreColor}10`,
          border: `1px solid ${scoreColor}25`,
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          textAlign: 'center' as const,
        }}>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: scoreColor,
          }}>
            {privacyScore}%
          </div>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 7,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
          }}>
            Privacy
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{
          padding: '10px 10px',
          background: 'rgba(255,255,255,0.015)',
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            Public Balance
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.65)',
          }}>
            {fmt(pubBal)}
          </div>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: 0.5,
          }}>xyBTC</div>
        </div>
        <div style={{
          padding: '10px 10px',
          background: 'rgba(255,255,255,0.015)',
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            Est. Yield (APR)
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: '#10b981',
          }}>
            {yieldEstimate.toFixed(4)}
          </div>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: 0.5,
          }}>BTC</div>
        </div>
        <div style={{
          padding: '10px 10px',
          background: 'rgba(255,255,255,0.015)',
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 8,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
            marginBottom: 4,
            textTransform: 'uppercase',
          }}>
            CDP Status
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 12,
            fontWeight: 600,
            color: balances.hasCDP ? '#3b82f6' : 'rgba(255,255,255,0.25)',
          }}>
            {balances.hasCDP ? `${Number(cdpCol) / 1e8} / ${Number(cdpDebt) / 1e8}` : 'None'}
          </div>
        </div>
      </div>
    </div>
  );
}
