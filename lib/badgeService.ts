import { supabase } from './supabase';

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  unlocked: boolean;
  earned_at?: string;
}

// Récupérer tous les badges avec statut débloqué/verrouillé
export async function getUserBadges(userId: string): Promise<BadgeData[]> {
  // Tous les badges
  const { data: allBadges } = await supabase
    .from('badges')
    .select('id, name, description, icon, category, rarity')
    .order('category');

  // Badges débloqués par l'utilisateur
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id, earned_at')
    .eq('user_id', userId);

  if (!allBadges) return [];

  const unlockedMap = new Map<string, string>();
  if (userBadges) {
    for (const ub of userBadges) {
      unlockedMap.set(ub.badge_id, ub.earned_at);
    }
  }

  return allBadges.map((b: any) => ({
    id: b.id,
    name: b.name,
    description: b.description,
    icon: b.icon,
    category: b.category,
    rarity: b.rarity,
    unlocked: unlockedMap.has(b.id),
    earned_at: unlockedMap.get(b.id),
  }));
}

// Compter les badges débloqués
export async function getUnlockedCount(userId: string): Promise<{ unlocked: number; total: number }> {
  const { count: total } = await supabase.from('badges').select('id', { count: 'exact', head: true });
  const { count: unlocked } = await supabase.from('user_badges').select('id', { count: 'exact', head: true }).eq('user_id', userId);

  return { unlocked: unlocked ?? 0, total: total ?? 47 };
}
