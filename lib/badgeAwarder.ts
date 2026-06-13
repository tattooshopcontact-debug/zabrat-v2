import { supabase } from './supabase';

// Badge fraîchement débloqué (renvoyé à l'écran succès)
export interface UnlockedBadge {
  name: string;
  icon: string;
}

// Attribue le badge (condition_type, condition_value) à l'utilisateur s'il ne l'a pas déjà.
// Retourne le badge si fraîchement débloqué, sinon null. Ne throw jamais.
export async function awardBadge(
  userId: string,
  conditionType: string,
  conditionValue: number
): Promise<UnlockedBadge | null> {
  try {
    const { data: badge } = await supabase
      .from('badges')
      .select('id, name, icon')
      .eq('condition_type', conditionType)
      .eq('condition_value', conditionValue)
      .maybeSingle();
    if (!badge) return null;

    const { data: inserted } = await supabase
      .from('user_badges')
      .upsert(
        { user_id: userId, badge_id: badge.id },
        { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
      )
      .select('badge_id');

    return inserted && inserted.length > 0 ? { name: badge.name, icon: badge.icon } : null;
  } catch {
    return null;
  }
}
