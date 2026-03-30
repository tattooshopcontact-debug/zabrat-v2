import { supabase } from './supabase';
import { getFriendIds } from './friendsService';

export interface Bar {
  id: string;
  name: string;
  city: string;
  address?: string;
  latitude: number;
  longitude: number;
  checkin_count: number;
  is_partner: boolean;
  // live data
  activeCount: number;
  activeFriends: { display_name: string; initials: string }[];
  popularBeers: { type: string; count: number }[];
}

export interface ActiveCheckin {
  id: string;
  user_id: string;
  bar_id: string;
  checked_in_at: string;
  display_name: string;
  bar_name: string;
  minutes_ago: number;
}

export type BarTier = 'hot' | 'active' | 'partner' | 'empty';

export function getBarTier(bar: Bar): BarTier {
  if (bar.activeCount >= 5) return 'hot';
  if (bar.activeCount >= 2) return 'active';
  if (bar.is_partner) return 'partner';
  return 'empty';
}

export function getAmbiance(count: number): string {
  if (count >= 5) return '🔥 Animée';
  if (count >= 3) return '😎 Sympa';
  if (count >= 1) return '🍺 Tranquille';
  return '😴 Vide';
}

// Récupérer tous les bars avec leurs check-ins actifs
export async function getBarsWithCheckins(userId: string): Promise<Bar[]> {
  // Récupérer les bars
  const { data: bars } = await supabase
    .from('bars')
    .select('*');

  if (!bars) return [];

  // Récupérer les check-ins actifs (non expirés)
  const now = new Date().toISOString();
  const { data: checkins } = await supabase
    .from('bar_checkins')
    .select('bar_id, user_id, users!bar_checkins_user_id_fkey(display_name)')
    .gt('expires_at', now);

  // Récupérer les bières logguées ce soir (depuis 18h ou dernières 6h)
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const { data: recentLogs } = await supabase
    .from('beer_logs')
    .select('bar_id, beer_type')
    .gt('created_at', sixHoursAgo)
    .not('bar_id', 'is', null);

  // Mapper les données
  return bars.map((bar: any) => {
    const barCheckins = (checkins ?? []).filter((c: any) => c.bar_id === bar.id);
    const barLogs = (recentLogs ?? []).filter((l: any) => l.bar_id === bar.id);

    // Compter les bières populaires
    const beerCounts = new Map<string, number>();
    for (const log of barLogs) {
      beerCounts.set(log.beer_type, (beerCounts.get(log.beer_type) ?? 0) + 1);
    }
    const popularBeers = [...beerCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    return {
      id: bar.id,
      name: bar.name,
      city: bar.city,
      address: bar.address,
      latitude: bar.latitude,
      longitude: bar.longitude,
      checkin_count: bar.checkin_count,
      is_partner: bar.is_partner,
      activeCount: barCheckins.length,
      activeFriends: barCheckins.map((c: any) => ({
        display_name: c.users?.display_name ?? 'Inconnu',
        initials: (c.users?.display_name ?? 'IN').slice(0, 2).toUpperCase(),
      })),
      popularBeers,
    };
  });
}

// Check-in dans un bar
export async function checkinBar(userId: string, barId: string, visibility: string) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4h

  // Vérifier s'il y a déjà un check-in actif
  const { data: existing } = await supabase
    .from('bar_checkins')
    .select('id, visit_count')
    .eq('user_id', userId)
    .eq('bar_id', barId)
    .gt('expires_at', now.toISOString())
    .maybeSingle();

  if (existing) {
    // Mettre à jour l'expiration
    await supabase
      .from('bar_checkins')
      .update({ expires_at: expiresAt.toISOString() })
      .eq('id', existing.id);
    return { isNew: false, visitCount: existing.visit_count };
  }

  // Compter les visites précédentes pour le badge "Roi du Bar"
  const { count: prevVisits } = await supabase
    .from('bar_checkins')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('bar_id', barId);

  const visitCount = (prevVisits ?? 0) + 1;

  // Insérer le check-in
  const { error } = await supabase.from('bar_checkins').insert({
    user_id: userId,
    bar_id: barId,
    checked_in_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    visibility,
    visit_count: visitCount,
  });

  if (error) throw error;

  // Incrémenter le compteur du bar (simple update)
  await supabase
    .from('bars')
    .update({ checkin_count: visitCount })
    .eq('id', barId);

  // Vérifier badge "Roi du Bar" (5 visites)
  if (visitCount >= 5) {
    const { data: badge } = await supabase
      .from('badges')
      .select('id')
      .eq('condition_type', 'same_bar_checkins')
      .eq('condition_value', 5)
      .maybeSingle();

    if (badge) {
      await supabase
        .from('user_badges')
        .upsert({ user_id: userId, badge_id: badge.id }, { onConflict: 'user_id,badge_id' });
    }
  }

  return { isNew: true, visitCount };
}

// Check-out manuellement
export async function checkoutBar(userId: string, barId: string) {
  const now = new Date().toISOString();
  await supabase
    .from('bar_checkins')
    .update({ expires_at: now })
    .eq('user_id', userId)
    .eq('bar_id', barId)
    .gt('expires_at', now);
}

// Amis qui sortent ce soir (check-in dans les 2 dernières heures)
export async function getWhoIsOut(userId: string): Promise<ActiveCheckin[]> {
  const friendIds = await getFriendIds(userId);
  if (friendIds.length === 0) return [];

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const now = new Date().toISOString();

  const { data } = await supabase
    .from('bar_checkins')
    .select('id, user_id, bar_id, checked_in_at, users!bar_checkins_user_id_fkey(display_name), bars!bar_checkins_bar_id_fkey(name)')
    .in('user_id', friendIds)
    .gt('expires_at', now)
    .gt('checked_in_at', twoHoursAgo)
    .order('checked_in_at', { ascending: false });

  if (!data) return [];

  return data.map((row: any) => {
    const minutesAgo = Math.floor((Date.now() - new Date(row.checked_in_at).getTime()) / 60000);
    return {
      id: row.id,
      user_id: row.user_id,
      bar_id: row.bar_id,
      checked_in_at: row.checked_in_at,
      display_name: row.users?.display_name ?? 'Inconnu',
      bar_name: row.bars?.name ?? 'Bar',
      minutes_ago: minutesAgo,
    };
  });
}

// Souscrire aux check-ins en temps réel
export function subscribeToCheckins(onUpdate: () => void) {
  const channel = supabase
    .channel('map-checkins')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bar_checkins' }, () => {
      onUpdate();
    })
    .subscribe();

  return () => supabase.removeChannel(channel);
}
