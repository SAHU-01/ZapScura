/**
 * Player level/XP card for the gamified dashboard sidebar.
 */

import { useState } from 'react';
import { Flame, Trophy, Star, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import {
  loadPlayerStats,
  getLevelForXP,
  getXPProgress,
  getUnlockedAchievements,
  getLockedAchievements,
  LEVELS,
  type Achievement,
} from '../lib/gamification';
import GamificationIcon from './GamificationIcon';

export default function PlayerCard() {
  const { address } = useWallet();
  const [showAchievements, setShowAchievements] = useState(false);

  if (!address) return null;

  const stats = loadPlayerStats(address);
  const level = getLevelForXP(stats.totalXP);
  const progress = getXPProgress(stats.totalXP);
  const nextLevel = LEVELS.find(l => l.rank === level.rank + 1);
  const unlocked = getUnlockedAchievements(address);
  const locked = getLockedAchievements(address);

  return (
    <div className="card" style={{ padding: 16, position: 'relative', flexShrink: 0 }}>
      {/* Level color accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: `linear-gradient(90deg, ${level.color}, transparent)`,
        borderRadius: '14px 14px 0 0',
      }} />

      {/* Level & Rank */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}>
            <Star size={11} strokeWidth={1.5} color={level.color} />
            <span style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              Agent Profile
            </span>
          </div>
          <div style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: level.color,
            letterSpacing: 0.5,
          }}>
            {level.title}
          </div>
          <div style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 2,
          }}>
            LEVEL {level.rank}
          </div>
        </div>

        {/* Streak */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '6px 12px',
          background: stats.currentStreak > 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)',
          border: `1px solid ${stats.currentStreak > 0 ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)'}`,
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
        }}>
          <Flame size={14} strokeWidth={1.5} color={stats.currentStreak > 0 ? '#f59e0b' : 'rgba(255,255,255,0.2)'} />
          <span style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 14,
            fontWeight: 800,
            color: stats.currentStreak > 0 ? '#f59e0b' : 'rgba(255,255,255,0.2)',
          }}>
            {stats.currentStreak}
          </span>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 7,
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: 1,
          }}>
            STREAK
          </span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}>
          <span style={{
            fontFamily: "'Fira Code', monospace",
            fontSize: 10,
            fontWeight: 600,
            color: level.color,
          }}>
            {stats.totalXP} XP
          </span>
          {nextLevel && (
            <span style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 8,
              color: 'rgba(255,255,255,0.25)',
            }}>
              {progress.current}/{progress.needed} to Lv.{nextLevel.rank}
            </span>
          )}
        </div>
        <div style={{
          height: 6,
          background: 'rgba(255,255,255,0.04)',
          clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)',
          overflow: 'hidden',
        }}>
          <div
            className="xp-bar-fill"
            style={{
              height: '100%',
              width: `${progress.percent}%`,
              background: `linear-gradient(90deg, ${level.color}, ${nextLevel?.color || level.color})`,
              boxShadow: `0 0 8px ${level.glowColor}`,
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
        {[
          { label: 'Actions', value: stats.totalActions },
          { label: 'Proofs', value: stats.proofsGenerated },
          { label: 'Badges', value: `${unlocked.length}/${unlocked.length + locked.length}` },
        ].map((stat, i) => (
          <div key={i} style={{
            padding: '6px 8px',
            background: 'rgba(255,255,255,0.015)',
            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)',
            textAlign: 'center',
          }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: "'Fira Code', monospace",
              fontSize: 7,
              color: 'rgba(255,255,255,0.25)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Achievements Toggle */}
      <button
        onClick={() => setShowAchievements(!showAchievements)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.015)',
          border: '1px solid rgba(255,255,255,0.04)',
          clipPath: 'polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px)',
          color: 'rgba(255,255,255,0.45)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={10} strokeWidth={1.5} />
          Achievements
        </div>
        {showAchievements ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {showAchievements && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Unlocked achievements */}
          {unlocked.map((a: Achievement) => (
            <div key={a.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'rgba(16,185,129,0.04)',
              border: '1px solid rgba(16,185,129,0.1)',
              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)',
            }}>
              <GamificationIcon name={a.icon} size={14} color="#10b981" />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  color: '#10b981',
                  letterSpacing: 0.5,
                }}>
                  {a.title}
                </div>
                <div style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.3)',
                }}>
                  {a.description}
                </div>
              </div>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 8,
                color: '#10b981',
                fontWeight: 600,
              }}>
                +{a.xpBonus} XP
              </span>
            </div>
          ))}

          {/* Locked achievements */}
          {locked.map((a: Achievement) => (
            <div key={a.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid rgba(255,255,255,0.04)',
              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)',
              opacity: 0.5,
            }}>
              <Lock size={14} strokeWidth={1.5} color="rgba(255,255,255,0.25)" />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: 9,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: 0.5,
                }}>
                  {a.title}
                </div>
                <div style={{
                  fontFamily: "'Fira Code', monospace",
                  fontSize: 8,
                  color: 'rgba(255,255,255,0.2)',
                }}>
                  {a.description}
                </div>
              </div>
              <span style={{
                fontFamily: "'Fira Code', monospace",
                fontSize: 8,
                color: 'rgba(255,255,255,0.15)',
              }}>
                +{a.xpBonus} XP
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
