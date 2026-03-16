/**
 * ZapScura Gamification System
 *
 * XP, levels, achievements, quests, and streaks — all persisted in localStorage.
 * Designed to make privacy-preserving DeFi feel like a game.
 */

import {
  Zap, Shield, Lock, Trophy, Landmark, Eye, Ghost, Star, Flame, Gem,
  Settings, Droplets, Target, Castle, Swords, EyeOff, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

const STORAGE_PREFIX = 'zapscura_';

/* ─── Icon Registry ─── */

export const ICON_MAP: Record<string, LucideIcon> = {
  zap: Zap,
  shield: Shield,
  lock: Lock,
  trophy: Trophy,
  landmark: Landmark,
  eye: Eye,
  ghost: Ghost,
  star: Star,
  flame: Flame,
  gem: Gem,
  settings: Settings,
  droplets: Droplets,
  target: Target,
  castle: Castle,
  swords: Swords,
  'eye-off': EyeOff,
  'shield-check': ShieldCheck,
};

/* ─── Level Definitions ─── */

export interface Level {
  rank: number;
  title: string;
  xpRequired: number;
  color: string;
  glowColor: string;
}

export const LEVELS: Level[] = [
  { rank: 1, title: 'Shadow Initiate',    xpRequired: 0,    color: '#6b7280', glowColor: 'rgba(107,114,128,0.3)' },
  { rank: 2, title: 'Cipher Apprentice',  xpRequired: 100,  color: '#3b82f6', glowColor: 'rgba(59,130,246,0.3)' },
  { rank: 3, title: 'Proof Runner',       xpRequired: 300,  color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.3)' },
  { rank: 4, title: 'Shield Bearer',      xpRequired: 600,  color: '#06b6d4', glowColor: 'rgba(6,182,212,0.3)' },
  { rank: 5, title: 'Vault Guardian',     xpRequired: 1000, color: '#10b981', glowColor: 'rgba(16,185,129,0.3)' },
  { rank: 6, title: 'Privacy Phantom',    xpRequired: 1500, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.3)' },
  { rank: 7, title: 'ZK Master',          xpRequired: 2100, color: '#ef4444', glowColor: 'rgba(239,68,68,0.3)' },
  { rank: 8, title: 'Shadow Sovereign',   xpRequired: 2800, color: '#00e5ff', glowColor: 'rgba(0,229,255,0.4)' },
];

/* ─── XP Rewards per Action ─── */

export const ACTION_XP: Record<string, number> = {
  faucet: 10,
  deposit: 25,
  shield: 50,
  unshield: 30,
  withdraw: 15,
  open_cdp: 40,
  lock_collateral: 50,
  mint_susd: 40,
  repay: 30,
  close_cdp: 25,
  submit_solvency: 60,
  check_balances: 5,
  check_solvency: 10,
};

/* ─── Achievement Definitions ─── */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;       // key into ICON_MAP
  xpBonus: number;
  condition: (stats: PlayerStats) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_action',
    title: 'First Steps',
    description: 'Complete your first action',
    icon: 'zap',
    xpBonus: 20,
    condition: (s) => s.totalActions >= 1,
  },
  {
    id: 'shield_up',
    title: 'Shield Up',
    description: 'Shield your balance for the first time',
    icon: 'shield',
    xpBonus: 30,
    condition: (s) => s.actionCounts.shield >= 1,
  },
  {
    id: 'proof_gen_5',
    title: 'Proof Generator',
    description: 'Generate 5 ZK proofs',
    icon: 'lock',
    xpBonus: 50,
    condition: (s) => s.proofsGenerated >= 5,
  },
  {
    id: 'proof_gen_20',
    title: 'ZK Veteran',
    description: 'Generate 20 ZK proofs',
    icon: 'trophy',
    xpBonus: 100,
    condition: (s) => s.proofsGenerated >= 20,
  },
  {
    id: 'cdp_operator',
    title: 'CDP Operator',
    description: 'Open your first CDP position',
    icon: 'landmark',
    xpBonus: 40,
    condition: (s) => s.actionCounts.open_cdp >= 1,
  },
  {
    id: 'privacy_80',
    title: 'Privacy Pro',
    description: 'Reach 80%+ privacy score',
    icon: 'eye-off',
    xpBonus: 75,
    condition: (s) => s.maxPrivacyScore >= 80,
  },
  {
    id: 'privacy_100',
    title: 'Full Stealth',
    description: 'Reach 100% privacy score',
    icon: 'ghost',
    xpBonus: 150,
    condition: (s) => s.maxPrivacyScore >= 100,
  },
  {
    id: 'level_5',
    title: 'Guardian Status',
    description: 'Reach Level 5: Vault Guardian',
    icon: 'star',
    xpBonus: 100,
    condition: (s) => getLevelForXP(s.totalXP).rank >= 5,
  },
  {
    id: 'streak_3',
    title: 'On a Roll',
    description: 'Maintain a 3-day streak',
    icon: 'flame',
    xpBonus: 50,
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Dedicated Agent',
    description: 'Maintain a 7-day streak',
    icon: 'gem',
    xpBonus: 100,
    condition: (s) => s.currentStreak >= 7,
  },
  {
    id: 'multi_action',
    title: 'Power User',
    description: 'Complete 25 total actions',
    icon: 'settings',
    xpBonus: 75,
    condition: (s) => s.totalActions >= 25,
  },
  {
    id: 'faucet_master',
    title: 'Faucet Farmer',
    description: 'Use the faucet 5 times',
    icon: 'droplets',
    xpBonus: 20,
    condition: (s) => s.actionCounts.faucet >= 5,
  },
];

