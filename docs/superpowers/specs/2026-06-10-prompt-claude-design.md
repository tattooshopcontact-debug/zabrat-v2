# Prompt Claude Design — Zabrat « Nightlife Néon »

À coller dans Claude Design (claude.ai) → **Prototype** → **High fidelity**.

---

Crée un prototype mobile haute fidélité (format iPhone, dark mode UNIQUEMENT) pour **Zabrat**, une app sociale de tracking de bières entre amis : **Strava × Snap Map × nightlife**. Marché : la Tunisie (La Marsa, Sidi Bou Said, Tunis), cible 20-35 ans qui sortent le soir. Boucle principale : Boire → Logger → Partager → Comparer. Toute l'interface est en **français, tutoiement, ton complice et festif** (jamais corporate).

## DIRECTION ARTISTIQUE — « Nightlife Néon »

L'app doit donner la sensation d'une sortie nocturne : noir profond, lumières néon chaudes, glow. Niveau d'exécution premium type app primée sur les stores — PAS un look d'app de débutant.

### Palette (STRICTE)
- Fond app : `#0A0A0F` (noir bleuté profond)
- Cartes / surfaces : `#15151C`, bordures fines `#2A2A35`
- **Ambre néon `#FFB300` = couleur signature** : boutons principaux, éléments actifs, highlights — toujours avec un effet glow (ombre lumineuse ambrée diffuse)
- Orange chaud `#FF6B35` : utilisé en **dégradé ambre→orange** sur les CTA et badges importants
- Cyan néon `#00E5FF` : accent RARE, réservé aux indicateurs « live » (amis sortis maintenant, bar en pleine affluence)
- Texte : blanc `#FFFFFF`, secondaire `#9494A6`
- Succès `#4CAF50`, danger `#F85149`

### Principes visuels
- **Glow partout où il y a de la vie** : bouton LOG, streak en cours, bars très fréquentés, ligne du classement de l'utilisateur
- Glassmorphism léger (verre fumé, blur) sur les overlays et modals
- **Chiffres géants** en typographie condensée bold pour les stats (nombre de bières, rang, streak)
- Coins arrondis 16-20 px, espacements généreux, hiérarchie visuelle forte
- Micro-détails premium : dégradés subtils sur les cartes, séparateurs quasi invisibles, états pressed/active visibles
- Logo : une chope de bière + 3 étoiles, à décliner en version néon glow ambre

## NAVIGATION

Tab bar de 5 éléments, fond `#15151C` avec blur, posée sur un fin liseré dégradé ambre :

`[ Ce soir ]  [ Carte ]  ( 🍺 LOG )  [ Ligue ]  [ Profil ]`

Le bouton central **LOG** est un cercle surélevé de ~64 px, dégradé ambre→orange, glow ambré permanent, icône chope. C'est LE bouton de l'app. Les onglets actifs passent en ambre néon avec un point lumineux sous l'icône.

## ÉCRANS À MAQUETTER (9)

### 1. Ce soir (feed social)
- Header : « Ce soir 🌙 » + date, avatar de l'utilisateur en haut à droite avec anneau de streak ambre
- Bandeau horizontal scrollable « Qui sort ce soir » : avatars des amis avec anneau cyan néon s'ils sont actuellement dans un bar (nom du bar en dessous)
- Cards du feed : avatar, « **Khalil** a bu une Blonde 🍺 au **Théatro** », heure, photo éventuelle, réactions (🍻 ❤️ 🔥) avec compteurs, bouton réagir
- Card spéciale streak : « 🔥 6 soirs d'affilée — encore ce soir pour continuer ! » avec glow
- État vide prévu : « Personne n'a encore bu ce soir… sois le premier 🍺 »

### 2. Carte (le cœur de l'app)
- Carte de nuit plein écran (style dark, La Marsa / Sidi Bou Said, Tunisie)
- Marqueurs des bars = pastilles néon dont **l'intensité du glow reflète l'affluence** : Théatro (très chaud, glow fort + compteur « 12 🍺 ce soir »), Les Caves, L'Alamo, Saf Saf, Le Nouveau Bar
- Avatars miniatures des amis posés sur les bars où ils sont check-in (anneau cyan)
- Bottom sheet glassmorphism quand on tape un bar : nom, distance, qui y est, total de bières ce soir, bouton « Check-in 📍 » dégradé ambre, mention « 👑 Roi du bar : Wassim »
- Bouton flottant « Qui sort ce soir ? » en haut

