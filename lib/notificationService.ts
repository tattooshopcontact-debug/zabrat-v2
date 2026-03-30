import { Platform } from 'react-native';
import { supabase } from './supabase';

// Types de notifications
export const NOTIFICATION_TYPES = {
  FRIDAY_FOMO: 'friday_fomo',         // Vendredi 19h: "Tes amis commencent sans toi !"
  WEEKLY_RESULTS: 'weekly_results',    // Lundi 9h: "Tu étais #2 cette semaine !"
  STREAK_DANGER: 'streak_danger',      // Streak en danger
  BADGE_CLOSE: 'badge_close',         // Badge proche
  INACTIVITY: 'inactivity',           // Inactivité 7j
  HOT_SPOT: 'hot_spot',              // Bar en feu
  FRIEND_CHECKIN: 'friend_checkin',   // Ami check-in
} as const;

// Enregistrer le push token dans Supabase
export async function registerPushToken(userId: string) {
  if (Platform.OS === 'web') return; // Pas de push sur web

  try {
    const Notifications = require('expo-notifications');
    const Device = require('expo-device');

    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Sauvegarder le token dans la table users
    await supabase
      .from('users')
      .update({ push_token: token })
      .eq('id', userId);

    // Config Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Zabrat',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F5A623',
      });
    }

    return token;
  } catch (err) {
    console.error('Push token registration failed:', err);
  }
}

// Envoyer une notification locale (pour le testing)
export async function sendLocalNotification(title: string, body: string) {
  if (Platform.OS === 'web') return;

  try {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: true },
      trigger: null, // Immédiat
    });
  } catch (err) {
    console.error('Local notification failed:', err);
  }
}

// Vérifier si un badge est proche et notifier
export async function checkBadgeProximity(userId: string, totalBeers: number) {
  const thresholds = [
    { value: 10, name: "L'Initié" },
    { value: 25, name: "L'Amateur" },
    { value: 50, name: "L'Assidu" },
    { value: 100, name: 'Le Centurion' },
    { value: 200, name: 'Le Phénix' },
    { value: 500, name: 'El Maestro' },
  ];

  for (const t of thresholds) {
    const remaining = t.value - totalBeers;
    if (remaining > 0 && remaining <= 3) {
      await sendLocalNotification(
        '🎯 Badge proche !',
        `Tu es à ${remaining} bière${remaining > 1 ? 's' : ''} du badge ${t.name}`
      );
      break;
    }
  }
}

// Vérifier le streak en danger
export async function checkStreakDanger(userId: string, streakCurrent: number, lastActive: string | null) {
  if (streakCurrent < 2 || !lastActive) return;

  const now = new Date();
  const last = new Date(lastActive);
  const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60);

  // Si plus de 20h sans log et streak active
  if (hoursSince >= 20 && hoursSince < 24) {
    await sendLocalNotification(
      '⚠️ Streak en danger !',
      `Ta streak de ${streakCurrent} jours est en danger ce soir !`
    );
  }
}
