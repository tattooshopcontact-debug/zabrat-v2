import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ActivityIndicator, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Colors, Fonts, Glow, Radius } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import GlassCard from '../../components/neon/GlassCard';
import NeonButton from '../../components/neon/NeonButton';
import { PulsingDot } from '../../components/neon/PulsingDot';
import { RingAvatar } from '../../components/neon/RingAvatar';
import { useAboveTabBarOffset } from '../../components/neon/useTabBarPadding';
import { useAuthStore } from '../../stores/authStore';
import {
  getBarsWithCheckins, checkinBar, getWhoIsOut, subscribeToCheckins,
  type Bar, type ActiveCheckin,
} from '../../lib/mapService';

type VisibilityMode = 'public' | 'friends' | 'ghost';
type ToastData = { text: string; tone: 'success' | 'error' };

const CENTER = { lat: 36.8780, lng: 10.3250 };

const initials = (name: string) => name.slice(0, 2).toUpperCase();

/* ─── Toast flottant vert (check-in) — fade + slide reanimated ─── */
function Toast({ toast, bottom }: { toast: ToastData; bottom: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(14);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 14;
    opacity.value = withTiming(1, { duration: 180 });
    translateY.value = withTiming(0, { duration: 180 });
  }, [toast, opacity, translateY]);

  const anim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View pointerEvents="none" style={[s.toastWrap, { bottom }, anim]}>
      <View style={[s.toast, toast.tone === 'error' && s.toastError]}>
        <Text style={s.toastText}>{toast.text}</Text>
      </View>
    </Animated.View>
  );
}

