import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_LEADERBOARD } from '../../constants/mockData';
import { AnimatedCard } from '../../components/AnimatedCard';
import { getLeaderboard, getTimeUntilReset, type LeaderboardRow } from '../../lib/leaderboardService';

const BG = '#0D0D0D';
const CARD = '#1A1A1A';
const AMBER = '#F5A623';
const MUTED = '#888888';
const WHITE = '#FFFFFF';
const GREEN = '#4CAF50';
const RED = '#FF4444';

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function TopScreen() {
  const user = useAuthStore(s => s.user);
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const [realData, setRealData] = useState<LeaderboardRow[]>([]);
  const [hasReal, setHasReal] = useState(false);
  const [resetTime, setResetTime] = useState(getTimeUntilReset());

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const d = await getLeaderboard(user.id, tab);
      if (d.length > 0) { setRealData(d); setHasReal(true); }
    } catch {}
  }, [user, tab]);

  useEffect(() => { load(); setResetTime(getTimeUntilReset()); }, [load]);

  const data = hasReal ? realData : MOCK_LEADERBOARD.map(r => ({
    rank: r.rank, user_id: String(r.rank), display_name: r.isMe ? 'Toi' : r.display_name,
    initials: r.initials, color: r.color, points: r.beers, isMe: !!r.isMe,
  }));

  const myRow = data.find(r => r.isMe);
  const podiumMin = data.length >= 3 ? data[2].points : 0;
  const gap = myRow ? Math.max(0, podiumMin - myRow.points + 1) : 0;

  // Trend arrows — EXACT Notion spec
  const trends = ['up', 'same', 'down', 'up', 'same'];
  const trendIcon = (i: number) => {
    const t = trends[i] || 'same';
    if (t === 'up') return { icon: '↑', color: GREEN };
    if (t === 'down') return { icon: '↓', color: RED };
    return { icon: '→', color: MUTED };
  };

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>🏆 Classement</Text>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['week', 'month'] as const).map(t => (
          <Pressable key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'week' ? 'Cette semaine' : 'Ce mois'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Timer */}
      <View style={s.timer}>
        <Text style={s.timerText}>Reset dans : {resetTime}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Rows */}
        {data.map((row, i) => {
          const trend = trendIcon(i);
          return (
            <AnimatedCard key={row.user_id} index={i}>
              <View style={[s.row, row.isMe && s.rowMe]}>
                <Text style={s.rowMedal}>{MEDALS[row.rank] ?? `${row.rank}.`}</Text>
                <Avatar initials={row.initials} color={row.color} size={40} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.rowName, row.isMe && s.rowNameMe]}>
                    {row.isMe ? `Toi 🔵` : row.display_name}
                  </Text>
                </View>
                <Text style={[s.rowPoints, row.isMe && { color: AMBER }]}>
                  {hasReal ? `${row.points} pts` : `${row.points} 🍺`}
                </Text>
                <Text style={[s.rowTrend, { color: trend.color }]}>{trend.icon}</Text>
              </View>
            </AnimatedCard>
          );
        })}

        {/* Message motivant — EXACT Notion */}
        {gap > 0 && (
          <View style={s.motivation}>
            <Text style={s.motivationText}>
              💬 "Tu es à {gap} bière{gap > 1 ? 's' : ''} du podium ! Vas-y ! 🔥"
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={s.actions}>
          <Pressable style={s.actionBtn}>
            <Text style={s.actionText}>Défier un ami</Text>
          </Pressable>
          <Pressable style={s.actionBtn}>
            <Text style={s.actionText}>Partager</Text>
          </Pressable>
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

  tabs: { flexDirection: 'row', paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: AMBER },
  tabText: { fontSize: 14, color: MUTED, fontWeight: '500' },
  tabTextActive: { color: AMBER, fontWeight: '700' },

  timer: { alignItems: 'center', paddingVertical: 8 },
  timerText: { fontSize: 11, color: MUTED },

  content: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },

  // Rows — fond #1A1A1A
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 8,
  },
  rowMe: {
    backgroundColor: 'rgba(245,166,35,0.08)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
  },
  rowMedal: { fontSize: 20, width: 30, textAlign: 'center' },
  rowName: { fontSize: 15, fontWeight: '600', color: WHITE },
  rowNameMe: { fontWeight: '800', color: AMBER },
  rowPoints: { fontSize: 15, fontWeight: '800', color: WHITE },
  // Tendances — EXACT Notion
  rowTrend: { fontSize: 18, fontWeight: '800', width: 20, textAlign: 'center' },

  // Message motivant — EXACT Notion
  motivation: {
    backgroundColor: CARD, borderRadius: 12, padding: 16, marginTop: 12,
    borderLeftWidth: 3, borderLeftColor: AMBER,
  },
  motivationText: { fontSize: 14, color: WHITE, fontStyle: 'italic' },

  // Buttons
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  actionText: { fontSize: 13, fontWeight: '600', color: WHITE },
});
