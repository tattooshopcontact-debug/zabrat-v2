import { supabase } from './supabase';
import { checkBadgeProximity, checkStreakDanger } from './notificationService';
import { awardBadge, type UnlockedBadge } from './badgeAwarder';

// Re-export pour compatibilité avec les imports existants (écran succès, etc.)
export type { UnlockedBadge };

interface LogBeerParams {
  userId: string;
  beerType: string;
  beerBrand?: string;
  barName?: string;
  latitude?: number;
  longitude?: number;
  visibility?: 'public' | 'friends' | 'ghost';
}

export interface LogBeerResult {
  newTotal: number;
  newLevel: number;
  newStreak: number;
  points: number;
  unlockedBadge?: UnlockedBadge;
}

// Calcul du niveau basé sur le total de bières
function calculateLevel(totalBeers: number): number {
  if (totalBeers >= 500) return 7;
  if (totalBeers >= 300) return 6;
  if (totalBeers >= 150) return 5;
  if (totalBeers >= 75) return 4;
  if (totalBeers >= 30) return 3;
  if (totalBeers >= 10) return 2;
  return 1;
}

// Calcul des points avec multiplicateurs
function calculatePoints(params: {
  beerType: string;
  isNewBar: boolean;
  withFriends: boolean;
  streakActive: boolean;
}): number {
  let points = 1; // base : 1 bière = 1 point

  if (params.isNewBar) points *= 1.5;        // Nouveau bar → ×1.5
  if (params.withFriends) points *= 1.2;      // Avec amis → ×1.2
  if (params.beerType === 'craft') points *= 1.3; // Craft beer → ×1.3
  if (params.streakActive) points *= 1.1;     // Streak 7j+ → ×1.1

  return Math.round(points * 10) / 10;
}

export async function logBeer(params: LogBeerParams): Promise<LogBeerResult> {
  const { userId, beerType, beerBrand, barName } = params;

  // Horodatage de CE log (utilisé pour les badges temporels)
  const logDate = new Date();

  // 1. INSERT dans beer_logs
  const { error: logError } = await supabase.from('beer_logs').insert({
    user_id: userId,
    beer_type: beerType,
    beer_brand: beerBrand || null,
    latitude: params.latitude || null,
    longitude: params.longitude || null,
    visibility: params.visibility ?? 'friends',
  });

  if (logError) throw logError;

  // 2. Récupérer le profil actuel
  const { data: user } = await supabase
    .from('users')
    .select('total_beers, streak_current, streak_max, last_active')
    .eq('id', userId)
    .maybeSingle();

  if (!user) throw new Error('User not found');

  const newTotal = user.total_beers + 1;
  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.last_active;

  // Calcul du streak
  let newStreak = user.streak_current;
  if (lastActive) {
    const lastDate = new Date(lastActive);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      newStreak += 1; // Jour consécutif
    } else if (diffDays > 1) {
      newStreak = 1; // Streak cassé
    }
    // Si diffDays === 0, même jour, pas de changement
  } else {
    newStreak = 1; // Premier log
  }

  const newStreakMax = Math.max(newStreak, user.streak_max);
  const newLevel = calculateLevel(newTotal);

  // 3. UPDATE le profil utilisateur
  const { error: updateError } = await supabase
    .from('users')
    .update({
      total_beers: newTotal,
      streak_current: newStreak,
      streak_max: newStreakMax,
      level: newLevel,
      last_active: today,
    })
    .eq('id', userId);

  if (updateError) throw updateError;

  // 4. UPDATE weekly_scores
  const weekStart = getWeekStart();
  const points = calculatePoints({
    beerType,
    isNewBar: false, // TODO: vérifier si nouveau bar
    withFriends: false, // TODO: vérifier si avec amis
    streakActive: newStreak >= 7,
  });

  const { data: existingScore } = await supabase
    .from('weekly_scores')
    .select('id, points')
    .eq('user_id', userId)
    .eq('week_start', weekStart)
    .maybeSingle();

  if (existingScore) {
    await supabase
      .from('weekly_scores')
      .update({ points: existingScore.points + points })
      .eq('id', existingScore.id);
  } else {
    await supabase.from('weekly_scores').insert({
      user_id: userId,
      week_start: weekStart,
      points,
    });
  }

  // 5-7. Vérifier les badges (quantité / type / streak) en fail-soft :
  // une erreur d'attribution de badge ne doit JAMAIS bloquer l'enregistrement.
  const settled = await Promise.allSettled([
    checkQuantityBadges(userId, newTotal),
    checkBeerTypeBadges(userId, beerType),
    checkStreakBadges(userId, newStreak),
    checkTimeBadges(userId, logDate),
  ]);
  const allUnlocked = settled.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  // L'écran succès n'en affiche qu'un seul → on prend le premier (undefined si aucun).
  const unlockedBadge = allUnlocked[0];

  // 8. Notifications : badge proche + streak danger
  checkBadgeProximity(userId, newTotal).catch(() => {});
  checkStreakDanger(userId, newStreak, today).catch(() => {});

  return { newTotal, newLevel, newStreak, points, unlockedBadge };
}