### 3. LOG (modal plein écran — l'écran signature)
- S'ouvre depuis le bouton central, fond noir avec blur
- Titre « C'est quoi ce soir ? »
- Grille de 6 types de bière en grandes tuiles glassmorphism : Blonde, Blanche, Brune, IPA, Craft, Autre — la sélection s'illumine en glow ambre
- Sélecteur du bar (chips horizontales : Théatro, Les Caves, L'Alamo…) + toggle visibilité (amis / privé)
- Bouton géant « VALIDER 🍺 » dégradé ambre→orange, glow
- Écran de succès : grande chope animée + confetti, « +1 ! T'en es à 4 ce soir 🔥 », points gagnés, badge débloqué le cas échéant

### 4. Ligue (classement)
- Tabs « Cette semaine / Ce mois »
- Podium top 3 avec avatars sur des marches néon (or ambré, argent, bronze)
- Liste du classement : rang, avatar, pseudo, nombre de bières, delta vs semaine dernière (▲▼)
- **La ligne de l'utilisateur (« Toi ») ressort avec un glow ambre et reste sticky en bas si hors écran**
- Compte à rebours « La ligue se termine dans 2j 14h »

### 5. Profil (profil + stats fusionnés)
- Hero : grand avatar avec anneau de progression XP ambre, pseudo « Faouez », niveau « L'Habitué ⭐ » (barre XP vers le niveau suivant)
- Rangée de 3 chiffres géants : **149** bières au total · **6** 🔥 streak · **#2** rang de la semaine
- Graphique hebdo stylisé néon (bières par jour, barres ambre glow)
- Grille de badges : débloqués en couleur glow (Premier Verre, L'Initié, L'Amateur, L'Assidu, Le Centurion, Régulier), verrouillés en silhouette sombre — compteur « 6/47 »
- Boutons : « Mon Wrapped 🎁 », « Mes amis », icône réglages en haut à droite

### 6. Amis
- 3 tabs : Mes amis / Demandes / Chercher
- Recherche par pseudo ou numéro de téléphone
- Cards amis : avatar, pseudo, « 23 bières ce mois », statut live (« 📍 au Théatro » en cyan) le cas échéant
- Bouton « Inviter sur WhatsApp » vert WhatsApp, demandes avec Accepter (ambre) / Refuser

### 7. Wrapped mensuel (story partageable)
- Format story 9:16 ultra visuel, fond dégradé nuit + néons
- « Ton mois de mai 🍺 » : total du mois en chiffre géant, bar préféré, bière préférée, meilleur soir, rang chez les amis, badge du mois
- Bouton « Partager 📤 » (WhatsApp/Instagram)

### 8. Onboarding (3 slides)
- Slide 1 : logo chope néon + « Zabrat — Tes soirées comptent. »
- Slide 2 : visuel carte néon + « Vois qui sort, et où ça bouge. »
- Slide 3 : visuel classement + « Sois le roi de la semaine. » + CTA « C'est parti 🍺 »
- Dots de progression ambre, bouton skip discret

### 9. Auth téléphone (3 étapes)
- Étape 1 : numéro de téléphone (+216, clavier numérique), étape 2 : code OTP 6 cases qui s'illuminent en ambre à la saisie, étape 3 : choix du pseudo + avatar
- Minimaliste, centré, le glow ambre guide l'attention sur le champ actif

## INTERACTIONS À PRÉVOIR DANS LE PROTOTYPE
- Tab bar fonctionnelle entre les 5 sections
- Ouverture du modal LOG depuis le bouton central + flow jusqu'à l'écran de succès
- Tap sur un bar de la carte → bottom sheet
- Tabs semaine/mois de la Ligue

## À ÉVITER ABSOLUMENT
- Tout fond clair ou mode jour
- Le violet/rose générique « app IA » — la signature c'est l'AMBRE
- Les emojis en guise d'icônes système (utiliser de vraies icônes type Ionicons, les emojis restent uniquement dans les textes du feed)
- Le look « template Bootstrap » : chaque écran doit avoir un point focal lumineux et une vraie composition
