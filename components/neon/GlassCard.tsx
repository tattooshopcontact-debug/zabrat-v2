import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius } from '../../constants/theme';

export default function GlassCard({ children, style, glow }: {
  children: React.ReactNode; style?: ViewStyle; glow?: string;
}) {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.card, glow ? { boxShadow: glow } : null, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21,21,28,0.78)',
    borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, overflow: 'hidden',
  },
});
