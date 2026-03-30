import { Share, Platform } from 'react-native';

// Partager le classement
export async function shareLeaderboard(rank: number, points: number) {
  const message = `🍺 Je suis #${rank} cette semaine sur Zabrat avec ${points} points ! Tu me dépasses ? 🏆\n\nTélécharge Zabrat pour traquer tes soirées !`;
  await Share.share({ message, title: 'Mon classement Zabrat' });
}

// Partager le Wrapped
export async function shareWrapped(month: string, totalBeers: number, favoriteBar: string) {
  const message = `🎵 Mon Zabrat de ${month} :\n🍺 ${totalBeers} bières\n📍 Bar préféré : ${favoriteBar}\n\nTrack. Share. Compete. 🏆`;
  await Share.share({ message, title: `Mon Zabrat de ${month}` });
}

// Partager un badge débloqué
export async function shareBadge(badgeName: string, badgeEmoji: string) {
  const message = `${badgeEmoji} Badge "${badgeName}" débloqué sur Zabrat ! 🍺🏆\n\nRejoins-moi sur Zabrat !`;
  await Share.share({ message, title: `Badge ${badgeName} débloqué !` });
}

// Inviter un ami via WhatsApp
export async function inviteViaWhatsApp(phone?: string) {
  const message = encodeURIComponent('Rejoins-moi sur Zabrat ! 🍺 Traque tes soirées, défie tes amis, découvre qui sort ce soir. 🏆');

  if (Platform.OS === 'web') {
    const url = phone
      ? `https://wa.me/${phone.replace('+', '')}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  } else {
    const { Linking } = require('react-native');
    const url = phone
      ? `whatsapp://send?phone=${phone.replace('+', '')}&text=${message}`
      : `whatsapp://send?text=${message}`;
    await Linking.openURL(url);
  }
}
