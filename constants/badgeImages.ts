// Mapping des badges vers leurs images 3D générées par Gemini
// Les badges qui n'ont pas encore d'image utilisent l'emoji en fallback

export const BADGE_IMAGES: Record<string, any> = {
  'Premier Verre': require('../assets/images/badges/first-sip.png'),
  'Party Starter': require('../assets/images/badges/party-animal.png'),
  'Régulier': require('../assets/images/badges/streak-7.png'),
  'Roi du Bar': require('../assets/images/badges/bar-king.png'),
  'Explorateur': require('../assets/images/badges/explorer.png'),
  'Le Centurion': require('../assets/images/badges/100-club.png'),
  'Duo de Feu': require('../assets/images/badges/social-drinker.png'),
  'El Maestro': require('../assets/images/badges/legend.png'),
  'Le Zombie': require('../assets/images/badges/legend.png'),
};

// Mapping des niveaux vers leurs emblèmes
export const LEVEL_IMAGES: Record<number, any> = {
  1: require('../assets/images/levels/level-1-novice.png'),
  2: require('../assets/images/levels/level-2-amateur.png'),
  3: require('../assets/images/levels/level-3-habitue.png'),
  4: require('../assets/images/levels/level-4-regulier.png'),
  5: require('../assets/images/levels/level-5-expert.png'),
  6: require('../assets/images/levels/level-6-legende.png'),
  7: require('../assets/images/levels/level-7-maestro.png'),
};

// Empty states
export const EMPTY_IMAGES = {
  feed: require('../assets/images/empty-feed.png'),
  friends: require('../assets/images/empty-friends.png'),
};
