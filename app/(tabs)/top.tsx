import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  type NativeSyntheticEvent, type NativeScrollEvent, type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Avatar } from '../../components/Avatar';
import { RingAvatar } from '../../components/neon/RingAvatar';
import { PulsingDot } from '../../components/neon/PulsingDot';
import { useTabBarPadding, useAboveTabBarOffset } from '../../components/neon/useTabBarPadding';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_LEADERBOARD } from '../../constants/mockData';
import { getLeaderboard, type LeaderboardRow } from '../../lib/leaderboardService';
import { Colors, Fonts, Glow, Gradients, Radius } from '../../constants/theme';

/* ─── Countdown « Xj Yh » — fin de semaine ISO (dimanche 23:59) ou fin de mois ─── */
function getCountdown(period: 'week' | 'month'): string {
  const now = new Date();
  let end: Date;
  if (period === 'week') {
    const day = now.getDay(); // 0 = dimanche
    const daysUntilSunday = day === 0 ? 0 : 7 - day;
    end = new Date(now);
    end.setDate(now.getDate() + daysUntilSunday);
    end.setHours(23, 59, 0, 0);
  } else {
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
  }
  const ms = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return `${days}j ${hours}h`;
}

/* ─── Podium (marches néon, ordre visuel 2-1-3) ─── */
const PODIUM = {
  1: {
    h: 92, av: 64, color: Colors.primary,
    grad: ['rgba(255,149,0,0.25)', 'rgba(255,107,53,0.1)'] as const,
    border: 'rgba(255,149,0,0.5)', glow: true,
  },
  2: {
    h: 64, av: 52, color: '#C8CAD8',
    grad: ['rgba(200,202,216,0.22)', 'rgba(200,202,216,0.04)'] as const,
    border: 'rgba(200,202,216,0.45)', glow: false,
  },
  3: {
    h: 46, av: 52, color: '#C77B4A',
    grad: ['rgba(199,123,74,0.22)', 'rgba(199,123,74,0.04)'] as const,
    border: 'rgba(199,123,74,0.45)', glow: false,
  },
} as const;

function PodiumStep({ row, place }: { row: LeaderboardRow; place: 1 | 2 | 3 }) {
  const conf = PODIUM[place];
  return (
    <View style={s.podiumCol}>
      <View>
        {place === 1 && <Text style={s.crown}>👑</Text>}
        {place === 1 ? (
          <RingAvatar initials={row.initials} color={row.color} size={conf.av} ring="amber" />
        ) : (
          <Avatar initials={row.initials} color={row.color} size={conf.av} />
        )}
      </View>
      <View style={s.podiumLabels}>
        <Text
          style={[s.podiumName, row.isMe && { color: Colors.primary }]}
          numberOfLines={1}
        >
          {row.isMe ? 'Toi' : row.display_name}
        </Text>
        <Text style={[s.podiumCount, { color: conf.color }]} numberOfLines={1}>
          {row.points} 🍺
        </Text>
      </View>
      <LinearGradient
        colors={[...conf.grad]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[
          s.podiumStep,
          { height: conf.h, borderColor: conf.border },
          conf.glow && { boxShadow: Glow.card },
        ]}
      >
        <Text style={[s.podiumPlace, { color: conf.color }]}>{place}</Text>
      </LinearGradient>
    </View>
  );
}

/* ─── Ligne de classement (rangs 4+) — delta « — » : pas de données semaine précédente ─── */
function LigueRow({ row }: { row: LeaderboardRow }) {
  const inner = (
    <>
      <Text style={[s.rowRank, row.isMe && { color: Colors.primary }]}>{row.rank}</Text>
      {row.isMe ? (
        <RingAvatar initials={row.initials} color={row.color} size={40} ring="amber" />
      ) : (
        <Avatar initials={row.initials} color={row.color} size={40} />
      )}
      <Text
        style={[s.rowName, row.isMe && s.rowNameMe]}
        numberOfLines={1}
      >
        {row.isMe ? 'Toi' : row.display_name}
      </Text>
      <Text style={s.rowCount}>
        {row.points}
        <Text style={s.rowBeer}> 🍺</Text>
      </Text>
      <Text style={s.rowDelta}>—</Text>
    </>
  );

  if (row.isMe) {
    return (
      <LinearGradient
        colors={[...Gradients.amberSoft]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.3 }}
        style={[s.row, s.rowMe]}
      >
        {inner}
      </LinearGradient>
    );
  }
  return <View style={s.row}>{inner}</View>;
}

