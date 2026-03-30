// Mock data for all screens — used when devMode is true
// TODO: SUPABASE — Replace all mock data with real queries

export const MOCK_FEED_ITEMS = [
  {
    id: '1',
    type: 'beer_log' as const,
    user: { display_name: 'Aymen', username: 'aymen_b', initials: 'AY', color: '#FF6B35' },
    beer_type: 'Blonde',
    beer_brand: 'Heineken',
    bar_name: 'Théatro',
    time: 'Il y a 5 min',
    reactions: { beer: 3, clap: 1, fire: 2 },
  },
  {
    id: '2',
    type: 'badge_unlock' as const,
    user: { display_name: 'Ines', username: 'ines_m', initials: 'IN', color: '#4CAF50' },
    badge_name: 'Exploratrice',
    badge_emoji: '🗺️',
    badge_description: '5 bars différents',
    time: 'Il y a 23 min',
    reactions: { beer: 0, clap: 5, fire: 3 },
  },
  {
    id: '3',
    type: 'beer_log' as const,
    user: { display_name: 'Mohamed', username: 'mo_z', initials: 'MO', color: '#F5A623' },
    beer_type: 'IPA',
    beer_brand: 'Celtia Craft',
    bar_name: 'Les Caves',
    time: 'Il y a 45 min',
    reactions: { beer: 2, clap: 0, fire: 1 },
  },
  {
    id: '4',
    type: 'beer_log' as const,
    user: { display_name: 'Sarra', username: 'sarra_k', initials: 'SA', color: '#E91E63' },
    beer_type: 'Blanche',
    beer_brand: 'Hoegaarden',
    bar_name: 'Théatro',
    time: 'Il y a 1h',
    reactions: { beer: 1, clap: 2, fire: 0 },
  },
];

export const MOCK_LEADERBOARD = [
  { rank: 1, display_name: 'Aymen', initials: 'AY', color: '#FF6B35', beers: 18, trend: 'up' as const },
  { rank: 2, display_name: 'Ines', initials: 'IN', color: '#4CAF50', beers: 14, trend: 'same' as const },
  { rank: 3, display_name: 'Mohamed', initials: 'MO', color: '#F5A623', beers: 12, trend: 'down' as const },
  { rank: 4, display_name: 'Toi', initials: 'FA', color: '#F5A623', beers: 10, trend: 'up' as const, isMe: true },
  { rank: 5, display_name: 'Sarra', initials: 'SA', color: '#E91E63', beers: 8, trend: 'same' as const },
];

export const MOCK_FAVORITE_BARS = [
  { name: 'Théatro', visits: 12 },
  { name: 'Les Caves', visits: 8 },
  { name: 'Nouveau Bar', visits: 3 },
];

export const MOCK_STREAK_DAYS = [
  { day: 'L', active: true },
  { day: 'M', active: true },
  { day: 'M', active: false },
  { day: 'J', active: true },
  { day: 'V', active: true },
  { day: 'S', active: true },
  { day: 'D', active: false },
];

