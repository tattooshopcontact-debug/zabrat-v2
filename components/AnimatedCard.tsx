import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  index?: number;
  style?: ViewStyle;
}

// Carte avec animation d'entrée fade + slide up
export function AnimatedCard({ children, index = 0, style }: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const delay = Math.min(index * 80, 400);
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}

// Badge avec animation scale bounce
export function AnimatedBadge({ children, index = 0, style }: AnimatedCardProps) {
  const scale = useSharedValue(0);

  useEffect(() => {
    const delay = Math.min(index * 50, 600);
    scale.value = withDelay(delay, withTiming(1, { duration: 300, easing: Easing.out(Easing.back(1.5)) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[style, animStyle]}>
      {children}
    </Animated.View>
  );
}

// Compteur animé (pour les stats)
export function AnimatedNumber({ value, style }: { value: number; style?: any }) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(value, { duration: 800, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  // On ne peut pas animer le texte directement avec reanimated sur web
  // Donc on fait juste un fade-in
  return (
    <Animated.Text style={[style, animStyle]}>
      {value}
    </Animated.Text>
  );
}
