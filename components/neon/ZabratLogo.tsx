import React from 'react';
import { View } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Colors, Glow } from '../../constants/theme';

// Logo Zabrat : chope + 3 étoiles, néon — porté depuis docs/design-handoff/zabrat-core.jsx

function star(x: number, y: number, s: number, o = 1) {
  const d = `M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`;
  return <Path d={d} fill={Colors.primary} opacity={o} />;
}

export default function ZabratLogo({ size = 120 }: { size?: number }) {
  return (
    <View style={{ boxShadow: Glow.card }}>
      <Svg width={size} height={size} viewBox="0 0 96 96" fill="none">
        {star(30, 16, 7)}
        {star(50, 9, 5, 0.85)}
        {star(66, 17, 4, 0.7)}
        <G stroke={Colors.primary} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M28 34h36v40a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6V34Z" />
          <Path d="M64 42h6a6 6 0 0 1 6 6v8a6 6 0 0 1-6 6h-6" />
          <Path d="M28 34c-2.4-1.6-3.8-3.7-3.8-6.2 0-4.3 3.6-7.6 8-7.6.9 0 1.9.1 2.7.4 1.2-3 4.3-5.1 7.9-5.1 3.4 0 6.3 1.8 7.7 4.5a8.6 8.6 0 0 1 3-.5c4.2 0 7.5 3.1 7.5 7 0 3-1.7 5.5-4 6.6" />
          <Path d="M38 46v22M48 46v22M58 46v22" opacity={0.85} />
        </G>
      </Svg>
    </View>
  );
}
