# Zabrat v2 — Refonte design « Nightlife Néon »

**Date :** 2026-06-10
**Statut :** validé par Faouez (brainstorming session)

## Contexte et objectif

Le design actuel fait amateur. Objectif : refonte visuelle complète niveau premium, direction **nightlife néon**. Le concept, les features et la stack (Expo + Supabase) ne changent pas. Workflow : maquettes générées via **Claude Design** (prompt préparé, mode High fidelity) → validation → implémentation dans l'app.

## Décisions actées

1. **Stack inchangée** — Expo + expo-router + Supabase + Zustand. Aucune migration DB.
2. **Concept inchangé** — boucle Boire → Logger → Partager → Comparer, marché Tunisie 20-35 ans.
3. **Direction visuelle : Nightlife Néon** — l'ambre actuel devient néon lumineux (glow), logo chope + 3 étoiles conservé.
4. **Navigation : Approche A « La nuit au centre »** — 4 onglets + bouton LOG central (au lieu de 6 onglets + FAB).

## Design system « Nightlife Néon »

| Élément | Valeur |
|---|---|
| Fond app | `#0A0A0F` (noir bleuté profond) |
| Cartes / surfaces | `#15151C`, bordures `#2A2A35` |
| Ambre néon (signature) | `#FFB300` + glow |
| Orange chaud (secondaire) | `#FF6B35` (dégradés ambre→orange sur CTA) |
| Cyan néon (accent rare) | `#00E5FF` — live, présence amis uniquement |
| Texte | `#FFFFFF` / secondaire `#9494A6` |
| Succès / Danger | `#4CAF50` / `#F85149` |

Principes : glow sur éléments actifs (bars qui chauffent, streak, bouton LOG), glassmorphism léger sur overlays, chiffres géants typo condensée pour stats, coins arrondis 16-20 px, dark mode uniquement.

## Navigation cible

```
[ Ce soir ]  [ Carte ]   ( 🍺 LOG )   [ Ligue ]  [ Profil ]
```

- **Ce soir** — ex-feed, réorienté soirée en cours
- **Carte** — cœur de l'app (Snap Map nightlife), glow des marqueurs = affluence
- **LOG** — bouton central surélevé glow, modal plein écran, log en 2 taps
- **Ligue** — ex-leaderboard
- **Profil** — fusionne profil + stats (l'onglet Stats disparaît)

Hors tabs (re-skin néon, rôle inchangé) : onboarding, auth OTP, amis, settings, wrapped.

## Livrables

1. **Prompt Claude Design** : `docs/superpowers/specs/2026-06-10-prompt-claude-design.md` — à coller dans Claude Design (Prototype, High fidelity).
2. **Implémentation** (après validation des maquettes) : refonte `constants/theme.ts`, tab bar 6→4+1, fusion stats/profil, puis chaque écran un par un. Services/lib inchangés.

## Hors scope

- Backend, données, auth Twilio, EAS/stores (viendront après la refonte design).
- Nouvelles features (aucune ajoutée dans cette refonte).
