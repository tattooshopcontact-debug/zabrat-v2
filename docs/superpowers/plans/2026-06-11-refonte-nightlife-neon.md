# Refonte « Nightlife Néon » — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refondre toute l'UI de Zabrat au niveau du prototype Claude Design « Nightlife Néon » (handoff dans `docs/design-handoff/`), sans toucher aux données, services ni à la stack.

**Architecture:** Re-skin complet écran par écran. On pose d'abord les fondations (tokens, fonts, composants néon partagés), on restructure la tab bar 6→4+1 (fusion Stats dans Profil), puis on refait chaque écran en suivant le handoff. Les services `lib/*` et stores restent inchangés — seuls les fichiers UI bougent.

**Tech Stack:** Expo SDK 55 / RN 0.83 (le style `boxShadow` est supporté nativement iOS+Android+web → c'est notre mécanisme de glow), expo-router, react-native-reanimated 4, + nouvelles deps : `expo-linear-gradient`, `expo-blur`, `expo-font`, `@expo-google-fonts/barlow-condensed`, `@expo-google-fonts/outfit`, `react-native-svg`.

**Référence design (source de vérité visuelle) :**
| Écran | Fichier handoff |
|---|---|
| Tokens, icônes, logo, verres, avatars | `docs/design-handoff/zabrat-core.jsx` |
| Ce soir (feed) + Carte | `docs/design-handoff/zabrat-screens-1.jsx` |
| Ligue + Profil + Amis | `docs/design-handoff/zabrat-screens-2.jsx` |
| Modal LOG + Wrapped + Onboarding + Auth | `docs/design-handoff/zabrat-flows.jsx` |
| Specs écrites (couleurs, tailles, comportements) | `docs/design-handoff/README.md` |

**Conversion CSS → RN (à appliquer partout) :**
- `box-shadow: 0 0 30px rgba(255,149,0,.47)` → style RN `boxShadow: '0 0 30px rgba(255,149,0,0.47)'` (string, supporté RN 0.76+)
- `backdrop-filter: blur(20px)` → `<BlurView intensity={50} tint="dark">` (expo-blur) ; sur web ça rend un vrai blur
- `linear-gradient(100deg, amber, orange)` → `<LinearGradient colors={[Colors.amber, Colors.orange]} start={{x:0,y:0}} end={{x:1,y:0.2}}>`
- `text-shadow` → `textShadowColor` + `textShadowRadius` (glow texte)
- Le multiplicateur de glow 0.85 du prototype est **déjà appliqué** dans les valeurs `Glow.*` du nouveau theme.ts (ne pas re-multiplier)

**Vérification par tâche (pas d'infra de test dans ce repo) :** `npx tsc --noEmit` (0 erreur) + contrôle visuel sur `npx expo start --web --port 8084` en comparant avec `docs/design-handoff/Zabrat Prototype.html` ouvert dans un autre onglet.

---

### Task 1: Dépendances + fonts

**Files:**
- Modify: `package.json` (via npx expo install)
- Modify: `app/_layout.tsx` (chargement fonts)

- [ ] **Step 1: Installer les dépendances**

```bash
npx expo install expo-linear-gradient expo-blur expo-font react-native-svg @expo-google-fonts/barlow-condensed @expo-google-fonts/outfit
```

Expected: ajoute les 6 paquets aux versions compatibles SDK 55, sans erreur peer-deps.

- [ ] **Step 2: Charger les fonts dans le layout racine**

Dans `app/_layout.tsx`, ajouter en haut :

```tsx
import { useFonts } from 'expo-font';
import { BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import {
  Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
```

Dans le composant racine, avant le return :

```tsx
const [fontsLoaded] = useFonts({
  BarlowCondensed_700Bold,
  Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold,
});
if (!fontsLoaded) return null; // le splash screen reste affiché
```

- [ ] **Step 3: Vérifier**

Run: `npx tsc --noEmit` → 0 erreur. `npx expo start --web --port 8084` → l'app démarre toujours.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json app/_layout.tsx
git commit -m "feat(neon): deps refonte (gradient, blur, svg, fonts Barlow/Outfit)"
```

---

### Task 2: Nouveau design system `constants/theme.ts`

**Files:**
- Modify: `constants/theme.ts` (remplacement complet, en gardant les exports `Colors`, `Fonts`, `TabBar` pour ne rien casser)

- [ ] **Step 1: Remplacer le contenu de `constants/theme.ts`**

```ts
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
```

- [ ] **Step 2: Corriger les usages cassés**

Run: `npx tsc --noEmit`. Les anciens styles utilisaient `Fonts.statNumber.fontSize: 28` etc. — les erreurs probables : spreads de `Fonts.*` qui attendaient `fontWeight`. Corriger UNIQUEMENT pour que ça compile (les écrans seront refaits dans les tâches suivantes) : si un écran spread `Fonts.label` ou `Fonts.body`, ça compile sans changement. Si `TabBar.plusSize`/`plusElevation` sont référencés dans `app/(tabs)/_layout.tsx`, remplacer temporairement par `TabBar.logSize`/`TabBar.logElevation`.

- [ ] **Step 3: Vérifier**

Run: `npx tsc --noEmit` → 0 erreur. L'app web démarre (le look est transitoire, c'est normal).

- [ ] **Step 4: Commit**

```bash
git add constants/theme.ts app
git commit -m "feat(neon): design system Nightlife Néon (tokens, glows, fonts)"
```

---

### Task 3: Composants néon partagés

**Files:**
- Create: `components/neon/NeonButton.tsx`
- Create: `components/neon/GlassCard.tsx`
- Create: `components/neon/StatNumber.tsx`
- Create: `components/neon/ZabratLogo.tsx`
- Create: `components/neon/BeerGlass.tsx`

- [ ] **Step 1: `components/neon/NeonButton.tsx` — CTA dégradé glow**

```tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Fonts, Gradients, Glow, Radius } from '../../constants/theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  hint?: string;            // ex. « Choisis ta bière d'abord » quand disabled
  style?: ViewStyle;
};

