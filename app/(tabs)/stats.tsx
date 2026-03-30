import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_STREAK_DAYS, MOCK_FAVORITE_BARS, LEVEL_INFO } from '../../constants/mockData';
import { LEVEL_IMAGES } from '../../constants/badgeImages';
import { getUserStats, type UserStats } from '../../lib/statsService';

const BG = '#0D0D0D';
const CARD = '#1A1A1A';
const AMBER = '#F5A623';
const MUTED = '#888888';
const WHITE = '#FFFFFF';

export default function StatsScreen() {
  const user = useAuthStore(s => s.user);
  const level = LEVEL_INFO[user?.level ?? 1];
  const nextLevel = LEVEL_INFO[Math.min((user?.level ?? 1) + 1, 7)];
  const beersToNext = nextLevel.min - (user?.total_beers ?? 0);
  const levelPct = user
    ? Math.min(((user.total_beers - level.min) / (level.max - level.min + 1)) * 100, 100)
    : 0;

  const [stats, setStats] = useState<UserStats | null>(null);

  const loadStats = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getUserStats(user.id);
      setStats(data);
    } catch {}
  }, [user]);

  useEffect(() => { loadStats(); }, [loadStats]);

  // Utiliser les données réelles si disponibles, sinon fallback mock
  const tonight = stats?.tonight ?? 2;
  const thisWeek = stats?.thisWeek ?? 8;
  const thisMonth = stats?.thisMonth ?? 23;
  const total = stats?.total ?? user?.total_beers ?? 0;
  const streakDays = stats?.streakDays
    ? ['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => ({ day: d, active: stats.streakDays[i] }))
    : MOCK_STREAK_DAYS;
  const favBars = stats?.favoriteBars.length ? stats.favoriteBars : MOCK_FAVORITE_BARS;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>📊 Mes Stats</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Stat grid */}
        <View style={s.statGrid}>
          {[
            { v: tonight, l: 'Ce soir', big: false },
            { v: thisWeek, l: 'Cette semaine', big: false },
            { v: thisMonth, l: 'Ce mois', big: false },
            { v: total, l: 'Total', big: true },
          ].map((st, i) => (
            <View key={i} style={[s.statCard, st.big && s.statCardBig]}>
              <Text style={[s.statValue, st.big && s.statValueBig]}>{st.v}</Text>
              <Text style={s.statEmoji}>🍺</Text>
              <Text style={s.statLabel}>{st.l}</Text>
            </View>
          ))}
        </View>

        {/* Level progress — EXACT Notion spec */}
        <View style={s.levelSection}>
          <View style={s.levelRow}>
            {LEVEL_IMAGES[user?.level ?? 1] && (
              <Image source={LEVEL_IMAGES[user?.level ?? 1]} style={s.levelImg} resizeMode="contain" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={s.levelName}>{level.emoji} {level.name} — Niveau {user?.level}</Text>
              <View style={s.progressBar}>
                <View style={[s.progressFill, { width: `${levelPct}%` }]} />
              </View>
              <Text style={s.levelText}>{beersToNext > 0 ? `${beersToNext} bières pour le niveau ${(user?.level ?? 1) + 1}` : 'Niveau max atteint !'}</Text>
            </View>
          </View>
        </View>

        {/* Streak calendar — carrés ambre = actif, gris = inactif */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>📅 Streak</Text>
            <Text style={s.streakCount}>🔥 {user?.streak_current ?? 0}j</Text>
          </View>
          <View style={s.streakRow}>
            {streakDays.map((d, i) => (
              <View key={i} style={s.streakDay}>
                <View style={[s.streakDot, d.active ? s.streakActive : s.streakInactive]} />
                <Text style={[s.streakLabel, d.active && { color: AMBER }]}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badge progress */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🎯 Prochain badge</Text>
          {[
            { name: 'Le Centurion', emoji: '💯', cur: user?.total_beers ?? 0, target: 175 },
            { name: 'Streak 7 jours', emoji: '🔄', cur: user?.streak_current ?? 0, target: 7 },
          ].map((b, i) => {
            const pct = Math.min((b.cur / b.target) * 100, 100);
            return (
              <View key={i} style={s.progressCard}>
                <Text style={s.progressEmoji}>{b.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.progressName}>{b.name}</Text>
                  <View style={s.progressBar}>
                    <View style={[s.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
                <Text style={s.progressPct}>{b.cur}/{b.target}</Text>
              </View>
            );
          })}
        </View>

        {/* Bars préférés */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>🍺 Mes bars préférés</Text>
          {favBars.map((bar, i) => (
            <View key={i} style={s.barRow}>
              <Text style={s.barRank}>{['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`}</Text>
              <Text style={s.barName}>{bar.name}</Text>
              <Text style={s.barVisits}>{bar.visits} visites</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: WHITE },
  content: { paddingHorizontal: 16, paddingBottom: 24 },

  // Stats
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: '46%', backgroundColor: CARD, borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  statCardBig: { borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)' },
  statValue: { fontSize: 32, fontWeight: '900', color: AMBER },
  statValueBig: { fontSize: 44 },
  statEmoji: { fontSize: 16, marginTop: 2 },
  statLabel: { fontSize: 11, color: MUTED, fontWeight: '600', marginTop: 4 },

  // Level — EXACT Notion
  levelSection: { backgroundColor: CARD, borderRadius: 16, padding: 16, marginBottom: 20 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelImg: { width: 52, height: 52 },
  levelName: { fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 8 },
  progressBar: { height: 8, backgroundColor: '#2A2A2A', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: AMBER, borderRadius: 4 },
  levelText: { fontSize: 11, color: MUTED, marginTop: 6 },

  // Section
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Streak
  streakCount: { fontSize: 13, fontWeight: '700', color: AMBER },
  streakRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: CARD, borderRadius: 16, padding: 16,
  },
  streakDay: { alignItems: 'center', gap: 6 },
  streakDot: { width: 32, height: 32, borderRadius: 8 },
  streakActive: { backgroundColor: AMBER },
  streakInactive: { backgroundColor: '#2A2A2A' },
  streakLabel: { fontSize: 11, color: MUTED, fontWeight: '600' },

  // Progress badges
  progressCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 8,
  },
  progressEmoji: { fontSize: 28 },
  progressName: { fontSize: 13, fontWeight: '700', color: WHITE, marginBottom: 6 },
  progressPct: { fontSize: 12, fontWeight: '700', color: AMBER, width: 50, textAlign: 'right' },

  // Bars
  barRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  barRank: { fontSize: 18, width: 30, textAlign: 'center' },
  barName: { flex: 1, fontSize: 14, fontWeight: '600', color: WHITE, marginLeft: 8 },
  barVisits: { fontSize: 11, color: MUTED },
});