/* ─── Bottom sheet glass d'un bar — entrée withSpring translateY 300→0 ─── */
function BarSheet({ bar, bottom, isKing, checkingIn, onClose, onCheckin }: {
  bar: Bar;
  bottom: number;
  isKing: boolean;
  checkingIn: boolean;
  onClose: () => void;
  onCheckin: () => void;
}) {
  const translateY = useSharedValue(300);

  useEffect(() => {
    translateY.value = 300;
    translateY.value = withSpring(0, { damping: 19, stiffness: 180 });
  }, [bar.id, translateY]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const friends = bar.activeFriends.slice(0, 3);
  const friendNames = bar.activeFriends.map(f => f.display_name.split(/\s+/)[0]).join(', ');

  return (
    <Animated.View style={[s.sheetWrap, { bottom }, anim]}>
      <GlassCard style={s.sheet}>
        <View style={s.sheetHandle} />

        <View style={s.sheetHeader}>
          <View style={{ flex: 1 }}>
            <Text style={s.sheetTitle}>{bar.name}</Text>
            <Text style={s.sheetSub}>📍 {bar.city}</Text>
          </View>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
            style={({ pressed }) => [s.sheetClose, pressed && { transform: [{ scale: 0.95 }] }]}
          >
            <Ionicons name="close" size={16} color={Colors.textMuted} />
          </Pressable>
        </View>

        {/* Stat tiles */}
        <View style={s.tilesRow}>
          <View style={s.tile}>
            <Text style={s.tileNumber}>{bar.activeCount}</Text>
            <Text style={s.tileLabel}>bières ce soir</Text>
          </View>
          <View style={[s.tile, s.tileWide]}>
            {friends.length > 0 ? (
              <View style={s.tileFriendsRow}>
                <View style={{ flexDirection: 'row' }}>
                  {friends.map((f, i) => (
                    <View key={`${f.initials}-${i}`} style={[s.friendAvatar, i > 0 && { marginLeft: -9 }]}>
                      <Avatar initials={f.initials} color={Colors.surface2} size={26} />
                    </View>
                  ))}
                </View>
                <Text style={s.tileFriendsText} numberOfLines={2}>
                  <Text style={s.tileFriendsNames}>{friendNames}</Text>
                  {'\n'}
                  {bar.activeFriends.length > 1 ? 'y sont' : 'y est'} en ce moment
                </Text>
              </View>
            ) : (
              <Text style={s.tileEmpty}>Personne sur place pour l'instant</Text>
            )}
          </View>
        </View>

        {/* Roi du bar (dispo uniquement pour toi via tes check-ins) */}
        {isKing && (
          <Text style={s.kingLine}>
            <Text style={{ fontSize: 15 }}>👑</Text> Roi du bar : <Text style={s.kingName}>Toi</Text>
          </Text>
        )}

        <NeonButton title="Check-in 📍" onPress={onCheckin} disabled={checkingIn} />
      </GlassCard>
    </Animated.View>
  );
}

/* ─── Main ─── */
export default function MapScreen() {
  const user = useAuthStore((st) => st.user);
  const insets = useSafeAreaInsets();
  const aboveTabBar = useAboveTabBarOffset();

  const [bars, setBars] = useState<Bar[]>([]);
  const [whoIsOut, setWhoIsOut] = useState<ActiveCheckin[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [visibility, setVisibility] = useState<VisibilityMode>('friends');
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [whoOpen, setWhoOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [kingBars, setKingBars] = useState<Set<string>>(new Set());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [barsData, whoOut] = await Promise.all([
        getBarsWithCheckins(user.id),
        getWhoIsOut(user.id),
      ]);
      setBars(barsData);
      setWhoIsOut(whoOut);
    } catch (err) {
      console.error('Map load error:', err);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCheckins(() => loadData());
    return () => { unsub(); };
  }, [user, loadData]);

  // Nettoyage du timer du toast au démontage
  useEffect(() => {
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, []);

  const showToast = useCallback((text: string, tone: ToastData['tone'] = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const handleCheckin = async (bar: Bar) => {
    if (!user) return;
    setCheckingIn(true);
    try {
      const result = await checkinBar(user.id, bar.id, visibility);
      if (result.visitCount >= 5) {
        setKingBars(prev => new Set(prev).add(bar.id));
      }
      if (result.isNew) {
        showToast(result.visitCount >= 5
          ? `👑 Tu es le Roi de ${bar.name} !`
          : `Check-in au ${bar.name} ✓`);
      } else {
        showToast(`Déjà check-in au ${bar.name}`);
      }
      await loadData();
      // Refresh selected bar data
      const updated = (await getBarsWithCheckins(user.id)).find(b => b.id === bar.id);
      if (updated) setSelectedBar(updated);
    } catch (err: any) {
      showToast(err.message || 'Erreur de check-in', 'error');
    }
    setCheckingIn(false);
  };

  // Amis live (uniques par utilisateur) pour le pill + panneau
  const liveFriends = useMemo(() => {
    const byUser = new Map<string, ActiveCheckin>();
    for (const c of whoIsOut) {
      if (!byUser.has(c.user_id)) byUser.set(c.user_id, c);
    }
    return [...byUser.values()];
  }, [whoIsOut]);

  const openBarFromFriend = (checkin: ActiveCheckin) => {
    setWhoOpen(false);
    const bar = bars.find(b => b.id === checkin.bar_id);
    if (bar) setSelectedBar(bar);
  };

  // Render Mapbox on web
  const renderMap = () => {
    if (Platform.OS === 'web' && process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
      const { MapboxWeb } = require('../../components/MapboxWeb');
      return (
        <MapboxWeb
          bars={bars}
          onBarSelect={(bar: Bar) => { setSelectedBar(bar); setWhoOpen(false); }}
          center={CENTER}
        />
      );
    }

    // Fallback : pas de token / plateforme native
    return (
      <View style={s.fallbackMap}>
        <Text style={s.fallbackText}>
          {!process.env.EXPO_PUBLIC_MAPBOX_TOKEN
            ? 'Ajoute EXPO_PUBLIC_MAPBOX_TOKEN dans .env'
            : 'Carte native disponible sur mobile'}
        </Text>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {/* Carte plein écran */}
      <View style={s.mapArea}>
        {loading ? <ActivityIndicator size="large" color={Colors.primary} /> : renderMap()}
      </View>

      {/* Pill flottant « Qui sort ce soir ? » */}
      <View pointerEvents="box-none" style={[s.pillRow, { top: insets.top + 12 }]}>
        <Pressable
          onPress={() => setWhoOpen(o => !o)}
          accessibilityRole="button"
          accessibilityLabel={`Qui sort ce soir, ${liveFriends.length} amis`}
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
        >
          <GlassCard style={s.pill}>
            <PulsingDot size={7} />
            <Text style={s.pillText}>Qui sort ce soir ?</Text>
            <Text style={s.pillCount}>{liveFriends.length}</Text>
          </GlassCard>
        </Pressable>
      </View>

      {/* Toggle visibilité du check-in (logique existante conservée) */}
      <View style={[s.visToggle, { top: insets.top + 12 }]}>
        <GlassCard style={s.visCard}>
          {([
            { key: 'public' as VisibilityMode, icon: '🌍' },
            { key: 'friends' as VisibilityMode, icon: '👥' },
            { key: 'ghost' as VisibilityMode, icon: '👻' },
          ]).map((v) => (
            <Pressable
              key={v.key}
              accessibilityRole="button"
              accessibilityState={{ selected: visibility === v.key }}
              style={[s.visBtn, visibility === v.key && s.visBtnActive]}
              onPress={() => setVisibility(v.key)}
            >
              <Text style={[s.visBtnText, visibility !== v.key && { opacity: 0.45 }]}>{v.icon}</Text>
            </Pressable>
          ))}
        </GlassCard>
      </View>

      {/* Panneau « qui sort » */}
      {whoOpen && (
        <GlassCard style={[s.whoPanel, { top: insets.top + 70 }]}>
          {liveFriends.length === 0 ? (
            <Text style={s.whoEmpty}>Personne n'est sorti pour l'instant…</Text>
          ) : (
            liveFriends.map((c, i) => (
              <View
                key={c.id}
                style={[s.whoRow, i < liveFriends.length - 1 && s.whoRowBorder]}
              >
                <RingAvatar initials={initials(c.display_name)} color={Colors.surface2} size={36} ring="cyan" />
                <View style={{ flex: 1 }}>
                  <Text style={s.whoName}>{c.display_name}</Text>
                  <Text style={s.whoBar}>📍 au {c.bar_name}</Text>
                </View>
                <Pressable
                  onPress={() => openBarFromFriend(c)}
                  accessibilityRole="button"
                  accessibilityLabel={`Voir ${c.bar_name}`}
                  style={({ pressed }) => [s.whoSee, pressed && { transform: [{ scale: 0.95 }] }]}
                >
                  <Text style={s.whoSeeText}>Voir</Text>
                </Pressable>
              </View>
            ))
          )}
        </GlassCard>
      )}

      {/* Bottom sheet bar */}
      {selectedBar && (
        <BarSheet
          key={selectedBar.id}
          bar={selectedBar}
          bottom={aboveTabBar}
          isKing={kingBars.has(selectedBar.id)}
          checkingIn={checkingIn}
          onClose={() => setSelectedBar(null)}
          onCheckin={() => handleCheckin(selectedBar)}
        />
      )}

      {/* Toast check-in */}
      {toast && <Toast toast={toast} bottom={aboveTabBar + 12} />}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.mapBg },
  mapArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  fallbackMap: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  fallbackText: { ...Fonts.label, textAlign: 'center' },

  // Pill flottant
  pillRow: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: Radius.pill,
  },
  pillText: { fontFamily: 'Outfit_700Bold', fontSize: 13.5, color: Colors.text },
  pillCount: { fontFamily: 'Outfit_800ExtraBold', fontSize: 13.5, color: Colors.cyan },

  // Toggle visibilité
  visToggle: { position: 'absolute', right: 16, zIndex: 10 },
  visCard: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingVertical: 5, paddingHorizontal: 5,
    borderRadius: Radius.pill,
  },
  visBtn: { paddingVertical: 4, paddingHorizontal: 7, borderRadius: Radius.pill },
  visBtnActive: { backgroundColor: 'rgba(255,149,0,0.16)' },
  visBtnText: { fontSize: 14 },

  // Panneau qui sort
  whoPanel: {
    position: 'absolute', left: 24, right: 24, zIndex: 11,
    paddingVertical: 6, paddingHorizontal: 16,
  },
  whoEmpty: { ...Fonts.small, paddingVertical: 14, textAlign: 'center' },
  whoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  whoRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  whoName: { fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.text },
  whoBar: { fontFamily: 'Outfit_600SemiBold', fontSize: 12, color: Colors.cyan, marginTop: 1 },
  whoSee: {
    backgroundColor: 'rgba(255,149,0,0.12)',
    borderWidth: 1, borderColor: 'rgba(255,149,0,0.4)',
    borderRadius: Radius.pill, paddingVertical: 6, paddingHorizontal: 13,
  },
  whoSeeText: { fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.primary },

  // Bottom sheet
  sheetWrap: { position: 'absolute', left: 10, right: 10, zIndex: 20 },
  sheet: {
    borderRadius: Radius.sheet,
    paddingTop: 12, paddingHorizontal: 20, paddingBottom: 20,
  },
  sheetHandle: {
    width: 38, height: 4.5, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'center', marginBottom: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  sheetTitle: { ...Fonts.display, fontSize: 26, letterSpacing: 0.3 },
  sheetSub: { ...Fonts.small, fontSize: 13, marginTop: 3 },
  sheetClose: {
    width: 32, height: 32, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center', justifyContent: 'center',
  },

  // Stat tiles
  tilesRow: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  tile: {
    flex: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14,
    backgroundColor: Colors.surface2,
    borderWidth: 1, borderColor: Colors.border,
  },
  tileWide: { flex: 1.6, justifyContent: 'center' },
  tileNumber: { ...Fonts.display, fontSize: 28, lineHeight: 32, color: Colors.primary, ...Glow.textAmber },
  tileLabel: { fontFamily: 'Outfit_600SemiBold', fontSize: 11.5, color: Colors.textMuted },
  tileFriendsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  friendAvatar: {
    borderWidth: 1, borderColor: Colors.cyan, borderRadius: Radius.pill,
    boxShadow: Glow.live,
  },
  tileFriendsText: {
    flex: 1, fontFamily: 'Outfit_600SemiBold', fontSize: 12,
    color: Colors.textMuted, lineHeight: 16,
  },
  tileFriendsNames: { fontFamily: 'Outfit_700Bold', color: Colors.cyan },
  tileEmpty: { fontFamily: 'Outfit_600SemiBold', fontSize: 12.5, color: Colors.textMuted },

  // Roi du bar
  kingLine: { fontFamily: 'Outfit_700Bold', fontSize: 13.5, color: Colors.text, marginBottom: 16 },
  kingName: { color: Colors.primary },

  // Toast
  toastWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 30 },
  toast: {
    backgroundColor: 'rgba(21,21,28,0.92)',
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.5)',
    borderRadius: Radius.pill, paddingVertical: 11, paddingHorizontal: 20,
    boxShadow: '0 0 24px rgba(76,175,80,0.25), 0 10px 30px rgba(0,0,0,0.5)',
  },
  toastError: {
    borderColor: 'rgba(248,81,73,0.5)',
    boxShadow: '0 0 24px rgba(248,81,73,0.25), 0 10px 30px rgba(0,0,0,0.5)',
  },
  toastText: { fontFamily: 'Outfit_700Bold', fontSize: 13.5, color: Colors.text },
});
