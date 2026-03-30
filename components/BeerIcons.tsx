import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Icônes types de bière — style flat illustration matching le logo Zabrat
// Chaque icône : fond circulaire + illustration emoji stylisée + label

interface BeerIconProps {
  size?: number;
  active?: boolean;
}

const ICON_BG = '#272727';
const ICON_BG_ACTIVE = 'rgba(245,166,35,0.15)';
const ICON_BORDER = '#333333';
const ICON_BORDER_ACTIVE = '#F5A623';

function IconWrapper({ children, active, size = 64 }: BeerIconProps & { children: React.ReactNode }) {
  return (
    <View style={[
      styles.wrapper,
      { width: size, height: size, borderRadius: size * 0.28 },
      active ? styles.wrapperActive : styles.wrapperInactive,
    ]}>
      {children}
    </View>
  );
}

// 🍺 Blonde — chope dorée classique
export function BlondeIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.mug, { width: size * 0.48, height: size * 0.42 }]}>
        <View style={[styles.mugFoam, { height: size * 0.1 }]} />
        <View style={[styles.mugBody, { backgroundColor: '#F5A623' }]} />
        <View style={[styles.mugHandle, { width: size * 0.08, height: size * 0.2, right: -size * 0.1 }]} />
      </View>
      <Text style={[styles.label, { fontSize: size * 0.13 }]}>Blonde</Text>
    </IconWrapper>
  );
}

// 🌾 Blanche — verre avec blé
export function BlancheIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.mug, { width: size * 0.48, height: size * 0.42 }]}>
        <View style={[styles.mugFoam, { height: size * 0.12 }]} />
        <View style={[styles.mugBody, { backgroundColor: '#FFD54F' }]} />
      </View>
      <Text style={styles.grain}>🌾</Text>
      <Text style={[styles.label, { fontSize: size * 0.13 }]}>Blanche</Text>
    </IconWrapper>
  );
}

// 🌑 Brune — chope sombre
export function BruneIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.mug, { width: size * 0.48, height: size * 0.42 }]}>
        <View style={[styles.mugFoam, { height: size * 0.08, backgroundColor: '#D7CCC8' }]} />
        <View style={[styles.mugBody, { backgroundColor: '#5D4037' }]} />
        <View style={[styles.mugHandle, { width: size * 0.08, height: size * 0.2, right: -size * 0.1 }]} />
      </View>
      <Text style={[styles.label, { fontSize: size * 0.13 }]}>Brune</Text>
    </IconWrapper>
  );
}

// 🍻 IPA — verre tulipe ambre foncé
export function IPAIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.tulip, { width: size * 0.36, height: size * 0.44 }]}>
        <View style={[styles.tulipFoam, { height: size * 0.08 }]} />
        <View style={[styles.tulipBody, { backgroundColor: '#E65100' }]} />
        <View style={[styles.tulipStem, { height: size * 0.1 }]} />
      </View>
      <Text style={[styles.labelBold, { fontSize: size * 0.14 }]}>IPA</Text>
    </IconWrapper>
  );
}

// 🍾 Craft — bouteille artisanale
export function CraftIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.bottle, { width: size * 0.24, height: size * 0.48 }]}>
        <View style={[styles.bottleNeck, { backgroundColor: '#4E342E' }]} />
        <View style={[styles.bottleBody, { backgroundColor: '#6D4C41' }]} />
        <View style={styles.bottleStar} />
      </View>
      <Text style={[styles.label, { fontSize: size * 0.13 }]}>Craft</Text>
    </IconWrapper>
  );
}

// 🥤 Autre — verre générique
export function AutreIcon({ size = 64, active }: BeerIconProps) {
  return (
    <IconWrapper size={size} active={active}>
      <View style={[styles.glass, { width: size * 0.34, height: size * 0.44 }]}>
        <View style={[styles.glassFoam, { height: size * 0.06 }]} />
        <View style={[styles.glassBody, { backgroundColor: '#9E9E9E' }]} />
      </View>
      <Text style={[styles.label, { fontSize: size * 0.13 }]}>Autre</Text>
    </IconWrapper>
  );
}

// Map des icônes par type
export const BEER_ICON_MAP: Record<string, React.ComponentType<BeerIconProps>> = {
  blonde: BlondeIcon,
  blanche: BlancheIcon,
  brune: BruneIcon,
  ipa: IPAIcon,
  craft: CraftIcon,
  autre: AutreIcon,
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wrapperInactive: {
    backgroundColor: ICON_BG,
    borderWidth: 1.5,
    borderColor: ICON_BORDER,
  },
  wrapperActive: {
    backgroundColor: ICON_BG_ACTIVE,
    borderWidth: 2,
    borderColor: ICON_BORDER_ACTIVE,
    shadowColor: '#F5A623',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  // Mug (Blonde, Brune)
  mug: {
    position: 'relative',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#4E342E',
  },
  mugFoam: {
    width: '100%',
    backgroundColor: '#FFF8E1',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  mugBody: {
    flex: 1,
  },
  mugHandle: {
    position: 'absolute',
    top: '30%',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#4E342E',
    borderLeftWidth: 0,
    borderRadius: 4,
  },
  // Tulip (IPA)
  tulip: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  tulipFoam: {
    width: '100%',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tulipBody: {
    width: '100%',
    flex: 1,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  tulipStem: {
    width: 4,
    backgroundColor: '#8D6E63',
  },
  // Bottle (Craft)
  bottle: {
    alignItems: 'center',
  },
  bottleNeck: {
    width: '40%',
    height: '30%',
    borderRadius: 2,
  },
  bottleBody: {
    width: '100%',
    flex: 1,
    borderRadius: 4,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  bottleStar: {
    position: 'absolute',
    top: '50%',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5A623',
  },
  // Glass (Autre)
  glass: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#757575',
    overflow: 'hidden',
  },
  glassFoam: {
    width: '100%',
    backgroundColor: '#E0E0E0',
  },
  glassBody: {
    flex: 1,
  },
  // Labels
  label: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  labelBold: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
  },
  grain: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 10,
  },
});
