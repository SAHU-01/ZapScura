/**
 * XP gain / level-up / achievement notification overlay.
 * Shows animated notifications when XP is earned.
 */

import { useEffect, useState } from 'react';
import type { XPGainResult } from '../lib/gamification';
import GamificationIcon from './GamificationIcon';

interface XPNotificationProps {
  result: XPGainResult | null;
  onDone: () => void;
}

export default function XPNotification({ result, onDone }: XPNotificationProps) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');

  useEffect(() => {
    if (!result) return;
    setPhase('enter');
    const t1 = setTimeout(() => setPhase('show'), 50);
    const t2 = setTimeout(() => setPhase('exit'), 2500);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [result, onDone]);

  if (!result || result.xpGained === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9998,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {/* XP Gain */}
      <div className={`xp-notif xp-notif-${phase}`} style={{
        padding: '10px 24px',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        backdropFilter: 'blur(16px)',
        clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
        fontFamily: "'Orbitron', sans-serif",
        fontSize: 16,
        fontWeight: 800,
        color: '#3b82f6',
        letterSpacing: 1,
        textShadow: '0 0 20px rgba(59,130,246,0.5)',
      }}>
        +{result.xpGained} XP
      </div>

      {/* Level Up */}
      {result.levelUp && (
        <div className={`xp-notif xp-notif-${phase}`} style={{
          padding: '12px 28px',
          background: `linear-gradient(135deg, ${result.levelUp.color}22, ${result.levelUp.color}08)`,
          border: `1px solid ${result.levelUp.color}44`,
          backdropFilter: 'blur(16px)',
          clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)',
          textAlign: 'center',
          animationDelay: '0.15s',
        }}>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: result.levelUp.color,
            letterSpacing: 2,
            marginBottom: 4,
          }}>
            LEVEL UP!
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: result.levelUp.color,
            letterSpacing: 0.5,
            textShadow: `0 0 20px ${result.levelUp.glowColor}`,
          }}>
            {result.levelUp.title}
          </div>
        </div>
      )}

      {/* Achievements */}
      {result.newAchievements.map((a, i) => (
        <div key={a.id} className={`xp-notif xp-notif-${phase}`} style={{
          padding: '10px 20px',
          background: 'rgba(16,185,129,0.12)',
          border: '1px solid rgba(16,185,129,0.25)',
          backdropFilter: 'blur(16px)',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animationDelay: `${0.3 + i * 0.15}s`,
        }}>
          <GamificationIcon name={a.icon} size={20} color="#10b981" />
          <div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: '#10b981',
              letterSpacing: 0.5,
            }}>
              {a.title}
            </div>
            <div style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: 'rgba(255,255,255,0.4)',
            }}>
              +{a.xpBonus} XP bonus
            </div>
          </div>
        </div>
      ))}

      {/* Quest Completed */}
      {result.questCompleted && (
        <div className={`xp-notif xp-notif-${phase}`} style={{
          padding: '10px 20px',
          background: 'rgba(139,92,246,0.12)',
          border: '1px solid rgba(139,92,246,0.25)',
          backdropFilter: 'blur(16px)',
          clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animationDelay: '0.45s',
        }}>
          <GamificationIcon name={result.questCompleted.icon} size={20} color="#8b5cf6" />
          <div>
            <div style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: '#8b5cf6',
              letterSpacing: 1.5,
              marginBottom: 2,
            }}>
              QUEST COMPLETE
            </div>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 700,
              color: '#8b5cf6',
              letterSpacing: 0.5,
            }}>
              {result.questCompleted.title}
            </div>
            <div style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: 'rgba(255,255,255,0.4)',
            }}>
              +{result.questCompleted.xpReward} XP reward
            </div>
          </div>
        </div>
      )}

      <style>{`
        .xp-notif {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .xp-notif-enter {
          opacity: 0;
          transform: translateY(-20px) scale(0.9);
        }
        .xp-notif-show {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .xp-notif-exit {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
      `}</style>
    </div>
  );
}
