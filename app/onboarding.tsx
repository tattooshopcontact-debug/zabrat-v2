import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Glow } from '../constants/theme';
import ZabratLogo from '../components/neon/ZabratLogo';
import NeonButton from '../components/neon/NeonButton';
import { RingAvatar } from '../components/neon/RingAvatar';

// ─── Visuels illustratifs (inline, suivant le handoff zabrat-flows.jsx) ───

function MiniMap() {
  return (
    <View style={s.miniMap}>
      {/* Rues stylisées */}
      <View style={[s.street, { top: 52, left: -20, width: 300, transform: [{ rotate: '-8deg' }] }]} />
      <View style={[s.street, { top: 108, left: -20, width: 300, transform: [{ rotate: '5deg' }] }]} />
      <View style={[s.street, { top: -20, left: 150, width: 220, transform: [{ rotate: '78deg' }] }]} />
      {/* Pastilles glow ambre */}
      <View style={[s.mapDot, { left: '34%', top: '42%', width: 14, height: 14, borderRadius: 7 }]} />
      <View style={[s.mapDot, s.mapDotSoft, { left: '60%', top: '64%' }]} />
      <View style={[s.mapDot, s.mapDotSoft, { left: '14%', top: '70%', opacity: 0.6 }]} />
      {/* Mini-avatars amis */}
      <View style={{ position: 'absolute', left: '22%', top: '18%' }}>
        <RingAvatar initials="KH" color="#7C5CFF" size={24} ring="cyan" />
      </View>
      <View style={{ position: 'absolute', left: '68%', top: '40%' }}>
        <RingAvatar initials="MA" color="#FF5C8A" size={24} ring="cyan" />
      </View>
    </View>
  );
}

function MiniPodium() {
  const bars = [
    { h: 64, win: false },
    { h: 92, win: true },
    { h: 46, win: false },
  ];
  return (
    <View style={s.podium}>
      {bars.map((b, i) => (
        <LinearGradient
          key={i}
          colors={
            b.win
              ? ['rgba(255,149,0,0.45)', 'rgba(255,149,0,0.06)']
              : ['rgba(255,149,0,0.22)', 'rgba(255,149,0,0.03)']
          }
          style={[s.podiumBar, { height: b.h }, b.win && s.podiumBarWin]}
        />
      ))}
    </View>
  );
}

// ─── Écran ───

type Slide = { visual: React.ReactNode; title: string; sub: string };

export default function OnboardingScreen() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  const slides: Slide[] = [
    { visual: <ZabratLogo size={150} />, title: 'Zabrat', sub: 'Tes soirées comptent.' },
    { visual: <MiniMap />, title: 'Vois qui sort,', sub: 'et où ça bouge.' },
    { visual: <MiniPodium />, title: 'Sois le roi', sub: 'de la semaine.' },
  ];

  const last = slide === slides.length - 1;
  const current = slides[slide];

  const finish = () => router.replace('/(tabs)/feed');

  return (
    <View style={s.container}>
      {/* Passer — discret en haut à droite */}
      <Pressable style={s.skipBtn} onPress={finish} hitSlop={10}>
        <Text style={s.skipText}>Passer</Text>
      </Pressable>

      {/* Contenu du slide courant — fade-up à chaque changement */}
      <View style={s.center}>
        <Animated.View key={`v${slide}`} entering={FadeInUp.duration(400)} style={s.visual}>
          {current.visual}
        </Animated.View>
        <Animated.View key={`t${slide}`} entering={FadeInUp.duration(400).delay(80)}>
          <Text style={s.title}>{current.title}</Text>
          <Text style={s.sub}>{current.sub}</Text>
        </Animated.View>
      </View>

      {/* Dots */}
      <View style={s.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[s.dot, i === slide && s.dotActive]} />
        ))}
      </View>

      <NeonButton
        title={last ? "C'est parti 🍺" : 'Continuer'}
        onPress={() => (last ? finish() : setSlide(slide + 1))}
        style={s.cta}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.background,
    paddingTop: 64, paddingBottom: 44, paddingHorizontal: 32,
    alignItems: 'center',
  },
  skipBtn: { alignSelf: 'flex-end', padding: 6 },
  skipText: { ...Fonts.bodyBold, fontSize: 13.5, color: Colors.textMuted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 36 },
  visual: { alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  title: {
    ...Fonts.display, fontSize: 38, lineHeight: 42,
    color: Colors.text, textAlign: 'center', letterSpacing: 0.4,
  },
  sub: {
    ...Fonts.display, fontSize: 38, lineHeight: 42,
    color: Colors.primary, textAlign: 'center', letterSpacing: 0.4,
    ...Glow.textAmber,
  },
  // Mini-carte (slide 2)
  miniMap: {
    width: 240, height: 160, borderRadius: 18, overflow: 'hidden',
    backgroundColor: Colors.mapBg, borderWidth: 1, borderColor: Colors.border,
    boxShadow: '0 0 40px rgba(0,229,255,0.10)',
  },
  street: { position: 'absolute', height: 2, backgroundColor: 'rgba(255,255,255,0.05)' },
  mapDot: {
    position: 'absolute', width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    boxShadow: '0 0 18px rgba(255,149,0,0.77)',
  },
  mapDotSoft: { borderWidth: 0, opacity: 0.8, boxShadow: '0 0 12px rgba(255,149,0,0.51)' },
  // Mini-podium (slide 3)
  podium: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10,
    width: 210, height: 110,
  },
  podiumBar: {
    flex: 1, borderTopLeftRadius: 8, borderTopRightRadius: 8,
    borderWidth: 1, borderBottomWidth: 0, borderColor: Colors.border,
  },
  podiumBarWin: {
    borderColor: 'rgba(255,149,0,0.6)',
    boxShadow: '0 -2px 28px rgba(255,149,0,0.30)',
  },
  // Dots
  dots: { flexDirection: 'row', gap: 8, marginBottom: 28, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: {
    width: 24, height: 6, borderRadius: 999, backgroundColor: Colors.primary,
    boxShadow: '0 0 10px rgba(255,149,0,0.51)',
  },
  cta: { alignSelf: 'stretch' },
});
