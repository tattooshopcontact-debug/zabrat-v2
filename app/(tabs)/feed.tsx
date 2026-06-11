import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MOCK_FEED_ITEMS } from '../../constants/mockData';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { fetchFeed, subscribeToFeed, type FeedItem } from '../../lib/feedService';
import { getFriendIds, getFriends, type FriendProfile } from '../../lib/friendsService';
import { getWhoIsOut, subscribeToCheckins, type ActiveCheckin } from '../../lib/mapService';
import { AnimatedCard } from '../../components/AnimatedCard';
import NeonButton from '../../components/neon/NeonButton';
import BeerGlass from '../../components/neon/BeerGlass';
import { useTabBarPadding } from '../../components/neon/useTabBarPadding';
import { PulsingDot } from '../../components/neon/PulsingDot';
import { RingAvatar } from '../../components/neon/RingAvatar';
import { Colors, Fonts, Glow, Gradients, Radius, Spacing } from '../../constants/theme';

/* ─── Helpers avatars (mêmes règles que feedService) ─── */
const AVATAR_COLORS = ['#FF6B35', '#4CAF50', '#F5A623', '#E91E63', '#2196F3', '#9C27B0'];

function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsOf(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function firstNameOf(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/* ─── Date du jour en français — « Mercredi 11 juin · La Marsa » ─── */
const FR_DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const FR_MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

function todayLine(): string {
  const d = new Date();
  return `${FR_DAYS[d.getDay()]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]} · La Marsa`;
}

/* ─── « Qui sort ce soir » ─── */
type WhoEntry = { id: string; name: string; bar: string | null };

function WhoIsOut({ entries }: { entries: WhoEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <View style={s.whoSection}>
      <Text style={s.sectionLabel}>Qui sort ce soir</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.whoScroll}
        contentContainerStyle={s.whoScrollContent}
      >
        {entries.map(f => (
          <View key={f.id} style={s.whoItem}>
            {f.bar ? (
              <RingAvatar initials={initialsOf(f.name)} color={colorFor(f.name)} size={52} ring="cyan" />
            ) : (
              <View style={{ opacity: 0.55 }}>
                <Avatar initials={initialsOf(f.name)} color={colorFor(f.name)} size={52} />
              </View>
            )}
            <View style={s.whoLabels}>
              <Text style={[s.whoName, !f.bar && { color: Colors.textMuted }]} numberOfLines={1}>
                {firstNameOf(f.name)}
              </Text>
              {f.bar ? (
                <View style={s.whoBarRow}>
                  <PulsingDot size={5} />
                  <Text style={s.whoBar} numberOfLines={1}>{f.bar}</Text>
                </View>
              ) : (
                <Text style={s.whoHome}>chez lui</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ─── Card streak (si streak ≥ 2) ─── */
function StreakCard({ streak }: { streak: number }) {
  return (
    <LinearGradient
      colors={[...Gradients.amberSoft]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0.3 }}
      style={s.streakCard}
    >
      <Text style={s.streakNumber}>🔥 {streak}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.streakTitle}>{streak} soirs d'affilée</Text>
        <Text style={s.streakSub}>Encore ce soir pour continuer la série !</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="rgba(255,149,0,0.8)" />
    </LinearGradient>
  );
}

/* ─── Réactions 🍻 ❤️ 🔥 — toggle optimiste local (logique existante conservée) ─── */
const REACTION_EMOJIS = ['🍻', '❤️', '🔥'] as const;
type ReactionEmoji = (typeof REACTION_EMOJIS)[number];
type ReactionCounts = Record<ReactionEmoji, number>;

const NO_COUNTS: ReactionCounts = { '🍻': 0, '❤️': 0, '🔥': 0 };

function mockCounts(r?: { beer?: number; clap?: number; fire?: number }): ReactionCounts {
  return { '🍻': r?.beer ?? 0, '❤️': r?.clap ?? 0, '🔥': r?.fire ?? 0 };
}

/* ─── Card du feed — texte riche, photo éventuelle, réactions ─── */
type CardData = {
  id: string;
  type: 'beer_log' | 'badge_unlock';
  name: string;
  initials: string;
  color: string;
  time: string;
  beerLabel?: string;
  barName?: string;
  badgeName?: string;
  badgeEmoji?: string;
  counts: ReactionCounts;
  photoUrl?: string;
};

function FeedCard({ item }: { item: CardData }) {
  const [mine, setMine] = useState<Partial<Record<ReactionEmoji, boolean>>>({});
  const toggle = (e: ReactionEmoji) => setMine(m => ({ ...m, [e]: !m[e] }));

  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <Avatar initials={item.initials} color={item.color} size={42} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardText}>
            {item.type === 'beer_log' ? (
              <>
                <Text style={s.cardBold}>{item.name}</Text>
                {' a bu une '}
                <Text style={s.cardBold}>{item.beerLabel}</Text>
                {' 🍺'}
                {item.barName ? (
                  <>
                    {' au '}
                    <Text style={s.cardBold}>{item.barName}</Text>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <Text style={s.cardBold}>{item.name}</Text>
                {' a débloqué le badge '}
                <Text style={s.cardBold}>{item.badgeName}</Text>
                {` ${item.badgeEmoji ?? '🏅'}`}
              </>
            )}
          </Text>
          <Text style={s.cardTime}>{item.time}</Text>
        </View>
      </View>

      {item.photoUrl ? (
        <Image source={{ uri: item.photoUrl }} style={s.cardPhoto} resizeMode="cover" />
      ) : null}

      <View style={s.reactionsRow}>
        {REACTION_EMOJIS.map(e => {
          const active = !!mine[e];
          const count = (item.counts[e] ?? 0) + (active ? 1 : 0);
          return (
            <Pressable
              key={e}
              onPress={() => toggle(e)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={({ pressed }) => [
                s.reaction,
                active && s.reactionActive,
                pressed && { transform: [{ scale: 0.95 }] },
              ]}
            >
              <Text style={s.reactionEmoji}>{e}</Text>
              {count > 0 && (
                <Text style={[s.reactionCount, active && s.reactionCountActive]}>{count}</Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/* ─── État vide ─── */
function EmptyState({ onLog }: { onLog: () => void }) {
  return (
    <View style={s.emptyCard}>
      <View style={s.emptyGlass}>
        <BeerGlass type="blonde" size={56} />
      </View>
      <Text style={s.emptyTitle}>Personne n'a encore bu ce soir…</Text>
      <Text style={s.emptySub}>sois le premier 🍺</Text>
      <NeonButton title="Logger ma première" onPress={onLog} style={s.emptyBtn} />
    </View>
  );
}

/* ─── Main ─── */
export default function FeedScreen() {
  const user = useAuthStore(st => st.user);
  const router = useRouter();
  const tabBarPadding = useTabBarPadding();
  const [refreshing, setRefreshing] = useState(false);
  const [realFeed, setRealFeed] = useState<FeedItem[]>([]);
  const [hasReal, setHasReal] = useState(false);
  const [whoOut, setWhoOut] = useState<ActiveCheckin[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    try {
      const items = await fetchFeed(user.id);
      if (items.length > 0) { setRealFeed(items); setHasReal(true); }
    } catch {}
  }, [user]);

  const loadWhoIsOut = useCallback(async () => {
    if (!user) return;
    try {
      const [out, fr] = await Promise.all([getWhoIsOut(user.id), getFriends(user.id)]);
      setWhoOut(out);
      setFriends(fr);
    } catch {}
  }, [user]);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => { loadWhoIsOut(); }, [loadWhoIsOut]);

  useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const ids = await getFriendIds(user.id);
      unsub = subscribeToFeed(user.id, ids, () => loadFeed());
    })();
    return () => { if (unsub) unsub(); };
  }, [user, loadFeed]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCheckins(() => loadWhoIsOut());
    return () => { unsub(); };
  }, [user, loadWhoIsOut]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([loadFeed(), loadWhoIsOut()]).finally(() => setRefreshing(false));
  }, [loadFeed, loadWhoIsOut]);

  // Amis live (check-in en cours) + inactifs (« chez lui »)
  const whoEntries = useMemo<WhoEntry[]>(() => {
    const liveByUser = new Map<string, ActiveCheckin>();
    for (const c of whoOut) {
      if (!liveByUser.has(c.user_id)) liveByUser.set(c.user_id, c);
    }
    const live: WhoEntry[] = [...liveByUser.values()].map(c => ({
      id: c.user_id, name: c.display_name, bar: c.bar_name,
    }));
    const inactive: WhoEntry[] = friends
      .filter(f => !liveByUser.has(f.id))
      .slice(0, 3)
      .map(f => ({ id: f.id, name: f.display_name, bar: null }));
    return [...live, ...inactive];
  }, [whoOut, friends]);

  // Normalisation des items (réels + mocks) vers les cards
  const cards = useMemo<CardData[]>(() => {
    if (hasReal) {
      return realFeed.map(item => ({
        id: item.id,
        type: item.type,
        name: item.display_name,
        initials: item.initials,
        color: item.color,
        time: item.time_ago,
        beerLabel: item.beer_type ?? item.beer_brand,
        barName: item.bar_name,
        badgeName: item.badge_name,
        badgeEmoji: item.badge_emoji,
        counts: NO_COUNTS,
      }));
    }
    return MOCK_FEED_ITEMS.map(item => ({
      id: item.id,
      type: item.type,
      name: item.user.display_name,
      initials: item.user.initials,
      color: item.user.color,
      time: item.time,
      beerLabel: 'beer_type' in item ? item.beer_type : undefined,
      barName: 'bar_name' in item ? item.bar_name : undefined,
      badgeName: 'badge_name' in item ? item.badge_name : undefined,
      badgeEmoji: 'badge_emoji' in item ? item.badge_emoji : undefined,
      counts: mockCounts(item.reactions),
    }));
  }, [hasReal, realFeed]);

  const streak = user?.streak_current ?? 0;
  const showEmpty = !hasReal && MOCK_FEED_ITEMS.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>
              Ce soir <Text style={s.headerMoon}>🌙</Text>
            </Text>
            <Text style={s.headerDate}>{todayLine()}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            accessibilityRole="button"
            accessibilityLabel="Ouvrir mon profil"
            style={({ pressed }) => [s.headerAvatar, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <RingAvatar
              initials={initialsOf(user?.display_name ?? '??')}
              color={colorFor(user?.display_name ?? '??')}
              size={46}
              ring="amber"
            />
            {streak > 0 && (
              <LinearGradient
                colors={[...Gradients.cta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0.2 }}
                style={s.streakBadge}
              >
                <Text style={s.streakBadgeText}>🔥{streak}</Text>
              </LinearGradient>
            )}
          </Pressable>
        </View>

        {/* Qui sort ce soir */}
        <WhoIsOut entries={whoEntries} />

        <View style={s.feedColumn}>
          {/* Card streak */}
          {streak >= 2 && <StreakCard streak={streak} />}

          {/* Cards du feed */}
          {!showEmpty && cards.map((item, idx) => (
            <AnimatedCard key={item.id} index={idx}>
              <FeedCard item={item} />
            </AnimatedCard>
          ))}

          {/* État vide */}
          {showEmpty && <EmptyState onLog={() => router.push('/log-beer')} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  scrollContent: { paddingHorizontal: Spacing.screenX },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 6, paddingBottom: 18,
  },
  headerTitle: { ...Fonts.screenTitle, lineHeight: 36, letterSpacing: 0.4 },
  headerMoon: { fontSize: 25 },
  headerDate: { ...Fonts.small, fontSize: 13.5, fontFamily: 'Outfit_600SemiBold', marginTop: 5 },
  headerAvatar: { position: 'relative' },
  streakBadge: {
    position: 'absolute', bottom: -4, right: -6,
    borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 2,
    boxShadow: '0 0 10px rgba(255,149,0,0.43)',
  },
  streakBadgeText: { fontFamily: 'Outfit_800ExtraBold', fontSize: 11, color: Colors.onAmber },

  // Qui sort ce soir
  whoSection: { marginBottom: 6 },
  sectionLabel: { ...Fonts.label, marginBottom: 12 },
  whoScroll: { marginHorizontal: -Spacing.screenX },
  whoScrollContent: {
    paddingHorizontal: Spacing.screenX, paddingTop: 4, paddingBottom: 6, gap: 18,
  },
  whoItem: { alignItems: 'center', gap: 7, width: 58 },
  whoLabels: { alignItems: 'center' },
  whoName: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.text },
  whoBarRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  whoBar: { fontFamily: 'Outfit_600SemiBold', fontSize: 10.5, color: Colors.cyan },
  whoHome: { fontFamily: 'Outfit_400Regular', fontSize: 10.5, color: Colors.textMuted, marginTop: 2 },

  // Colonne feed
  feedColumn: { gap: Spacing.gap, paddingTop: 12 },

  // Card streak
  streakCard: {
    borderRadius: Radius.card,
    paddingVertical: 16, paddingHorizontal: 18,
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.4)',
    boxShadow: Glow.card,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    overflow: 'hidden',
  },
  streakNumber: {
    ...Fonts.display, fontSize: 44, lineHeight: 48, color: Colors.primary,
    ...Glow.textAmber,
  },
  streakTitle: { fontFamily: 'Outfit_800ExtraBold', fontSize: 15.5, color: Colors.text },
  streakSub: { fontFamily: 'Outfit_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 },

  // Cards feed
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.cardPad,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center' },
  cardText: { ...Fonts.body, lineHeight: 20 },
  cardBold: { ...Fonts.bodyBold },
  cardTime: { ...Fonts.small, marginTop: 3 },
  cardPhoto: { width: '100%', height: 170, borderRadius: 14 },

  // Réactions
  reactionsRow: { flexDirection: 'row', gap: 8 },
  reaction: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 5, paddingHorizontal: 11,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
  },
  reactionActive: {
    backgroundColor: 'rgba(255,149,0,0.16)',
    borderColor: 'rgba(255,149,0,0.55)',
    boxShadow: Glow.card,
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: { fontFamily: 'Outfit_700Bold', fontSize: 13, color: Colors.textMuted },
  reactionCountActive: { color: Colors.primary },

  // État vide
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border,
    paddingVertical: 44, paddingHorizontal: 24,
    alignItems: 'center',
  },
  emptyGlass: { opacity: 0.5, marginBottom: 14 },
  emptyTitle: { fontFamily: 'Outfit_800ExtraBold', fontSize: 16, color: Colors.text, textAlign: 'center' },
  emptySub: {
    fontFamily: 'Outfit_400Regular', fontSize: 13.5, color: Colors.textMuted,
    textAlign: 'center', marginTop: 6, marginBottom: 20,
  },
  emptyBtn: { alignSelf: 'center' },
});
