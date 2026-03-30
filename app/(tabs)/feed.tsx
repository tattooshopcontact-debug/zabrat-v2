import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_FEED_ITEMS } from '../../constants/mockData';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../stores/authStore';
import { fetchFeed, subscribeToFeed, type FeedItem } from '../../lib/feedService';
import { getFriendIds } from '../../lib/friendsService';
import { EMPTY_IMAGES } from '../../constants/badgeImages';

// Couleurs STRICTES du Notion
const BG = '#0D0D0D';
const CARD = '#1A1A1A';
const AMBER = '#F5A623';
const MUTED = '#888888';
const WHITE = '#FFFFFF';
const GREEN = '#4CAF50';
const BORDER = '#333333';

/* ─── Rank Banner — bordure gauche 3px ambre, fond #1A1A1A ─── */
function RankBanner() {
  return (
    <View style={s.rankBanner}>
      <Text style={s.rankText}>🔥 Tu es <Text style={s.rankHighlight}>#3</Text> cette semaine</Text>
      <Text style={s.rankSub}>+2 bières pour le podium</Text>
    </View>
  );
}

/* ─── Reactions — exactement comme le Notion ─── */
function Reactions({ initial = { beer: 0, clap: 0, fire: 0 } }: { initial?: Record<string, number> }) {
  const [counts, setCounts] = useState(initial);
  const [tapped, setTapped] = useState<Record<string, boolean>>({});

  const react = (key: string) => {
    if (tapped[key]) return;
    setCounts(p => ({ ...p, [key]: (p[key] || 0) + 1 }));
    setTapped(p => ({ ...p, [key]: true }));
  };

  return (
    <View style={s.reactions}>
      {[
        { key: 'beer', emoji: '🍺' },
        { key: 'clap', emoji: '👏' },
        { key: 'fire', emoji: '🔥' },
      ].map(r => (
        <Pressable key={r.key} style={[s.reactionBtn, tapped[r.key] && s.reactionActive]} onPress={() => react(r.key)}>
          <Text>{r.emoji}</Text>
          <Text style={[s.reactionCount, tapped[r.key] && { color: AMBER }]}>{counts[r.key] || 0}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ─── Feed Card Beer Log ─── */
function BeerCard({ name, initials, color, time, beerType, beerBrand, barName, reactions }: any) {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <Avatar initials={initials} color={color} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardName}>{name}</Text>
          <Text style={s.cardTime}>{time}</Text>
        </View>
      </View>
      <Text style={s.cardAction}>vient de boire une 🍺</Text>
      <Text style={s.cardDetail}>{beerBrand || beerType}{barName ? ` — ${barName}` : ''}</Text>
      <Reactions initial={reactions} />
    </View>
  );
}

/* ─── Feed Card Badge ─── */
function BadgeCard({ name, initials, color, time, badgeName, badgeEmoji, badgeDesc, reactions }: any) {
  return (
    <View style={s.card}>
      <View style={s.cardTop}>
        <Avatar initials={initials} color={color} size={44} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.cardName}>{name}</Text>
          <Text style={s.cardTime}>{time}</Text>
        </View>
      </View>
      <Text style={s.cardAction}>🏆 Nouveau badge !</Text>
      <Text style={s.cardDetail}>{badgeEmoji} « {badgeName} » débloqué</Text>
      {badgeDesc && <Text style={s.cardSub}>{badgeDesc}</Text>}
      <Reactions initial={reactions} />
    </View>
  );
}

/* ─── Main ─── */
export default function FeedScreen() {
  const user = useAuthStore(s => s.user);
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [realFeed, setRealFeed] = useState<FeedItem[]>([]);
  const [hasReal, setHasReal] = useState(false);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    try {
      const items = await fetchFeed(user.id);
      if (items.length > 0) { setRealFeed(items); setHasReal(true); }
    } catch {}
  }, [user]);

  useEffect(() => { loadFeed(); }, [loadFeed]);
  useEffect(() => {
    if (!user) return;
    let unsub: (() => void) | undefined;
    (async () => {
      const ids = await getFriendIds(user.id);
      unsub = subscribeToFeed(user.id, ids, () => loadFeed());
    })();
    return () => { if (unsub) unsub(); };
  }, [user, loadFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed().finally(() => setRefreshing(false));
  }, [loadFeed]);

  const showEmpty = !hasReal && MOCK_FEED_ITEMS.length === 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>🍺 Zabrat</Text>
        <View style={s.headerRight}>
          <Pressable style={s.headerBtn} onPress={() => {}}>
            <Ionicons name="notifications-outline" size={20} color={WHITE} />
          </Pressable>
          <Pressable style={s.headerBtn} onPress={() => router.push('/friends')}>
            <Ionicons name="people-outline" size={20} color={WHITE} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={AMBER} colors={[AMBER]} />}
      >
        {/* Rank banner — bordure gauche 3px ambre */}
        <RankBanner />

        <Text style={s.sectionLabel}>FEED AMIS</Text>

        {/* Real feed */}
        {hasReal && realFeed.map(item => (
          item.type === 'beer_log'
            ? <BeerCard key={item.id} name={item.display_name} initials={item.initials} color={item.color} time={item.time_ago} beerType={item.beer_type} beerBrand={item.beer_brand} barName={item.bar_name} />
            : <BadgeCard key={item.id} name={item.display_name} initials={item.initials} color={item.color} time={item.time_ago} badgeName={item.badge_name} badgeEmoji={item.badge_emoji} badgeDesc={item.badge_description} />
        ))}

        {/* Mock feed */}
        {!hasReal && MOCK_FEED_ITEMS.map(item => (
          item.type === 'beer_log'
            ? <BeerCard key={item.id} name={item.user.display_name} initials={item.user.initials} color={item.user.color} time={item.time} beerType={item.beer_type} beerBrand={item.beer_brand} barName={item.bar_name} reactions={item.reactions} />
            : <BadgeCard key={item.id} name={item.user.display_name} initials={item.user.initials} color={item.user.color} time={item.time} badgeName={item.badge_name} badgeEmoji={item.badge_emoji} badgeDesc={item.badge_description} reactions={item.reactions} />
        ))}

        {/* Empty state */}
        {showEmpty && (
          <View style={s.empty}>
            <Image source={EMPTY_IMAGES.feed} style={s.emptyImg} resizeMode="contain" />
            <Text style={s.emptyText}>Tes amis n'ont pas encore loggé de bières ce soir</Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: WHITE },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: CARD, alignItems: 'center', justifyContent: 'center',
  },

  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

  // Rank banner — EXACT Notion : fond #1A1A1A, bordure gauche 3px #F5A623, padding 12px, coins 12px
  rankBanner: {
    backgroundColor: CARD,
    borderLeftWidth: 3,
    borderLeftColor: AMBER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  rankText: { fontSize: 15, fontWeight: '600', color: WHITE },
  rankHighlight: { color: AMBER, fontWeight: '900', fontSize: 18 },
  rankSub: { fontSize: 11, color: MUTED, marginTop: 4 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: MUTED, letterSpacing: 2, marginBottom: 12 },

  // Cards — fond #1A1A1A, coins 16px
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardName: { fontSize: 15, fontWeight: '700', color: WHITE },
  cardTime: { fontSize: 11, color: MUTED, marginTop: 1 },
  cardAction: { fontSize: 14, color: WHITE, marginBottom: 4 },
  cardDetail: { fontSize: 14, fontWeight: '700', color: AMBER, marginBottom: 4 },
  cardSub: { fontSize: 11, color: MUTED, marginBottom: 4 },

  // Reactions — EXACT Notion
  reactions: {
    flexDirection: 'row', gap: 8,
    marginTop: 10, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: '#2A2A2A',
  },
  reactionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#222222', borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  reactionActive: {
    backgroundColor: 'rgba(245,166,35,0.12)',
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.3)',
  },
  reactionCount: { fontSize: 12, fontWeight: '600', color: MUTED },

  // Empty state
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyImg: { width: 180, height: 180, marginBottom: 16 },
  emptyText: { fontSize: 14, color: MUTED, textAlign: 'center', paddingHorizontal: 32 },
});
