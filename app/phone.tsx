import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  FadeInUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming, cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Glow, Gradients } from '../constants/theme';
import NeonButton from '../components/neon/NeonButton';
import { RingAvatar } from '../components/neon/RingAvatar';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

type Step = 'phone' | 'otp' | 'profile';

const STEPS: Step[] = ['phone', 'otp', 'profile'];
const AMBER_60 = 'rgba(255,149,0,0.6)';

// ─── Caret ambre clignotant (reanimated opacity loop) ───

function Caret({ height }: { height: number }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0, { duration: 550 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.caret, { height }, style]} />;
}

// ─── Clavier numérique custom (3×4) — rendu identique web/mobile ───

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

function NumPad({ onKey }: { onKey: (k: string) => void }) {
  return (
    <View style={styles.numpad}>
      {KEYS.map((k, i) =>
        k === '' ? (
          <View key={i} style={styles.numKeyEmpty} />
        ) : (
          <Pressable
            key={i}
            onPress={() => onKey(k)}
            accessibilityRole="button"
            accessibilityLabel={k === 'del' ? 'Effacer' : k}
            style={({ pressed }) => [
              styles.numKey,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            {k === 'del' ? (
              <Ionicons name="backspace-outline" size={21} color={Colors.textMuted} />
            ) : (
              <Text style={styles.numKeyText}>{k}</Text>
            )}
          </Pressable>
        ),
      )}
    </View>
  );
}

// ─── Écran ───

export default function PhoneScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [digits, setDigits] = useState(''); // 8 chiffres max, préfixe +216 implicite
  const [otp, setOtp] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { devMode, setSession, fetchProfile } = useAuthStore();

  const phone = `+216${digits}`;
  const fmtPhone = digits.replace(/(\d{2})(?=\d)/g, '$1 ');

  // Étape 1: Envoyer le code OTP
  const handleSendCode = async () => {
    if (devMode) {
      router.replace('/(tabs)/feed');
      return;
    }

    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithOtp({ phone });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setStep('otp');
  };

  // Étape 2: Vérifier le code OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError('');

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      setOtp('');
      return;
    }

    if (data.session) {
      setSession(data.session);

      // Vérifier si le profil existe déjà
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.session.user.id)
        .single();

      if (profile) {
        // Profil existant → aller au feed
        await fetchProfile(data.session.user.id);
        router.replace('/(tabs)/feed');
      } else {
        // Nouveau user → créer profil
        setStep('profile');
      }
    }
  };

  // Auto-submit à 6 chiffres après 450ms
  useEffect(() => {
    if (step !== 'otp' || otp.length !== 6 || loading) return;
    const timer = setTimeout(() => {
      handleVerifyOtp();
    }, 450);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  // Étape 3: Créer le profil
  const handleCreateProfile = async () => {
    if (!pseudo.trim()) {
      setError('Ton pseudo est obligatoire');
      return;
    }

    setLoading(true);
    setError('');

    const session = useAuthStore.getState().session;
    if (!session) return;

    const { error: insertError } = await supabase.from('users').insert({
      id: session.user.id,
      phone,
      display_name: pseudo.trim(),
      username: pseudo.trim().toLowerCase().replace(/\s/g, '_'),
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await fetchProfile(session.user.id);
    router.replace('/(tabs)/feed');
  };

  // ─── Saisie clavier custom ───

  const phoneKey = (k: string) => {
    setError('');
    setDigits((p) => (k === 'del' ? p.slice(0, -1) : p.length < 8 ? p + k : p));
  };

  const otpKey = (k: string) => {
    if (loading) return;
    setError('');
    setOtp((o) => (k === 'del' ? o.slice(0, -1) : o.length < 6 ? o + k : o));
  };

  const goBack = () => {
    // Back step par step — uniquement OTP → numéro (le profil suppose une session créée)
    if (step === 'otp') {
      setOtp('');
      setError('');
      setStep('phone');
    }
  };

  const stepIndex = STEPS.indexOf(step);
  const titles: Record<Step, [string, string]> = {
    phone: ['Ton numéro', "On t'envoie un code, c'est tout."],
    otp: ['Le code reçu', `Envoyé au +216 ${fmtPhone || '…'}`],
    profile: ['Ton pseudo', "C'est lui qui apparaîtra dans la ligue."],
  };

  const pseudoInitials = pseudo.trim() ? pseudo.trim().slice(0, 2).toUpperCase() : '?';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header : back + dots de progression */}
      <View style={styles.header}>
        {step === 'otp' && (
          <Pressable
            onPress={goBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Retour"
            style={({ pressed }) => [
              styles.backBtn,
              { transform: [{ scale: pressed ? 0.95 : 1 }] },
            ]}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </Pressable>
        )}
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i <= stepIndex && styles.dotDone,
                i === stepIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Titre de l'étape */}
      <Animated.View key={`t-${step}`} entering={FadeInUp.duration(400)} style={styles.titleBlock}>
        <Text style={styles.title}>{titles[step][0]}</Text>
        <Text style={styles.subtitle}>{titles[step][1]}</Text>
      </Animated.View>

      {/* Contenu central */}
      <Animated.View key={`c-${step}`} entering={FadeInUp.duration(400).delay(80)} style={styles.center}>
        {/* Étape 1: champ numéro */}
        {step === 'phone' && (
          <View style={styles.phoneField}>
            <View style={styles.prefixWrap}>
              <Text style={styles.prefix}>🇹🇳 +216</Text>
            </View>
            <View style={styles.phoneValueWrap}>
              <Text style={digits ? styles.phoneValue : styles.phonePlaceholder} numberOfLines={1}>
                {fmtPhone || '20 000 000'}
              </Text>
              <Caret height={26} />
            </View>
          </View>
        )}

        {/* Étape 2: 6 cases OTP */}
        {step === 'otp' && (
          <>
            <View style={styles.otpRow}>
              {Array.from({ length: 6 }, (_, i) => {
                const filled = i < otp.length;
                const current = i === otp.length;
                return (
                  <View
                    key={i}
                    style={[
                      styles.otpBox,
                      filled && styles.otpBoxFilled,
                      current && styles.otpBoxCurrent,
                    ]}
                  >
                    {filled ? (
                      <Text style={styles.otpDigit}>{otp[i]}</Text>
                    ) : current ? (
                      <Caret height={28} />
                    ) : null}
                  </View>
                );
              })}
            </View>
            {loading && <ActivityIndicator color={Colors.primary} style={styles.spinner} />}
          </>
        )}

        {/* Étape 3: avatar + pseudo */}
        {step === 'profile' && (
          <>
            <View style={styles.avatarWrap}>
              <RingAvatar initials={pseudoInitials} color={Colors.surface2} size={104} ring="amber" />
              <LinearGradient
                colors={[...Gradients.cta]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.2 }}
                style={styles.avatarPlus}
              >
                <Ionicons name="add" size={19} color={Colors.onAmber} />
              </LinearGradient>
            </View>
            <TextInput
              style={styles.pseudoInput}
              value={pseudo}
              onChangeText={(v) => { setError(''); setPseudo(v); }}
              placeholder="Ton pseudo"
              placeholderTextColor={Colors.textMuted}
              maxLength={16}
              autoCapitalize="none"
              textAlign="center"
            />
          </>
        )}

        {/* Erreur */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Note de test (étapes 1 et 2) */}
        {step !== 'profile' && (
          <Text style={styles.testNote}>En test : utilise le code 123456</Text>
        )}
      </Animated.View>

      {/* Bas d'écran : clavier custom + CTA */}
      <View style={styles.bottom}>
        {step === 'phone' && (
          <>
            <NumPad onKey={phoneKey} />
            <NeonButton
              title={loading ? 'Envoi…' : 'Recevoir mon code'}
              onPress={handleSendCode}
              disabled={loading || digits.length < 8}
            />
            {devMode && (
              <Pressable style={styles.devBypass} onPress={() => router.replace('/(tabs)/feed')}>
                <Text style={styles.devBypassText}>Passer en mode DEV →</Text>
              </Pressable>
            )}
          </>
        )}

        {step === 'otp' && <NumPad onKey={otpKey} />}

        {step === 'profile' && (
          <NeonButton
            title={loading ? 'Création…' : "C'est parti 🍺"}
            onPress={handleCreateProfile}
            disabled={loading || !pseudo.trim()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 64,
    paddingBottom: 36,
    paddingHorizontal: 28,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  dots: {
    flexDirection: 'row', gap: 5, alignItems: 'center',
    marginLeft: 'auto',
  },
  dot: {
    width: 7, height: 7, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dotDone: { backgroundColor: Colors.primary },
  dotActive: {
    width: 20,
    boxShadow: '0 0 8px rgba(255,149,0,0.6)',
  },
  // Titre
  titleBlock: { marginTop: 34, alignItems: 'center' },
  title: {
    ...Fonts.display, fontSize: 32, letterSpacing: 0.4,
    color: Colors.text, textAlign: 'center',
  },
  subtitle: {
    ...Fonts.bodyBold, fontSize: 13.5, color: Colors.textMuted,
    marginTop: 8, textAlign: 'center',
  },
  // Centre
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    width: '100%',
  },
  // Étape 1 — champ numéro
  phoneField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    height: 60,
    borderRadius: 18,
    width: '100%',
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: AMBER_60,
    boxShadow: Glow.card,
  },
  prefixWrap: {
    borderRightWidth: 1, borderRightColor: Colors.border,
    paddingRight: 12,
  },
  prefix: { ...Fonts.bodyBold, fontSize: 18, color: Colors.textMuted },
  phoneValueWrap: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  phoneValue: {
    ...Fonts.display, fontSize: 22, letterSpacing: 1.5,
    color: Colors.text,
  },
  phonePlaceholder: {
    ...Fonts.display, fontSize: 22, letterSpacing: 1.5,
    color: '#3A3A48',
  },
  caret: {
    width: 2, borderRadius: 1, marginLeft: 3,
    backgroundColor: Colors.primary,
  },
  // Étape 2 — OTP
  otpRow: { flexDirection: 'row', gap: 9 },
  otpBox: {
    width: 46, height: 58, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
  },
  otpBoxFilled: {
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1.5, borderColor: Colors.primary,
    boxShadow: Glow.card,
  },
  otpBoxCurrent: {
    borderWidth: 1.5, borderColor: AMBER_60,
    boxShadow: '0 0 14px rgba(255,149,0,0.15)',
  },
  otpDigit: { ...Fonts.display, fontSize: 27, color: Colors.primary },
  spinner: { marginTop: 4 },
  // Étape 3 — profil
  avatarWrap: { position: 'relative' },
  avatarPlus: {
    position: 'absolute', bottom: -2, right: -2,
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2.5, borderColor: Colors.background,
    alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 12px rgba(255,149,0,0.43)',
  },
  pseudoInput: {
    width: '100%', height: 58, borderRadius: 18,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5, borderColor: AMBER_60,
    boxShadow: Glow.card,
    color: Colors.text,
    fontFamily: 'Outfit_700Bold', fontSize: 20,
    paddingHorizontal: 16,
  },
  // Clavier custom
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  numKey: {
    width: '31.5%',
    flexGrow: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyEmpty: { width: '31.5%', flexGrow: 1, height: 52 },
  numKeyText: { ...Fonts.bodyBold, fontSize: 21, color: Colors.text },
  // Bas
  bottom: { width: '100%' },
  // Divers
  error: {
    ...Fonts.small, color: Colors.danger,
    textAlign: 'center',
  },
  testNote: {
    ...Fonts.small, fontSize: 12, color: Colors.primary,
    textAlign: 'center',
  },
  devBypass: { paddingVertical: 12, alignSelf: 'center' },
  devBypassText: { ...Fonts.bodyBold, fontSize: 14, color: Colors.danger },
});
