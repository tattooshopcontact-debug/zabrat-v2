import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors, TabBar } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PlusButton() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.3);

  // Pulse glow subtil en continu
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 }),
      ),
      -1, true
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85, { damping: 10 }),
      withSpring(1.1, { damping: 6 }),
      withSpring(1, { damping: 8 }),
    );
    setTimeout(() => router.push('/log-beer'), 150);
  };

  return (
    <AnimatedPressable onPress={handlePress} style={[styles.plusButton, animStyle]}>
      <Ionicons name="add" size={30} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

// Icône tab animée
function TabIcon({ name, color, size, focused }: { name: string; color: string; size: number; focused: boolean }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 8 }),
        withSpring(1, { damping: 10 }),
      );
    }
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name as any} size={size} color={color} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: TabBar.activeColor,
        tabBarInactiveTintColor: TabBar.inactiveColor,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="stats-chart" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="map" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: '',
          tabBarButton: () => <PlusButton />,
        }}
        listeners={{ tabPress: (e) => e.preventDefault() }}
      />
      <Tabs.Screen
        name="top"
        options={{
          title: 'Top',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="trophy" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TabBar.height,
    backgroundColor: '#0D0D0D',
    borderTopWidth: 1,
    borderTopColor: '#1A1A1A',
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  plusButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 10,
  },
});