// Lundi de la semaine en cours
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Vérifier et attribuer les badges quantité
async function checkQuantityBadges(userId: string, totalBeers: number): Promise<UnlockedBadge[]> {
  const thresholds = [1, 10, 25, 50, 100, 200, 500, 1000];
  const unlocked: UnlockedBadge[] = [];

  for (const threshold of thresholds) {
    if (totalBeers >= threshold) {
      // Récupérer le badge correspondant
      const { data: badge } = await supabase
        .from('badges')
        .select('id, name, icon')
        .eq('condition_type', 'total_beers')
        .eq('condition_value', threshold)
        .maybeSingle();

      if (badge) {
        // Insérer si pas déjà gagné. ignoreDuplicates → l'INSERT est ignoré
        // sur conflit, donc .select() ne renvoie QUE les lignes réellement insérées.
        const { data: inserted } = await supabase
          .from('user_badges')
          .upsert(
            { user_id: userId, badge_id: badge.id },
            { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
          )
          .select('badge_id');

        if (inserted && inserted.length > 0) {
          unlocked.push({ name: badge.name, icon: badge.icon });
        }
      }
    }
  }

  return unlocked;
}

// Vérifier les badges temporels / saisonniers à partir des timestamps des beer_logs.
// Fail-soft : retourne [] en cas d'erreur, ne throw jamais. Heures en LOCAL.
async function checkTimeBadges(userId: string, createdAt: Date): Promise<UnlockedBadge[]> {
  try {
    const { data: logs } = await supabase
      .from('beer_logs')
      .select('created_at, beer_type')
      .eq('user_id', userId);

    const rows = (logs ?? []) as { created_at: string; beer_type: string | null }[];

    // Comptages client-side
    let afterMidnight = 0; // heure locale ∈ [0,6)
    let afterwork = 0; // heure locale ∈ [17,20)
    let weekend = 0; // samedi (6) ou dimanche (0)
    const distinctTypes = new Set<string>();

    for (const row of rows) {
      const d = new Date(row.created_at);
      const h = d.getHours();
      const day = d.getDay();
      if (h >= 0 && h < 6) afterMidnight++;
      if (h >= 17 && h < 20) afterwork++;
      if (day === 0 || day === 6) weekend++;
      if (row.beer_type) distinctTypes.add(row.beer_type);
    }

    // Caractéristiques de CE log
    const thisHour = createdAt.getHours();
    const thisDay = createdAt.getDay();
    const thisMonth = createdAt.getMonth(); // 0 = janvier
    const thisDate = createdAt.getDate();

    const candidates: Promise<UnlockedBadge | null>[] = [];

    // Comptages cumulés
    if (afterMidnight >= 5) candidates.push(awardBadge(userId, 'after_midnight', 5));
    if (afterwork >= 5) candidates.push(awardBadge(userId, 'afterwork_logs', 5));
    if (weekend >= 10) candidates.push(awardBadge(userId, 'weekend_beers', 10));
    if (distinctTypes.size >= 10) candidates.push(awardBadge(userId, 'unique_beer_types', 10));

    // Une seule occurrence suffit (basé sur CE log)
    if (thisHour >= 2 && thisHour < 6) candidates.push(awardBadge(userId, 'late_night_log', 1));
    if (thisDay === 5 && thisHour < 18) candidates.push(awardBadge(userId, 'early_friday', 1));
    if (thisMonth === 11 && thisDate === 24) candidates.push(awardBadge(userId, 'christmas_eve', 1));
    if (thisMonth === 11 && thisDate === 31) candidates.push(awardBadge(userId, 'new_years_eve', 1));

    const results = await Promise.all(candidates);
    return results.filter((b): b is UnlockedBadge => b !== null);
  } catch {
    return [];
  }
}

// Vérifier les badges par type de bière
async function checkBeerTypeBadges(userId: string, beerType: string): Promise<UnlockedBadge[]> {
  const conditionMap: Record<string, string> = {
    ipa: 'beer_type_ipa',
    blanche: 'beer_type_blanche',
    brune: 'beer_type_brune',
    craft: 'beer_type_craft',
  };

  const conditionType = conditionMap[beerType];
  if (!conditionType) return [];

  // Compter combien de ce type l'utilisateur a logué
  const { count } = await supabase
    .from('beer_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('beer_type', beerType);

  if (!count) return [];

  // Vérifier si un badge existe pour ce count
  const { data: badge } = await supabase
    .from('badges')
    .select('id, name, icon')
    .eq('condition_type', conditionType)
    .lte('condition_value', count)
    .order('condition_value', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (badge) {
    const { data: inserted } = await supabase
      .from('user_badges')
      .upsert(
        { user_id: userId, badge_id: badge.id },
        { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
      )
      .select('badge_id');

    if (inserted && inserted.length > 0) {
      return [{ name: badge.name, icon: badge.icon }];
    }
  }

  return [];
}

// Vérifier les badges streak
async function checkStreakBadges(userId: string, currentStreak: number): Promise<UnlockedBadge[]> {
  const thresholds = [3, 7, 30];
  const unlocked: UnlockedBadge[] = [];

  for (const threshold of thresholds) {
    if (currentStreak >= threshold) {
      const { data: badge } = await supabase
        .from('badges')
        .select('id, name, icon')
        .eq('condition_type', 'streak_days')
        .eq('condition_value', threshold)
        .maybeSingle();

      if (badge) {
        const { data: inserted } = await supabase
          .from('user_badges')
          .upsert(
            { user_id: userId, badge_id: badge.id },
            { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
          )
          .select('badge_id');

        if (inserted && inserted.length > 0) {
          unlocked.push({ name: badge.name, icon: badge.icon });
        }
      }
    }
  }

  return unlocked;
}