export default function NeonButton({ title, onPress, disabled, hint, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        { opacity: disabled ? 0.4 : 1, transform: [{ scale: pressed ? 0.96 : 1 }] },
        !disabled && { boxShadow: Glow.cta },
        styles.radius, style,
      ]}
    >
      <LinearGradient
        colors={[...Gradients.cta]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.2 }}
        style={styles.inner}
      >
        <Text style={Fonts.cta}>{disabled && hint ? hint : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  radius: { borderRadius: Radius.cta },
  inner: {
    height: 62, borderRadius: Radius.cta,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24,
  },
});
```

- [ ] **Step 2: `components/neon/GlassCard.tsx` — surface glassmorphism**

```tsx
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius } from '../../constants/theme';

export default function GlassCard({ children, style, glow }: {
  children: React.ReactNode; style?: ViewStyle; glow?: string;
}) {
  return (
    <BlurView intensity={40} tint="dark" style={[styles.card, glow ? { boxShadow: glow } : null, style]}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(21,21,28,0.78)',
    borderRadius: Radius.card,
    borderWidth: 1, borderColor: Colors.border,
    padding: 16, overflow: 'hidden',
  },
});
```

- [ ] **Step 3: `components/neon/StatNumber.tsx` — chiffre géant glow**

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Fonts, Glow } from '../../constants/theme';

export default function StatNumber({ value, label, amber = false, size = 40 }: {
  value: string; label: string; amber?: boolean; size?: number;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={[Fonts.display, { fontSize: size }, amber && { color: Colors.primary, ...Glow.textAmber }]}>
        {value}
      </Text>
      <Text style={Fonts.small}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', gap: 2 } });
```

- [ ] **Step 4: `components/neon/ZabratLogo.tsx` — porter le SVG du handoff**

Porter `ZabratLogo` de `docs/design-handoff/zabrat-core.jsx` (chercher `function ZabratLogo`) en react-native-svg : chope (3 traits de mousse + corps + anse) + 3 étoiles 4 branches, trait `Colors.primary` strokeWidth 3.4. Wrapper le `<Svg>` dans une `<View style={{ boxShadow: Glow.card }}>` pour le glow. Props : `size?: number` (défaut 120).

- [ ] **Step 5: `components/neon/BeerGlass.tsx` — les 6 verres**

Porter `BeerGlass` de `docs/design-handoff/zabrat-core.jsx` (chercher `function BeerGlass`) en react-native-svg. Props : `type: 'blonde'|'blanche'|'brune'|'ipa'|'craft'|'autre'`, `size?: number`, `selected?: boolean`. Verres différenciés (pinte, weizen, snifter, tulipe, teku, cercle pointillé +) teintés par robe — reprendre les paths et couleurs du handoff tels quels.

- [ ] **Step 6: Vérifier + commit**

Run: `npx tsc --noEmit` → 0 erreur.

```bash
git add components/neon
git commit -m "feat(neon): composants partagés (NeonButton, GlassCard, StatNumber, logo, verres)"
```

---

### Task 4: Tab bar 4 onglets + bouton LOG central

**Files:**
- Modify: `app/(tabs)/_layout.tsx` (remplacement complet)
- Delete: `app/(tabs)/stats.tsx` (fusionné dans Profil — Task 8)

- [ ] **Step 1: Réécrire `app/(tabs)/_layout.tsx`**

