import { supabase } from './supabase';
import { awardBadge } from './badgeAwarder';

export interface FriendProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  total_beers: number;
  monthBeers: number;
  level: number;
}

export interface FriendRequest {
  id: string;
  status: 'pending' | 'accepted';
  created_at: string;
  user: FriendProfile;
}

// Chercher un utilisateur par numéro de téléphone
export async function searchByPhone(phone: string): Promise<FriendProfile | null> {
  const { data } = await supabase
    .from('users')
    .select('id, display_name, username, avatar_url, total_beers, level')
    .eq('phone', phone)
    .maybeSingle();

  return data ? { ...data, monthBeers: 0 } : null;
}

// Chercher par username
export async function searchByUsername(query: string): Promise<FriendProfile[]> {
  const { data } = await supabase
    .from('users')
    .select('id, display_name, username, avatar_url, total_beers, level')
    .ilike('username', `%${query}%`)
    .limit(10);

  return (data ?? []).map((u) => ({ ...u, monthBeers: 0 }));
}

// Envoyer une demande d'ami
export async function sendFriendRequest(userId: string, friendId: string) {
  const { error } = await supabase.from('friendships').insert({
    user_id: userId,
    friend_id: friendId,
    status: 'pending',
  });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Demande déjà envoyée');
    }
    throw error;
  }
}

// Accepter une demande d'ami
export async function acceptFriendRequest(requestId: string) {
  const { data: updated, error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', requestId)
    .select('user_id, friend_id')
    .maybeSingle();

  if (error) throw error;

  // Attribuer les badges "friends_count" aux DEUX utilisateurs nouvellement connectés.
  // Silencieux, fail-soft : ne change ni le retour ni le comportement.
  if (updated) {
    awardFriendsCountBadges(updated.user_id).catch(() => {});
    awardFriendsCountBadges(updated.friend_id).catch(() => {});
  }
}

// Attribue les badges friends_count (3/10/20) selon le nombre d'amis acceptés. Fail-soft.
async function awardFriendsCountBadges(userId: string): Promise<void> {
  try {
    const count = await getFriendsCount(userId);
    if (count >= 3) await awardBadge(userId, 'friends_count', 3);
    if (count >= 10) await awardBadge(userId, 'friends_count', 10);
    if (count >= 20) await awardBadge(userId, 'friends_count', 20);
  } catch {
    // silencieux
  }
}

// Refuser / supprimer une demande
export async function removeFriendship(requestId: string) {
  const { error } = await supabase
    .from('friendships')
    .delete()
    .eq('id', requestId);

  if (error) throw error;
}

// Récupérer la liste d'amis acceptés
export async function getFriends(userId: string): Promise<FriendProfile[]> {
  // Amis que j'ai ajoutés
  const { data: sent } = await supabase
    .from('friendships')
    .select('friend_id, users!friendships_friend_id_fkey(id, display_name, username, avatar_url, total_beers, level)')
    .eq('user_id', userId)
    .eq('status', 'accepted');

  // Amis qui m'ont ajouté
  const { data: received } = await supabase
    .from('friendships')
    .select('user_id, users!friendships_user_id_fkey(id, display_name, username, avatar_url, total_beers, level)')
    .eq('friend_id', userId)
    .eq('status', 'accepted');

  const friends: FriendProfile[] = [];

  if (sent) {
    for (const row of sent) {
      const u = (row as any).users;
      if (u) friends.push(u);
    }
  }

  if (received) {
    for (const row of received) {
      const u = (row as any).users;
      if (u) friends.push(u);
    }
  }

  // Dédupliquer
  const seen = new Set<string>();
  const deduped = friends.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });

  // Compteur de bières du mois en cours (1 seule requête batchée)
  const friendIds = deduped.map((f) => f.id);
  const monthCounts = new Map<string, number>();

  if (friendIds.length > 0) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0).toISOString();

    const { data: logs, error } = await supabase
      .from('beer_logs')
      .select('user_id')
      .in('user_id', friendIds)
      .gte('created_at', monthStart);

    // Fail-soft : si erreur, on laisse tout le monde à 0
    if (!error && logs) {
      for (const row of logs as { user_id: string }[]) {
        monthCounts.set(row.user_id, (monthCounts.get(row.user_id) ?? 0) + 1);
      }
    }
  }

  return deduped.map((f) => ({
    ...f,
    monthBeers: monthCounts.get(f.id) ?? 0,
  }));
}

// Récupérer les demandes en attente (reçues)
export async function getPendingRequests(userId: string): Promise<FriendRequest[]> {
  const { data } = await supabase
    .from('friendships')
    .select('id, status, created_at, users!friendships_user_id_fkey(id, display_name, username, avatar_url, total_beers, level)')
    .eq('friend_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    user: row.users,
  }));
}

// Compter les amis
export async function getFriendsCount(userId: string): Promise<number> {
  const { count: sentCount } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'accepted');

  const { count: receivedCount } = await supabase
    .from('friendships')
    .select('id', { count: 'exact', head: true })
    .eq('friend_id', userId)
    .eq('status', 'accepted');

  return (sentCount ?? 0) + (receivedCount ?? 0);
}

// Récupérer les IDs des amis (utile pour le feed et leaderboard)
export async function getFriendIds(userId: string): Promise<string[]> {
  const friends = await getFriends(userId);
  return friends.map((f) => f.id);
}
