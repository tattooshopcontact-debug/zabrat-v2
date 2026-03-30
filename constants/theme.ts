export const Colors = {
  primary: '#F5A623',     // amber/gold — main CTAs, active tabs, stat numbers
  accent: '#FF6B35',      // orange — secondary CTAs only
  background: '#0D0D0D',  // noir profond
  surface: '#1E1E1E',     // card surface
  surface2: '#272727',    // card surface 2
  text: '#FFFFFF',        // texte principal
  textMuted: '#888888',   // texte secondaire
  border: '#333333',      // bordures
  success: '#4CAF50',     // badges unlocked, partner bars
  danger: '#F85149',      // danger
  mapBg: '#1C2128',       // dark map placeholder
} as const;

export const Fonts = {
  statNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  label: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: Colors.textMuted,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: Colors.text,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
  },
} as const;

export const TabBar = {
  height: 64,
  background: Colors.background,
  borderTop: Colors.border,
  activeColor: Colors.primary,
  inactiveColor: Colors.textMuted,
  plusSize: 52,
  plusElevation: -18,
} as const;