Ordre des écrans : `feed` (Ce soir) · `map` (Carte) · `plus` (LOG) · `top` (Ligue) · `profile` (Profil). Supprimer le `<Tabs.Screen name="stats">`. Spécifications (README handoff, section Navigation) :

```tsx
import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming,
} from 'react-native-reanimated';
import { Colors, TabBar, Glow, Gradients } from '../../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Bouton LOG central : cercle 64px surélevé, dégradé ambre→orange, glow permanent, label « LOG »
function LogButton() {
  const router = useRouter();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 10 }),
      withSpring(1, { damping: 8 }),
    );
    setTimeout(() => router.push('/log-beer'), 120);
  };

  return (
    <View style={styles.logWrap}>
      <AnimatedPressable onPress={handlePress} style={[styles.logButton, animStyle]}>
        <LinearGradient colors={[...Gradients.cta]} style={styles.logGradient}>
          <Ionicons name="beer" size={30} color={Colors.onAmber} />
        </LinearGradient>
      </AnimatedPressable>
      <Text style={styles.logLabel}>LOG</Text>
    </View>
  );
}

// Onglet : icône + label, actif = ambre + point lumineux 4px sous le label
function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: string; focused: boolean }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    if (focused) scale.value = withSequence(withSpring(1.15, { damping: 8 }), withSpring(1, { damping: 10 }));
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[animStyle, styles.iconWrap]}>
      <Ionicons name={name} size={23} color={color} />
      <View style={[styles.activeDot, { opacity: focused ? 1 : 0 }]} />
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: TabBar.activeColor,
        tabBarInactiveTintColor: TabBar.inactiveColor,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {/* Liseré dégradé ambre 1.5px au-dessus de la barre */}
            <LinearGradient
              colors={['transparent', Colors.primary, Colors.accent, 'transparent']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              locations={[0, 0.45, 0.6, 1]}
              style={styles.topEdge}
            />
            <View style={styles.barBg} />
          </View>
        ),
      }}
    >
      <Tabs.Screen name="feed" options={{
        title: 'Ce soir',
        tabBarIcon: ({ color, focused }) => <TabIcon name="moon" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="map" options={{
        title: 'Carte',
        tabBarIcon: ({ color, focused }) => <TabIcon name="map" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="plus" options={{ title: '', tabBarButton: () => <LogButton /> }}
        listeners={{ tabPress: (e) => e.preventDefault() }} />
      <Tabs.Screen name="top" options={{
        title: 'Ligue',
        tabBarIcon: ({ color, focused }) => <TabIcon name="trophy" color={color} focused={focused} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color, focused }) => <TabIcon name="person" color={color} focused={focused} />,
      }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: TabBar.height, borderTopWidth: 0, backgroundColor: 'transparent',
    paddingBottom: 6, paddingTop: 6, position: 'absolute', elevation: 0,
  },
  topEdge: { height: 1.5 },
  barBg: { flex: 1, backgroundColor: TabBar.background, ...(Platform.OS === 'web' ? { backdropFilter: 'blur(20px)' } as any : null) },
  tabLabel: { fontFamily: 'Outfit_700Bold', fontSize: 10.5 },
  iconWrap: { alignItems: 'center', gap: 3 },
  activeDot: {
    width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary,
    boxShadow: Glow.live.replace('0,229,255', '255,149,0'),
  },
  logWrap: { alignItems: 'center', marginTop: TabBar.logElevation },
  logButton: { borderRadius: TabBar.logSize / 2, boxShadow: Glow.log },
  logGradient: {
    width: TabBar.logSize, height: TabBar.logSize, borderRadius: TabBar.logSize / 2,
    alignItems: 'center', justifyContent: 'center',
  },
  logLabel: { fontFamily: 'Outfit_800ExtraBold', fontSize: 10.5, color: Colors.primary, marginTop: 3 },
});
```

Note : la tab bar est `position: 'absolute'` → chaque écran devra prévoir `paddingBottom: 96` sur son scroll (repris dans chaque tâche écran).

- [ ] **Step 2: Supprimer l'onglet Stats**

```bash
git rm app/\(tabs\)/stats.tsx
```

