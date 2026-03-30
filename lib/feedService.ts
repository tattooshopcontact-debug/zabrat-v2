import { supabase } from './supabase';
import { getFriendIds } from './friendsService';

export interface FeedItem {
  id: string;
  type: 'beer_log' | 'badge_unlock';
  user_id: string;
  display_name: string;
  username: string;
  initials: string;
  color: string;
  // beer_log fields
  beer_type?: string;
  beer_brand?: string;
  bar_name?: string;
  // badge_unlock fields
  badge_name?: string;
  badge_emoji?: string;
  badge_description?: string;
  // common
  created_at: string;
  time_ago: string;
}

const COLORS = ['#FF6B35', '#4CAF50', '#F5A623', '#E91E63', '#2196F3', '#9C27B0'];

function getColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  return `Il y a ${Math.floor(diff / 86400)}j`;
}

// Récupérer le feed (beer logs des amis + soi-même)
export async function fetchFeed(userId: string, limit = 20): Promise<FeedItem[]> {
  const friendIds = await getFriendIds(userId);
  const allIds = [userId, ...friendIds];

  // Beer logs récents
  const { data: logs } = await supabase
    .from('beer_logs')
    .select('id, user_id, beer_type, beer_brand, created_at, users!beer_logs_user_id_fkey(display_name, username)')
    .in('user_id', allIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  // User badges récents
  const { data: badges } = await supabase
    .from('user_badges')
    .select('id, user_id, earned_at, badges!user_badges_badge_id_fkey(name, icon, description), users!user_badges_user_id_fkey(display_name, username)')
    .in('user_id', allIds)
    .order('earned_at', { ascending: false })
    .limit(10);

  const items: FeedItem[] = [];

  // Mapper les beer logs
  if (logs) {
    for (const log of logs) {
      const u = (log as any).users;
      if (!u) continue;
      items.push({
        id: log.id,
        type: 'beer_log',
        user_id: log.user_id,
        display_name: u.display_name,
        username: u.username,
        initials: getInitials(u.display_name),
        color: getColor(u.display_name),
        beer_type: log.beer_type,
        beer_brand: log.beer_brand ?? undefined,
        created_at: log.created_at,
        time_ago: timeAgo(log.created_at),
      });
    }
  }

  // Mapper les badges
  if (badges) {
    for (const ub of badges) {
      const u = (ub as any).users;
      const b = (ub as any).badges;
      if (!u || !b) continue;
      items.push({
        id: ub.id,
        type: 'badge_unlock',
        user_id: ub.user_id,
        display_name: u.display_name,
        username: u.username,
        initials: getInitials(u.display_name),
        color: getColor(u.display_name),
        badge_name: b.name,
        badge_emoji: b.icon,
        badge_description: b.description,
        created_at: ub.earned_at,
        time_ago: timeAgo(ub.earned_at),
      });
    }
  }

  // Trier par date décroissante
  items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return items.slice(0, limit);
}

// Souscrire aux nouveaux beer_logs en temps réel
export function subscribeToFeed(
  userId: string,
  friendIds: string[],
  onNewLog: (log: any) => void,
) {
  const allIds = [userId, ...friendIds];

  const channel = supabase
    .channel('feed-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'beer_logs',
      },
      (payload) => {
        if (allIds.includes(payload.new.user_id)) {
          onNewLog(payload.new);
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
