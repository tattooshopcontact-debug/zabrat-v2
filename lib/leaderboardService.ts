import { supabase } from './supabase';
import { getFriendIds } from './friendsService';

export interface LeaderboardRow {
  rank: number;
  user_id: string;
  display_name: string;
  initials: string;
  color: string;
  points: number;
  isMe: boolean;
}

const COLORS = ['#FF6B35', '#4CAF50', '#F5A623', '#E91E63', '#2196F3', '#9C27B0'];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export async function getLeaderboard(
  userId: string,
  period: 'week' | 'month' = 'week',
): Promise<LeaderboardRow[]> {
  const friendIds = await getFriendIds(userId);
  const allIds = [userId, ...friendIds];

  if (period === 'week') {
    const weekStart = getWeekStart();

    const { data } = await supabase
      .from('weekly_scores')
      .select('user_id, points, users!weekly_scores_user_id_fkey(display_name)')
      .eq('week_start', weekStart)
      .in('user_id', allIds)
      .order('points', { ascending: false });

    if (!data || data.length === 0) return [];

    return data.map((row: any, i) => ({
      rank: i + 1,
      user_id: row.user_id,
      display_name: row.users?.display_name ?? 'Inconnu',
      initials: (row.users?.display_name ?? 'IN').slice(0, 2).toUpperCase(),
      color: getColor(row.users?.display_name ?? ''),
      points: row.points,
      isMe: row.user_id === userId,
    }));
  }

  // Mois: agréger les weekly_scores du mois
  const monthStart = getMonthStart();

  const { data } = await supabase
    .from('weekly_scores')
    .select('user_id, points, users!weekly_scores_user_id_fkey(display_name)')
    .gte('week_start', monthStart)
    .in('user_id', allIds);

  if (!data || data.length === 0) return [];

  // Agréger par user
  const totals = new Map<string, { points: number; display_name: string }>();
  for (const row of data as any[]) {
    const existing = totals.get(row.user_id);
    const name = row.users?.display_name ?? 'Inconnu';
    if (existing) {
      existing.points += row.points;
    } else {
      totals.set(row.user_id, { points: row.points, display_name: name });
    }
  }

  // Trier par points
  const sorted = [...totals.entries()].sort((a, b) => b[1].points - a[1].points);

  return sorted.map(([uid, info], i) => ({
    rank: i + 1,
    user_id: uid,
    display_name: info.display_name,
    initials: info.display_name.slice(0, 2).toUpperCase(),
    color: getColor(info.display_name),
    points: info.points,
    isMe: uid === userId,
  }));
}

// Temps restant avant le reset (lundi prochain 00h)
export function getTimeUntilReset(): string {
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);

  const diff = nextMonday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return `${days}j ${hours}h`;
}
