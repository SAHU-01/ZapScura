/**
 * Supabase client for ZapScura.
 *
 * Handles persistent XP/gamification storage so stats survive across devices.
 * Falls back gracefully to localStorage if Supabase is unavailable.
 *
 * Setup:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
 * 3. Run the SQL migration below in the Supabase SQL editor
 *
 * SQL Migration:
 * ```sql
 * create table if not exists player_stats (
 *   wallet_address text primary key,
 *   total_xp integer default 0,
 *   total_actions integer default 0,
 *   proofs_generated integer default 0,
 *   max_privacy_score integer default 0,
 *   current_streak integer default 0,
 *   longest_streak integer default 0,
 *   last_active_date text default '',
 *   unlocked_achievements text[] default '{}',
 *   completed_quests text[] default '{}',
 *   action_counts jsonb default '{}',
 *   xp_history jsonb default '[]',
 *   updated_at timestamp with time zone default now()
 * );
 *
 * -- Enable Row Level Security
 * alter table player_stats enable row level security;
 *
 * -- Allow anyone to read (leaderboard)
 * create policy "Public read" on player_stats
 *   for select using (true);
 *
 * -- Allow anyone to upsert their own row (identified by wallet)
 * create policy "Users can upsert own stats" on player_stats
 *   for all using (true) with check (true);
 *
 * -- Index for leaderboard queries
 * create index if not exists idx_player_stats_xp on player_stats (total_xp desc);
 * ```
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { PlayerStats } from './gamification';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export function isSupabaseEnabled(): boolean {
  return supabase !== null;
}

/** Convert PlayerStats to DB row format */
function statsToRow(address: string, stats: PlayerStats) {
  return {
    wallet_address: address.toLowerCase(),
    total_xp: stats.totalXP,
    total_actions: stats.totalActions,
    proofs_generated: stats.proofsGenerated,
    max_privacy_score: stats.maxPrivacyScore,
    current_streak: stats.currentStreak,
    longest_streak: stats.longestStreak,
    last_active_date: stats.lastActiveDate,
    unlocked_achievements: stats.unlockedAchievements,
    completed_quests: stats.completedQuests,
    action_counts: stats.actionCounts,
    xp_history: stats.xpHistory,
    updated_at: new Date().toISOString(),
  };
}

/** Convert DB row to PlayerStats */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStats(row: any): PlayerStats {
  return {
    totalXP: row.total_xp ?? 0,
    totalActions: row.total_actions ?? 0,
    proofsGenerated: row.proofs_generated ?? 0,
    maxPrivacyScore: row.max_privacy_score ?? 0,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    lastActiveDate: row.last_active_date ?? '',
    unlockedAchievements: row.unlocked_achievements ?? [],
    completedQuests: row.completed_quests ?? [],
    actionCounts: row.action_counts ?? {},
    xpHistory: row.xp_history ?? [],
  };
}

/**
 * Sync player stats to Supabase (fire-and-forget).
 * Called after every local save so the backend stays in sync.
 */
export async function syncStatsToCloud(address: string, stats: PlayerStats): Promise<void> {
  if (!supabase) return;

  try {
    const { error } = await supabase
      .from('player_stats')
      .upsert(statsToRow(address, stats), { onConflict: 'wallet_address' });

    if (error) {
      console.warn('[ZapScura] Supabase sync failed:', error.message);
    }
  } catch {
    // Silently fail — localStorage is the source of truth
  }
}

/**
 * Load player stats from Supabase.
 * Used on login to restore stats if localStorage is empty (new device).
 */
export async function loadStatsFromCloud(address: string): Promise<PlayerStats | null> {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('*')
      .eq('wallet_address', address.toLowerCase())
      .single();

    if (error || !data) return null;
    return rowToStats(data);
  } catch {
    return null;
  }
}

/**
 * Leaderboard: top players by XP.
 */
export interface LeaderboardEntry {
  walletAddress: string;
  totalXP: number;
  level: number;
  totalActions: number;
  proofsGenerated: number;
  currentStreak: number;
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('player_stats')
      .select('wallet_address, total_xp, total_actions, proofs_generated, current_streak')
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    return data.map((row) => ({
      walletAddress: row.wallet_address,
      totalXP: row.total_xp,
      level: row.total_xp >= 2800 ? 8 : row.total_xp >= 2100 ? 7 : row.total_xp >= 1500 ? 6 :
             row.total_xp >= 1000 ? 5 : row.total_xp >= 600 ? 4 : row.total_xp >= 300 ? 3 :
             row.total_xp >= 100 ? 2 : 1,
      totalActions: row.total_actions,
      proofsGenerated: row.proofs_generated,
      currentStreak: row.current_streak,
    }));
  } catch {
    return [];
  }
}