export const MOCK_BADGES = [
  { id: '1', emoji: '🥤', name: 'Premier Verre', unlocked: true, category: 'quantity' },
  { id: '2', emoji: '🔟', name: "L'Initié", unlocked: true, category: 'quantity' },
  { id: '3', emoji: '🍺', name: "L'Amateur", unlocked: true, category: 'quantity' },
  { id: '4', emoji: '⭐', name: "L'Assidu", unlocked: true, category: 'quantity' },
  { id: '5', emoji: '🗺️', name: 'Explorateur', unlocked: true, category: 'exploration' },
  { id: '6', emoji: '👥', name: 'Social Starter', unlocked: true, category: 'social' },
  { id: '7', emoji: '📅', name: 'Régulier', unlocked: true, category: 'streak' },
  { id: '8', emoji: '🎉', name: 'Party Starter', unlocked: true, category: 'social' },
  // Locked badges
  { id: '9', emoji: '💯', name: 'Le Centurion', unlocked: false, category: 'quantity' },
  { id: '10', emoji: '🔥', name: 'Le Phénix', unlocked: false, category: 'quantity' },
  { id: '11', emoji: '💎', name: 'El Maestro', unlocked: false, category: 'quantity' },
  { id: '12', emoji: '💀', name: 'Le Zombie', unlocked: false, category: 'quantity' },
  { id: '13', emoji: '🌍', name: 'Nomade', unlocked: false, category: 'exploration' },
  { id: '14', emoji: '🏴‍☠️', name: 'Le Pionnier', unlocked: false, category: 'exploration' },
  { id: '15', emoji: '🌆', name: 'Roi de la Nuit', unlocked: false, category: 'exploration' },
  { id: '16', emoji: '🧭', name: 'Le Cartographe', unlocked: false, category: 'exploration' },
  { id: '17', emoji: '🏠', name: 'Le Régulier', unlocked: false, category: 'exploration' },
  { id: '18', emoji: '📣', name: "L'Influenceur", unlocked: false, category: 'social' },
  { id: '19', emoji: '🤝', name: 'Le Connecteur', unlocked: false, category: 'social' },
  { id: '20', emoji: '👑', name: 'Le Maire', unlocked: false, category: 'social' },
  { id: '21', emoji: '🔥', name: 'Duo de Feu', unlocked: false, category: 'social' },
  { id: '22', emoji: '🔄', name: 'La Semaine', unlocked: false, category: 'streak' },
  { id: '23', emoji: '📆', name: 'Le Mensuel', unlocked: false, category: 'streak' },
  { id: '24', emoji: '🌙', name: 'Night Owl', unlocked: false, category: 'streak' },
  { id: '25', emoji: '🌅', name: 'Early Bird', unlocked: false, category: 'streak' },
  { id: '26', emoji: '🎄', name: 'Nuit de Noël', unlocked: false, category: 'streak' },
  { id: '27', emoji: '🎆', name: 'Réveillon', unlocked: false, category: 'streak' },
  { id: '28', emoji: '🍺', name: 'IPA Lover', unlocked: false, category: 'type' },
  { id: '29', emoji: '🌾', name: 'Blanche Fan', unlocked: false, category: 'type' },
  { id: '30', emoji: '🌑', name: 'Dark Side', unlocked: false, category: 'type' },
  { id: '31', emoji: '🍾', name: 'Craft Master', unlocked: false, category: 'type' },
  { id: '32', emoji: '🌍', name: 'World Explorer', unlocked: false, category: 'type' },
  { id: '33', emoji: '🎨', name: "L'Épicurien", unlocked: false, category: 'type' },
  { id: '34', emoji: '🏃', name: 'Marathon', unlocked: false, category: 'event' },
  { id: '35', emoji: '🚀', name: 'Afterwork King', unlocked: false, category: 'event' },
  { id: '36', emoji: '🌙', name: 'Nuit Blanche', unlocked: false, category: 'event' },
  { id: '37', emoji: '🎵', name: 'Festival Goer', unlocked: false, category: 'event' },
  { id: '38', emoji: '⚽', name: 'Match Day', unlocked: false, category: 'event' },
  { id: '39', emoji: '🏆', name: 'Weekend Warrior', unlocked: false, category: 'event' },
  { id: '40', emoji: '🥇', name: 'N°1 de la Semaine', unlocked: false, category: 'competition' },
  { id: '41', emoji: '🥈', name: 'Podium', unlocked: false, category: 'competition' },
  { id: '42', emoji: '👑', name: 'Le Roi', unlocked: false, category: 'competition' },
  { id: '43', emoji: '📈', name: 'Le Revenant', unlocked: false, category: 'competition' },
  // Padding to 47
  { id: '44', emoji: '🍺', name: 'Blonde Fan', unlocked: false, category: 'type' },
  { id: '45', emoji: '🏅', name: 'Habitué', unlocked: false, category: 'exploration' },
  { id: '46', emoji: '🎯', name: 'Sniper', unlocked: false, category: 'competition' },
  { id: '47', emoji: '🌟', name: 'Rising Star', unlocked: false, category: 'competition' },
];

export const BEER_TYPES = [
  { key: 'blonde', label: 'Blonde', emoji: '🍺' },
  { key: 'blanche', label: 'Blanche', emoji: '🌾' },
  { key: 'brune', label: 'Brune', emoji: '🌑' },
  { key: 'ipa', label: 'IPA', emoji: '🍻' },
  { key: 'craft', label: 'Craft', emoji: '🍾' },
  { key: 'autre', label: 'Autre', emoji: '🥤' },
];

export const LEVEL_INFO: Record<number, { name: string; emoji: string; color: string; min: number; max: number }> = {
  1: { name: 'Le Novice', emoji: '🥤', color: '#888888', min: 0, max: 9 },
  2: { name: "L'Amateur", emoji: '🍺', color: '#CD7F32', min: 10, max: 29 },
  3: { name: "L'Habitué", emoji: '⭐', color: '#C0C0C0', min: 30, max: 74 },
  4: { name: 'Le Régulier', emoji: '🔥', color: '#FFD700', min: 75, max: 149 },
  5: { name: "L'Expert", emoji: '💪', color: '#E5E4E2', min: 150, max: 299 },
  6: { name: 'La Légende', emoji: '👑', color: '#B9F2FF', min: 300, max: 499 },
  7: { name: 'El Maestro', emoji: '🏆', color: '#FF0000', min: 500, max: 99999 },
};
