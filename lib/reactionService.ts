import { supabase } from './supabase';

export type ReactionType = 'beer' | 'clap' | 'fire';

// Ajouter une réaction
export async function addReaction(userId: string, targetId: string, targetType: 'beer_log' | 'badge_unlock', reactionType: ReactionType) {
  const { error } = await supabase.from('reactions').upsert(
    { user_id: userId, target_id: targetId, target_type: targetType, reaction_type: reactionType },
    { onConflict: 'user_id,target_id,reaction_type' }
  );
  if (error) throw error;
}

// Récupérer les compteurs de réactions pour un post
export async function getReactionCounts(targetId: string): Promise<Record<ReactionType, number>> {
  const counts: Record<ReactionType, number> = { beer: 0, clap: 0, fire: 0 };

  const { data } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('target_id', targetId);

  if (data) {
    for (const row of data) {
      const type = row.reaction_type as ReactionType;
      if (counts[type] !== undefined) counts[type]++;
    }
  }

  return counts;
}

// Vérifier si l'utilisateur a déjà réagi
export async function getUserReactions(userId: string, targetId: string): Promise<ReactionType[]> {
  const { data } = await supabase
    .from('reactions')
    .select('reaction_type')
    .eq('user_id', userId)
    .eq('target_id', targetId);

  return data?.map(r => r.reaction_type as ReactionType) ?? [];
}
