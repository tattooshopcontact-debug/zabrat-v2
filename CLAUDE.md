# CLAUDE.md — Zabrat App

## C'est quoi ce projet ?

Zabrat est une app mobile sociale de tracking de bières : **Strava x Snap Map x nightlife**
Boucle principale : **Boire → Logger → Partager → Comparer → Recommencer**

Marché : Tunisie (La Marsa, Sidi Bou Said, Tunis) — Cible : 20-35 ans

## Stack

- React Native + Expo (expo-router file-based)
- Supabase (PostgreSQL + Auth + Realtime + Storage)
- Zustand (state management)
- Mapbox GL JS (carte dark-v11 sur web)
- react-native-reanimated (animations)

## Design System STRICT

| Élément | Valeur |
|---|---|
| Fond app | `#0D0D0D` |
| Cartes | `#1A1A1A` |
| Accent primaire | `#F5A623` (ambre) |
| Accent secondaire | `#FF6B35` (orange) |
| Texte principal | `#FFFFFF` |
| Texte secondaire | `#888888` |
| Bordures | `#333333` |
| Succès | `#4CAF50` |
| Danger | `#F85149` |
| Coins arrondis | 16-20px |
| Dark mode | UNIQUEMENT |

## Commandes

```bash
# Démarrer
npx expo start --web --port 8084

# Supabase
npx supabase db query --linked
```

## Règles de code

- TypeScript strict
- Composants PascalCase
- Hooks custom préfixés `use`
- Styles via StyleSheet.create()
- Animations : react-native-reanimated UNIQUEMENT
- Icônes : @expo/vector-icons (Ionicons)
- JAMAIS de clés API dans le code — toujours .env
- Toujours gérer loading, error, empty states
- Répondre en français

## Variables d'environnement (.env)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_TOKEN=
GEMINI_API_KEY=
```

## Mode DEV

- `devMode = true` dans `stores/authStore.ts`
- Mock user UUID : `00000000-0000-0000-0000-000000000001`
- Policies RLS permissives pour tester sans auth