/* ─── Quest Definitions ─── */

export interface Quest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  action: string;        // the AI prompt to trigger
  requiredAction?: string; // the executor action that completes it
  icon: string;
  difficulty: 'starter' | 'intermediate' | 'advanced';
}

export const QUESTS: Quest[] = [
  {
    id: 'quest_faucet',
    title: 'Gear Up',
    description: 'Get test tokens from the faucet',
    xpReward: 15,
    action: 'Get me some test BTC tokens from the faucet',
    requiredAction: 'faucet',
    icon: 'target',
    difficulty: 'starter',
  },
  {
    id: 'quest_deposit',
    title: 'Into the Vault',
    description: 'Deposit tokens into the shielded vault',
    xpReward: 30,
    action: 'Deposit 50 xyBTC into the vault',
    requiredAction: 'deposit',
    icon: 'castle',
    difficulty: 'starter',
  },
  {
    id: 'quest_shield',
    title: 'Go Dark',
    description: 'Shield your balance with a ZK proof',
    xpReward: 60,
    action: 'Shield 25 xyBTC to make it private',
    requiredAction: 'shield',
    icon: 'shield',
    difficulty: 'intermediate',
  },
  {
    id: 'quest_cdp',
    title: 'Leverage Up',
    description: 'Open a CDP and mint stablecoins',
    xpReward: 80,
    action: 'I want to open a CDP and mint sUSD against my collateral',
    requiredAction: 'open_cdp',
    icon: 'landmark',
    difficulty: 'intermediate',
  },
  {
    id: 'quest_privacy',
    title: 'Shadow Protocol',
    description: 'Reach 80%+ privacy score',
    xpReward: 100,
    action: 'Analyze my privacy score and what\'s visible on-chain',
    requiredAction: 'shield',
    icon: 'ghost',
    difficulty: 'advanced',
  },
  {
    id: 'quest_solvency',
    title: 'Trust Verifier',
    description: 'Submit a solvency proof to the chain',
    xpReward: 75,
    action: 'Submit solvency proofs to verify the protocol',
    requiredAction: 'submit_solvency',
    icon: 'shield-check',
    difficulty: 'advanced',
  },
];

/* ─── Player Stats ─── */

export interface PlayerStats {
  totalXP: number;
  totalActions: number;
  proofsGenerated: number;
  maxPrivacyScore: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;   // YYYY-MM-DD
  unlockedAchievements: string[];
  completedQuests: string[];
  actionCounts: Record<string, number>;
  xpHistory: { date: string; xp: number }[];
}

function getKey(address: string): string {
  return `${STORAGE_PREFIX}${address.slice(0, 10)}_gamification`;
}

function defaultStats(): PlayerStats {
  return {
    totalXP: 0,
    totalActions: 0,
    proofsGenerated: 0,
    maxPrivacyScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    unlockedAchievements: [],
    completedQuests: [],
    actionCounts: {},
    xpHistory: [],
  };
}

import { syncStatsToCloud, loadStatsFromCloud } from './supabase';

export function loadPlayerStats(address: string): PlayerStats {
  const raw = localStorage.getItem(getKey(address));
  if (!raw) return defaultStats();
  try {
    return JSON.parse(raw);
  } catch {
    return defaultStats();
  }
}

/**
 * Try to restore stats from Supabase if localStorage is empty (new device).
 * Should be called once after wallet connect.
 */
export async function restoreStatsFromCloud(address: string): Promise<PlayerStats> {
  const local = loadPlayerStats(address);
  // If local has data, use it (it's the source of truth)
  if (local.totalXP > 0) return local;

  // Otherwise try to pull from cloud
  const cloud = await loadStatsFromCloud(address);
  if (cloud && cloud.totalXP > 0) {
    savePlayerStats(address, cloud);
    return cloud;
  }
  return local;
}

