import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';
import { shareWrapped } from '../lib/shareService';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const BG = '#0D0D0D';
const CARD = '#1A1A1A';
const AMBER = '#F5A623';
const MUTED = '#888888';
const WHITE = '#FFFFFF';

interface WrappedData {
  month: string;
  totalBeers: number;
  favoriteBar: string;
  favBarVisits: number;
  bestFriend: string;
  bestFriendNights: number;
  rarestBadge: string;
  rarestBadgeEmoji: string;
  avgRank: number;
  liters: string;
}

function AnimStat({ index, emoji, value, label }: { index: number; emoji: string; value: string; label: string }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  useEffect(() => {
    const delay = 300 + index * 150;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[s.statCard, style]}>
      <Text style={s.statEmoji}>{emoji}</Text>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function WrappedScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<WrappedData | null>(null);

  // Animation du chiffre principal
  const mainScale = useSharedValue(0);
  const mainOpacity = useSharedValue(0);

  useEffect(() => {
    loadWrapped();
    mainScale.value = withDelay(200, withTiming(1, { duration: 600, easing: Easing.out(Easing.back(1.2)) }));
    mainOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, []);

  const mainStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mainScale.value }],
    opacity: mainOpacity.value,
  }));

  const loadWrapped = async () => {
    if (!user) return;
    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    const { count: beerCount } = await supabase
      .from('beer_logs').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', monthStart);

    const { data: barVisits } = await supabase
      .from('bar_checkins').select('bar_id, bars!bar_checkins_bar_id_fkey(name)')
      .eq('user_id', user.id).gte('checked_in_at', monthStart);

    let favoriteBar = 'Aucun', favBarVisits = 0;
    if (barVisits && barVisits.length > 0) {
      const counts = new Map<string, { name: string; count: number }>();
      for (const v of barVisits as any[]) {
        const name = v.bars?.name ?? 'Bar';
        const ex = counts.get(v.bar_id);
        if (ex) ex.count++; else counts.set(v.bar_id, { name, count: 1 });
      }
      const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
      if (sorted[0]) { favoriteBar = sorted[0].name; favBarVisits = sorted[0].count; }
    }

    const { data: badges } = await supabase
      .from('user_badges').select('badges!user_badges_badge_id_fkey(name, icon, rarity)')
      .eq('user_id', user.id).gte('earned_at', monthStart).order('earned_at', { ascending: false });

    let rarestBadge = 'Aucun', rarestBadgeEmoji = '🏅';
    const rarityOrder = ['legendary', 'epic', 'rare', 'common', 'seasonal'];
    if (badges && badges.length > 0) {
      const sorted = (badges as any[]).sort((a, b) =>
        rarityOrder.indexOf(a.badges?.rarity ?? 'common') - rarityOrder.indexOf(b.badges?.rarity ?? 'common'));
      rarestBadge = sorted[0]?.badges?.name ?? 'Aucun';
      rarestBadgeEmoji = sorted[0]?.badges?.icon ?? '🏅';
    }

    const totalBeers = beerCount ?? 0;
    setData({
      month: monthName, totalBeers, favoriteBar, favBarVisits,
      bestFriend: 'Aymen', bestFriendNights: 3,
      rarestBadge, rarestBadgeEmoji, avgRank: 4,
      liters: (totalBeers * 0.33).toFixed(1),
    });
  };

  if (!data) return <View style={s.container} />;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <Pressable style={s.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={WHITE} />
      </Pressable>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Image source={require('../assets/images/app-icon.png')} style={s.logoImg} resizeMode="contain" />
        <Text style={s.wrappedLabel}>Ton Zabrat de</Text>
        <Text style={s.wrappedMonth}>{data.month}</Text>

        {/* Ligne dorée */}
        <View style={s.divider} />

        {/* Main stat animé */}
        <Animated.View style={[s.mainStat, mainStyle]}>
          <Text style={s.mainNumber}>{data.totalBeers}</Text>
          <Text style={s.mainUnit}>bières 🍺</Text>
        </Animated.View>

        {/* Stats grid — apparition progressive */}
        <View style={s.statsGrid}>
          <AnimStat index={0} emoji="📍" value={data.favoriteBar} label={`Bar préféré (${data.favBarVisits} visites)`} />
          <AnimStat index={1} emoji="👥" value={data.bestFriend} label={`Meilleur ami (${data.bestFriendNights} soirs)`} />
          <AnimStat index={2} emoji={data.rarestBadgeEmoji} value={data.rarestBadge} label="Badge le plus rare" />
          <AnimStat index={3} emoji="🏆" value={`#${data.avgRank}`} label="Rang moyen" />
        </View>

        {/* Fun stat */}
        <View style={s.funStat}>
          <Text style={s.funEmoji}>🍻</Text>
          <Text style={s.funText}>{data.liters} litres bu ce mois</Text>
        </View>

        {/* Share buttons */}
        <View style={s.shareRow}>
          <Pressable style={s.shareBtn} onPress={() => {
            if (data) shareWrapped(data.month, data.totalBeers, data.favoriteBar);
          }}>
            <Ionicons name="share-social" size={18} color="#000" />
            <Text style={s.shareBtnText}>Partager</Text>
          </Pressable>
          <Pressable style={[s.shareBtn, s.whatsappBtn]} onPress={() => {
            if (data) shareWrapped(data.month, data.totalBeers, data.favoriteBar);
          }}>
            <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
            <Text style={[s.shareBtnText, { color: '#FFF' }]}>WhatsApp</Text>
          </Pressable>
        </View>

        <Text style={s.branding}>Track. Share. Compete.</Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  closeBtn: { position: 'absolute', top: 50, right: 16, zIndex: 10, padding: 8 },
  content: { paddingHorizontal: 24, paddingTop: 50, alignItems: 'center' },

  logoImg: { width: 60, height: 60, borderRadius: 16, marginBottom: 16 },
  wrappedLabel: { fontSize: 14, color: MUTED, fontWeight: '500' },
  wrappedMonth: { fontSize: 30, fontWeight: '900', color: AMBER, textTransform: 'capitalize', marginBottom: 12 },

  divider: { width: 60, height: 2, backgroundColor: AMBER, borderRadius: 1, marginBottom: 24 },

  // Main stat
  mainStat: { alignItems: 'center', marginBottom: 32 },
  mainNumber: { fontSize: 80, fontWeight: '900', color: AMBER, lineHeight: 88 },
  mainUnit: { fontSize: 18, color: WHITE, fontWeight: '600', marginTop: 4 },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, width: '100%' },
  statCard: {
    flex: 1, minWidth: '46%', backgroundColor: CARD, borderRadius: 18,
    padding: 18, alignItems: 'center',
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', color: WHITE, textAlign: 'center' },
  statLabel: { fontSize: 10, color: MUTED, textAlign: 'center', marginTop: 4 },

  // Fun stat
  funStat: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(245,166,35,0.08)', borderRadius: 16,
    padding: 18, width: '100%', marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.2)',
  },
  funEmoji: { fontSize: 32 },
  funText: { fontSize: 16, fontWeight: '700', color: WHITE },

  // Share
  shareRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  shareBtn: {
    flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: AMBER, borderRadius: 14, paddingVertical: 16,
  },
  whatsappBtn: { backgroundColor: '#25D366' },
  shareBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },

  branding: { fontSize: 12, color: MUTED, fontWeight: '500', letterSpacing: 2 },
});
