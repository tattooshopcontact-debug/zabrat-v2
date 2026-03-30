import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming,
  withDelay, withSequence, Easing, runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const COLORS = ['#F5A623', '#FF6B35', '#4CAF50', '#E91E63', '#2196F3', '#FFD700', '#FF4444'];
const NUM_PARTICLES = 30;

interface ConfettiProps {
  visible: boolean;
  onComplete?: () => void;
}

function Particle({ index, onComplete }: { index: number; onComplete?: () => void }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0);

  const startX = Math.random() * SCREEN_WIDTH;
  const color = COLORS[index % COLORS.length];
  const size = 6 + Math.random() * 8;
  const isCircle = Math.random() > 0.5;

  useEffect(() => {
    const delay = Math.random() * 300;
    const driftX = (Math.random() - 0.5) * 200;

    scale.value = withDelay(delay, withTiming(1, { duration: 200 }));
    translateY.value = withDelay(delay,
      withTiming(SCREEN_HEIGHT * 0.7 + Math.random() * 200, {
        duration: 1500 + Math.random() * 1000,
        easing: Easing.out(Easing.quad),
      })
    );
    translateX.value = withDelay(delay,
      withTiming(driftX, { duration: 1500, easing: Easing.out(Easing.quad) })
    );
    rotate.value = withDelay(delay,
      withTiming(360 * (2 + Math.random() * 3), { duration: 2000 })
    );
    opacity.value = withDelay(delay + 1000,
      withTiming(0, { duration: 800 }, () => {
        if (index === 0 && onComplete) runOnJS(onComplete)();
      })
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: -20,
          width: size,
          height: isCircle ? size : size * 1.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        style,
      ]}
    />
  );
}

export function Confetti({ visible, onComplete }: ConfettiProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) setShow(true);
  }, [visible]);

  const handleComplete = () => {
    setShow(false);
    onComplete?.();
  };

  if (!show) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} index={i} onComplete={i === 0 ? handleComplete : undefined} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    pointerEvents: 'none',
  },
});
