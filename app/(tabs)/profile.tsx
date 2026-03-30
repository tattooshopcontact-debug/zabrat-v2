import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { MOCK_BADGES, LEVEL_INFO } from '../../constants/mockData';
import { Avatar } from '../../components/Avatar';
import { BADGE_IMAGES, LEVEL_IMAGES } from '../../constants/badgeImages';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const level = LEVEL_INFO[user?.level ?? 1];
  const unlockedCount = MOCK_BADGES.filter((b) => b.unlocked).length;
  const pct = user
    ? Math.min(((user.total_beers - level.min) / (level.max - level.min + 1)) * 100, 100)
    : 0;

  return (
    <SafeAreaView style={s.container} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={s.topBar}>
          <View style={{ width: 36 }} />
          <Text style={s.topTitle}>Profil</Text>
          <Pressable style={s.settingsBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={18} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Avatar + name */}
        <View style={s.profileCard}>
          <View style={s.avatarGlow}>
            <Avatar initials="FA" color={Colors.primary} size={72} />
          </View>
          <Text style={s.name}>{user?.display_name ?? 'User'}</Text>
          <Text style={s.username}>@{user?.username ?? 'user'}</Text>

          {/* Level badge with emblem */}
          <View style={s.levelRow}>
            {LEVEL_IMAGES[user?.level ?? 1] && (
              <Image source={LEVEL_IMAGES[user?.level ?? 1]} style={s.levelEmblem} resizeMode="contain" />
            )}
            <View style={s.levelBadge}>
              <Text style={s.levelEmoji}>{level.emoji}</Text>
              <Text style={s.levelName}>{level.name}</Text>
              <Text style={s.levelNum}>Niv. {user?.level}</Text>
            </View>
          </View>

          {/* XP bar */}
          <View style={s.xpBarBg}>
            <View style={[s.xpBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={s.xpText}>{Math.round(pct)}% vers le niveau suivant</Text>
        </View>

        {/* Quick stats */}
        <View style={s.quickRow}>
          <View style={s.quickItem}>
            <Text style={s.quickValue}>{user?.total_beers ?? 0}</Text>
            <Text style={s.quickEmoji}>🍺</Text>
            <Text style={s.quickLabel}>Total</Text>
          </View>
          <View style={s.quickDivider} />
          <View style={s.quickItem}>
            <Text style={s.quickValue}>12</Text>
            <Text style={s.quickEmoji}>📍</Text>
            <Text style={s.quickLabel}>Bars</Text>
          </View>
          <View style={s.quickDivider} />
          <Pressable style={s.quickItem} onPress={() => router.push('/friends')}>
            <Text style={s.quickValue}>8</Text>
            <Text style={s.quickEmoji}>👥</Text>
            <Text style={s.quickLabel}>Amis →</Text>
          </Pressable>
        </View>

        {/* Badges */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>🏅 Mes Badges</Text>
            <View style={s.badgeCountBadge}>
              <Text style={s.badgeCountText}>{unlockedCount}/{MOCK_BADGES.length}</Text>
            </View>
          </View>
          <View style={s.badgeGrid}>
            {MOCK_BADGES.map((badge) => {
              const badgeImage = badge.unlocked ? BADGE_IMAGES[badge.name] : null;
              return (
                <View key={badge.id} style={[s.badgeSlot, badge.unlocked && s.badgeUnlocked, !badge.unlocked && s.badgeLocked]}>
                  {badgeImage ? (
                    <Image source={badgeImage} style={s.badgeImage} resizeMode="contain" />
                  ) : (
                    <Text style={[s.badgeEmoji, !badge.unlocked && { opacity: 0.3 }]}>
                      {badge.unlocked ? badge.emoji : '🔒'}
                    </Text>
                  )}
                  <Text style={[s.badgeName, !badge.unlocked && { opacity: 0.3 }]} numberOfLines={1}>
                    {badge.name}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Wrapped */}
        <Pressable style={s.wrappedCard} onPress={() => router.push('/wrapped')}>
          <View style={s.wrappedLeft}>
            <Text style={s.wrappedEmoji}>🎵</Text>
            <View>
              <Text style={s.wrappedTitle}>Mon Zabrat de Mars 2026</Text>
              <Text style={s.wrappedSub}>Ton résumé du mois est prêt !</Text>
            </View>
          </View>
          <Text style={s.wrappedCta}>Voir →</Text>
        </Pressable>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  settingsBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },

  // Profile card
  profileCard: {
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20,
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: Colors.surface, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.border, paddingTop: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 5,
  },
  avatarGlow: {
    borderRadius: 44, padding: 4,
    borderWidth: 2, borderColor: 'rgba(245,166,35,0.4)',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16,
    marginBottom: 12,
  },
  name: { fontSize: 24, fontWeight: '800', color: Colors.text },
  username: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },

  levelRow: { marginTop: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelEmblem: { width: 44, height: 44 },
  levelBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,166,35,0.10)', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
  },
  levelEmoji: { fontSize: 18 },
  levelName: { color: Colors.primary, fontWeight: '700', fontSize: 13 },
  levelNum: { color: Colors.textMuted, fontSize: 11 },

  xpBarBg: {
    width: '80%', height: 8, backgroundColor: Colors.surface2,
    borderRadius: 4, overflow: 'hidden',
  },
  xpBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 4 },
  xpText: { fontSize: 10, color: Colors.textMuted, marginTop: 6 },

  // Quick stats
  quickRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 20,
    backgroundColor: Colors.surface, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: Colors.border,
  },
  quickItem: { flex: 1, alignItems: 'center' },
  quickDivider: { width: 1, backgroundColor: Colors.border },
  quickValue: { fontSize: 24, fontWeight: '900', color: Colors.primary },
  quickEmoji: { fontSize: 14, marginTop: 2 },
  quickLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },

  // Badges
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  badgeCountBadge: {
    backgroundColor: Colors.surface, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeCountText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeSlot: {
    width: '22.5%', aspectRatio: 0.82,
    backgroundColor: Colors.surface, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', padding: 6,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeUnlocked: {
    borderColor: 'rgba(76,175,80,0.3)',
    shadowColor: '#4CAF50', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1, shadowRadius: 8,
  },
  badgeLocked: { opacity: 0.4 },
  badgeImage: { width: 40, height: 40, marginBottom: 2 },
  badgeEmoji: { fontSize: 24, marginBottom: 3 },
  badgeName: { fontSize: 8, color: Colors.text, textAlign: 'center', fontWeight: '600' },

  // Wrapped
  wrappedCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginHorizontal: 16, backgroundColor: Colors.surface, borderRadius: 18,
    padding: 18, borderWidth: 1, borderColor: Colors.primary,
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08, shadowRadius: 12,
  },
  wrappedLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  wrappedEmoji: { fontSize: 28 },
  wrappedTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  wrappedSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  wrappedCta: { color: Colors.primary, fontWeight: '800', fontSize: 14 },
});
