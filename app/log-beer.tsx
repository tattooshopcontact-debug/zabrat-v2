import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../constants/theme';
import { BEER_TYPES } from '../constants/mockData';
import { useAuthStore } from '../stores/authStore';
import { logBeer } from '../lib/beerService';
import { Confetti } from '../components/Confetti';
import { BEER_ICON_MAP } from '../components/BeerIcons';

export default function LogBeerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { user, devMode, fetchProfile } = useAuthStore();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [barName, setBarName] = useState('');
  const [logged, setLogged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [error, setError] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [noTypeError, setNoTypeError] = useState(false);

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

  const handleLog = async () => {
    // Bug #6 : validation avec feedback
    if (!selectedType) {
      setNoTypeError(true);
      return;
    }
    setNoTypeError(false);

    if (!user) {
      setLogged(true);
      setShowConfetti(true);
      setEarnedPoints(1);
      triggerHaptic();
      setTimeout(() => safeGoBack(), 2000);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await logBeer({
        userId: user.id,
        beerType: selectedType,
        barName: barName || undefined,
      });

      setEarnedPoints(result.points);
      setLogged(true);
      setShowConfetti(true);
      triggerHaptic();

      if (!devMode) {
        await fetchProfile(user.id);
      }

      // Bug #1 : utiliser safeGoBack au lieu de router.back()
      setTimeout(() => safeGoBack(), 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du log');
      setLoading(false);
    }
  };

  if (logged) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Confetti visible={showConfetti} />
        <Text style={styles.successEmoji}>🍺</Text>
        <Text style={styles.successText}>Loggé !</Text>
        <Text style={styles.successSub}>
          +{earnedPoints} point{earnedPoints > 1 ? 's' : ''} ajouté{earnedPoints > 1 ? 's' : ''}
        </Text>
        {/* Bouton de secours si la redirection automatique échoue */}
        <Pressable style={styles.backToFeed} onPress={() => router.replace('/(tabs)/feed')}>
          <Text style={styles.backToFeedText}>← Retour au feed</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={safeGoBack} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>🍺 Nouvelle bière</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Beer type selector */}
        <Text style={styles.sectionLabel}>Type de bière</Text>
        {/* Bug #6 : message d'erreur si aucun type */}
        {noTypeError && (
          <Text style={styles.typeError}>⚠️ Sélectionne un type de bière</Text>
        )}
        <View style={styles.typeGrid}>
          {BEER_TYPES.map((t) => {
            const IconComponent = BEER_ICON_MAP[t.key];
            const isActive = selectedType === t.key;
            return (
              <Pressable
                key={t.key}
                style={[
                  styles.typeBtn,
                  isActive && styles.typeBtnActive,
                  noTypeError && !selectedType && styles.typeBtnError,
                ]}
                onPress={() => { setSelectedType(t.key); setNoTypeError(false); }}
              >
                {IconComponent ? (
                  <IconComponent size={56} active={isActive} />
                ) : (
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Bar field */}
        <Text style={styles.sectionLabel}>📍 Localisation</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom du bar (optionnel)..."
          placeholderTextColor={Colors.textMuted}
          value={barName}
          onChangeText={setBarName}
        />
        <Text style={styles.geoHint}>Géolocalisation auto disponible sur mobile</Text>

        {/* Friends tag — Bug #2 : le bouton ne navigue plus, il est juste informatif */}
        <Text style={styles.sectionLabel}>👥 Avec des amis ?</Text>
        <View style={styles.skipBtn}>
          <Text style={styles.skipText}>Bientôt disponible — tag tes amis après le log</Text>
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaWrapper}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Pressable
          style={[styles.ctaButton, loading && styles.ctaDisabled]}
          onPress={handleLog}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.ctaText}>✅ LOGGER !</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  successContainer: { alignItems: 'center', justifyContent: 'center' },
  successEmoji: { fontSize: 64, marginBottom: 16 },
  successText: { ...Fonts.screenTitle, fontSize: 28, color: Colors.success },
  successSub: { ...Fonts.label, marginTop: 8, fontSize: 14 },
  backToFeed: { marginTop: 24, padding: 12 },
  backToFeedText: { color: Colors.textMuted, fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  closeBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Fonts.screenTitle, fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 },
  sectionLabel: { ...Fonts.bodyBold, marginBottom: 12, marginTop: 8 },
  typeError: { color: Colors.danger, fontSize: 12, fontWeight: '600', marginBottom: 8 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  typeBtn: {
    width: '30%', backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(245,166,35,0.12)' },
  typeBtnError: { borderColor: Colors.danger },
  typeEmoji: { fontSize: 28, marginBottom: 6 },
  typeLabel: { ...Fonts.body, fontSize: 13 },
  typeLabelActive: { color: Colors.primary, fontWeight: '700' },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, borderWidth: 1,
    borderColor: Colors.border, padding: 14, color: Colors.text, fontSize: 15, marginBottom: 6,
  },
  geoHint: { ...Fonts.label, fontSize: 10, marginBottom: 24 },
  skipBtn: {
    backgroundColor: Colors.surface2, borderRadius: 10, padding: 12,
    alignItems: 'center', marginBottom: 20,
  },
  skipText: { ...Fonts.label, fontSize: 12 },
  ctaWrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 30, backgroundColor: Colors.background,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  ctaButton: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: 'center' },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { color: '#000000', fontSize: 18, fontWeight: '800' },
  errorText: { color: Colors.danger, fontSize: 12, textAlign: 'center', marginBottom: 8 },
});
