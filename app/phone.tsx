import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Fonts } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

type Step = 'phone' | 'otp' | 'profile';

export default function PhoneScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('+216');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { devMode, setSession, fetchProfile } = useAuthStore();

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

  // Étape 3: Créer le profil
  const handleCreateProfile = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Prénom et pseudo obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    const session = useAuthStore.getState().session;
    if (!session) return;

    const { error: insertError } = await supabase.from('users').insert({
      id: session.user.id,
      phone,
      display_name: displayName.trim(),
      username: username.trim().toLowerCase().replace(/\s/g, '_'),
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    await fetchProfile(session.user.id);
    router.replace('/(tabs)/feed');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.logo}>🍺</Text>
        <Text style={styles.title}>Zabrat</Text>
        <Text style={styles.tagline}>Tes soirées. Tes amis. Tes stats.</Text>

        {/* Étape 1: Numéro de téléphone */}
        {step === 'phone' && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Numéro de téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={Colors.textMuted}
                placeholder="+216 XX XXX XXX"
              />
            </View>

            <Pressable style={styles.cta} onPress={handleSendCode} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.ctaText}>Recevoir le code SMS</Text>
              )}
            </Pressable>

            <Text style={styles.testNote}>En test : utilise le code 123456</Text>
          </>
        )}

        {/* Étape 2: Code OTP */}
        {step === 'otp' && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Code reçu par SMS</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                placeholderTextColor={Colors.textMuted}
                placeholder="000000"
                textAlign="center"
              />
            </View>

            <Pressable style={styles.cta} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.ctaText}>Vérifier le code</Text>
              )}
            </Pressable>

            <Text style={styles.testNote}>En test : utilise le code 123456</Text>

            <Pressable onPress={() => setStep('phone')}>
              <Text style={styles.linkText}>← Changer de numéro</Text>
            </Pressable>
          </>
        )}

        {/* Étape 3: Créer le profil */}
        {step === 'profile' && (
          <>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholderTextColor={Colors.textMuted}
                placeholder="Ton prénom"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Pseudo</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={Colors.textMuted}
                placeholder="ton_pseudo"
                autoCapitalize="none"
              />
            </View>

            <Pressable style={styles.cta} onPress={handleCreateProfile} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.ctaText}>C'est parti ! 🍺</Text>
              )}
            </Pressable>
          </>
        )}

        {/* Erreur */}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Bypass DEV */}
        {devMode && step === 'phone' && (
          <Pressable style={styles.devBypass} onPress={() => router.replace('/(tabs)/feed')}>
            <Text style={styles.devBypassText}>Passer en mode DEV →</Text>
          </Pressable>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    ...Fonts.screenTitle,
    fontSize: 32,
    marginBottom: 4,
  },
  tagline: {
    ...Fonts.label,
    fontSize: 14,
    marginBottom: 40,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    ...Fonts.label,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 18,
    paddingHorizontal: 16,
  },
  otpInput: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 12,
  },
  cta: {
    width: '100%',
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  linkText: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 8,
  },
  testNote: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  devBypass: {
    paddingVertical: 12,
  },
  devBypassText: {
    color: Colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
});
