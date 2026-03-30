import { supabase } from './supabase';

export interface UserStats {
  tonight: number;
  thisWeek: number;
  thisMonth: number;
  total: number;
  streakDays: boolean[]; // 7 jours, lundi = index 0
  favoriteBars: { name: string; visits: number }[];
}

export async function getUserStats(userId: string): Promise<UserStats> {
  const now = new Date();

  // Ce soir (depuis 18h ou depuis minuit)
  const tonightStart = new Date(now);
  tonightStart.setHours(now.getHours() >= 18 ? 18 : 0, 0, 0, 0);

  // Cette semaine (lundi)
  const weekDay = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
  weekStart.setHours(0, 0, 0, 0);

  // Ce mois
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Requêtes en parallèle
  const [tonightRes, weekRes, monthRes, totalRes, barsRes, logsWeek] = await Promise.all([
    supabase.from('beer_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', tonightStart.toISOString()),
    supabase.from('beer_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', weekStart.toISOString()),
    supabase.from('beer_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).gte('created_at', monthStart.toISOString()),
    supabase.from('users').select('total_beers').eq('id', userId).maybeSingle(),
    // Bars les plus visités
    supabase.from('bar_checkins')
      .select('bar_id, bars!bar_checkins_bar_id_fkey(name)')
      .eq('user_id', userId),
    // Logs de la semaine pour le calendrier streak
    supabase.from('beer_logs').select('created_at')
      .eq('user_id', userId).gte('created_at', weekStart.toISOString()),
  ]);

  // Streak calendar: quels jours de la semaine ont un log
  const streakDays = [false, false, false, false, false, false, false]; // L M M J V S D
  if (logsWeek.data) {
    for (const log of logsWeek.data) {
      const d = new Date(log.created_at);
      const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1; // Lundi=0, Dimanche=6
      streakDays[dayIdx] = true;
    }
  }

  // Top bars
  const barCounts = new Map<string, { name: string; count: number }>();
  if (barsRes.data) {
    for (const row of barsRes.data as any[]) {
      const name = row.bars?.name ?? 'Bar';
      const existing = barCounts.get(row.bar_id);
      if (existing) existing.count++;
      else barCounts.set(row.bar_id, { name, count: 1 });
    }
  }
  const favoriteBars = [...barCounts.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(b => ({ name: b.name, visits: b.count }));

  return {
    tonight: tonightRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    thisMonth: monthRes.count ?? 0,
    total: totalRes.data?.total_beers ?? 0,
    streakDays,
    favoriteBars,
  };
}
