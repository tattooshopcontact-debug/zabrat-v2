import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Colors, Fonts, Glow, Gradients, Radius } from '../constants/theme';
import { BEER_TYPES } from '../constants/mockData';
import { useAuthStore } from '../stores/authStore';
import { logBeer } from '../lib/beerService';
import { getBarsWithCheckins, Bar } from '../lib/mapService';
import { getUserStats } from '../lib/statsService';
import { Confetti } from '../components/Confetti';
import BeerGlass, { BeerType } from '../components/neon/BeerGlass';
import NeonButton from '../components/neon/NeonButton';

const CONFETTI_COLORS = ['#FF9500', '#FF6B35', '#00E5FF', '#FFFFFF'];

export default function LogBeerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, devMode, fetchProfile } = useAuthStore();

  const [selectedType, setSelectedType] = useState<BeerType | null>(null);
  const [bars, setBars] = useState<Bar[]>([]);
  const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [tonightCount, setTonightCount] = useState(1);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  // logBeer() ne retourne pas (encore) de badge fraîchement débloqué — le chip reste prêt.
  const [unlockedBadge] = useState<string | null>(null);

  // Pop de la chope sur l'écran succès : scale 0.3 → 1 (spring)
  const popScale = useSharedValue(0.3);
  const popStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popScale.value }],
  }));

  useEffect(() => {
    if (logged) {
      popScale.value = withSpring(1, { damping: 7 });
    }
  }, [logged]);

  // Chips bars : liste depuis mapService (pas de présélection sans géoloc)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getBarsWithCheckins(user.id)
      .then((data) => { if (!cancelled) setBars(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id]);

  // Navigation sûre : back si possible, sinon redirect feed
  const safeGoBack = () => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/feed');
    }
  };

  const triggerHaptic = async () => {
    if (Platform.OS !== 'web') {
      try {
        const Haptics = require('expo-haptics');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || loading) return;

    if (!user) {
      setEarnedPoints(1);
      setTonightCount(1);
      setLogged(true);
      setShowConfetti(true);
      triggerHaptic();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const selectedBar = bars.find((b) => b.id === selectedBarId);
      const result = await logBeer({
        userId: user.id,
        beerType: selectedType,
        barName: selectedBar?.name,
        latitude: selectedBar?.latitude,
        longitude: selectedBar?.longitude,
      });

      setEarnedPoints(result.points);
      setLogged(true);
      setShowConfetti(true);
      triggerHaptic();

      // Compteur réel « ce soir » (non bloquant)
      getUserStats(user.id)
        .then((s) => setTonightCount(Math.max(1, s.tonight)))
        .catch(() => {});

      // Refresh profil silencieux : une erreur ici ne doit pas masquer le succès du log
      if (!devMode) {
        fetchProfile(user.id).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du log');
      setLoading(false);
    }
  };

  // ── Écran succès ─────────────────────────────────────────
  if (logged) {
    return (
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <Confetti visible={showConfetti} colors={CONFETTI_COLORS} />
        <View style={styles.successContent}>
          <Animated.View style={popStyle}>
            <BeerGlass type={selectedType ?? 'blonde'} size={120} selected />
          </Animated.View>
          <Text style={styles.plusOne}>+1 !</Text>
          <Text style={styles.successCount}>T'en es à {tonightCount} ce soir 🔥</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.pointsChip}>+{earnedPoints} pts</Text>
            {unlockedBadge && (
              <Text style={styles.badgeChip}>🏅 Badge « {unlockedBadge} » débloqué</Text>
            )}
          </View>
        </View>
        <View style={[styles.successCta, { bottom: insets.bottom + 40 }]}>
          <NeonButton title="Retour à la soirée" onPress={safeGoBack} />
        </View>
      </View>
    );
  }

  // ── Modal LOG ────────────────────────────────────────────
  return (
    <View style={styles.overlay}>
      <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>C'est quoi ce soir ?</Text>
          <Pressable
            onPress={safeGoBack}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Grille 3×2 des 6 types */}
        <View style={styles.typeGrid}>
          {BEER_TYPES.map((t) => {
            const key = t.key as BeerType;
            const active = selectedType === key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setSelectedType(key)}
                style={({ pressed }) => [
                  styles.typeTile,
                  active && styles.typeTileActive,
                  pressed && styles.pressed,
                ]}
              >
                {active && (
                  <LinearGradient
                    colors={[...Gradients.amberSoft]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.6, y: 1 }}
                    style={styles.tileGradient}
                  />
                )}
                <BeerGlass type={key} size={44} selected={active} />
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Chips bars */}
        {bars.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Où ça ?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.barScroll}
              contentContainerStyle={styles.barRow}
            >
              {bars.map((b) => {
                const active = selectedBarId === b.id;
                return (
                  <Pressable
                    key={b.id}
                    onPress={() => setSelectedBarId(active ? null : b.id)}
                    style={({ pressed }) => [
                      styles.barChip,
                      active && styles.barChipActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.barChipText, active && styles.barChipTextActive]}>
                      {b.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        )}

        {/* TODO post-refonte : toggle visibilité quand beer_logs.visibility existera (migration + service + filtre feed) */}

        {/* CTA */}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <NeonButton
          title="VALIDER 🍺"
          hint={selectedType ? undefined : "Choisis ta bière d'abord"}
          disabled={!selectedType || loading}
          onPress={handleSubmit}
          style={styles.cta}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(6,6,10,0.88)' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 22 },
  pressed: { transform: [{ scale: 0.95 }] },

  // Header
  headerRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: 12,
  },
  title: { ...Fonts.display, fontSize: 27, lineHeight: 32, letterSpacing: 0.4, flex: 1 },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },

  // Grille types
  typeGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22,
  },
  typeTile: {
    flexBasis: '30%', flexGrow: 1, aspectRatio: 1,
    borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.045)',
    alignItems: 'center', justifyContent: 'center', gap: 8,
    overflow: 'hidden',
  },
  typeTileActive: {
    borderColor: Colors.primary, borderWidth: 1.5,
    boxShadow: Glow.card,
  },
  tileGradient: { ...StyleSheet.absoluteFillObject, borderRadius: 16.5 },
  typeLabel: { fontFamily: 'Outfit_700Bold', fontSize: 13.5, color: Colors.text },
  typeLabelActive: { color: Colors.primary },

  // Section labels
  sectionLabel: { ...Fonts.label, marginTop: 24, marginBottom: 10 },

  // Chips bars
  barScroll: { marginHorizontal: -22 },
  barRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 22, paddingVertical: 2 },
  barChip: {
    paddingVertical: 9, paddingHorizontal: 16, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  barChipActive: {
    backgroundColor: 'rgba(255,149,0,0.16)',
    borderWidth: 1.5, borderColor: Colors.primary,
    boxShadow: '0 0 14px rgba(255,149,0,0.30)',
  },
  barChipText: { fontFamily: 'Outfit_700Bold', fontSize: 13.5, color: Colors.textMuted },
  barChipTextActive: { color: Colors.primary },

  // CTA
  cta: { marginTop: 30 },
  errorText: { color: Colors.danger, fontSize: 12, textAlign: 'center', marginTop: 16 },

  // Écran succès
  successContent: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  plusOne: {
    ...Fonts.display, fontSize: 56, lineHeight: 60, color: Colors.primary,
    marginTop: 18, ...Glow.textAmberBig,
  },
  successCount: {
    fontFamily: 'Outfit_800ExtraBold', fontSize: 18, color: Colors.text, marginTop: 12,
  },
  rewardRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: 10, marginTop: 22,
  },
  pointsChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.pill,
    fontFamily: 'Outfit_800ExtraBold', fontSize: 13.5, color: Colors.primary,
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.45)',
    overflow: 'hidden',
  },
  badgeChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.pill,
    fontFamily: 'Outfit_800ExtraBold', fontSize: 13.5, color: Colors.cyan,
    backgroundColor: 'rgba(0,229,255,0.10)',
    borderWidth: 1, borderColor: 'rgba(0,229,255,0.40)',
    boxShadow: Glow.live,
    overflow: 'hidden',
  },
  successCta: { position: 'absolute', left: 32, right: 32 },
});
