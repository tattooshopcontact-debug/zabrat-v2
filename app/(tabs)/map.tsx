import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../../constants/theme';
import { Avatar } from '../../components/Avatar';
import { useAuthStore } from '../../stores/authStore';
import {
  getBarsWithCheckins, checkinBar, getWhoIsOut, subscribeToCheckins,
  getAmbiance,
  type Bar, type ActiveCheckin,
} from '../../lib/mapService';

type VisibilityMode = 'public' | 'friends' | 'ghost';

const CENTER = { lat: 36.8780, lng: 10.3250 };

export default function MapScreen() {
  const user = useAuthStore((s) => s.user);
  const [bars, setBars] = useState<Bar[]>([]);
  const [whoIsOut, setWhoIsOut] = useState<ActiveCheckin[]>([]);
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);
  const [visibility, setVisibility] = useState<VisibilityMode>('friends');
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState('');

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
    const unsub = subscribeToCheckins(() => loadData());
    return unsub;
  }, [loadData]);

  const handleCheckin = async (bar: Bar) => {
    if (!user) return;
    setCheckingIn(true);
    setCheckinMessage('');
    try {
      const result = await checkinBar(user.id, bar.id, visibility);
      if (result.isNew) {
        setCheckinMessage(result.visitCount >= 5
          ? `👑 Tu es le Roi de ${bar.name} !`
          : `📍 Check-in à ${bar.name} ! (visite #${result.visitCount})`
        );
      } else {
        setCheckinMessage(`Déjà check-in à ${bar.name}`);
      }
      await loadData();
      // Refresh selected bar data
      const updated = (await getBarsWithCheckins(user.id)).find(b => b.id === bar.id);
      if (updated) setSelectedBar(updated);
    } catch (err: any) {
      setCheckinMessage(err.message || 'Erreur de check-in');
    }
    setCheckingIn(false);
  };

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  // Render Mapbox on web
  const renderMap = () => {
    if (Platform.OS === 'web' && process.env.EXPO_PUBLIC_MAPBOX_TOKEN) {
      const { MapboxWeb } = require('../../components/MapboxWeb');
      return (
        <MapboxWeb
          bars={bars}
          onBarSelect={(bar: Bar) => { setSelectedBar(bar); setCheckinMessage(''); }}
          center={CENTER}
        />
      );
    }

    // Fallback: simple positioned markers on dark bg
    return (
      <View style={styles.fallbackMap}>
        <Text style={styles.fallbackText}>
          {!process.env.EXPO_PUBLIC_MAPBOX_TOKEN
            ? 'Ajoute EXPO_PUBLIC_MAPBOX_TOKEN dans .env'
            : 'Carte native disponible sur mobile'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🗺️ Map</Text>
        <View style={styles.visToggle}>
          {([
            { key: 'public' as VisibilityMode, icon: '🌍' },
            { key: 'friends' as VisibilityMode, icon: '👥' },
            { key: 'ghost' as VisibilityMode, icon: '👻' },
          ]).map((v) => (
            <Pressable
              key={v.key}
              style={[styles.visBtn, visibility === v.key && styles.visBtnActive]}
              onPress={() => setVisibility(v.key)}
            >
              <Text style={[styles.visBtnText, visibility === v.key && styles.visBtnTextActive]}>
                {v.icon}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapArea}>
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          renderMap()
        )}
      </View>

      {/* Bottom Sheet */}
      {selectedBar && (
        <View style={styles.sheet}>
          <Pressable style={styles.sheetClose} onPress={() => { setSelectedBar(null); setCheckinMessage(''); }}>
            <Ionicons name="close" size={20} color={Colors.textMuted} />
          </Pressable>

          <Text style={styles.sheetTitle}>🍺 {selectedBar.name}</Text>
          {selectedBar.is_partner && <Text style={styles.sheetPartner}>⭐ Bar partenaire</Text>}

          <View style={styles.sheetDivider} />

          <Text style={styles.sheetStat}>
            👥 {selectedBar.activeCount} Zabrateur{selectedBar.activeCount !== 1 ? 's' : ''} ce soir
          </Text>
          <Text style={styles.sheetStat}>{getAmbiance(selectedBar.activeCount)}</Text>

          {selectedBar.activeFriends.length > 0 && (
            <View style={styles.sheetFriends}>
              {selectedBar.activeFriends.slice(0, 5).map((f, i) => (
                <View key={i} style={styles.friendChip}>
                  <Avatar initials={f.initials} color={Colors.primary} size={22} />
                  <Text style={styles.friendChipName}>{f.display_name}</Text>
                </View>
              ))}
              {selectedBar.activeFriends.length > 5 && (
                <Text style={styles.sheetMore}>+{selectedBar.activeFriends.length - 5}</Text>
              )}
            </View>
          )}

          {selectedBar.popularBeers.length > 0 && (
            <Text style={styles.sheetBeers}>
              Bières populaires : {selectedBar.popularBeers.map(b => `${b.type} (${b.count})`).join(' • ')}
            </Text>
          )}

          {checkinMessage ? <Text style={styles.checkinMsg}>{checkinMessage}</Text> : null}

          <View style={styles.sheetActions}>
            <Pressable style={styles.checkinBtn} onPress={() => handleCheckin(selectedBar)} disabled={checkingIn}>
              {checkingIn ? <ActivityIndicator color="#000" size="small" /> : <Text style={styles.checkinBtnText}>📍 J'y suis !</Text>}
            </Pressable>
            <Pressable style={styles.shareBtn}>
              <Text style={styles.shareBtnText}>📤 Partager</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Who is out strip */}
      {whoIsOut.length > 0 && !selectedBar && (
        <View style={styles.whoStrip}>
          <Text style={styles.whoTitle}>Qui sort ce soir ?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.whoScroll}>
            {whoIsOut.map((c) => (
              <View key={c.id} style={styles.whoCard}>
                <Avatar initials={initials(c.display_name)} color={Colors.primary} size={36} />
                <Text style={styles.whoName} numberOfLines={1}>{c.display_name}</Text>
                <Text style={styles.whoBar} numberOfLines={1}>{c.bar_name}</Text>
                <Text style={styles.whoTime}>depuis {c.minutes_ago}min</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border, zIndex: 10,
  },
  headerTitle: { ...Fonts.screenTitle },
  visToggle: { flexDirection: 'row', gap: 4 },
  visBtn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: Colors.border },
  visBtnActive: { borderColor: Colors.primary, backgroundColor: 'rgba(245,166,35,0.12)' },
  visBtnText: { fontSize: 14 },
  visBtnTextActive: { color: Colors.primary },
  mapArea: { flex: 1, backgroundColor: Colors.mapBg, justifyContent: 'center', alignItems: 'center' },
  fallbackMap: { flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' },
  fallbackText: { ...Fonts.label, textAlign: 'center' },
  // Sheet
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 28, borderTopWidth: 1, borderTopColor: Colors.border,
    zIndex: 20, maxHeight: '55%',
  },
  sheetClose: { position: 'absolute', top: 12, right: 16, zIndex: 1 },
  sheetTitle: { ...Fonts.screenTitle, fontSize: 20, marginBottom: 2 },
  sheetPartner: { color: Colors.success, fontSize: 12, fontWeight: '600' },
  sheetDivider: { height: 1, backgroundColor: Colors.border, marginVertical: 10 },
  sheetStat: { ...Fonts.body, fontSize: 14, marginBottom: 4 },
  sheetFriends: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  friendChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surface2, borderRadius: 16, paddingRight: 8, paddingVertical: 2, paddingLeft: 2,
  },
  friendChipName: { ...Fonts.label, fontSize: 11, color: Colors.text },
  sheetMore: { ...Fonts.label, alignSelf: 'center' },
  sheetBeers: { ...Fonts.label, fontSize: 11, color: Colors.primary, marginBottom: 8 },
  checkinMsg: { color: Colors.primary, fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 4 },
  checkinBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: 12, padding: 14, alignItems: 'center' },
  checkinBtnText: { color: '#000', fontSize: 15, fontWeight: '800' },
  shareBtn: {
    flex: 1, backgroundColor: Colors.surface2, borderRadius: 12, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  shareBtnText: { color: Colors.text, fontSize: 14, fontWeight: '600' },
  // Who strip
  whoStrip: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border,
    paddingTop: 10, paddingBottom: 8,
  },
  whoTitle: { ...Fonts.bodyBold, fontSize: 13, paddingHorizontal: 16, marginBottom: 8 },
  whoScroll: { paddingLeft: 16 },
  whoCard: { alignItems: 'center', width: 70, marginRight: 12 },
  whoName: { ...Fonts.body, fontSize: 10, marginTop: 4, textAlign: 'center' },
  whoBar: { ...Fonts.label, fontSize: 9, textAlign: 'center' },
  whoTime: { color: Colors.primary, fontSize: 9, fontWeight: '600' },
});