export function savePlayerStats(address: string, stats: PlayerStats): void {
  localStorage.setItem(getKey(address), JSON.stringify(stats));
  // Fire-and-forget sync to Supabase
  syncStatsToCloud(address, stats).catch(() => {});
}

/* ─── Level Helpers ─── */

export function getLevelForXP(xp: number): Level {
  let result = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.xpRequired) result = level;
    else break;
  }
  return result;
}

export function getXPProgress(xp: number): { current: number; needed: number; percent: number } {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = LEVELS.find(l => l.rank === currentLevel.rank + 1);
  if (!nextLevel) return { current: 0, needed: 0, percent: 100 }; // max level

  const xpIntoLevel = xp - currentLevel.xpRequired;
  const xpForNextLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  return {
    current: xpIntoLevel,
    needed: xpForNextLevel,
    percent: Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)),
  };
}

/* ─── Streak Logic ─── */

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function updateStreak(stats: PlayerStats): void {
  const today = getToday();
  if (stats.lastActiveDate === today) return; // already counted today

  if (stats.lastActiveDate === getYesterday()) {
    stats.currentStreak += 1;
  } else if (stats.lastActiveDate !== today) {
    stats.currentStreak = 1;
  }

  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  stats.lastActiveDate = today;
}

/* ─── Core: Record Action & Calculate XP ─── */

export interface XPGainResult {
  xpGained: number;
  newAchievements: Achievement[];
  levelUp: Level | null;   // set if player leveled up
  questCompleted: Quest | null;
}

export function recordAction(
  address: string,
  actionName: string,
  privacyScore: number,
): XPGainResult {
  const stats = loadPlayerStats(address);
  const previousLevel = getLevelForXP(stats.totalXP);

  // Base XP
  const baseXP = ACTION_XP[actionName] || 5;
  let totalXPGained = baseXP;

  // Update action counts
  stats.actionCounts[actionName] = (stats.actionCounts[actionName] || 0) + 1;
  stats.totalActions += 1;

  // Count proofs for ZK-proof actions
  const proofActions = ['shield', 'unshield', 'lock_collateral', 'mint_susd', 'repay', 'close_cdp', 'submit_solvency'];
  if (proofActions.includes(actionName)) {
    stats.proofsGenerated += 1;
  }

  // Update privacy score
  stats.maxPrivacyScore = Math.max(stats.maxPrivacyScore, privacyScore);

  // Update streak
  updateStreak(stats);

  // Streak bonus: +10% per streak day (max 50%)
  const streakMultiplier = 1 + Math.min(stats.currentStreak * 0.1, 0.5);
  totalXPGained = Math.round(baseXP * streakMultiplier);

  stats.totalXP += totalXPGained;

  // Track XP history
  const today = getToday();
  const todayEntry = stats.xpHistory.find(e => e.date === today);
  if (todayEntry) {
    todayEntry.xp += totalXPGained;
  } else {
    stats.xpHistory.push({ date: today, xp: totalXPGained });
    if (stats.xpHistory.length > 30) stats.xpHistory.shift();
  }

  // Check for new achievements
  const newAchievements: Achievement[] = [];
  for (const achievement of ACHIEVEMENTS) {
    if (!stats.unlockedAchievements.includes(achievement.id) && achievement.condition(stats)) {
      stats.unlockedAchievements.push(achievement.id);
      stats.totalXP += achievement.xpBonus;
      totalXPGained += achievement.xpBonus;
      newAchievements.push(achievement);
    }
  }

  // Check quest completion
  let questCompleted: Quest | null = null;
  for (const quest of QUESTS) {
    if (!stats.completedQuests.includes(quest.id) && quest.requiredAction === actionName) {
      stats.completedQuests.push(quest.id);
      stats.totalXP += quest.xpReward;
      totalXPGained += quest.xpReward;
      questCompleted = quest;
      break;
    }
  }

  // Check level up
  const newLevel = getLevelForXP(stats.totalXP);
  const levelUp = newLevel.rank > previousLevel.rank ? newLevel : null;

  savePlayerStats(address, stats);

  return { xpGained: totalXPGained, newAchievements, levelUp, questCompleted };
}

/* ─── Get available (incomplete) quests ─── */

export function getAvailableQuests(address: string): Quest[] {
  const stats = loadPlayerStats(address);
  return QUESTS.filter(q => !stats.completedQuests.includes(q.id));
}

/* ─── Get unlocked achievements ─── */

export function getUnlockedAchievements(address: string): Achievement[] {
  const stats = loadPlayerStats(address);
  return ACHIEVEMENTS.filter(a => stats.unlockedAchievements.includes(a.id));
}

/* ─── Get locked achievements ─── */

export function getLockedAchievements(address: string): Achievement[] {
  const stats = loadPlayerStats(address);
  return ACHIEVEMENTS.filter(a => !stats.unlockedAchievements.includes(a.id));
}
