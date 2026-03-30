import { supabase } from './supabase';

export interface FriendProfile {
  id: string;
  display_name: string;
  username: string;
  avatar_url?: string;
  total_beers: number;
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

  return data;
}

// Chercher par username
export async function searchByUsername(query: string): Promise<FriendProfile[]> {
  const { data } = await supabase
    .from('users')
    .select('id, display_name, username, avatar_url, total_beers, level')
    .ilike('username', `%${query}%`)
    .limit(10);

  return data ?? [];
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
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', requestId);

  if (error) throw error;
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
  return friends.filter((f) => {
    if (seen.has(f.id)) return false;
    seen.add(f.id);
    return true;
  });
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
