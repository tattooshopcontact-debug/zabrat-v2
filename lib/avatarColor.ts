// Avatars déterministes : couleur + initiales identiques partout dans l'app.
import { Colors } from '../constants/theme';

export const AVATAR_COLORS = ['#FF6B35', '#4CAF50', Colors.primary, '#E91E63', '#2196F3', '#9C27B0'];

export function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Deux premières lettres des deux premiers mots (ex. « Dev Faouez » → « DF »), sinon 2 premières lettres.
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
