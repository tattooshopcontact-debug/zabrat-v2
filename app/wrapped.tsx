import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { shareWrapped } from '../lib/shareService';
import { Colors, Fonts } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

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

export default function WrappedScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<WrappedData | null>(null);

  useEffect(() => {
    loadWrapped();
  }, []);

  const loadWrapped = async () => {
    if (!user) return;

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const monthName = now.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

    // Nombre de bières ce mois
    const { count: beerCount } = await supabase
      .from('beer_logs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', monthStart);

    // Bar le plus visité
    const { data: barVisits } = await supabase
      .from('bar_checkins')
      .select('bar_id, bars!bar_checkins_bar_id_fkey(name)')
      .eq('user_id', user.id)
      .gte('checked_in_at', monthStart);

    let favoriteBar = 'Aucun';
    let favBarVisits = 0;
    if (barVisits && barVisits.length > 0) {
      const counts = new Map<string, { name: string; count: number }>();
      for (const v of barVisits as any[]) {
        const name = v.bars?.name ?? 'Bar';
        const existing = counts.get(v.bar_id);
        if (existing) existing.count++;
        else counts.set(v.bar_id, { name, count: 1 });
      }
      const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
      if (sorted[0]) { favoriteBar = sorted[0].name; favBarVisits = sorted[0].count; }
    }

    // Badge le plus rare ce mois
    const { data: badges } = await supabase
      .from('user_badges')
      .select('badges!user_badges_badge_id_fkey(name, icon, rarity)')
      .eq('user_id', user.id)
      .gte('earned_at', monthStart)
      .order('earned_at', { ascending: false });

    let rarestBadge = 'Aucun';
    let rarestBadgeEmoji = '🏅';
    const rarityOrder = ['legendary', 'epic', 'rare', 'common', 'seasonal'];
    if (badges && badges.length > 0) {
      const sorted = (badges as any[]).sort((a, b) =>
        rarityOrder.indexOf(a.badges?.rarity ?? 'common') - rarityOrder.indexOf(b.badges?.rarity ?? 'common')
      );
      rarestBadge = sorted[0]?.badges?.name ?? 'Aucun';
      rarestBadgeEmoji = sorted[0]?.badges?.icon ?? '🏅';
    }

    const totalBeers = beerCount ?? 0;
    const liters = (totalBeers * 0.33).toFixed(1);

    setData({
      month: monthName,
      totalBeers,
      favoriteBar,
      favBarVisits,
      bestFriend: 'Aymen', // TODO: calculer depuis beer_logs.with_friends
      bestFriendNights: 3,
      rarestBadge,
      rarestBadgeEmoji,
      avgRank: 4,
      liters,
    });
  };

  if (!data) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Pressable style={styles.closeBtn} onPress={() => router.back()}>
        <Ionicons name="close" size={24} color={Colors.text} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.wrappedLabel}>🎵 Ton Zabrat de</Text>
        <Text style={styles.wrappedMonth}>{data.month}</Text>

        {/* Main stat */}
        <View style={styles.mainStat}>
          <Text style={styles.mainNumber}>{data.totalBeers}</Text>
          <Text style={styles.mainLabel}>bières ce mois 🍺</Text>
        </View>

        {/* Stats grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📍</Text>
            <Text style={styles.statValue}>{data.favoriteBar}</Text>
            <Text style={styles.statLabel}>Bar préféré ({data.favBarVisits} visites)</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statValue}>{data.bestFriend}</Text>
            <Text style={styles.statLabel}>Meilleur ami de soirée ({data.bestFriendNights} soirs)</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>{data.rarestBadgeEmoji}</Text>
            <Text style={styles.statValue}>{data.rarestBadge}</Text>
            <Text style={styles.statLabel}>Badge le plus rare</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statValue}>#{data.avgRank}</Text>
            <Text style={styles.statLabel}>Rang moyen</Text>
          </View>
        </View>

        {/* Fun stat */}
        <View style={styles.funStat}>
          <Text style={styles.funText}>
            Tu as bu l'équivalent de {data.liters} litres 🍻
          </Text>
        </View>

        {/* Share */}
        <Pressable style={styles.shareBtn}>
          <Ionicons name="share-social" size={18} color="#000" />
          <Text style={styles.shareBtnText}>Partager sur Instagram / WhatsApp</Text>
        </Pressable>
        <Pressable style={[styles.shareBtn, { backgroundColor: '#25D366' }]} onPress={() => {
          if (data) shareWrapped(data.month, data.totalBeers, data.favoriteBar);
        }}>
          <Ionicons name="logo-whatsapp" size={18} color="#FFF" />
          <Text style={[styles.shareBtnText, { color: '#FFF' }]}>WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  closeBtn: { position: 'absolute', top: 50, right: 16, zIndex: 10, padding: 8 },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  wrappedLabel: { ...Fonts.label, fontSize: 14, marginBottom: 4 },
  wrappedMonth: { ...Fonts.screenTitle, fontSize: 28, color: Colors.primary, marginBottom: 30, textTransform: 'capitalize' },
  mainStat: { alignItems: 'center', marginBottom: 32 },
  mainNumber: { fontSize: 72, fontWeight: '900', color: Colors.primary },
  mainLabel: { ...Fonts.body, fontSize: 18, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24, width: '100%' },
  statCard: {
    flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: 16,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statValue: { ...Fonts.bodyBold, fontSize: 16, textAlign: 'center' },
  statLabel: { ...Fonts.label, fontSize: 10, textAlign: 'center', marginTop: 4 },
  funStat: {
    backgroundColor: 'rgba(245,166,35,0.12)', borderRadius: 16, padding: 20,
    width: '100%', alignItems: 'center', borderWidth: 1, borderColor: Colors.primary, marginBottom: 24,
  },
  funText: { ...Fonts.bodyBold, fontSize: 16, textAlign: 'center' },
  shareBtn: {
    flexDirection: 'row', gap: 8, backgroundColor: Colors.primary,
    borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center',
  },
  shareBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
});
