import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Glow, Gradients, Spacing } from '../constants/theme';
import { Avatar } from '../components/Avatar';
import { RingAvatar } from '../components/neon/RingAvatar';
import { AnimatedCard } from '../components/AnimatedCard';
import { useAuthStore } from '../stores/authStore';
import { inviteViaWhatsApp } from '../lib/shareService';
import { getWhoIsOut, subscribeToCheckins } from '../lib/mapService';
import {
  searchByPhone, searchByUsername, sendFriendRequest,
  getFriends, getPendingRequests, acceptFriendRequest,
  removeFriendship, type FriendProfile, type FriendRequest,
} from '../lib/friendsService';
import { colorFor, initialsOf } from '../lib/avatarColor';

type Tab = 'friends' | 'requests' | 'search';

export default function FriendsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const devMode = useAuthStore((s) => s.devMode);

  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState('');
  // user_id → nom du bar si l'ami est en check-in en ce moment (anneau cyan)
  const [liveBars, setLiveBars] = useState<Map<string, string>>(new Map());

  // Charger amis et demandes
  const loadData = useCallback(async () => {
    if (!user || devMode) return;
    setLoading(true);
    try {
      const [friendsList, requestsList] = await Promise.all([
        getFriends(user.id),
        getPendingRequests(user.id),
      ]);
      setFriends(friendsList);
      setRequests(requestsList);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [user, devMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Statut live des amis (check-in en cours) — dégrade silencieusement si vide
  const loadLive = useCallback(async () => {
    if (!user || devMode) return;
    try {
      const out = await getWhoIsOut(user.id);
      const map = new Map<string, string>();
      for (const c of out) {
        if (!map.has(c.user_id)) map.set(c.user_id, c.bar_name);
      }
      setLiveBars(map);
    } catch {
      setLiveBars(new Map());
    }
  }, [user, devMode]);

  useEffect(() => {
    loadLive();
  }, [loadLive]);

  useEffect(() => {
    if (!user || devMode) return;
    const unsub = subscribeToCheckins(() => loadLive());
    return () => { unsub(); };
  }, [user, devMode, loadLive]);

  // Recherche
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setMessage('');

    try {
      let results: FriendProfile[] = [];

      // Si commence par +, recherche par téléphone
      if (searchQuery.startsWith('+')) {
        const found = await searchByPhone(searchQuery.trim());
        if (found) results = [found];
      } else {
        results = await searchByUsername(searchQuery.trim());
      }

      // Exclure soi-même
      results = results.filter((r) => r.id !== user?.id);

      setSearchResults(results);
      if (results.length === 0) {
        setMessage('Aucun utilisateur trouvé');
      }
    } catch (err) {
      setMessage('Erreur de recherche');
    }
    setSearchLoading(false);
  }, [searchQuery, user]);

  // Filtre live : lance la recherche existante avec un léger debounce
  useEffect(() => {
    if (tab !== 'search') return;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setMessage('');
      return;
    }
    const t = setTimeout(() => { handleSearch(); }, 350);
    return () => clearTimeout(t);
  }, [tab, searchQuery, handleSearch]);

  // Envoyer demande
  const handleSendRequest = async (friendId: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(user.id, friendId);
      setMessage('Demande envoyée !');
      setSearchResults((prev) => prev.filter((r) => r.id !== friendId));
    } catch (err: any) {
      setMessage(err.message || 'Erreur');
    }
  };

  // Accepter demande
  const handleAccept = async (requestId: string) => {
    try {
      await acceptFriendRequest(requestId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Refuser demande
  const handleReject = async (requestId: string) => {
    try {
      await removeFriendship(requestId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'friends', label: 'Mes amis' },
    { key: 'requests', label: `Demandes${requests.length ? ` (${requests.length})` : ''}` },
    { key: 'search', label: 'Chercher' },
  ];

  const renderFriendCard = (f: FriendProfile, idx: number) => {
    const liveBar = liveBars.get(f.id);
    return (
      <AnimatedCard key={f.id} index={idx}>
        <View style={styles.card}>
          {liveBar ? (
            <RingAvatar initials={initialsOf(f.display_name)} color={colorFor(f.display_name)} size={44} ring="cyan" />
          ) : (
            <View style={styles.avatarSlot}>
              <Avatar initials={initialsOf(f.display_name)} color={colorFor(f.display_name)} size={44} />
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{f.display_name}</Text>
            <Text style={styles.cardSub} numberOfLines={1}>
              {f.monthBeers} bière{f.monthBeers > 1 ? 's' : ''} ce mois
              {liveBar ? <Text style={styles.cardLive}> · 📍 au {liveBar}</Text> : null}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#3A3A48" />
        </View>
      </AnimatedCard>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Mes amis</Text>
      </View>

      {/* Tabs segmentés */}
      <View style={styles.tabs}>
        {tabs.map(({ key, label }) => (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
            onPress={() => setTab(key)}
          >
            {tab === key ? (
              <LinearGradient
                colors={[...Gradients.cta]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tabPill}
              >
                <Text style={styles.tabTextActive} numberOfLines={1}>{label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabIdle}>
                <Text style={styles.tabText} numberOfLines={1}>{label}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tab: Mes amis */}
        {tab === 'friends' && (
          <>
            {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />}
            {!loading && friends.length === 0 && (
              <View style={styles.empty}>
                <Image source={require('../assets/images/empty-friends.png')} style={styles.emptyImage} resizeMode="contain" />
                <Text style={styles.emptyText}>Pas encore d'amis</Text>
                <Text style={styles.emptyHint}>Cherche tes amis par pseudo ou numéro</Text>
                <Pressable
                  style={({ pressed }) => [pressed && styles.pressed]}
                  onPress={() => setTab('search')}
                >
                  <LinearGradient
                    colors={[...Gradients.cta]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.emptyBtn}
                  >
                    <Text style={styles.emptyBtnText}>Ajouter des amis</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
            {!loading && friends.map((f, idx) => renderFriendCard(f, idx))}
          </>
        )}

        {/* Tab: Demandes */}
        {tab === 'requests' && (
          <>
            {requests.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>📬</Text>
                <Text style={styles.emptyText}>Aucune demande en attente</Text>
              </View>
            )}
            {requests.map((req, idx) => (
              <AnimatedCard key={req.id} index={idx}>
                <View style={styles.card}>
                  <View style={styles.avatarSlot}>
                    <Avatar initials={initialsOf(req.user.display_name)} color={colorFor(req.user.display_name)} size={44} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{req.user.display_name}</Text>
                    <Text style={styles.cardSub}>@{req.user.username}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <Pressable
                      style={({ pressed }) => [styles.ghostBtn, pressed && styles.pressed]}
                      onPress={() => handleReject(req.id)}
                    >
                      <Text style={styles.ghostBtnText}>Refuser</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [pressed && styles.pressed]}
                      onPress={() => handleAccept(req.id)}
                    >
                      <LinearGradient
                        colors={[...Gradients.cta]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.acceptPill}
                      >
                        <Text style={styles.acceptText}>Accepter</Text>
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Tab: Chercher */}
        {tab === 'search' && (
          <>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color={Colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Pseudo ou numéro de téléphone"
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchLoading && <ActivityIndicator color={Colors.primary} size="small" />}
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {searchResults.map((r, idx) => (
              <AnimatedCard key={r.id} index={idx}>
                <View style={styles.card}>
                  <View style={styles.avatarSlot}>
                    <Avatar initials={initialsOf(r.display_name)} color={colorFor(r.display_name)} size={44} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{r.display_name}</Text>
                    <Text style={styles.cardSub} numberOfLines={1}>
                      @{r.username} · {r.total_beers} 🍺
                    </Text>
                  </View>
                  <Pressable
                    style={({ pressed }) => [pressed && styles.pressed]}
                    onPress={() => handleSendRequest(r.id)}
                  >
                    <LinearGradient
                      colors={[...Gradients.cta]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.acceptPill}
                    >
                      <Text style={styles.acceptText}>Ajouter</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </AnimatedCard>
            ))}
          </>
        )}

        {/* Inviter sur WhatsApp */}
        <Pressable
          style={({ pressed }) => [styles.whatsappBtn, pressed && styles.pressed]}
          onPress={() => inviteViaWhatsApp()}
        >
          <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
          <Text style={styles.whatsappText}>Inviter sur WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.screenX,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Fonts.screenTitle,
    fontSize: 28,
    letterSpacing: 0.4,
  },
  tabs: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 16,
    marginHorizontal: Spacing.screenX,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 36,
  },
  tabIdle: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPill: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: Glow.cta,
  },
  tabText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 13,
    color: Colors.textMuted,
  },
  tabTextActive: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 13,
    color: Colors.onAmber,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Spacing.screenX,
    paddingTop: 16,
    gap: 10,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyImage: { width: 150, height: 150, marginBottom: 8 },
  emptyEmoji: { fontSize: 48 },
  emptyText: {
    ...Fonts.bodyBold,
    fontSize: 16,
  },
  emptyHint: {
    ...Fonts.small,
    fontSize: 13,
  },
  emptyBtn: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 11,
    marginTop: 12,
    boxShadow: Glow.cta,
  },
  emptyBtnText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 14,
    color: Colors.onAmber,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarSlot: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardName: {
    ...Fonts.bodyBold,
  },
  cardSub: {
    ...Fonts.small,
    marginTop: 2,
  },
  cardLive: {
    color: Colors.cyan,
    fontFamily: 'Outfit_700Bold',
  },
  requestActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ghostBtn: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  ghostBtnText: {
    fontFamily: 'Outfit_700Bold',
    fontSize: 12.5,
    color: Colors.textMuted,
  },
  acceptPill: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    boxShadow: Glow.cta,
  },
  acceptText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 12.5,
    color: Colors.onAmber,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    paddingHorizontal: 16,
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    marginBottom: 6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: Colors.text,
    fontFamily: 'Outfit_400Regular',
    fontSize: 14.5,
  },
  message: {
    ...Fonts.small,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    height: 50,
    borderRadius: 16,
    backgroundColor: Colors.whatsapp,
    marginTop: 4,
    boxShadow: '0 4px 20px rgba(31,175,82,0.30)',
  },
  whatsappText: {
    fontFamily: 'Outfit_800ExtraBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
});
