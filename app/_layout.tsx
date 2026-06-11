import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/theme';
import { DevBadge } from '../components/DevBadge';
import { useAuthStore } from '../stores/authStore';
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import {
  Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  useEffect(() => { initialize(); }, []);

  // Force dark bg on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = Colors.background;
      document.body.style.backgroundColor = Colors.background;
      document.body.style.margin = '0';
      const root = document.getElementById('root');
      if (root) {
        root.style.backgroundColor = Colors.background;
        root.style.minHeight = '100vh';
      }
      const allDivs = document.querySelectorAll('#root > div');
      allDivs.forEach((div) => {
        (div as HTMLElement).style.backgroundColor = Colors.background;
      });
    }
  }, []);

  const [fontsLoaded] = useFonts({
    BarlowCondensed_700Bold,
    Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (isLoading) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <DevBadge />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade_from_bottom',
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
        <Stack.Screen
          name="log-beer"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="phone"
          options={{ animation: 'fade', animationDuration: 400 }}
        />
        <Stack.Screen
          name="onboarding"
          options={{ animation: 'fade', animationDuration: 500 }}
        />
        <Stack.Screen
          name="wrapped"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right', animationDuration: 250 }}
        />
        <Stack.Screen
          name="friends"
          options={{
            presentation: 'transparentModal',
            animation: 'slide_from_bottom',
            animationDuration: 300,
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loading: { alignItems: 'center', justifyContent: 'center' },
});
