import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Glow } from '../../constants/theme';

export default function StatNumber({ value, label, amber = false, size = 40 }: {
  value: string; label: string; amber?: boolean; size?: number;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[Fonts.display, { fontSize: size }, amber && { color: Colors.primary, ...Glow.textAmber }]}>
        {value}
      </Text>
      <Text style={Fonts.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', gap: 2 } });
