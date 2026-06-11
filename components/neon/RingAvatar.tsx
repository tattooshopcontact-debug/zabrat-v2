import React from 'react';
import { View } from 'react-native';
import { Avatar } from '../Avatar';
import { Colors, Glow } from '../../constants/theme';

interface RingAvatarProps {
  initials: string;
  color: string;
  size: number;
  ring: 'amber' | 'cyan';
}

export function RingAvatar({ initials, color, size, ring }: RingAvatarProps) {
  const ringColor = ring === 'cyan' ? Colors.cyan : Colors.primary;
  const glow = ring === 'cyan' ? Glow.live : Glow.card;
  const outer = size + 8; // bordure 2 + écart 2 de chaque côté
  return (
    <View
      style={{
        width: outer, height: outer, borderRadius: outer / 2,
        borderWidth: 2, borderColor: ringColor,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: Colors.background,
        boxShadow: glow,
      }}
    >
      <Avatar initials={initials} color={color} size={size} />
    </View>
  );
}
