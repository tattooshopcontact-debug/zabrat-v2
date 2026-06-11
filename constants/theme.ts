// Design system « Nightlife Néon » — source : docs/design-handoff/README.md
// Ambre validé client : #FF9500. Glow : valeurs déjà multipliées par 0.85.

export const Colors = {
  primary: '#FF9500',     // ambre néon — signature (ex #F5A623)
  amber: '#FF9500',       // alias lisible
  accent: '#FF6B35',      // orange — fin des dégradés CTA
  cyan: '#00E5FF',        // accent RARE — indicateurs live uniquement
  background: '#0A0A0F',  // noir bleuté profond
  surface: '#15151C',     // cartes, surfaces, tab bar
  surface2: '#1C1C26',    // surfaces secondaires (inputs, chips)
  text: '#FFFFFF',
  textMuted: '#9494A6',
  border: '#2A2A35',
  success: '#4CAF50',
  danger: '#F85149',
  onAmber: '#1A0E00',     // texte posé sur les CTA dégradés
  whatsapp: '#1FAF52',    // bouton invite WhatsApp uniquement
  mapBg: '#0E0E16',
} as const;

// Glows prêts à poser dans les styles (RN 0.76+ : boxShadow en string).
// Intensité ×0.85 déjà appliquée — ne pas re-multiplier.
export const Glow = {
  cta: '0 4px 24px rgba(255,149,0,0.38)',
  log: '0 0 30px rgba(255,149,0,0.47), 0 6px 18px rgba(0,0,0,0.5)',
  card: '0 0 22px rgba(255,149,0,0.20)',
  live: '0 0 14px rgba(0,229,255,0.43)',
  textAmber: { textShadowColor: 'rgba(255,149,0,0.50)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18 },
  textAmberBig: { textShadowColor: 'rgba(255,149,0,0.55)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
} as const;

// Dégradé signature des CTA : <LinearGradient colors={[...Gradients.cta]} ...>
export const Gradients = {
  cta: ['#FF9500', '#FF6B35'] as const,
  amberSoft: ['rgba(255,149,0,0.16)', 'rgba(255,107,53,0.08)'] as const, // cards streak / ligne Toi
};

export const Fonts = {
  // Chiffres géants & titres d'écran — Barlow Condensed 700
  display: { fontFamily: 'BarlowCondensed_700Bold', color: Colors.text },
  statNumber: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 40, color: Colors.primary },
  screenTitle: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 34, color: Colors.text },
  // UI — Outfit
  body: { fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.text },
  bodyBold: { fontFamily: 'Outfit_700Bold', fontSize: 15, color: Colors.text },
  label: {
    fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.textMuted,
    textTransform: 'uppercase' as const, letterSpacing: 1.6,
  },
  small: { fontFamily: 'Outfit_400Regular', fontSize: 12.5, color: Colors.textMuted },
  cta: { fontFamily: 'Outfit_800ExtraBold', fontSize: 17, color: Colors.onAmber },
} as const;

export const Radius = { card: 18, tile: 16, sheet: 24, pill: 999, cta: 20 } as const;
export const Spacing = { screenX: 20, gap: 12, cardPad: 16 } as const;

export const TabBar = {
  height: 64,
  background: 'rgba(21,21,28,0.86)',
  activeColor: Colors.primary,
  inactiveColor: Colors.textMuted,
  logSize: 64,
  logElevation: -26,
} as const;