/* ─── Main ─── */
export default function TopScreen() {
  const user = useAuthStore(st => st.user);
  const tabBarPadding = useTabBarPadding();
  const stickyBottom = useAboveTabBarOffset();
  const [tab, setTab] = useState<'week' | 'month'>('week');
  const [realData, setRealData] = useState<LeaderboardRow[]>([]);
  const [hasReal, setHasReal] = useState(false);
  const [countdown, setCountdown] = useState(() => getCountdown('week'));

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const d = await getLeaderboard(user.id, tab);
      if (d.length > 0) { setRealData(d); setHasReal(true); }
    } catch {}
  }, [user, tab]);

  useEffect(() => { load(); setCountdown(getCountdown(tab)); }, [load, tab]);

  // Tick du countdown toutes les 60s (écran laissé ouvert)
  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(tab)), 60_000);
    return () => clearInterval(id);
  }, [tab]);

  const data: LeaderboardRow[] = hasReal ? realData : MOCK_LEADERBOARD.map(r => ({
    rank: r.rank, user_id: String(r.rank), display_name: r.isMe ? 'Toi' : r.display_name,
    initials: r.initials, color: r.color, points: r.beers, isMe: !!r.isMe,
  }));

  const podium = data.length >= 3 ? data.slice(0, 3) : [];
  const list = data.length >= 3 ? data.slice(3) : data;
  const myRow = data.find(r => r.isMe);
  const myInList = !!myRow && myRow.rank > 3;

  /* ─── Sticky « Toi » : mesure onLayout + onScroll, clone quand hors viewport ─── */
  const viewportH = useRef(0);
  const scrollYRef = useRef(0);
  const listYRef = useRef(0);
  const meRowYRef = useRef(0);
  const meRowHRef = useRef(0);
  const [meVisible, setMeVisible] = useState(true);

  const recompute = useCallback(() => {
    if (viewportH.current === 0 || meRowHRef.current === 0) return;
    // Position de la ligne « Toi » relative au viewport du ScrollView
    const top = listYRef.current + meRowYRef.current - scrollYRef.current;
    const bottom = top + meRowHRef.current;
    // Visible si au-dessus de la zone sticky (tab bar) et sous le bord haut
    setMeVisible(top < viewportH.current - stickyBottom - meRowHRef.current && bottom > 0);
  }, [stickyBottom]);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollYRef.current = e.nativeEvent.contentOffset.y;
    recompute();
  }, [recompute]);

  const onScrollViewLayout = useCallback((e: LayoutChangeEvent) => {
    viewportH.current = e.nativeEvent.layout.height;
    recompute();
  }, [recompute]);

  const onListLayout = useCallback((e: LayoutChangeEvent) => {
    listYRef.current = e.nativeEvent.layout.y;
    recompute();
  }, [recompute]);

  const onMeRowLayout = useCallback((e: LayoutChangeEvent) => {
    meRowYRef.current = e.nativeEvent.layout.y;
    meRowHRef.current = e.nativeEvent.layout.height;
    recompute();
  }, [recompute]);

  const showSticky = myInList && !meVisible && !!myRow;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: tabBarPadding }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onLayout={onScrollViewLayout}
      >
        <View style={s.headerBlock}>
          {/* Header + countdown */}
          <View style={s.headerRow}>
            <Text style={s.headerTitle}>Ligue</Text>
            <View style={s.countdownRow}>
              <PulsingDot size={6} color={Colors.primary} />
              <Text style={s.countdownText}>
                ⏱ Se termine dans <Text style={s.countdownValue}>{countdown}</Text>
              </Text>
            </View>
          </View>

          {/* Tabs segmentés */}
          <View style={s.tabs}>
            {(['week', 'month'] as const).map(t => {
              const active = tab === t;
              const label = t === 'week' ? 'Cette semaine' : 'Ce mois';
              return (
                <Pressable
                  key={t}
                  onPress={() => setTab(t)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => [s.tab, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                  {active ? (
                    <LinearGradient
                      colors={[...Gradients.cta]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0.3 }}
                      style={s.tabPill}
                    >
                      <Text style={s.tabTextActive}>{label}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={s.tabPill}>
                      <Text style={s.tabText}>{label}</Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Podium top 3 — ordre visuel 2-1-3 */}
          {podium.length === 3 && (
            <View style={s.podiumRow}>
              <PodiumStep row={podium[1]} place={2} />
              <PodiumStep row={podium[0]} place={1} />
              <PodiumStep row={podium[2]} place={3} />
            </View>
          )}
        </View>

        {/* Séparateur dégradé */}
        {podium.length === 3 && (
          <LinearGradient
            colors={['transparent', 'rgba(255,149,0,0.35)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.divider}
          />
        )}

        {/* Liste rangs 4+ */}
        <View style={s.list} onLayout={onListLayout}>
          {list.map(row => (
            <View key={row.user_id} onLayout={row.isMe ? onMeRowLayout : undefined}>
              <LigueRow row={row} />
            </View>
          ))}
          {list.length === 0 && (
            <Text style={s.emptyText}>Personne d'autre dans ta ligue pour l'instant 🍺</Text>
          )}
        </View>
      </ScrollView>

      {/* Clone sticky « Toi » quand la ligne sort du viewport */}
      {showSticky && myRow && (
        <View style={[s.sticky, { bottom: stickyBottom }]}>
          <LigueRow row={myRow} />
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  headerBlock: { paddingHorizontal: 20, paddingTop: 6 },

  // Header + countdown
  headerRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  headerTitle: { ...Fonts.screenTitle, letterSpacing: 0.4 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  countdownText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.textMuted },
  countdownValue: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.primary },

  // Tabs segmentés
  tabs: {
    flexDirection: 'row', gap: 4, marginTop: 16,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 14, padding: 4,
  },
  tab: { flex: 1 },
  tabPill: {
    height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  tabText: { fontFamily: 'Outfit_800ExtraBold', fontSize: 14, color: Colors.textMuted },
  tabTextActive: { fontFamily: 'Outfit_800ExtraBold', fontSize: 14, color: Colors.onAmber },

  // Podium
  podiumRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    marginTop: 26, paddingHorizontal: 6,
  },
  podiumCol: { flex: 1, alignItems: 'center', gap: 8 },
  crown: {
    position: 'absolute', top: -16, alignSelf: 'center', zIndex: 1,
    fontSize: 17,
    textShadowColor: 'rgba(255,149,0,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  podiumLabels: { alignItems: 'center' },
  podiumName: { fontFamily: 'Outfit_800ExtraBold', fontSize: 13, color: Colors.text, maxWidth: 96 },
  podiumCount: { ...Fonts.display, fontSize: 19, lineHeight: 24 },
  podiumStep: {
    width: '100%',
    borderTopLeftRadius: 10, borderTopRightRadius: 10,
    borderWidth: 1, borderBottomWidth: 0,
    alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8,
  },
  podiumPlace: { ...Fonts.display, fontSize: 26, lineHeight: 28, opacity: 0.9 },

  // Séparateur
  divider: { height: 1, marginHorizontal: 20, marginTop: 16, marginBottom: 14 },

  // Liste rangs 4+
  list: { paddingHorizontal: 14, gap: 4 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 13,
    paddingVertical: 11, paddingHorizontal: 16,
    borderRadius: Radius.tile,
  },
  rowMe: {
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.5)',
    boxShadow: Glow.card,
  },
  rowRank: { ...Fonts.display, fontSize: 19, color: Colors.textMuted, width: 26, textAlign: 'center' },
  rowName: { flex: 1, fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.text },
  rowNameMe: { fontFamily: 'Outfit_800ExtraBold', color: Colors.primary },
  rowCount: { ...Fonts.display, fontSize: 19 },
  rowBeer: { fontFamily: 'Outfit_600SemiBold', fontSize: 13, color: Colors.textMuted },
  rowDelta: {
    fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.textMuted,
    width: 34, textAlign: 'right',
  },
  emptyText: {
    ...Fonts.small, textAlign: 'center', paddingVertical: 24,
  },

  // Clone sticky « Toi »
  sticky: {
    position: 'absolute', left: 14, right: 14, zIndex: 25,
    borderRadius: Radius.tile, overflow: 'hidden',
    backgroundColor: 'rgba(16,16,23,0.94)',
    boxShadow: '0 10px 34px rgba(0,0,0,0.55)',
  },
});
