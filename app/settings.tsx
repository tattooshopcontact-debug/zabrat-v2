import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts } from '../constants/theme';
import { useAuthStore } from '../stores/authStore';

type VisibilityMode = 'public' | 'friends' | 'ghost';

function SettingsRow({ icon, label, value, onPress }: {
  icon: string; label: string; value?: string; onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, devMode, setDevMode, signOut } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [visibility, setVisibility] = useState<VisibilityMode>(user?.visibility_mode as VisibilityMode ?? 'friends');

  const handleSignOut = async () => {
    await signOut();
    router.replace('/phone');
  };

  const cycleVisibility = () => {
    const modes: VisibilityMode[] = ['public', 'friends', 'ghost'];
    const idx = modes.indexOf(visibility);
    setVisibility(modes[(idx + 1) % modes.length]);
  };

  const visLabels: Record<VisibilityMode, string> = {
    public: '🌍 Public',
    friends: '👥 Amis uniquement',
    ghost: '👻 Fantôme',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>⚙️ Paramètres</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profil */}
        <Text style={styles.sectionTitle}>PROFIL</Text>
        <SettingsRow icon="👤" label="Nom" value={user?.display_name ?? '-'} />
        <SettingsRow icon="@" label="Pseudo" value={`@${user?.username ?? '-'}`} />
        <SettingsRow icon="📱" label="Téléphone" value={user?.phone ?? '-'} />

        {/* Confidentialité */}
        <Text style={styles.sectionTitle}>CONFIDENTIALITÉ</Text>
        <SettingsRow
          icon="👁️"
          label="Visibilité sur la Map"
          value={visLabels[visibility]}
          onPress={cycleVisibility}
        />

        {/* Notifications */}
        <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>🔔</Text>
          <Text style={styles.rowLabel}>Notifications push</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: Colors.border, true: Colors.primary }}
            thumbColor="#FFF"
          />
        </View>

        {/* Dev */}
        <Text style={styles.sectionTitle}>DÉVELOPPEUR</Text>
        <View style={styles.row}>
          <Text style={styles.rowIcon}>🛠️</Text>
          <Text style={styles.rowLabel}>Mode DEV</Text>
          <Switch
            value={devMode}
            onValueChange={setDevMode}
            trackColor={{ false: Colors.border, true: Colors.danger }}
            thumbColor="#FFF"
          />
        </View>

        {/* App info */}
        <Text style={styles.sectionTitle}>APP</Text>
        <SettingsRow icon="📱" label="Version" value="1.0.0" />
        <SettingsRow icon="🍺" label="Zabrat" value="MVP" />

        {/* Déconnexion */}
        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Fonts.screenTitle, fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionTitle: {
    ...Fonts.label, letterSpacing: 1.5, fontSize: 11,
    marginTop: 24, marginBottom: 8,
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, marginBottom: 6, gap: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  rowIcon: { fontSize: 16, width: 24, textAlign: 'center' },
  rowLabel: { ...Fonts.body, flex: 1 },
  rowValue: { ...Fonts.label, fontSize: 12 },
  signOutBtn: {
    backgroundColor: 'rgba(248,81,73,0.1)', borderRadius: 12,
    padding: 16, alignItems: 'center', marginTop: 32,
    borderWidth: 1, borderColor: Colors.danger,
  },
  signOutText: { color: Colors.danger, fontWeight: '700', fontSize: 15 },
});
