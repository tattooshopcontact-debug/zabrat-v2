import React, { useEffect, useRef } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, TabBar, Glow, Gradients } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bouton LOG central : cercle 64px surélevé, dégradé ambre→orange, glow permanent, label « LOG »
function LogButton() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const navigating = useRef(false);

  const handlePress = () => {
    if (navigating.current) return;
    navigating.current = true;
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 8 }),
    );
    setTimeout(() => {
      router.push('/log-beer');
      navigating.current = false;
    }, 120);
  };

  return (
    <View style={styles.logWrap}>
      <AnimatedPressable
        onPress={handlePress}
        style={[styles.logButton, animStyle]}
        accessibilityRole="button"
        accessibilityLabel="Logger une bière"
      >
        <LinearGradient colors={[...Gradients.cta]} style={styles.logGradient}>
          <Ionicons name="beer" size={30} color={Colors.onAmber} />
        </LinearGradient>
      </AnimatedPressable>
      <Text style={styles.logLabel}>LOG</Text>
    </View>
  );
}

// Onglet : icône + label, actif = ambre + point lumineux 4px sous le label
function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused) scale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 10 }));
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, styles.iconWrap]}>
      <Ionicons name={name} size={23} color={color} />
      <View style={[styles.activeDot, { opacity: focused ? 1 : 0 }]} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabBar, { height: TabBar.height + insets.bottom, paddingBottom: insets.bottom + 6 }],
        tabBarActiveTintColor: TabBar.activeColor,
        tabBarInactiveTintColor: TabBar.inactiveColor,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {/* Liseré dégradé ambre 1.5px au-dessus de la barre */}
            <LinearGradient
              colors={['transparent', Colors.primary, Colors.accent, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              locations={[0, 0.45, 0.6, 1]}
              style={styles.topEdge}
            />
            <View style={styles.barBg} />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="feed" options={{
        title: 'Ce soir',
        tabBarIcon: ({ color, focused }) => <TabIcon name="moon" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="map" options={{
        title: 'Carte',
        tabBarIcon: ({ color, focused }) => <TabIcon name="map" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="plus" options={{ title: '', tabBarButton: () => <LogButton /> }}
        listeners={{ tabPress: (e) => e.preventDefault() }} />
      <Tabs.Screen name="top" options={{
        title: 'Ligue',
        tabBarIcon: ({ color, focused }) => <TabIcon name="trophy" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TabBar.height, borderTopWidth: 0, backgroundColor: 'transparent',
    paddingBottom: 6, paddingTop: 6, position: 'absolute', elevation: 0,
  },
  topEdge: { height: 1.5 },
  barBg: { flex: 1, backgroundColor: TabBar.background, ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : null) },
  tabLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10.5 },
  iconWrap: { alignItems: 'center', gap: 3 },
  activeDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary,
    boxShadow: '0 0 14px rgba(255,149,0,0.43)',
  },
  logWrap: { alignItems: 'center', marginTop: TabBar.logElevation },
  logButton: { borderRadius: TabBar.logSize / 2, boxShadow: Glow.log },
  logGradient: {
    width: TabBar.logSize, height: TabBar.logSize, borderRadius: TabBar.logSize / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  logLabel: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10.5, color: Colors.primary, marginTop: 3 },
});
