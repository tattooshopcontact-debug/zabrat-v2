import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  Dimensions, TextInput, ActivityIndicator, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Step = 1 | 2 | 3 | 4 | 5;

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { user, devMode, setUser, fetchProfile } = useAuthStore();

  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState('+216');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const goToStep = (s: Step) => {
    setStep(s);
    scrollRef.current?.scrollTo({ x: (s - 1) * SCREEN_WIDTH, animated: true });
  };

  // Step 2: Send OTP
  const handleSendOtp = async () => {
    if (devMode) { goToStep(3); return; }
    setLoading(true); setError('');
    const { error: e } = await supabase.auth.signInWithOtp({ phone });
    setLoading(false);
    if (e) { setError(e.message); return; }
    goToStep(3);
  };

  // Step 3: Verify OTP (skip in dev)
  const handleVerifyOtp = async () => {
    if (devMode) { goToStep(4); return; }
    setLoading(true); setError('');
    const { data, error: e } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
    setLoading(false);
    if (e) { setError(e.message); return; }
    if (data.session) {
      useAuthStore.getState().setSession(data.session);
    }
    goToStep(4);
  };

  // Step 4: Create profile
  const handleCreateProfile = async () => {
    if (!displayName.trim()) { setError('Prénom obligatoire'); return; }
    if (devMode) { goToStep(5); return; }
    setLoading(true); setError('');
    const session = useAuthStore.getState().session;
    if (!session) return;
    const uname = username.trim().toLowerCase().replace(/\s/g, '_') || displayName.trim().toLowerCase().replace(/\s/g, '_');
    const { error: e } = await supabase.from('users').insert({
      id: session.user.id, phone, display_name: displayName.trim(), username: uname,
    });
    setLoading(false);
    if (e) { setError(e.message); return; }
    await fetchProfile(session.user.id);
    goToStep(5);
  };

  // Step 5: First beer → go to feed
  const handleFirstBeer = () => {
    router.replace('/(tabs)/feed');
  };

  return (
    <View style={styles.container}>
      {/* Progress dots */}
      <View style={styles.dots}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View key={s} style={[styles.dot, step >= s && styles.dotActive]} />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
      >
        {/* Step 1: Splash — avec image générée */}
        <View style={styles.page}>
          <Image source={require('../assets/images/app-icon.png')} style={styles.splashImage} resizeMode="contain" />
          <Text style={styles.splashTitle}>Zabrat</Text>
          <Text style={styles.splashTagline}>Track. Share. Compete.</Text>
          <View style={styles.splashFeatures}>
            <Text style={styles.feature}>📊 Traque tes soirées</Text>
            <Text style={styles.feature}>🏆 Défie tes amis</Text>
            <Text style={styles.feature}>🗺️ Vois qui sort ce soir</Text>
          </View>
          <Pressable style={styles.ctaBtn} onPress={() => goToStep(2)}>
            <Text style={styles.ctaBtnText}>Commencer</Text>
          </Pressable>
        </View>

        {/* Step 2: Phone */}
        <View style={styles.page}>
          <Text style={styles.stepEmoji}>📱</Text>
          <Text style={styles.stepTitle}>Ton numéro</Text>
          <Text style={styles.stepSub}>On t'envoie un code par SMS</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+216 XX XXX XXX"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.testHint}>En test : utilise le code 123456</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.ctaBtn} onPress={handleSendOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.ctaBtnText}>Envoyer le code</Text>}
          </Pressable>
        </View>

        {/* Step 3: OTP (skipped in devMode) */}
        <View style={styles.page}>
          <Text style={styles.stepEmoji}>🔐</Text>
          <Text style={styles.stepTitle}>Code de vérification</Text>
          <Text style={styles.stepSub}>Entre le code reçu par SMS</Text>
          <TextInput
            style={[styles.input, styles.otpInput]}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor={Colors.textMuted}
            textAlign="center"
          />
          <Text style={styles.testHint}>En test : utilise le code 123456</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.ctaBtn} onPress={handleVerifyOtp} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.ctaBtnText}>Vérifier</Text>}
          </Pressable>
        </View>

        {/* Step 4: Profile */}
        <View style={styles.page}>
          <Text style={styles.stepEmoji}>👤</Text>
          <Text style={styles.stepTitle}>Ton profil</Text>
          <Text style={styles.stepSub}>Comment on t'appelle ?</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Ton prénom"
            placeholderTextColor={Colors.textMuted}
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={username}
            onChangeText={setUsername}
            placeholder="Pseudo (optionnel)"
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable style={styles.ctaBtn} onPress={handleCreateProfile} disabled={loading}>
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.ctaBtnText}>Continuer</Text>}
          </Pressable>
        </View>

        {/* Step 5: First beer! */}
        <View style={styles.page}>
          <Text style={styles.splashEmoji}>🎉</Text>
          <Text style={styles.stepTitle}>C'est parti !</Text>
          <Text style={styles.stepSub}>Logger ta première bière pour débloquer ton premier badge</Text>
          <View style={styles.badgePreview}>
            <Text style={styles.badgePreviewEmoji}>🥤</Text>
            <Text style={styles.badgePreviewName}>Premier Verre</Text>
            <Text style={styles.badgePreviewDesc}>Logger ta 1ère bière</Text>
          </View>
          <Pressable style={styles.ctaBtn} onPress={handleFirstBeer}>
            <Text style={styles.ctaBtnText}>🍺 Logger ma première bière !</Text>
          </Pressable>
          <Pressable style={styles.skipBtn} onPress={() => router.replace('/(tabs)/feed')}>
            <Text style={styles.skipText}>Plus tard →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  splashImage: { width: 120, height: 120, marginBottom: 16, borderRadius: 28 },
  dots: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    paddingTop: 60, paddingBottom: 20,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  scroll: { flex: 1 },
  page: {
    width: SCREEN_WIDTH, paddingHorizontal: 32,
    justifyContent: 'center', alignItems: 'center',
  },
  splashEmoji: { fontSize: 80, marginBottom: 16 },
  splashTitle: { ...Fonts.screenTitle, fontSize: 40, marginBottom: 8 },
  splashTagline: { ...Fonts.label, fontSize: 16, marginBottom: 40 },
  splashFeatures: { gap: 12, marginBottom: 40, alignItems: 'flex-start' },
  feature: { ...Fonts.body, fontSize: 16 },
  stepEmoji: { fontSize: 56, marginBottom: 16 },
  stepTitle: { ...Fonts.screenTitle, fontSize: 28, marginBottom: 8 },
  stepSub: { ...Fonts.label, fontSize: 14, marginBottom: 30, textAlign: 'center' },
  input: {
    width: '100%', height: 52, backgroundColor: Colors.surface,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.border,
    color: Colors.text, fontSize: 18, paddingHorizontal: 16,
  },
  otpInput: { fontSize: 28, fontWeight: '700', letterSpacing: 12 },
  testHint: { color: Colors.primary, fontSize: 11, marginTop: 8, fontWeight: '600' },
  error: { color: Colors.danger, fontSize: 12, marginTop: 8, textAlign: 'center' },
  ctaBtn: {
    width: '100%', height: 52, backgroundColor: Colors.primary,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 24,
  },
  ctaBtnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  badgePreview: {
    backgroundColor: Colors.surface, borderRadius: 16, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.primary,
    marginVertical: 24, width: '80%',
  },
  badgePreviewEmoji: { fontSize: 48, marginBottom: 8 },
  badgePreviewName: { ...Fonts.bodyBold, fontSize: 18 },
  badgePreviewDesc: { ...Fonts.label, marginTop: 4 },
  skipBtn: { marginTop: 16, padding: 12 },
  skipText: { color: Colors.textMuted, fontSize: 14 },
});
