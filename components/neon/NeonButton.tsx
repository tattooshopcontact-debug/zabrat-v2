import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Gradients, Glow, Radius } from '../../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;            // ex. « Choisis ta bière d'abord » quand disabled
  style?: ViewStyle;
};

export default function NeonButton({ title, onPress, disabled, hint, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
        !disabled && { boxShadow: Glow.cta },
        styles.radius, style,
      ]}
    >
      <LinearGradient
        colors={[...Gradients.cta]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.2 }}
        style={styles.inner}
      >
        <Text style={Fonts.cta}>{disabled && hint ? hint : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radius: { borderRadius: Radius.cta },
  inner: {
    height: 62, borderRadius: Radius.cta,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
});
