import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, ActivityIndicator, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../constants/theme';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../stores/authStore';
import {
  searchByPhone, searchByUsername, sendFriendRequest,
  getFriends, getPendingRequests, acceptFriendRequest,
  removeFriendship, type FriendProfile, type FriendRequest,
} from '../lib/friendsService';

type Tab = 'friends' | 'requests' | 'search';

export default function FriendsScreen() {
  const router = useRouter();
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

  // Recherche
  const handleSearch = async () => {
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
  };

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

  const initials = (name: string) => name.slice(0, 2).toUpperCase();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>👥 Amis</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['friends', 'requests', 'search'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'friends' ? `Amis (${friends.length})` : t === 'requests' ? `Demandes (${requests.length})` : 'Chercher'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Tab: Amis */}
        {tab === 'friends' && (
          <>
            {loading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />}
            {!loading && friends.length === 0 && (
              <View style={styles.empty}>
                <Image source={require('../assets/images/empty-friends.png')} style={styles.emptyImage} resizeMode="contain" />
                <Text style={styles.emptyText}>Pas encore d'amis</Text>
                <Text style={styles.emptyHint}>Cherche tes amis par numéro ou pseudo</Text>
                <Pressable style={styles.emptyBtn} onPress={() => setTab('search')}>
                  <Text style={styles.emptyBtnText}>Ajouter des amis</Text>
                </Pressable>
              </View>
            )}
            {friends.map((f) => (
              <View key={f.id} style={styles.friendRow}>
                <Avatar initials={initials(f.display_name)} color={Colors.primary} size={42} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{f.display_name}</Text>
                  <Text style={styles.friendUsername}>@{f.username}</Text>
                </View>
                <View style={styles.friendStats}>
                  <Text style={styles.friendBeers}>{f.total_beers} 🍺</Text>
                  <Text style={styles.friendLevel}>Niv. {f.level}</Text>
                </View>
              </View>
            ))}
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
            {requests.map((req) => (
              <View key={req.id} style={styles.friendRow}>
                <Avatar initials={initials(req.user.display_name)} color={Colors.accent} size={42} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{req.user.display_name}</Text>
                  <Text style={styles.friendUsername}>@{req.user.username}</Text>
                </View>
                <View style={styles.requestActions}>
                  <Pressable style={styles.acceptBtn} onPress={() => handleAccept(req.id)}>
                    <Ionicons name="checkmark" size={18} color="#000" />
                  </Pressable>
                  <Pressable style={styles.rejectBtn} onPress={() => handleReject(req.id)}>
                    <Ionicons name="close" size={18} color={Colors.text} />
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Tab: Recherche */}
        {tab === 'search' && (
          <>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Numéro (+216...) ou pseudo"
                placeholderTextColor={Colors.textMuted}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              <Pressable style={styles.searchBtn} onPress={handleSearch}>
                {searchLoading ? (
                  <ActivityIndicator color="#000" size="small" />
                ) : (
                  <Ionicons name="search" size={18} color="#000" />
                )}
              </Pressable>
            </View>

            {message ? <Text style={styles.message}>{message}</Text> : null}

            {searchResults.map((r) => (
              <View key={r.id} style={styles.friendRow}>
                <Avatar initials={initials(r.display_name)} color={Colors.success} size={42} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{r.display_name}</Text>
                  <Text style={styles.friendUsername}>@{r.username} — {r.total_beers} 🍺</Text>
                </View>
                <Pressable style={styles.addBtn} onPress={() => handleSendRequest(r.id)}>
                  <Ionicons name="person-add" size={16} color="#000" />
                </Pressable>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...Fonts.screenTitle,
    fontSize: 18,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    ...Fonts.body,
    fontSize: 12,
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyImage: { width: 150, height: 150, marginBottom: 8 },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyText: {
    ...Fonts.bodyBold,
    fontSize: 16,
  },
  emptyHint: {
    ...Fonts.label,
    fontSize: 13,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 12,
  },
  emptyBtnText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    ...Fonts.bodyBold,
  },
  friendUsername: {
    ...Fonts.label,
    fontSize: 12,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  friendBeers: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  friendLevel: {
    ...Fonts.label,
    fontSize: 10,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: Colors.surface2,
    borderRadius: 8,
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    color: Colors.text,
    fontSize: 15,
  },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    color: Colors.primary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
});
