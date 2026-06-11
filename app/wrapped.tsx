import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInUp, useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';
import { shareWrapped } from '../lib/shareService';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import { Colors, Fonts, Glow, Radius } from '../constants/theme';
import ZabratLogo from '../components/neon/ZabratLogo';
import NeonButton from '../components/neon/NeonButton';
import GlassCard from '../components/neon/GlassCard';

interface WrappedData {
  month: string;        // « mai 2026 » — utilisé par le share
  monthTitle: string;   // « mai » — titre de l'écran
  totalBeers: number;
  favoriteBar: string;
  favBarVisits: number;
  favoriteBeer: string;
  favBeerCount: number;
  bestNight: string;
  bestNightCount: number;
  rarestBadge: string;
  rarestBadgeEmoji: string;
  avgRank: number;
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Halo néon flou — sur web : vrai blur CSS, sur natif l'opacity basse suffit
function Halo({ color, style }: { color: string; style: object }) {
  return (
    <View
      pointerEvents="none"
      style={[
        s.halo,
        { backgroundColor: color },
        Platform.OS === 'web' ? ({ filter: 'blur(70px)' } as object) : null,
        style,
      ]}
    />
  );
}

function GlassRow({ index, label, value, sub }: { index: number; label: string; value: string; sub: string }) {
  return (
    <Animated.View entering={FadeInUp.delay(300 + index * 130).duration(400)}>
      <GlassCard style={s.row}>
        <Text style={s.rowLabel}>{label}</Text>
        <View style={s.rowRight}>
          <Text style={s.rowValue} numberOfLines={1}>{value}</Text>
          <Text style={s.rowSub}>{sub}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export default function WrappedScreen() {
  const router = useRouter();
  const user = useAuthStore((st) => st.user);
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
    const monthTitle = now.toLocaleString('fr-FR', { month: 'long' });

    const { data: logs } = await supabase
      .from('beer_logs').select('beer_type, created_at')
      .eq('user_id', user.id).gte('created_at', monthStart);

    const totalBeers = logs?.length ?? 0;

    // Bière préférée (type le plus loggé ce mois)
    let favoriteBeer = 'Aucune', favBeerCount = 0;
    // Meilleur soir (record de 🍺 sur une journée)
    let bestNight = '—', bestNightCount = 0;
    if (logs && logs.length > 0) {
      const beerCounts = new Map<string, number>();
      const dayCounts = new Map<string, number>();
      for (const log of logs as { beer_type: string | null; created_at: string }[]) {
        const type = log.beer_type ?? 'Blonde';
        beerCounts.set(type, (beerCounts.get(type) ?? 0) + 1);
        const day = log.created_at.slice(0, 10);
        dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
      }
      const topBeer = [...beerCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      if (topBeer) { favoriteBeer = cap(topBeer[0]); favBeerCount = topBeer[1]; }
      const topDay = [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      if (topDay) {
        bestNight = cap(new Date(topDay[0]).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' }));
        bestNightCount = topDay[1];
      }
    }

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

    let rarestBadge = 'Aucun', rarestBadgeEmoji = '🥇';
    const rarityOrder = ['legendary', 'epic', 'rare', 'common', 'seasonal'];
    if (badges && badges.length > 0) {
      const sorted = (badges as any[]).sort((a, b) =>
        rarityOrder.indexOf(a.badges?.rarity ?? 'common') - rarityOrder.indexOf(b.badges?.rarity ?? 'common'));
      rarestBadge = sorted[0]?.badges?.name ?? 'Aucun';
      rarestBadgeEmoji = sorted[0]?.badges?.icon ?? '🥇';
    }

    setData({
      month: monthName, monthTitle, totalBeers,
      favoriteBar, favBarVisits,
      favoriteBeer, favBeerCount,
      bestNight, bestNightCount,
      rarestBadge, rarestBadgeEmoji,
      avgRank: 4,
    });
  };

  const handleShare = () => {
    if (data) shareWrapped(data.month, data.totalBeers, data.favoriteBar);
  };

  return (
    <View style={s.container}>
      {/* Fond nuit : dégradé + halos néon */}
      <LinearGradient colors={['#1B1430', '#0A0A0F']} style={StyleSheet.absoluteFill} />
      <Halo color={Colors.amber} style={{ top: -80, left: -90 }} />
      <Halo color={Colors.accent} style={{ bottom: 60, right: -110 }} />
      <Halo color={Colors.cyan} style={{ top: '38%', right: -60, opacity: 0.1 }} />

      {/* Fermer (overlay story plein écran) */}
      <Pressable style={s.closeBtn} onPress={() => router.back()} accessibilityRole="button">
        <Ionicons name="close" size={18} color={Colors.text} />
      </Pressable>

      {data && (
        <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={s.header}>
            <ZabratLogo size={30} />
            <Text style={s.wrappedLabel}>Zabrat Wrapped</Text>
          </View>
          <Text style={s.title}>Ton mois de {data.monthTitle} 🍺</Text>

          {/* Total géant */}
          <Animated.View style={[s.mainStat, mainStyle]}>
            <Text style={s.mainNumber}>{data.totalBeers}</Text>
            <View style={s.mainUnit}>
              <Text style={s.mainUnitTop}>bières</Text>
              <Text style={s.mainUnitSub}>ce mois-ci</Text>
            </View>
          </Animated.View>

          {/* Rows glass */}
          <View style={s.rows}>
            <GlassRow index={0} label="Bar préféré" value={data.favoriteBar}
              sub={`${data.favBarVisits} soirée${data.favBarVisits > 1 ? 's' : ''}`} />
            <GlassRow index={1} label="Bière préférée" value={data.favoriteBeer}
              sub={`${data.favBeerCount} sur ${data.totalBeers}`} />
            <GlassRow index={2} label="Meilleur soir" value={data.bestNight}
              sub={`${data.bestNightCount} 🍺 — record`} />

            {/* 2 tiles côte à côte */}
            <Animated.View entering={FadeInUp.delay(690).duration(400)} style={s.tilesRow}>
              <View style={s.amberTile}>
                <Text style={s.tileLabel}>Chez les amis</Text>
                <Text style={s.tileRank}>#{data.avgRank}</Text>
              </View>
              <GlassCard style={s.badgeTile}>
                <Text style={s.tileLabel}>Badge du mois</Text>
                <Text style={s.tileBadge} numberOfLines={1}>{data.rarestBadgeEmoji} {data.rarestBadge}</Text>
              </GlassCard>
            </Animated.View>
          </View>

          <View style={s.spacer} />

          {/* Partage */}
          <NeonButton title="Partager 📤" onPress={handleShare} />
          <Text style={s.shareHint}>WhatsApp · Instagram</Text>
        </ScrollView>
      )}
    </View>
  );
}

const HALO_SIZE = 220;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  halo: {
    position: 'absolute', width: HALO_SIZE, height: HALO_SIZE,
    borderRadius: HALO_SIZE / 2, opacity: 0.16,
  },

  closeBtn: {
    position: 'absolute', top: 58, right: 20, zIndex: 10,
    width: 36, height: 36, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },

  content: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 92, paddingBottom: 46 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  wrappedLabel: { ...Fonts.label, letterSpacing: 3 },
  title: { ...Fonts.display, fontSize: 32, marginTop: 18, letterSpacing: 0.4 },

  // Total géant
  mainStat: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 8 },
  mainNumber: {
    ...Fonts.display, fontSize: 118, lineHeight: 112, color: Colors.amber,
    ...Glow.textAmberBig,
  },
  mainUnit: { paddingBottom: 12 },
  mainUnitTop: { ...Fonts.bodyBold, fontSize: 17 },
  mainUnitSub: { ...Fonts.bodyBold, fontSize: 17, color: Colors.textMuted },

  // Rows glass
  rows: { gap: 9, marginTop: 24 },
  row: {
    padding: 14, borderRadius: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.09)',
  },
  rowLabel: { ...Fonts.label, letterSpacing: 1 },
  rowRight: { alignItems: 'flex-end', maxWidth: '60%' },
  rowValue: { ...Fonts.display, fontSize: 20 },
  rowSub: { ...Fonts.small, fontSize: 12 },

  // Tiles
  tilesRow: { flexDirection: 'row', gap: 9 },
  amberTile: {
    flex: 1, padding: 14, borderRadius: 14,
    backgroundColor: 'rgba(255,149,0,0.10)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.40)',
    boxShadow: '0 0 18px rgba(255,149,0,0.18)',
  },
  badgeTile: { flex: 1.4, padding: 14, borderRadius: 14, justifyContent: 'center' },
  tileLabel: { ...Fonts.label, fontSize: 11.5, letterSpacing: 1 },
  tileRank: { ...Fonts.display, fontSize: 26, color: Colors.amber, ...Glow.textAmber, marginTop: 2 },
  tileBadge: { ...Fonts.display, fontSize: 20, marginTop: 4 },

  spacer: { flex: 1, minHeight: 24 },
  shareHint: { ...Fonts.small, fontSize: 11.5, textAlign: 'center', marginTop: 10 },
});
