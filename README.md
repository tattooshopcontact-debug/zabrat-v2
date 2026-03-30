# 🍺 Zabrat

**Social beer tracking app — Strava x Snap Map x nightlife**

Track. Share. Compete.

## Features

- **Log Beer** — Logger une bière en < 3 secondes
- **Feed Social** — Voir les logs de tes amis en temps réel
- **Leaderboard** — Classement hebdomadaire entre amis
- **Map** — Carte Mapbox dark avec check-ins temps réel
- **47 Badges** — Système de gamification complet
- **7 Niveaux** — Novice → El Maestro
- **Wrapped** — Résumé mensuel partageable

## Stack

| Tech | Usage |
|---|---|
| React Native + Expo | iOS + Android + Web |
| expo-router | Navigation file-based |
| Supabase | PostgreSQL + Auth + Realtime + Storage |
| Zustand | State management |
| Mapbox GL | Carte dark mode |
| react-native-reanimated | Animations |

## Getting Started

```bash
# Clone
git clone https://github.com/tattooshopcontact-debug/zabrat-v2.git
cd zabrat-v2

# Install
npm install --legacy-peer-deps

# Setup .env
cp .env.example .env
# Fill in your Supabase, Mapbox, and Gemini keys

# Run
npx expo start --web --port 8084
```

## Design

Dark mode only — built for nightlife.

- Background: `#0D0D0D`
- Cards: `#1A1A1A`
- Accent: `#F5A623` (amber)

## Market

Tunisia (La Marsa, Tunis, Sidi Bou Said) — Target: 20-35 years old

---

Built with Claude Code
