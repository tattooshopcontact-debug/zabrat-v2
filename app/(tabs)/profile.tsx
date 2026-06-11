import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { Colors, Fonts, Glow, Gradients, Radius } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_BADGES, LEVEL_INFO } from '../../constants/mockData';
import { Avatar } from '../../components/Avatar';
import { AnimatedBadge } from '../../components/AnimatedCard';
import { uploadAvatar } from '../../lib/storageService';
import { getUserBadges, type BadgeData } from '../../lib/badgeService';
import { getUserStats, type UserStats } from '../../lib/statsService';
import { getLeaderboard } from '../../lib/leaderboardService';
import { supabase } from '../../lib/supabase';
import StatNumber from '../../components/neon/StatNumber';
import NeonButton from '../../components/neon/NeonButton';
import { useTabBarPadding } from '../../components/neon/useTabBarPadding';
import { initialsOf } from '../../lib/avatarColor';

/* ─── Anneau de progression XP (SVG, rotation -90°, dasharray ∝ % XP) ─── */
const RING_SIZE = 118;
const RING_STROKE = 5;

function XPRing({ progress, children }: { progress: number; children: React.ReactNode }) {
  const r = (RING_SIZE - 8) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(progress, 0), 1);
  return (
    <View style={s.ringWrap}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={s.ringSvg}>
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
          fill="none" stroke={Colors.border} strokeWidth={RING_STROKE}
        />
        <Circle
          cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r}
          fill="none" stroke={Colors.primary} strokeWidth={RING_STROKE}
          strokeLinecap="round" strokeDasharray={`${c * clamped} ${c}`}
        />
      </Svg>
      {children}
    </View>
  );
}

/* ─── Graphique hebdo ─── */
type WeekDay = { d: string; v: number };
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MOCK_WEEK: WeekDay[] = [
  { d: 'L', v: 2 }, { d: 'M', v: 3 }, { d: 'M', v: 0 }, { d: 'J', v: 1 },
  { d: 'V', v: 4 }, { d: 'S', v: 5 }, { d: 'D', v: 3 },
];

