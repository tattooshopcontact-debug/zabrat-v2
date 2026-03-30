import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { Colors } from '../constants/theme';

export function DevBadge() {
  const devMode = useAuthStore((s) => s.devMode);
  if (!devMode) return null;

  return (
    <View style={styles.badge}>
      <Text style={styles.text}>DEV</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 999,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
