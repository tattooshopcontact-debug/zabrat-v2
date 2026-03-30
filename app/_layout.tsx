import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';
import { DevBadge } from '../components/DevBadge';
import { useAuthStore } from '../stores/authStore';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);

  // Initialiser l'auth au démarrage
  useEffect(() => {
    initialize();
  }, []);

  // Fix Bug 2: Force dark background on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = '#0D0D0D';
      document.body.style.backgroundColor = '#0D0D0D';
      document.body.style.margin = '0';
      const root = document.getElementById('root');
      if (root) {
        root.style.backgroundColor = '#0D0D0D';
        root.style.minHeight = '100vh';
      }
      // Also fix any wrapper divs
      const allDivs = document.querySelectorAll('#root > div');
      allDivs.forEach((div) => {
        (div as HTMLElement).style.backgroundColor = '#0D0D0D';
      });
    }
  }, []);

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
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="log-beer"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="phone" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="wrapped"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="settings" />
        <Stack.Screen
          name="friends"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loading: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
