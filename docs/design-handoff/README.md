# Handoff : Zabrat — App sociale de tracking de bières (mobile, dark mode)

## Overview
Zabrat est une app mobile sociale de tracking de bières entre amis pour le marché tunisien (La Marsa, Sidi Bou Saïd, Tunis) — positionnement « Strava × Snap Map × nightlife », cible 20-35 ans. Boucle principale : **Boire → Logger → Partager → Comparer**. Toute l'interface est en français, tutoiement, ton complice et festif (jamais corporate). Dark mode **uniquement**.

Ce handoff couvre les 9 écrans du produit + la navigation, prototypés en haute fidélité.

## About the Design Files
Les fichiers de ce bundle sont des **références de design créées en HTML/React (Babel inline)** — des prototypes qui montrent le look et le comportement attendus, **pas du code de production à copier tel quel**. La tâche est de **recréer ces designs dans l'environnement du codebase cible** (React Native, Flutter, SwiftUI, Kotlin…) en utilisant ses patterns et librairies établis. S'il n'y a pas encore de codebase, choisir le framework mobile le plus adapté (React Native ou Flutter recommandés pour iOS+Android) et y implémenter ces designs.

Pour visualiser le prototype : ouvrir `Zabrat Prototype.html` dans un navigateur (nécessite internet pour React/Babel/Google Fonts via CDN). Le rail de gauche bascule entre les flows (Onboarding / Auth / App / Wrapped).

## Fidelity
**Haute fidélité (hifi).** Couleurs, typo, espacements, copies et interactions sont finaux. Recréer l'UI au pixel près avec les conventions du codebase cible. Exceptions lo-fi : les avatars (initiales + dégradés générés — prévoir de vraies photos de profil), la photo du feed (slot drag-and-drop) et la carte (SVG stylisé — en prod, utiliser Mapbox/MapLibre avec un style dark custom).

## Direction artistique — « Nightlife Néon »
Sensation de sortie nocturne : noir profond, lumières néon chaudes, glow. Principes :
- **Glow partout où il y a de la vie** : bouton LOG, streak en cours, bars fréquentés, ligne du classement de l'utilisateur.
- Glassmorphism léger (blur 18-22px, fond `rgba(21,21,28,.7-.88)`) sur overlays, modals, bottom sheets, tab bar.
- Chiffres géants en typo condensée bold.
- Coins arrondis 14-20px, hiérarchie visuelle forte, états pressed visibles (scale .95-.97).
- Le violet/rose « app IA » est interdit — la signature, c'est l'AMBRE. Aucun fond clair.
- Emojis uniquement dans les textes de contenu (feed, boutons CTA) — jamais comme icônes système (utiliser Ionicons ou équivalent).

## Design Tokens