Si `tsc` remonte des imports vers `stats`, les retirer (l'écran Profil refait en Task 8 absorbera le contenu).

- [ ] **Step 3: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : 4 onglets (Ce soir, Carte, Ligue, Profil) + bouton LOG central dégradé glow, point ambre sous l'onglet actif, liseré dégradé au-dessus de la barre.

- [ ] **Step 4: Commit**

```bash
git add -A app/\(tabs\) && git commit -m "feat(neon): tab bar 4 onglets + bouton LOG central, suppression onglet Stats"
```

---

### Task 5: Écran « Ce soir » (feed)

**Files:**
- Modify: `app/(tabs)/feed.tsx` (refonte complète du rendu — la logique data `feedService` reste identique)
- Référence : `docs/design-handoff/zabrat-screens-1.jsx` (composant `CeSoirScreen`) + README §1

- [ ] **Step 1: Refaire le rendu de `feed.tsx`**

Structure à implémenter (garder les hooks/fetch existants — `feedService`, Realtime, réactions) :

1. **Header** : `<Text style={Fonts.screenTitle}>Ce soir 🌙</Text>` + sous-titre date (`Fonts.small`, ex. « Mardi 10 juin · La Marsa »). À droite : avatar user 46px entouré d'un anneau ambre (`borderWidth: 2, borderColor: Colors.primary, boxShadow: Glow.card`) + badge pill « 🔥6 » (LinearGradient cta, texte `Colors.onAmber`, fontSize 11). Tap avatar → `router.push('/(tabs)/profile')`.
2. **« Qui sort ce soir »** : `Fonts.label` en titre de section, puis `ScrollView horizontal` d'avatars 52px. Ami live : anneau `Colors.cyan` (`borderWidth: 2`, `boxShadow: Glow.live`) + nom du bar en cyan 10.5px avec dot pulsant (reanimated `withRepeat(withTiming)` opacity 0.4→1, 1.8s). Ami inactif : `opacity: 0.55`, « chez lui » en muted.
3. **Card streak** (si streak ≥ 2) : fond `LinearGradient amberSoft`, `borderColor: 'rgba(255,149,0,0.4)'`, `boxShadow: Glow.card` ; « 🔥 6 » en `Fonts.display` 44 + texte « 6 soirs d'affilée / Encore ce soir pour continuer la série ! » + chevron.
4. **Cards feed** : surface `Colors.surface`, radius 18, border `Colors.border` ; avatar 42px, texte riche 15px Outfit (« **Khalil** a bu une **Blonde** 🍺 au **Théatro** » — noms en `Outfit_700Bold`), heure `Fonts.small` ; photo éventuelle (height 170, borderRadius 14) ; réactions 🍻 ❤️ 🔥 en chips pill (`Colors.surface2`, border) avec compteur — état actif : border+texte ambre, `boxShadow: Glow.card`, toggle optimiste existant conservé.
5. **État vide** : emoji verre grisé, « Personne n'a encore bu ce soir… sois le premier 🍺 », `<NeonButton title="Logger ma première" onPress={() => router.push('/log-beer')} />`.
6. Scroll : `contentContainerStyle={{ paddingBottom: 96, paddingHorizontal: 20 }}`, fond écran `Colors.background`.

- [ ] **Step 2: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : comparer côte à côte avec le prototype (flow App → Ce soir). Vérifier : glow streak, anneaux cyan amis live, réactions toggle.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/feed.tsx && git commit -m "feat(neon): écran Ce soir (feed) refait — header streak, qui sort, cards glow"
```

---

### Task 6: Écran Carte

**Files:**
- Modify: `app/(tabs)/map.tsx`
- Modify: `components/MapboxWeb.tsx` (marqueurs néon)
- Référence : `docs/design-handoff/zabrat-screens-1.jsx` (composant `CarteScreen`, marqueurs `heat`) + README §2

- [ ] **Step 1: Marqueurs néon dans `MapboxWeb.tsx`**

Les marqueurs custom existants passent au système « heat » (0-3) calculé depuis le compte de check-ins du soir par bar (data déjà dispo via `mapService.getBarsWithCheckins`) :
- Taille pastille : `10 + heat * 3.4` px ; couleur : heat 0 → `#4A4A5C`, heat ≥ 1 → `Colors.primary` avec `box-shadow: 0 0 ${8 + heat * 8}px rgba(255,149,0,${0.3 + heat * 0.12})` (HTML markers Mapbox → CSS direct).
- Halo pulsant : élément CSS avec `animation: pulse ${2.6 - heat * 0.4}s infinite` (keyframes scale 1→1.45, injectées une fois dans le DOM par MapboxWeb).
- Bar le plus chaud : chip au-dessus du marqueur `linear-gradient(100deg,#FF9500,#FF6B35)`, texte `#1A0E00` 11px 800, « 12 🍺 ce soir ». Les autres : label « Nom · n » 10.5px `#9494A6`.
- Avatars amis 22px (initiales, anneau cyan `box-shadow: 0 0 14px rgba(0,229,255,.43)`) posés à côté du marqueur de leur bar.

- [ ] **Step 2: UI de l'écran dans `map.tsx`**

1. **Bouton flottant haut centré** : pill glass (`GlassCard` compacte, padding 10×16) « ● Qui sort ce soir ? 4 » — dot cyan pulsant (reanimated), compteur cyan. Tap → panneau glass (GlassCard absolute top 70) listant les amis live : avatar, « 📍 au Théatro » cyan, bouton « Voir » (ouvre la sheet du bar correspondant).
2. **Bottom sheet bar** (remplace l'existante) : `GlassCard` absolute bottom 80 (au-dessus de la tab bar), radius 24, handle 38×4.5 centré ; nom (`Fonts.display` 26), « 📍 zone · distance » (`Fonts.small`), rangée de 2 stat-tiles (`Colors.surface2`, radius 14) : « 12 / bières ce soir » (chiffre `Fonts.display` 28 ambre + `Glow.textAmber`) et avatars + « Khalil, Wassim y sont en ce moment » (texte cyan) ; ligne « 👑 Roi du bar : **Wassim** » (nom en ambre) ; `<NeonButton title="Check-in 📍" onPress={handleCheckin} />`. Le handler `handleCheckin` existant reste, mais le message succès devient un **toast** vert flottant 2.2s (`Animated` opacity/translateY) au lieu du texte inline.
3. Entrée de la sheet : reanimated `withSpring` translateY 300→0.

- [ ] **Step 3: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : marqueurs glow proportionnels à l'affluence, sheet glass au tap, check-in → toast vert.

- [ ] **Step 4: Commit**

```bash
git add app/\(tabs\)/map.tsx components/MapboxWeb.tsx
git commit -m "feat(neon): carte — marqueurs heat glow, bottom sheet glass, qui sort ce soir"
```

---

### Task 7: Modal LOG + écran succès

**Files:**
- Modify: `app/log-beer.tsx`
- Référence : `docs/design-handoff/zabrat-flows.jsx` (composants `LogModal`, succès confetti) + README §3
- Réutilise : `components/neon/BeerGlass.tsx`, `NeonButton`, `components/Confetti.tsx` (existant)

- [ ] **Step 1: Refaire le rendu de `log-beer.tsx`** (logique `logBeer()` inchangée)

1. Fond : `rgba(6,6,10,0.88)` + `<BlurView>` plein écran ; titre « C'est quoi ce soir ? » (`Fonts.display` 27) + bouton fermer (Ionicons close, 38px surface/border).
2. **Grille 3×2 des 6 types** (`BEER_TYPES` de mockData) : tuiles `aspectRatio: 1` fond `rgba(255,255,255,0.045)`, border `rgba(255,255,255,0.1)`, radius 18, contenant `<BeerGlass type={key} size={44} selected={...} />` + label. Sélection : `borderColor: Colors.primary, borderWidth: 1.5`, fond `LinearGradient amberSoft`, `boxShadow: Glow.card` (26px), label ambre. Press : scale 0.95.
3. **Chips bars** horizontales (bars de `mapService`) — active : border + texte ambre + glow léger. Défaut : bar le plus proche si géoloc dispo (logique existante).
4. **Toggle visibilité** segmenté « 👥 Mes amis / 🔒 Privé » (2 segments pill, actif = fond ambre translucide + texte ambre).
5. **CTA** : `<NeonButton title="VALIDER 🍺" hint="Choisis ta bière d'abord" disabled={!selectedType} onPress={handleSubmit} />`.
6. **Succès** : conserver `Confetti` existant (passer les couleurs `['#FF9500','#FF6B35','#00E5FF','#FFFFFF']`) ; grande chope = `<BeerGlass type={selected} size={120} />` avec pop reanimated `withSpring` scale 0.3→1 (damping 7, ~0.55s) ; « +1 ! » en `Fonts.display` 56 ambre + `Glow.textAmberBig` ; « T'en es à 4 ce soir 🔥 » ; chips « +25 pts » (ambre translucide) et « 🏅 Badge « X » débloqué » (cyan translucide) si badge retourné par `logBeer()` ; CTA « Retour à la soirée ».

- [ ] **Step 2: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : flow complet LOG → sélection (CTA passe de 0.4 à plein + glow) → VALIDER → succès confetti → retour.

- [ ] **Step 3: Commit**

```bash
git add app/log-beer.tsx && git commit -m "feat(neon): modal LOG — verres SVG, chips bars, succès néon confetti"
```

---

### Task 8: Écran Ligue

**Files:**
- Modify: `app/(tabs)/top.tsx`
- Référence : `docs/design-handoff/zabrat-screens-2.jsx` (composant `LigueScreen`) + README §4

- [ ] **Step 1: Refaire le rendu** (data `leaderboardService` inchangée)

1. Header « Ligue » (`Fonts.screenTitle`) + ligne countdown « ⏱ Se termine dans **2j 14h** » (dot ambre pulsant, valeur en ambre `Outfit_700Bold`). Le countdown se calcule depuis la fin de semaine ISO (dimanche 23:59) — `const ms = endOfWeek.getTime() - Date.now()` formaté « Xj Yh ».
2. Tabs segmentés « Cette semaine / Ce mois » : actif = pill `LinearGradient cta` texte `Colors.onAmber` (logique de période existante).
3. **Podium top 3** : 3 colonnes (ordre visuel 2-1-3), marches de hauteurs 64/92/46 avec dégradés translucides — #1 : `rgba(255,149,0,0.25)→rgba(255,107,53,0.1)` + border ambre 0.5 + `boxShadow: Glow.card` + couronne Ionicons au-dessus + avatar 64px anneau ambre ; #2 argent `#C8CAD8` ; #3 bronze `#C77B4A` (mêmes structures, translucides, sans glow). Compteur « 23 🍺 » `Fonts.display` 19 coloré par rang.
4. **Liste rangs 4+** : rang (`Fonts.display` 19 muted), avatar 40, pseudo, « 14 🍺 », delta `▲1` vert / `▼2` rouge / `—` muted (le delta vient de `weekly_scores` vs semaine précédente si dispo ; sinon afficher `—` pour tous : pas de nouvelle table).
5. **Ligne « Toi »** : fond `LinearGradient amberSoft`, border `rgba(255,149,0,0.5)`, `boxShadow: Glow.card`. **Sticky** : mesurer sa position avec `onLayout` + `onScroll` ; quand elle sort du viewport, afficher un clone `position: absolute, bottom: 96` fond `rgba(16,16,23,0.94)`.

- [ ] **Step 2: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : podium néon, switch période, scroller pour déclencher la ligne sticky.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/top.tsx && git commit -m "feat(neon): Ligue — podium néon, countdown, ligne Toi sticky"
```

---

### Task 9: Écran Profil (fusion Stats)

**Files:**
- Modify: `app/(tabs)/profile.tsx`
- Référence : `docs/design-handoff/zabrat-screens-2.jsx` (composant `ProfilScreen`) + README §5
- Source des données stats : reprendre les requêtes de l'ancien `stats.tsx` (supprimé en Task 4 — récupérer son code via `git show HEAD~N:app/\(tabs\)/stats.tsx` si besoin)

- [ ] **Step 1: Refaire le rendu**

1. Icône réglages en haut à droite (38px, `Colors.surface` + border) → `router.push('/settings')`.
2. **Hero** : avatar 94px dans un **anneau de progression XP** en react-native-svg — `<Circle>` fond `Colors.border` strokeWidth 5 + `<Circle>` ambre `strokeDasharray` proportionnel au % XP (72% pour le mock), `strokeLinecap="round"`, rotation -90°, wrapper avec `boxShadow: Glow.card`. Pseudo (`Fonts.display` 28), pill niveau « Niv. 4 · L'Habitué ⭐ » (ambre translucide), « 140 XP avant « Le Pilier » » (`Fonts.small`). Niveaux : `LEVEL_INFO` de mockData.
3. **3 chiffres géants** (rangée, séparateurs verticaux 1px border) avec `StatNumber` : `149` bières au total (amber), `6 🔥` streak, `#2` cette semaine.
4. **Graphique hebdo** : carte surface avec header « Cette semaine » + total « 18 🍺 » ; 7 barres (L→D) `borderRadius: 6`, hauteur proportionnelle, jours forts en `LinearGradient cta` + `boxShadow: Glow.card`, jours passés `rgba(255,149,0,0.35)`, jour vide : trait 3px border. Données : beer_logs de la semaine groupés par jour (requête existante de l'ancien stats.tsx, sinon mock).
5. **Grille badges 5 colonnes** + compteur « 6/47 » : débloqués = tuile `rgba(255,149,0,0.12)` + emoji/icône avec glow ; verrouillés = `Colors.surface2` + cadenas `#3A3A48`. Data : `badgeService` existant.
6. **Boutons** : `<NeonButton title="Mon Wrapped 🎁" onPress={() => router.push('/wrapped')} />` + bouton secondaire « Mes amis » (fond ambre translucide, border ambre 0.4, texte ambre, icône users) → `/friends`.
7. Scroll `paddingBottom: 96`.

- [ ] **Step 2: Vérifier**

`npx tsc --noEmit` → 0 erreur. Web : anneau XP, 3 stats, graphe, badges, navigation Wrapped/Amis/Settings OK. Plus d'onglet Stats nulle part.

- [ ] **Step 3: Commit**

```bash
git add app/\(tabs\)/profile.tsx && git commit -m "feat(neon): Profil — fusion stats, anneau XP, graphe hebdo, badges glow"
```

---

### Task 10: Écran Amis

**Files:**
- Modify: `app/friends.tsx`
- Référence : `docs/design-handoff/zabrat-screens-2.jsx` (composant `AmisScreen`) + README §6

- [ ] **Step 1: Refaire le rendu** (logique `friendsService` inchangée)

1. Header avec bouton back (38px surface/border) + titre « Mes amis » (`Fonts.screenTitle`).
2. Tabs segmentés : **Mes amis / Demandes (2) / Chercher** — actif : pill dégradé ambre texte `onAmber` ; le compteur de demandes vient de la data existante.
3. Chercher : input 48px (`Colors.surface2`, border, radius 16, icône loupe) « Pseudo ou numéro de téléphone », filtre live (logique existante).
4. Cards amis : avatar 44 (anneau cyan + `Glow.live` si live), pseudo `Fonts.bodyBold`, sous-ligne « 23 bières ce mois » + « · 📍 au Théatro » en cyan si live, chevron.
5. Demandes : avatar, pseudo, « 4 amis en commun » (`Fonts.small`), boutons **Refuser** (ghost : border muted, texte muted) / **Accepter** (pill `LinearGradient cta`).
6. **« Inviter sur WhatsApp »** : bouton plein `Colors.whatsapp`, 50px radius 16, icône logo-whatsapp Ionicons + texte blanc 700 (handler share existant).

- [ ] **Step 2: Vérifier + commit**

`npx tsc --noEmit` → 0 erreur ; web : 3 tabs, recherche, accept/refuse.

```bash
git add app/friends.tsx && git commit -m "feat(neon): écran Amis — tabs segmentés, live cyan, invite WhatsApp"
```

---

### Task 11: Wrapped mensuel

**Files:**
- Modify: `app/wrapped.tsx`
- Référence : `docs/design-handoff/zabrat-flows.jsx` (composant `WrappedScreen`) + README §7

- [ ] **Step 1: Refaire le rendu** (data du mois inchangée)

1. Fond : `LinearGradient` radial simulé — `colors={['#1B1430', '#0A0A0F']}` vertical + 3 `<View>` halos flous absolus (ambre/orange/cyan : cercles 220px, `opacity: 0.16`, sur web `filter: 'blur(70px)'`, sur natif opacity basse suffit).
2. Header : `<ZabratLogo size={30} />` + « ZABRAT WRAPPED » (`Fonts.label` letterSpacing 3) ; titre « Ton mois de mai 🍺 » (`Fonts.display` 32).
3. **Total géant** : chiffre du mois en `Fonts.display` **118** ambre + `Glow.textAmberBig` + « bières / ce mois-ci » dessous.
4. Rows glass (`GlassCard` padding 14) : Bar préféré → **Théatro** (14 soirées) · Bière préférée → **Blonde** (31 sur 54) · Meilleur soir → **Sam. 17 mai** (7 🍺 — record) — valeurs depuis la data existante.
5. 2 tiles côte à côte : « Chez les amis **#3** » (chiffre ambre glow) · « Badge du mois 🥇 L'Assidu ».
6. `<NeonButton title="Partager 📤" onPress={handleShare} />` + mention « WhatsApp · Instagram » (`Fonts.small`) — handler share existant conservé.

- [ ] **Step 2: Vérifier + commit**

`npx tsc --noEmit` → 0 erreur ; web : rendu story, halos visibles.

```bash
git add app/wrapped.tsx && git commit -m "feat(neon): Wrapped — fond nuit halos néon, total géant 118, rows glass"
```

---

### Task 12: Onboarding (5 → 3 slides)

**Files:**
- Modify: `app/onboarding.tsx`
- Référence : `docs/design-handoff/zabrat-flows.jsx` (composant `OnboardingFlow`) + README §8

- [ ] **Step 1: Réduire à 3 slides et re-skinner**

1. Slide 1 : `<ZabratLogo size={150} />` + « Zabrat » (`Fonts.display` 38 blanc) + « **Tes soirées comptent.** » (`Fonts.display` 38 ambre + `Glow.textAmber`).
2. Slide 2 : mini-carte illustrative (View 240×160 `Colors.mapBg` radius 18 avec 3 pastilles glow + 2 mini-avatars — composant inline simple) + « Vois qui sort, / **et où ça bouge.** ».
3. Slide 3 : mini-podium (3 barres 64/92/46 dégradé ambre) + « Sois le roi / **de la semaine.** ».
4. Dots : inactif 6px muted ; actif : pill 24×6 ambre + glow. « Passer » discret en haut à droite. CTA « Continuer » → slide suivante, puis « **C'est parti 🍺** » → flow existant (phone/feed).
5. Entrées en fade-up reanimated (`FadeInUp.duration(400)`).

- [ ] **Step 2: Vérifier + commit**

`npx tsc --noEmit` → 0 erreur ; web : 3 slides, dots, skip.

```bash
git add app/onboarding.tsx && git commit -m "feat(neon): onboarding 3 slides néon"
```

---

### Task 13: Auth téléphone

**Files:**
- Modify: `app/phone.tsx`
- Référence : `docs/design-handoff/zabrat-flows.jsx` (composant `AuthFlow`) + README §9

- [ ] **Step 1: Re-skinner les 3 étapes** (logique OTP/devMode inchangée)

1. **Étape numéro** : champ 60px `Colors.surface2` radius 18, **bordure ambre + `boxShadow: Glow.card`** (le glow guide l'attention), préfixe « 🇹🇳 +216 » `Fonts.bodyBold`, placeholder « 20 000 000 ». Clavier numérique custom : grille 3×4 touches 52px (`Colors.surface`, border, radius 14, pressed scale 0.95) — remplace le TextInput clavier système pour un rendu identique web/mobile. CTA « Recevoir mon code » désactivé < 8 chiffres.
2. **Étape OTP** : 6 cases 46×58 (`Fonts.display` 27) — remplie : fond `rgba(255,149,0,0.12)` + border ambre + `boxShadow: Glow.card` ; courante : caret ambre clignotant (reanimated opacity loop) + glow léger. Auto-submit à 6 chiffres après 450ms (logique existante).
3. **Étape profil** : avatar 104px anneau ambre + bouton « + » dégradé en coin, champ pseudo centré bordure ambre glow, `<NeonButton title="C'est parti 🍺" />`.
4. Dots de progression (3) en haut à droite, back step par step (existant).

- [ ] **Step 2: Vérifier + commit**

`npx tsc --noEmit` → 0 erreur ; web : flow 3 étapes en devMode.

```bash
git add app/phone.tsx && git commit -m "feat(neon): auth téléphone — clavier custom, OTP glow, étape profil"
```

---

### Task 14: Settings + finitions globales

**Files:**
- Modify: `app/settings.tsx` (re-skin léger : tokens néon, pas de redesign structurel)
- Modify: `app/_layout.tsx` (fond `#0A0A0F` partout, status bar)
- Modify: `CLAUDE.md` (mettre à jour la table Design System)
- Modify: `constants/mockData.ts` (si des couleurs hex `#F5A623`/`#0D0D0D`/`#1E1E1E` y traînent)

- [ ] **Step 1: Balayage des anciennes couleurs**

```bash
grep -rn "#F5A623\|#0D0D0D\|#1E1E1E\|#272727\|#333333\|#888888" app components constants lib stores --include="*.ts" --include="*.tsx"
```

Remplacer chaque occurrence par le token `Colors.*` correspondant (primary/background/surface/surface2/border/textMuted). Zéro hex en dur hors `theme.ts`.

- [ ] **Step 2: Settings re-skin léger**

Cards `Colors.surface` radius 18 border `Colors.border`, titres de sections en `Fonts.label`, switches `trackColor={{ true: Colors.primary }}`, bouton déconnexion `Colors.danger` translucide. Structure et logique inchangées.

- [ ] **Step 3: Mettre à jour `CLAUDE.md`**

Remplacer la table Design System par les nouvelles valeurs (fond `#0A0A0F`, cartes `#15151C`, ambre `#FF9500`, cyan live `#00E5FF`, bordures `#2A2A35`, texte secondaire `#9494A6`, fonts Barlow Condensed 700 / Outfit) et noter : « Glows via style `boxShadow` (RN 0.76+), dégradés via expo-linear-gradient, blur via expo-blur ».

- [ ] **Step 4: Vérification finale complète**

`npx tsc --noEmit` → 0 erreur. Parcours complet sur web : onboarding → auth (devMode) → Ce soir → Carte (sheet + check-in) → LOG (succès) → Ligue → Profil → Amis → Wrapped → Settings. Aucun écran avec l'ancien thème.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(neon): settings, purge anciennes couleurs, CLAUDE.md à jour — refonte complète"
```

---

## Notes d'exécution

- **Ordre strict** : Tasks 1→4 sont des fondations, ne pas paralléliser. Tasks 5→13 sont indépendantes entre elles une fois 1-4 faites.
- **Ne JAMAIS toucher** : `lib/*` (services), `stores/*`, `supabase/*`, la logique de fetch/Realtime des écrans. Si un écran semble exiger un changement de service, s'arrêter et demander.
- **`prefers-reduced-motion`** : sur web, les keyframes CSS de MapboxWeb doivent être dans un bloc `@media (prefers-reduced-motion: no-preference)`.
- Le prototype HTML (`docs/design-handoff/Zabrat Prototype.html`) s'ouvre dans un navigateur avec internet — l'avoir ouvert à côté pendant toute l'implémentation.