function WeekChart({ week }: { week: WeekDay[] }) {
  const max = Math.max(...week.map(d => d.v), 1);
  const total = week.reduce((a, d) => a + d.v, 0);
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={Fonts.label}>Cette semaine</Text>
        <Text style={s.cardHeaderValue}>{total} 🍺</Text>
      </View>
      <View style={s.chartRow}>
        {week.map((day, i) => (
          <View key={i} style={s.chartCol}>
            {day.v > 0 ? (
              i >= 4 ? (
                <LinearGradient
                  colors={[...Gradients.cta]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={[s.bar, s.barStrong, { height: `${(day.v / max) * 100}%` }]}
                />
              ) : (
                <View style={[s.bar, s.barPast, { height: `${(day.v / max) * 100}%` }]} />
              )
            ) : (
              <View style={s.barEmpty} />
            )}
            <Text style={s.chartLabel}>{day.d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ─── Tuile badge ─── */
function BadgeTile({ badge }: { badge: BadgeData }) {
  if (!badge.unlocked) {
    return (
      <View style={[s.badgeTile, s.badgeTileLocked]}>
        <Ionicons name="lock-closed" size={22} color="#3A3A48" />
        <Text style={[s.badgeName, s.badgeNameLocked]} numberOfLines={2}>{badge.name}</Text>
      </View>
    );
  }
  return (
    <View style={[s.badgeTile, s.badgeTileUnlocked]}>
      <Text style={s.badgeEmoji}>{badge.icon}</Text>
      <Text style={s.badgeName} numberOfLines={2}>{badge.name}</Text>
    </View>
  );
}

/* ─── Main ─── */
export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore(st => st.user);
  const tabBarPadding = useTabBarPadding();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [week, setWeek] = useState<WeekDay[] | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [badgesLoaded, setBadgesLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;

    // Stats globales (total, semaine, streak)
    getUserStats(user.id).then(setStats).catch(() => {});

    // Badges
    getUserBadges(user.id).then(data => {
      if (data.length > 0) { setBadges(data); setBadgesLoaded(true); }
    }).catch(() => {});

    // Rang de la semaine (ligue amis)
    getLeaderboard(user.id, 'week').then(rows => {
      const me = rows.find(r => r.isMe);
      if (me) setRank(me.rank);
    }).catch(() => {});

    // Logs de la semaine groupés par jour (L → D) pour le graphe
    try {
      const now = new Date();
      const weekDay = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (weekDay === 0 ? 6 : weekDay - 1));
      weekStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from('beer_logs').select('created_at')
        .eq('user_id', user.id).gte('created_at', weekStart.toISOString());
      if (data) {
        // Semaine vide = vraies données à zéro (le mock ne sert qu'avant chargement/erreur)
        const counts = [0, 0, 0, 0, 0, 0, 0];
        for (const log of data) {
          const d = new Date(log.created_at);
          const idx = d.getDay() === 0 ? 6 : d.getDay() - 1;
          counts[idx]++;
        }
        setWeek(DAY_LABELS.map((d, i) => ({ d, v: counts[i] })));
      }
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Niveau + XP (XP = bières totales, bornes LEVEL_INFO)
  const levelNum = user?.level ?? 1;
  const level = LEVEL_INFO[levelNum];
  const nextLevel = LEVEL_INFO[Math.min(levelNum + 1, 7)];
  const isMaxLevel = levelNum >= 7;
  const total = stats?.total ?? user?.total_beers ?? 0;
  const progress = Math.min((total - level.min) / (level.max - level.min + 1), 1);
  const xpToNext = Math.max(nextLevel.min - total, 0);

  const streak = user?.streak_current ?? 0;
  const displayWeek = week ?? MOCK_WEEK;

  const displayBadges: BadgeData[] = badgesLoaded ? badges : MOCK_BADGES.map(b => ({
    id: b.id, name: b.name, description: '', icon: b.emoji,
    category: b.category, rarity: 'common', unlocked: b.unlocked,
  }));
  const unlockedCount = displayBadges.filter(b => b.unlocked).length;

  const pickAvatar = useCallback(() => {
    if (Platform.OS !== 'web' || !user) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        await uploadAvatar(user.id, url);
      }
    };
    input.click();
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={s.container} edges={['top']}>
        <Text style={s.emptyText}>Connecte-toi pour voir ton profil 🍺</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        showsVerticalScrollIndicator={false}
      >
        {/* Réglages */}
        <View style={s.settingsRow}>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel="Réglages"
            style={({ pressed }) => [s.settingsBtn, pressed && { transform: [{ scale: 0.94 }] }]}
          >
            <Ionicons name="settings-outline" size={19} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Hero : avatar + anneau XP */}
        <View style={s.hero}>
          <Pressable onPress={pickAvatar} accessibilityRole="button" accessibilityLabel="Changer mon avatar">
            <XPRing progress={progress}>
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={s.avatarImage} />
              ) : (
                <Avatar initials={initialsOf(user.display_name)} color={Colors.accent} size={94} />
              )}
            </XPRing>
            <View style={s.avatarEditBadge}>
              <Ionicons name="camera" size={12} color="#FFF" />
            </View>
          </Pressable>
          <Text style={s.heroName}>{user.display_name}</Text>
          <View style={s.levelPill}>
            <Text style={s.levelPillText}>Niv. {levelNum} · {level.name} {level.emoji}</Text>
          </View>
          <Text style={s.xpText}>
            {isMaxLevel ? 'Niveau max atteint 🏆' : `${xpToNext} XP avant « ${nextLevel.name} »`}
          </Text>
        </View>

        {/* 3 chiffres géants */}
        <View style={s.statsRow}>
          <View style={s.statCell}>
            <StatNumber value={`${total}`} label="bières au total" amber />
          </View>
          <View style={[s.statCell, s.statCellBorder]}>
            <StatNumber value={`${streak} 🔥`} label="streak" />
          </View>
          <View style={[s.statCell, s.statCellBorder]}>
            <StatNumber value={rank != null ? `#${rank}` : '—'} label="cette semaine" />
          </View>
        </View>

        <View style={s.body}>
          {/* Graphique hebdo */}
          <WeekChart week={displayWeek} />

          {/* Badges */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Text style={Fonts.label}>Badges</Text>
              <Text style={s.badgeCount}>
                {unlockedCount}
                <Text style={s.badgeCountTotal}>/{displayBadges.length}</Text>
              </Text>
            </View>
            <View style={s.badgeGrid}>
              {displayBadges.map((badge, idx) => (
                <AnimatedBadge key={badge.id} index={idx} style={s.badgeCell}>
                  <BadgeTile badge={badge} />
                </AnimatedBadge>
              ))}
            </View>
          </View>

          {/* Boutons */}
          <View style={s.buttonsRow}>
            <NeonButton
              title="Mon Wrapped 🎁"
              onPress={() => router.push('/wrapped')}
              style={{ flex: 1.2 }}
            />
            <Pressable
              onPress={() => router.push('/friends')}
              accessibilityRole="button"
              style={({ pressed }) => [s.secondaryBtn, pressed && { transform: [{ scale: 0.96 }] }]}
            >
              <Ionicons name="people" size={18} color={Colors.primary} />
              <Text style={s.secondaryBtnText}>Mes amis</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyText: { ...Fonts.small, textAlign: 'center', paddingVertical: 40 },

  // Réglages
  settingsRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20, paddingTop: 6 },
  settingsBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Hero
  hero: { alignItems: 'center', marginTop: -6 },
  ringWrap: {
    width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    boxShadow: Glow.card,
  },
  ringSvg: { position: 'absolute', transform: [{ rotate: '-90deg' }] },
  avatarImage: { width: 94, height: 94, borderRadius: 47 },
  avatarEditBadge: {
    position: 'absolute', bottom: 4, right: 4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.background,
  },
  heroName: { ...Fonts.display, fontSize: 28, marginTop: 12, letterSpacing: 0.4 },
  levelPill: {
    marginTop: 7, paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.4)',
    boxShadow: '0 0 14px rgba(255,149,0,0.2)',
  },
  levelPillText: { fontFamily: 'Outfit_800ExtraBold', fontSize: 13, color: Colors.primary },
  xpText: { ...Fonts.small, fontFamily: 'Outfit_600SemiBold', fontSize: 11.5, marginTop: 7 },

  // 3 chiffres géants
  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 22 },
  statCell: { flex: 1, alignItems: 'center' },
  statCellBorder: { borderLeftWidth: 1, borderLeftColor: Colors.border },

  // Corps
  body: { paddingHorizontal: 20, marginTop: 22, gap: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 18, paddingTop: 18, paddingBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderValue: { fontFamily: 'Outfit_700Bold', fontSize: 12.5, color: Colors.textMuted },

  // Graphique hebdo
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 92 },
  chartCol: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 7 },
  bar: { width: '100%', maxWidth: 26, borderRadius: 6 },
  barStrong: { boxShadow: '0 0 14px rgba(255,149,0,0.43)' },
  barPast: { backgroundColor: 'rgba(255,149,0,0.35)' },
  barEmpty: { width: '100%', maxWidth: 26, height: 3, borderRadius: 3, backgroundColor: Colors.border },
  chartLabel: { fontFamily: 'Outfit_700Bold', fontSize: 11, color: Colors.textMuted },

  // Badges
  badgeCount: { fontFamily: 'Outfit_800ExtraBold', fontSize: 12.5, color: Colors.primary },
  badgeCountTotal: { color: Colors.textMuted },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 6 },
  badgeCell: { width: '20%', padding: 3 },
  badgeTile: {
    alignItems: 'center', gap: 7,
    paddingTop: 14, paddingBottom: 11, paddingHorizontal: 4,
    borderRadius: Radius.tile, minHeight: 76,
  },
  badgeTileUnlocked: {
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.4)',
    boxShadow: '0 0 16px rgba(255,149,0,0.16)',
  },
  badgeTileLocked: {
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeEmoji: {
    fontSize: 22, lineHeight: 26,
    textShadowColor: 'rgba(255,149,0,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  badgeName: {
    fontFamily: 'Outfit_700Bold', fontSize: 10.5, color: Colors.text,
    textAlign: 'center', lineHeight: 13,
  },
  badgeNameLocked: { color: '#3A3A48' },

  // Boutons
  buttonsRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, height: 62, borderRadius: Radius.cta,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.4)',
  },
  secondaryBtnText: { fontFamily: 'Outfit_800ExtraBold', fontSize: 15, color: Colors.primary },
});
