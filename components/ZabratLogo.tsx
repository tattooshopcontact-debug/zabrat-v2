import React from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

// Essaie de charger le logo PNG. Si pas trouvé, affiche le fallback emoji.
let logoSource: any = null;
try {
  logoSource = require('../assets/images/logo.png');
} catch {
  logoSource = null;
}

let iconSource: any = null;
try {
  iconSource = require('../assets/images/app-icon.png');
} catch {
  iconSource = null;
}

export function ZabratLogo({ size = 32, showText = true }: LogoProps) {
  return (
    <View style={styles.row}>
      {logoSource ? (
        <Image source={logoSource} style={{ width: size, height: size }} resizeMode="contain" />
      ) : (
        <Text style={{ fontSize: size * 0.8 }}>🍺</Text>
      )}
      {showText && <Text style={[styles.text, { fontSize: size * 0.75 }]}>Zabrat</Text>}
    </View>
  );
}

export function ZabratAppIcon({ size = 80 }: { size?: number }) {
  if (iconSource) {
    return <Image source={iconSource} style={{ width: size, height: size, borderRadius: size * 0.22 }} resizeMode="cover" />;
  }
  return (
    <View style={[styles.iconFallback, { width: size, height: size, borderRadius: size * 0.22 }]}>
      <Text style={{ fontSize: size * 0.5 }}>🍺</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  text: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  iconFallback: {
    backgroundColor: '#F5A623',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