### Couleurs
| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#0A0A0F` | Fond app (noir bleuté profond) |
| `--surface` | `#15151C` | Cartes, surfaces, tab bar |
| `--border` | `#2A2A35` | Bordures fines des cartes |
| `--amber` | `#FF9500` | **Couleur signature** (valeur validée par le client via tweaks ; la valeur d'origine du brief était `#FFB300`) — boutons principaux, actifs, highlights, toujours avec glow |
| `--orange` | `#FF6B35` | Fin du dégradé CTA `linear-gradient(100deg, amber, orange)` |
| `--cyan` | `#00E5FF` | Accent RARE — uniquement indicateurs « live » (amis sortis, check-in, position user) |
| `--text` | `#FFFFFF` | Texte principal |
| `--muted` | `#9494A6` | Texte secondaire |
| `--green` | `#4CAF50` | Succès / delta ▲ |
| `--red` | `#F85149` | Danger / delta ▼ |
| WhatsApp | `#1FAF52` | Bouton « Inviter sur WhatsApp » uniquement |
| Texte sur ambre | `#1A0E00` | Texte des CTA dégradés |

### Glow (intensité globale validée : multiplicateur **0.85**)
Les ombres lumineuses sont définies en `rgb(<amber-rgb> / alpha × 0.85)` :
- CTA : `0 4px 24px rgb(amber / .45×0.85)` + `inset 0 1px 0 rgba(255,255,255,.35)`
- Bouton LOG : `0 0 30px rgb(amber / .55×0.85), 0 6px 18px rgba(0,0,0,.5)`
- Chiffres ambre : `text-shadow: 0 0 18-36px rgb(amber / .5-.65×0.85)`
- Anneaux live : `0 0 ~14px rgb(cyan / .5×0.85)`

### Typographie
| Rôle | Font | Poids | Usage |
|---|---|---|---|
| Chiffres géants & titres d'écran | **Barlow Condensed** | 700 | Stats (40-118px), titres (27-38px), rangs, compteurs |
| UI | **Outfit** | 400-800 | Tout le reste ; labels de section en 12px / 700 / uppercase / letter-spacing 1.6 |
Échelle : 10.5 (tab labels) · 12-13.5 (secondaire) · 15 (corps) · 17-19 (CTA) · 27-34 (titres) · 40-56 (stats) · 118 (Wrapped).

### Rayons & espacements
- Cartes : 18px · tuiles/inputs : 14-18px · sheets/modals : 24px · chips/pills : 999px · CTA géant : 20px.
- Padding écran : 20px horizontal · gaps entre cartes : 12px · padding cartes : 16-18px.

## Navigation
Tab bar 5 éléments, fond `rgba(21,21,28,.86)` + blur 20px, posée sur un **liseré dégradé ambre de 1.5px** (`linear-gradient(90deg, transparent, amber 55%, orange 45%, transparent)`) :

`[ Ce soir ] [ Carte ] ( 🍺 LOG ) [ Ligue ] [ Profil ]`

- Icônes : lune, carte, chope, trophée, personne (style Ionicons outline, stroke ~1.8).
- **Bouton LOG central** : cercle 64px surélevé de 26px au-dessus de la barre, dégradé ambre→orange, glow ambré permanent, icône chope pleine (mousse en 3 cercles + corps + anse), label « LOG » 10.5px/800/ambre dessous. C'est LE bouton de l'app.
- Onglet actif : icône + label ambre, drop-shadow glow sur l'icône, **point lumineux 4px** sous le label.

## Screens / Views

### 1. Ce soir (feed social) — onglet par défaut
- **Header** : « Ce soir 🌙 » (Barlow Condensed 34/700) + « Mardi 10 juin · La Marsa » (13.5/muted). À droite : avatar user 46px avec **anneau ambre de streak** + badge « 🔥6 » (pill dégradé ambre, texte #1A0E00). Tap avatar → onglet Profil.
- **« Qui sort ce soir »** : rangée horizontale scrollable d'avatars 52px. Amis dans un bar : **anneau cyan + nom du bar en cyan** (avec dot live pulsant) sous le prénom. Amis inactifs : opacité .55, « chez lui ».
- **Card streak** (spéciale, glow) : fond dégradé ambre translucide, bordure ambre .4, « 🔥 6 » géant (Barlow 44) + « 6 soirs d'affilée / Encore ce soir pour continuer la série ! » + chevron.
- **Cards du feed** : avatar 42px, texte riche (« **Khalil** a bu une **Blonde** 🍺 au **Théatro** »), heure 12.5/muted, photo éventuelle (170×plein, radius 14), rangée de réactions 🍻 ❤️ 🔥 en chips pill avec compteurs — tap = toggle +1, état actif ambre avec glow léger.
- **État vide** : verre grisé, « Personne n'a encore bu ce soir… / sois le premier 🍺 » + CTA « Logger ma première ».

### 2. Carte (cœur de l'app)
- Carte de nuit plein écran, style dark — golfe de Tunis en haut à droite, liseré de côte avec glow cyan subtil, ligne TGM pointillée, labels quartiers (GAMMARTH / LA MARSA / SIDI BOU SAÏD) en 11px letter-spacing 2.4, couleur `#3D3D4F`.
- **Marqueurs bars** = pastilles néon dont taille (10→20px) et intensité du glow reflètent l'affluence (heat 0-3) + halo pulsant (scale 1→1.45, 1.5-2.6s). Bar le plus chaud (Théatro, 12 🍺) : chip dégradé ambre « 12 🍺 ce soir » au-dessus. Les autres : « Nom · count ». Bar mort : pastille grise `#4A4A5C`.
- **Avatars miniatures 22px anneau cyan** des amis posés à côté du marqueur de leur bar.
- **Position user** : dot cyan 16px, bordure blanche, double halo.
- **Bouton flottant en haut, centré** : « ● Qui sort ce soir ? 4 » (pill glass, dot cyan pulsant, compteur cyan). Tap → panneau glass listant les amis live (avatar, « 📍 au Théatro » cyan, bouton « Voir » qui ouvre la sheet du bar).
- **Bottom sheet glassmorphism** au tap d'un bar (au-dessus de la tab bar, radius 24, handle 38×4.5) : nom (Barlow 26), « 📍 zone · distance », 2 stat-tiles (« 12 / bières ce soir » en ambre glow ; avatars + « Khalil, Wassim y sont en ce moment » en cyan), ligne « 👑 Roi du bar : **Wassim** » (nom en ambre), CTA « Check-in 📍 ». Check-in → toast vert « Check-in au Théatro ✓ » (2.2s).

### 3. LOG (modal plein écran — écran signature)
- S'ouvre depuis le bouton central. Fond `rgba(6,6,10,.88)` + blur 20px.
- Titre « C'est quoi ce soir ? » (Barlow 27) + bouton fermer.
- **Grille 3×2 de 6 types** : Blonde, Blanche, Brune, IPA, Craft, Autre. Tuiles glass (fond blanc .045, bordure blanche .1, radius 18) avec **verres SVG différenciés** (pinte, weizen, snifter, tulipe, teku, cercle pointillé+) teintés par robe. Sélection : bordure ambre 1.5px, fond dégradé ambre translucide, **glow ambre 26px**, label ambre.
- **Chips bars** horizontales scrollables (Théatro, Les Caves, L'Alamo, Saf Saf, Le Nouveau Bar) — active : bordure+texte ambre, glow.
- **Toggle visibilité** segmenté : « 👥 Mes amis / 🔒 Privé » (icônes réelles users/lock).
- **CTA géant « VALIDER 🍺 »** : 62px, radius 20, dégradé ambre→orange, glow ; opacité .4 + hint « Choisis ta bière d'abord » tant qu'aucune bière n'est sélectionnée.
- **Écran de succès** : confettis (34 pièces ambre/orange/cyan/blanc, chute 2-3.6s), grande chope néon (pop scale .3→1, cubic-bezier(.2,1.6,.4,1), .55s), « +1 ! » (Barlow 56 ambre glow), « T'en es à 4 ce soir 🔥 », chips « +25 pts » (ambre) et « 🏅 Badge « L'Assidu » débloqué » (cyan), CTA « Retour à la soirée ».

### 4. Ligue
- Header « Ligue » + compte à rebours « ● Se termine dans **2j 14h** » (dot ambre pulsant, valeur ambre).
- **Tabs segmentés** « Cette semaine / Ce mois » — actif : pill dégradé ambre, texte #1A0E00.
- **Podium top 3** : marches néon (2-1-3), hauteurs 64/92/46px, dégradés translucides or-ambré (#1 avec glow + anneau ambre + couronne), argent `#C8CAD8`, bronze `#C77B4A`. Avatar 64px pour #1, 52px sinon. Compteur « 23 🍺 » en Barlow 19 coloré par rang.
- **Liste** (rangs 4+) : rang (Barlow 19 muted), avatar 40px, pseudo, « 14 🍺 », delta `▲1` vert / `▼2` rouge / `—` muted.
- **Ligne « Toi »** : fond dégradé ambre translucide, bordure ambre .5, glow — **dupliquée en sticky en bas** (au-dessus de la tab bar, fond `rgba(16,16,23,.94)` + blur) quand elle sort de l'écran.

### 5. Profil
- Icône réglages en haut à droite (38px, surface+border).
- **Hero** : avatar 94px dans un **anneau de progression XP** (SVG, stroke ambre 5px, 72%, glow), pseudo « Faouez » (Barlow 28), pill « Niv. 7 · L'Habitué ⭐ » (ambre translucide), « 140 XP avant « Le Pilier » ».
- **Rangée de 3 chiffres géants** (Barlow 40, séparateurs verticaux) : **149** bières au total (ambre + glow) · **6 🔥** streak · **#2** cette semaine.
- **Graphique hebdo** : 7 barres (L→D), radius 6 ; V/S/D en dégradé ambre→orange avec glow, jours passés en ambre .35, jour vide : trait 3px. Total « 18 🍺 » en header de carte.
- **Grille badges 5 colonnes**, compteur « 6/47 » : débloqués (Premier Verre, L'Initié, L'Amateur, L'Assidu, Le Centurion, Régulier) en tuiles ambre translucide + icône ambre glow ; verrouillés en silhouette sombre (icône cadenas `#3A3A48`).
- **Boutons** : « Mon Wrapped 🎁 » (CTA dégradé) + « Mes amis » (secondaire ambre translucide, icône users).

### 6. Amis (écran poussé depuis Profil, bouton back)
- 3 tabs segmentés : **Mes amis / Demandes (2) / Chercher**.
- Chercher : champ « Pseudo ou numéro de téléphone » (48px, icône loupe), filtre en live.
- Cards amis : avatar 44px (anneau cyan si live), pseudo, « 23 bières ce mois » + « · 📍 au Théatro » en cyan le cas échéant, chevron.
- Demandes : avatar, pseudo, « 4 amis en commun », boutons **Refuser** (ghost) / **Accepter** (pill dégradé ambre).
- **« Inviter sur WhatsApp »** : bouton plein `#1FAF52`, icône WhatsApp, 50px.

### 7. Wrapped mensuel (story 9:16, overlay plein écran)
- Fond : radial nuit (`#1B1430` → `#0A0A0F`) + 3 halos néon flous (ambre, orange, cyan).
- « ZABRAT WRAPPED » (logo 30px + label letterspacé) ; « Ton mois de mai 🍺 » (Barlow 32).
- **Total géant : 54** (Barlow 118, ambre, double glow) + « bières / ce mois-ci ».
- Rows glass : Bar préféré → **Théatro** (14 soirées) · Bière préférée → **Blonde** (31 sur 54) · Meilleur soir → **Sam. 17 mai** (7 🍺 — record).
- 2 tiles : « Chez les amis **#3** » (ambre glow) · « Badge du mois 🔥 L'Assidu ».
- CTA « Partager 📤 » + mention « WhatsApp · Instagram ». En prod : générer une image story 1080×1920 pour le share sheet.

### 8. Onboarding (3 slides)
1. Logo chope néon 150px + « Zabrat / **Tes soirées comptent.** »
2. Mini-carte néon (240×160, markers + avatars) + « Vois qui sort, / **et où ça bouge.** »
3. Mini-podium + « Sois le roi / **de la semaine.** »
- Titre blanc / sous-titre ambre glow (Barlow 38). Dots ambre (actif 24px pill + glow), « Passer » discret en haut à droite, CTA « Continuer » puis « **C'est parti 🍺** ». Entrées en fade-up .4s.

### 9. Auth téléphone (3 étapes)
1. **Numéro** : champ 60px bordure ambre + glow (le glow guide l'attention sur le champ actif), préfixe « 🇹🇳 +216 », placeholder « 20 000 000 », **clavier numérique custom** (grille 3×4, touches 52px surface/border), CTA « Recevoir mon code » (désactivé < 8 chiffres).
2. **OTP 6 cases** (46×58, Barlow 27) : case remplie → fond ambre translucide + bordure ambre + **glow** ; case courante → caret ambre clignotant + glow léger. Auto-avance à 6 chiffres (450ms).
3. **Pseudo + avatar** : avatar 104px anneau ambre + bouton « + » dégradé, champ centré bordure ambre glow, CTA « C'est parti 🍺 ».
- Dots de progression en haut à droite, back step par step. Minimaliste, centré.

## Interactions & Behavior
- Tab bar : navigation entre 4 onglets, état conservé par écran. Bouton LOG → modal par-dessus tout.
- Flow LOG : sélection bière (requise) → bar (défaut : bar le plus proche) → visibilité → VALIDER → succès (confetti + récompenses) → retour.
- Carte : tap marqueur → bottom sheet (slide-up) ; tap ailleurs/X → fermer ; Check-in → toast 2.2s ; bouton flottant → liste des amis live.
- Ligue : switch semaine/mois instantané ; détection de visibilité de la ligne « Toi » au scroll pour le sticky.
- Réactions feed : toggle optimiste +1/-1.
- Pressed states : scale(.95) 120ms partout ; transitions de sélection 150-200ms ease.
- Animations : pulse live dot 1.8s ; pulse marqueurs 1.5-2.6s (plus rapide = plus chaud) ; pop chope .55s spring ; fade-up 0.4s ; confetti 2-3.6s linear. Respecter `prefers-reduced-motion`.

## State Management
- `currentTab`, `logModal { open, beer, bar, visibility, success }`, `selectedBar` (sheet), `liguePeriod`, `amisTab`, recherche, demandes (accepter/refuser), réactions par post, flow auth (step, phone, otp, pseudo).
- Données à fetcher : feed du soir, amis + statut live (temps réel — websocket/push), bars + affluence ce soir, classements semaine/mois, profil + badges + graphe hebdo, wrapped mensuel.

## Assets
- **Logo** : chope (3 traits de mousse, anse) + 3 étoiles à 4 branches, en trait ambre 3.4px + glow — recréé en SVG dans `zabrat-core.jsx` (`ZabratLogo`). À décliner en version néon glow ambre.
- **Icônes** : set SVG custom style Ionicons outline (24px, stroke 1.8) dans `zabrat-core.jsx` — en prod, utiliser Ionicons directement (moon, map, beer, trophy, person, settings, search, etc.).
- **Verres de bière** : 6 SVG custom (`BeerGlass` dans `zabrat-core.jsx`).
- **Avatars** : placeholders générés (initiales + 8 dégradés déterministes) — remplacer par photos utilisateurs.
- **Fonts** : Google Fonts — Barlow Condensed (700), Outfit (400-800).
- **Carte** : SVG illustratif (`NightMap` dans `zabrat-screens-1.jsx`) — en prod, fond de carte réel (Mapbox dark custom) centré sur La Marsa/Sidi Bou Saïd.

## Files
| Fichier | Contenu |
|---|---|
| `Zabrat Prototype.html` | Shell : fonts, CSS global (tokens, keyframes), tab bar, navigation, panneau Tweaks |
| `zabrat-core.jsx` | Tokens, icônes SVG, logo, avatars, data mock, `NeonButton`, `BeerGlass`, `Reaction` |
| `zabrat-screens-1.jsx` | Écrans Ce soir (feed) + Carte (SVG map, marqueurs, bottom sheet) |
| `zabrat-screens-2.jsx` | Écrans Ligue (podium, sticky) + Profil (XP ring, chart, badges) + Amis |
| `zabrat-flows.jsx` | Modal LOG + succès confetti, Wrapped, Onboarding, Auth |
| `ios-frame.jsx`, `tweaks-panel.jsx`, `image-slot.js` | Outillage du prototype (cadre iPhone, panneau de réglages, slot photo) — **ne pas implémenter** |

Note : dans le prototype, l'ambre est paramétré via la variable CSS `--amber` (valeur retenue `#FF9500`) et le glow via un multiplicateur `--gi` (retenu `0.85`) — en prod, figer ces valeurs dans les tokens.
