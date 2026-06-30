# PUNJABI SPEED — Project Blueprint
> Document de référence pour Claude Code · v3.3 · Mis à jour 2026-06-30

---

## 1. Contexte et contraintes matérielles

### Plateforme cible
- **Appareil** : Radio aftermarket Android HCN (ex. Hyundai Accent 2012)
- **OS** : Android natif (pas Android Auto)
- **Navigateur** : **Google Chrome 79 / V8 7.9** — vieux moteur, contrainte forte (voir §1bis)
- **RAM** : 2 Go
- **Écran** : Touchscreen intégré, résolution cible **1280×720** (fallback 1024×600)
- **Entrée** : Écran tactile + manette USB (standard HID, ex. Xbox filaire)
- **Distribution** : deux méthodes (voir §16) —
  1. **Dossier `punjabi-speed/`** sur clé USB / carte SD, chargé via Chrome (`file://`) — zéro build
  2. **APK natif** (`com.vibecoding.punjabi`) construit via Cordova — icône + plein écran (voir §16bis)
- **Cible secondaire** : téléphones mobiles (paysage) — voir §1ter

### Contraintes techniques absolues
- **Un seul fichier HTML** — zéro dépendance externe, zéro réseau requis au runtime
- **Pas d'assets externes** — visuels générés en Canvas 2D / pixel art procédural en JS (exception : `menu-music.mp3` co-localisé)
- **Pas de WebGL** — Canvas 2D uniquement (compatibilité maximale, perf prévisible)
- **Cible 30 fps stable** — priorité à la stabilité sur matériel faible
- **Taille** : `index.html` ≈ 106 Ko · `menu-music.mp3` ≈ 2.1 Mo
- **localStorage** : utilisé uniquement pour la **langue** (`gameLanguage`) ; les scores restent en mémoire session
- **Gamepad API** (`navigator.getGamepads()`) pour la manette USB
- JS pur — aucune librairie externe

### Fichiers à mettre sur la clé USB
```
/
└── punjabi-speed/                          (tout le jeu dans un seul dossier)
    ├── index.html                          (140+ Ko — jeu complet)
    ├── manifest.json                       (PWA — installation sur écran d'accueil)
    ├── service-worker.js                   (PWA — cache hors-ligne)
    ├── icons/                              (4 PNG — repli emoji pour Chrome 79, voir §8)
    ├── menu-music.mp3                      (2.1 Mo — Notize - Density Wave)
    └── sfx/Sound effects 1/                (18 fichiers AAC .m4a, ~500 Ko)
        ├── Throw object.m4a
        ├── Boost.m4a
        ├── Lap.m4a
        ├── Wrong way.m4a
        ├── Laughing.m4a
        ├── First position (All).m4a
        ├── Hit somebody (Mr Boogerman).m4a
        ├── Hit somebody 3 (Boogerman).m4a
        ├── Hit somebody (babypie).m4a
        ├── Hit somebody 2 (Babypie).m4a
        ├── hit somebody (Aashi).m4a
        ├── Banana (Hanuman).m4a
        ├── Got hit and slipping (babypie).m4a
        ├── Got it (Hanuman).m4a
        ├── First place (Hanuman).m4a
        ├── Podium (Babypie).m4a
        ├── Last position (Boogerman).m4a
        └── Last position (Hanuman).m4a
```

---

## 1bis. Compatibilité Chrome 79 (contrainte critique)

La radio tourne sous **Chrome 79 (V8 7.9, fin 2019)**. Une seule erreur de parsing
JS **ou** une propriété CSS inconnue qui casse le positionnement → **écran noir total**,
sans message. Règles absolues :

| Interdit (Chrome 80+) | Utiliser à la place |
|---|---|
| `??` (nullish coalescing) | `a != null ? a : b` |
| `?.` (optional chaining) | `a && a.b` / `fn && fn()` |
| CSS `inset:0` (Chrome 87) | `top:0;right:0;bottom:0;left:0` |
| `aspect-ratio` (Chrome 88) | ratio via `vh`/`vw` (`max-width:177.78vh`) |
| Flex `gap` (Chrome 84) | échoue en silence (cosmétique) — éviter si critique |

**OK en Chrome 79** : `clamp()`/`min()`/`max()` (Chrome 79), variables CSS, `vmin`/`vw`/`vh`,
`env(safe-area-inset-*)`, `calc()`, Gamepad API, Web Audio, `<audio>` AAC.

> **Vérification avant déploiement** :
> - `grep -cF "??" index.html` → doit donner **0**
> - `grep -cF "inset:0" index.html` → doit donner **0**
> - Parse : `node -e "new Function(require('fs').readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/)[1])"`

---

## 1ter. Support mobile (téléphones)

Le jeu fonctionne aussi sur téléphone, **en paysage**.

- **Cadrage auto** : `#frame` calcule la plus grande boîte 16:9 qui tient (`max-width:177.78vh`,
  `max-height:56.25vw`), centrée. Le canvas 640×360 est mis à l'échelle en `width/height:100%`.
  Les téléphones ~20:9 montrent des **bandes latérales** (pillarbox) — comportement normal.
- **Verrouillage paysage** : `screen.orientation.lock('landscape')` tenté au chargement
  (ignoré silencieusement si non supporté — fréquent hors PWA/plein écran).
- **Invite de rotation** : `#rotate-prompt` (overlay plein écran animé 📱) s'affiche en portrait,
  masqué en paysage via `@media (orientation:landscape)` + toggle JS sur `resize`/`orientationchange`.
- **Boutons tactiles height-aware** : taille via `--tbtn:clamp(52px,18vmin,92px)` (vmin → tient
  compte de la hauteur ; ~68px sur téléphone paysage, 92px sur la radio). Police dérivée de `--tbtn`.
- **Encoche / safe-area** : `viewport-fit=cover` + `env(safe-area-inset-*)` sur `#stage`, les
  boutons gauche/droite et le HUD d'item, des deux côtés.
- **Menus courts** : `@media (max-height:430px)` compacte titre/sélection/réglages (logo réduit,
  gaps serrés, scroll de secours) pour éviter le débordement vertical. N'affecte ni la radio
  (720px) ni le bureau.

---

## 2. Nom et identité

- **Nom du jeu** : PUNJABI SPEED
- **Sous-titre** : MOREL × NAGPAL RACING
- **Circuits** : HOCHELAGA · KITCHENER · ÎLE NOTRE-DAME
- **Contexte personnel** :
  - Alexis Morel (Montréal) + famille Nagpal (Kitchener, Ontario, origine Inde)
  - Les circuits et personnages reflètent leurs vies
- **Favicon** : SVG inline — lettre "P" en dégradé saffron→or (`#FF8A1E`→`#FFC83D`) sur fond marron, assorti au thème indien/racing
- **Palette UI** : saffron `#FF8A1E` · or `#FFC83D` · marron `#5a1208`/`#2d0a0a` — fond des écrans en dégradé radial marron, accents or partout

---

## 3. Architecture du fichier `index.html`

```
index.html
├── <head>
│   ├── <title>PUNJABI SPEED</title>
│   ├── <link rel="icon"> SVG inline (lettre P rouge)
│   └── <style> CSS inline complet
├── <body>
│   ├── #stage → #frame (conteneur 16:9 centré)
│   │   ├── Écrans UI (divs)
│   │   │   ├── #screen-title       Titre + 1J/2J + description + tips rotatifs
│   │   │   ├── #screen-select      Sélection de personnage
│   │   │   ├── #screen-diff        Paramètres de course (diff/tours/CC)
│   │   │   ├── #screen-track       Sélection de circuit (minimap)
│   │   │   ├── #screen-settings    Volume musique + SFX + contrôles (clavier/manette)
│   │   │   ├── #screen-stats       Statistiques de session
│   │   │   ├── #screen-result      Résultats de course
│   │   │   └── #screen-pause       Menu pause
│   │   ├── #game-canvas            Canvas principal Mode 7
│   │   ├── #hud                    HUD overlay (tour / temps / vitesse / position)
│   │   ├── #notif-el               Notifications items (centre écran)
│   │   ├── #star-fx                Overlay étoile (invincibilité)
│   │   ├── #bridge-hud             Alerte pont (Kitchener)
│   │   ├── #wrong-way              Alerte mauvais sens
│   │   ├── Boutons tactiles        ◀ ▶ USE B A (in-game)
│   │   ├── #ingame-menu-btn        ⌂ bouton pause (top-right in-game)
│   │   ├── #top-bar                ⌂ home + EN/FR (hors jeu)
│   │   └── <audio id="menu-music"> Musique menu (src=menu-music.mp3)
│   └── <script>
│       ├── CONSTANTS               WORLD, TEX, TARGET_DT, etc.
│       ├── GLOBAL STATE            difficulty, selectedLaps, selectedCC
│       ├── TEXTURES                texColor Uint32Array (512×512)
│       ├── KART SPRITES            KART8, KART12 (tableaux pixel art)
│       ├── CHARACTERS              4 personnages jouables/IA
│       ├── ITEM_INFO               6 types d'items
│       ├── ICON SYSTEM             _buildPixelEmoji, drawPixelIcon
│       ├── TRACKS                  3 circuits (Catmull-Rom splines)
│       ├── AUDIO                   Web Audio API + menu-music.mp3
│       ├── INPUT                   Clavier / tactile / gamepad
│       ├── MODE 7                  Moteur rendu sol pseudo-3D
│       ├── BILLBOARDS              Sprites 3D (karts, items, décors)
│       ├── PHYSICS                 updatePlayer, updateAI, collisions
│       ├── ITEMS                   Boîtes, projectiles, items posés (dosa)
│       ├── HUD                     drawHUD, minimap, timer
│       ├── I18N                    T(key), STRINGS.fr/en/pa/hi, cycleLang
│       ├── SCREENS                 showScreen, initDiffSelect, etc.
│       └── GAME LOOP               startRace, loop (rAF)
```

---

## 4. États de jeu (STATE machine)

```
TITLE(0) → SELECT(1) → DIFF_SELECT(9) → TRACK_SELECT(2) → COUNTDOWN(3) → RACING(4)
                                                                              ↓
                                                                          PAUSE(6)
                                                                              ↓
                                                                          RESULT(5) → TITLE
                                                                              ↓
                                                                          STATS(7) / SETTINGS(8)
```

| État | Valeur | Écran |
|------|--------|-------|
| TITLE | 0 | Logo + 1J/2J + JOUER |
| SELECT | 1 | Sélection personnage |
| TRACK_SELECT | 2 | Sélection circuit avec minimap |
| COUNTDOWN | 3 | 3 - 2 - 1 - GO! |
| RACING | 4 | Jeu (Mode 7 + HUD) |
| RESULT | 5 | Résultats de course |
| PAUSE | 6 | Menu pause (Reprendre / Recommencer / Menu) |
| STATS | 7 | Statistiques de session |
| SETTINGS | 8 | Volume musique + SFX |
| DIFF_SELECT | 9 | Paramètres de course |

---

## 5. Personnages

4 personnages — jouables en 1J ou 2J, le reste devient IA.

| ID | Nom | Couleur | Vitesse | Accél | Maniab | Style IA |
|----|-----|---------|---------|-------|--------|----------|
| 0 | MR BOOGERMAN | `#9B59B6` violet | 10/10 | 6/10 | 5/10 | Agressif |
| 1 | HANUMAN | `#E67E22` orange | 8/10 | 10/10 | 7/10 | Régulier |
| 2 | BABYPIE | `#FF6B9D` rose | 6/10 | 8/10 | 10/10 | Technique |
| 3 | ASHI | `#00BCD4` cyan | 7/10 | 8/10 | 8/10 | Équilibré |

Sprites : tableaux pixel art `KART8` (8×8) et `KART12` (12×12), dessinés avec `ctx.fillRect()`.

---

## 6. Paramètres de course (écran DIFF_SELECT)

Trois sélecteurs indépendants, persistants jusqu'à la fin de la session :

**Disposition** : grille uniforme « label + 3 options » (`.params-rows` → `.prow` → `.prow-label` + `.opt-grid`). Les trois rangées (DIFFICULTÉ, TOURS, CC) partagent exactement la même structure : label centré dans une colonne de largeur fixe, puis 3 boutons `.opt-btn` de taille identique alignés en colonnes via `grid-template-columns:repeat(3,1fr)`. Pas de panneau/boîte derrière. Les `id` `diff-cards` / `pad-row-1` / `pad-row-2` (sur les `.opt-grid`) servent à la navigation manette.

### Difficulté — niveaux de piment 🌶️
Icônes pixelisées thématiques (échelle de piquant) au lieu de symboles abstraits :
| Valeur | Label | Icône (`DIFF_ICONS`) | Effet |
|--------|-------|------|-------|
| 0 | FACILE | 🫑 poivron doux (`LEAF`) | IA lente, items fréquents |
| 1 | NORMAL (défaut) | 🌶️ piment (`BOLT`) | Équilibré |
| 2 | DIFFICILE | 🔥 feu (`SKULL`) | IA agressive |

> Les clés internes (`LEAF`/`BOLT`/`SKULL`) sont historiques ; seules les valeurs emoji de `DIFF_ICONS` ont changé.

### Nombre de tours
Options : **1 / 3 (défaut) / 5**

### CC (cylindrée)
| CC | Multiplicateur vitesse |
|----|----------------------|
| 50 | × 0.65 |
| 100 (défaut) | × 1.00 |
| 150 | × 1.35 |

Appliqué à `topSpeed` et `acceleration` de tous les karts au lancement de la course.

---

## 7. Circuits (3 tracks)

Tous définis par des **splines Catmull-Rom** sur une grille monde 1000×1000. Texture sol : `Uint32Array` 512×512 (`TEX_SCALE = 0.512`). Points de contrôle gardés à ≥ 70 unités des bords du monde.

### HOCHELAGA — Montréal, Québec
- 11 points de contrôle
- Grande ligne droite (~625 unités)
- Épingle serrée côté ouest (virage droit)
- Chicane en S (virage droit puis gauche)
- Couleur preview : `#E24B4A` (rouge)

### KITCHENER — Ontario, Canada
- Circuit ovale avec épingle
- Zone spéciale : **PONT** (alerte `#bridge-hud`)
- Couleur preview : `#1D9E75` (vert)

### ÎLE NOTRE-DAME — Montréal, Québec
- Inspiration Circuit Gilles-Villeneuve
- Couleur preview : `#378ADD` (bleu)

---

## 8. Système d'items

6 types d'items 100% Punjab. Récupérés sur des boîtes `?` placées sur la piste. **Tous les visuels sont rendus en emoji pixelisé nearest-neighbor** — inventaire HUD, icône centre-écran, projectile en vol, item posé au sol.

| Clé | Emoji | Type | Effet | Stun (frames) |
|-----|-------|------|-------|--------------|
| CHAPPAL | 🩴 | Projectile avant rapide | Sandale, vitesse 9.5 | 60 |
| CUILLERE | 🥄 | Projectile avant | Cuillère en bois, vitesse **8.5** | 42 |
| OIGNON | 🧅 | Projectile homing + rebond | Cherche l'ennemi, vitesse **6.0**, rebondit 4× hors-piste, bloqué par une DOSA | 70 |
| DOSA | 🫓 | Posé derrière | Glisse les adversaires (comme une banane graisseuse) | 48 |
| CHILI | 🌶️ | Effet immédiat | Boost de vitesse (boostTime=200) | — |
| KURKURE | 🍿 | Scatter + bouclier | Lance 5 morceaux en cône avant + 2s de protection croustillante (starTime=120) | 35 |

### Rareté (tirage pondéré)
`ITEM_LIST` contient des doublons pour pondérer le tirage `pickRandom()`. Tous les items
sont doublés **sauf OIGNON** (1 seule entrée) → l'oignon (homing) tombe ~2× moins souvent :
`['CHAPPAL','CHAPPAL','CUILLERE','CUILLERE','OIGNON','DOSA','DOSA','CHILI','CHILI','KURKURE','KURKURE']`.

### Lancer vers l'arrière (↓ + item)
Les projectiles (CHAPPAL, CUILLERE, OIGNON) et le scatter KURKURE peuvent être lancés
**vers l'arrière** en maintenant ↓ (ou D-pad bas manette) pendant l'usage. `useItem(k, backward)` :
`throwAngle = k.angle + (backward ? π : 0)`. La notif affiche un préfixe `↩`.

### Système d'icônes pixelisées (`_buildPixelEmoji`)

**Ratio standard : `srcPx = Math.max(6, Math.round(sz/3))`** — 3× upscale, appliqué partout sans exception.

Pipeline :
1. Rend l'emoji à taille source (`srcPx = sz/3`) sur un canvas temporaire
2. Scale up en `imageSmoothingEnabled=false` → pixels carrés bien nets
3. Résultat mis en cache dans `_emojiCache[emoji_src_dst]`

**Utilisé partout de façon cohérente** :
| Contexte | Fonction | sz typique |
|---|---|---|
| Inventaire HUD (centre écran) | `drawPixelIcon(_icC, type)` | 52–76px |
| Icône HUD mineure | `drawPixelIcon(hudIc, type)` | idem |
| Icône split-screen (kart ennemi) | `_buildPixelEmoji` inline | 16px |
| Projectile en vol 3D | `drawProjectile()` | scale×22 |
| Item posé au sol 3D | `drawDroppedItem()` | scale×18 |
| Boutons du menu | canvas `data-emoji` dans `init()` | 28–32px |

> **Règle absolue** : tout nouvel item ou icône de menu doit passer par `_buildPixelEmoji` avec `srcPx = Math.max(6, Math.round(sz/3))`. Ne jamais utiliser `fillText` emoji directement sur le canvas de jeu — ça briserait la cohérence pixel art.

#### Emoji trop récents pour Chrome 79 : repli sur image PNG (v3.2, détection corrigée v3.3)
Chrome 79 / l'ancien Android de la radio ne possèdent pas les glyphes des emoji **≥ Emoji 12.0 (2019-2020)** : `fillText` y dessine soit du vide, soit une **boîte « tofu » `.notdef`** (un carré gris opaque) → l'item apparaît comme une case (bug DOSA invisible).

`_buildPixelEmoji` fonctionne en **deux temps** :
1. Dessine l'emoji via `fillText` (rendu **natif** là où le glyphe existe — navigateur récent, poste de dev → look d'origine inchangé).
2. Si le glyphe n'est **pas un vrai emoji couleur** (`_canvasHasColor` = false) **et** que l'emoji a une image de secours, il bascule sur le PNG `icons/<nom>.png` pré-rasterisé (rendu d'un vrai emoji), puis pixélise pareil.

> **Détection par couleur (v3.3), pas par alpha.** L'ancien `_canvasHasInk` testait seulement l'alpha → la boîte tofu **opaque** de Chrome 79 le trompait (alpha>0 = « glyphe présent ») et le PNG ne s'affichait jamais. `_canvasHasColor` cherche un pixel **saturé** (`max(R,G,B) − min(R,G,B) > 40`) : un vrai emoji est coloré, une boîte tofu est grise → repli correct. Les 4 emoji ciblés (doré/violet/brun/vert) sont tous assez colorés.

| Emoji | Item / usage | Version | Repli |
|---|---|---|---|
| 🫓 | DOSA | Emoji 13.0 | `icons/dosa.png` |
| 🧅 | OIGNON | Emoji 12.0 | `icons/onion.png` |
| 🩴 | CHAPPAL | Emoji 12.0 | `icons/sandal.png` |
| 🫑 | difficulté FACILE (`DIFF_ICONS.LEAF`) | Emoji 13.0 | `icons/pepper.png` |

Table `_BAKED_NAMES` (emoji → nom de fichier), images préchargées dans `_BAKED_IMG`. Comme **tous** les chemins de rendu passent par `_buildPixelEmoji`, le repli couvre tout (sol, vol, inventaire, notif, tips, menu). Audit : ce sont les **seuls** emoji ≥ Emoji 12.0 dessinés sur canvas (les autres — 🌶️ 🍿 🥄 🔥 👤 👥 📊 ⚙ ▶ 🌉 — sont assez anciens).

> Les PNG `icons/*.png` sont des emoji rasterisés via un navigateur (générés avec le serveur de dev, voir §16ter). On NE lit jamais `getImageData` sur un canvas issu d'un PNG (évite le canvas-taint en `file://`).

> **Règle** : tout nouvel item avec un emoji récent (≥ 2019) doit ajouter une entrée `_BAKED_NAMES` + un fichier `icons/<nom>.png`, sinon il sera invisible sur la radio. **Le dossier `icons/` doit être copié sur la clé USB et dans `build-apk/www/`.**

### Notifications d'item (`showNotif`)
- **Ramassage** : une pop centrale (`#item-notif`, 25 % en split / 50 % en solo ; `#item-notif-p2` à 75 %) indique l'item obtenu.
- **Usage / lancer** : **aucune** pop (depuis v3.1). Les anciennes pops « CHILI! / KURKURE! / DOSA! / CHAPPAL! » ont été retirées de `useItem` — la pop de ramassage suivie de la pop d'usage se chevauchaient et donnaient l'impression d'une animation jouée deux fois. Le projectile visible et l'icône d'inventaire suffisent comme retour. Le bouclier KURKURE (`#star-fx`) et tous les sons sont conservés.
- **Touché** : `💥 TOUCHÉ!` reste (événement reçu, distinct du lancer).

### Comportement KURKURE (remplace l'étoile)
Kart protégé pendant `starTime > 0` (120 frames ≈ 2s) :
- Perce à travers les autres karts et les étourdit (`stunKart`)
- Lance simultanément 5 projectiles KURKURE en cône (angles : -0.45, -0.22, 0, +0.22, +0.45 rad)
- Effet visuel `#star-fx` actif pendant la protection

---

## 9. Moteur de rendu Mode 7

Projection pseudo-3D sol vu de derrière le kart (floor-casting).

```
Pour chaque ligne horizontale sous l'horizon :
  1. Calculer distance caméra
  2. Projeter en coordonnées monde (raycasting horizontal)
  3. Lire texColor[ty*512 + tx] → couleur (route, herbe, bordure)
  4. Écrire dans imageData
→ putImageData() unique par frame
```

Variables clés :
- `_vpY0`, `_vpH` : position et hauteur du viewport (split-screen)
- `WORLD=1000`, `TEX=512`, `TEX_SCALE=0.512`
- `texColor` : Uint32Array 512×512 généré à `setupTrack()`

### Split-screen 2 joueurs
- Deux viewports de 175px de haut chacun
- `drawBillboardsClipped()` par viewport
- Un seul `putImageData` par frame

---

## 10. Physique

### Joueur
```js
// Steering proportionnel à la vitesse (plus précis lentement)
steerStrength = handling * (1 - speed/topSpeed * 0.4)
// Hors piste : pénalité offTrackPenalty (0.52–0.68 selon perso)
// Friction différente sur/hors piste
```

### Collisions kart-à-kart
- `minD = 9` unités (boîte physique réduite)
- Si un kart a `starTime > 0` : pousse et étourdit la victime, kart étoile non affecté
- Deux étoiles simultanés : repoussement symétrique
- Projectiles : rayon de détection `< 16` unités (plus généreux)

### Classement (`computePlace`)
```js
score = finished ? (1e9 - finishTime) : (laps + u) * 1000
// place = nombre de karts avec score supérieur + 1
```

---

## 11. Audio

### Musique menu
- Fichier : `menu-music.mp3` (Notize - Density Wave, 2.1 Mo)
- Chargé via `<audio id="menu-music">`
- Pause automatique quand l'onglet/app passe en arrière-plan (`visibilitychange`)
- Reprend à la mise au premier plan
- **Démarrage automatique (v3.1)** : `_tryAutoMusic()` tente `m.play()` **au chargement**.
  Si la politique autoplay du navigateur le bloque, on réessaie au **1er geste OU à la 1re touche**
  (`pointerdown` + `keydown`, auto-retirés au succès). Sur l'**APK**, le vrai levier est la
  préférence Cordova **`MediaPlaybackRequiresUserAction=false`** (config.xml) qui autorise
  l'autoplay du WebView → la musique démarre sans aucune interaction. *(Un onglet Chrome 79 nu
  exigera toujours un 1er geste — limite de la politique navigateur, pas du code.)*

### Effets sonores procéduraux (Web Audio API)
- Moteur : oscillateur sawtooth, fréquence proportionnelle à la vitesse
- SFX : `AUDIO.beep(freq, dur, vol, x, y)` avec atténuation par distance :
  ```js
  dmul = 1 / (1 + (d/160)²)   // coupé si dmul < 0.04
  ```
- Contrôle volume indépendant : `sfxVolume` (slider Settings)

### Voix enregistrées (AAC/MP4 natif)
**18 fichiers .m4a** dans `sfx/Sound effects 1/` — voix de personnages pour événements de jeu. Aucune conversion ffmpeg requise (Android WebView décode natif).

**Architecture à pools unifiés (depuis v3.0)** — *remplace l'ancien système per-character.*
Toutes les voix sont **mélangées dans des pools partagés**, peu importe qui conduit le kart.
`SFX.play(key, vol)` tire un clip aléatoire du pool et le joue (`cloneNode` → lectures superposables).

| Pool (`SFX_FILES`) | Contenu | Déclenché par |
|---|---|---|
| `throw_all` | 6 voix « hit/laugh » mélangées | Lancer un item (toujours, +150ms) |
| `hit_all` | 5 voix « hit » mélangées | Projectile touche quelqu'un (aléatoire avec `throw_all`) |
| `stun_all` | 2 voix « got hit » | Victime étourdie (+100ms) |
| `drop_all` | Banana (Hanuman) | Dépôt DOSA |
| `boost` · `lap` · `wrongway` · `laugh` | clips uniques | Boost CHILI · tour · mauvais sens · taunt leader |
| `win_any` · `win_1` · `podium_2` · `last_0` · `last_1` | clips de fin | Résultats (échelonnés par place) |

- **Lancer** : `throw_all` joue **toujours** (un seul par lancer).
- **Toucher quelqu'un** (`playAttackerHit`) : un seul son par victime, tiré au hasard entre `throw_all` et `hit_all`.
- **Fin de course** : voix de résultat échelonnées (1er=500ms, podium=550ms, dernier=600ms).

### Toggle VOIX / SYNTHÉ (Paramètres)
Variable globale `useSynthSFX` (défaut `false`). Bouton dans Réglages (`set-sfx-recorded` / `set-sfx-synth`) :
- **🎤 VOIX** (`useSynthSFX=false`) : voix .m4a enregistrées (comportement par défaut).
- **🔊 SYNTHÉ** (`useSynthSFX=true`) : `SFX.play()` retourne `false` immédiatement → **toutes les voix coupées**, seuls les `AUDIO.beep()` synthétisés jouent.

> Garde-fou : `SFX.play()` commence par `if(useSynthSFX)return false;`. Les `AUDIO.beep()` ne sont jamais affectés.

---

## 12. Internationalisation (i18n)

**Quatre langues** : **FR** (défaut) · **EN** · **PA** (ਪੰਜਾਬੀ) · **HI** (हिंदी). Le bouton `#lang-btn` (top-right) **cycle** FR→EN→PA→HI→FR via `cycleLang()` ; il affiche la prochaine langue (`{fr:'EN',en:'PA',pa:'HI',hi:'FR'}`).

```js
T(key)            // retourne STRINGS[lang][key]
updateTexts()     // parcourt [data-i18n] et applique T(key)
cycleLang()       // langue suivante puis updateTexts() + showTip()
```

`updateTexts()` préserve les `<canvas class="menu-pixel-icon">` dans les boutons (met à jour seulement le nœud texte voisin, sans écraser le canvas).

Toutes les chaînes UI sont traduites dans les 4 langues : menus, HUD, notifications, descriptions d'items, contrôles, description du jeu, et les **tips rotatifs** (`tips` = tableau `[emoji, texte]`).

### Écran titre — description + tips
- **Description du jeu** (`#game-desc`, clé `game_desc`) : phrase complète, texte crème `#FFE2B0` + ombre pour lisibilité sur fond marron.
- **Barre de tips** (`#tip-bar`) : fait défiler les 6 items toutes les 4 s (`startTipRotation()`/`showTip()`), icône emoji rendue en canvas pixelisé (`_buildPixelEmoji`, `sz/3`). S'arrête hors de l'écran titre.

---

## 13. Système d'input

### En course
```
Clavier J1 : ← → (direction) · ↑ (gaz) · ↓ (frein/recul) · Shift (item)
Clavier J2 : A D (direction) · W (gaz) · S (frein) · Ctrl (item)   [split-screen]
Tactile    : Joystick analogique (gauche) + cluster A/B/USE (droite)
```

**Mapping manette unifié (`_buildGP`)** — normalise NES et Xbox dans un même état :

| Action | Manette NES / générique | Manette Xbox |
|---|---|---|
| Direction | D-pad ← → (`btn 14/15`) ou `axes[0]` | Stick gauche `axes[0]` |
| Accélérer | **A** = `btn(accelBtn)` | **RT** (`axes[7]>0` / `btn 7`) |
| Freiner / reculer | **B** = `btn(brakeBtn)` | **LT** (`axes[6]>0` / `btn 6`) |
| Utiliser item | **X** = `btn(3)` | **X** = `btn(3)` |
| Lancer derrière | ↓ (D-pad bas) + X | ↓ + X |
| Pause | Start (`btn 8/9`) | Start |

> Le mapping item est `btn(3)` (X sur la manette NES de l'utilisateur), volontairement **étroit**
> pour ne pas déclencher de son en tournant. La réf. est dans **Paramètres** : trois cartes
> côte à côte ⌨ CLAVIER · 🎮 MANETTE NES · 🎮 MANETTE XBOX (la carte NES affiche le nom de
> la manette branchée via `updateGamepadUI`).

#### Réglage « inverser ACCÉL / FREIN » (`swapAB`, persistant)
Le mapping standard W3C suppose **A = `btn(1)`, B = `btn(0)`**, mais beaucoup de manettes
NES/HID ont les index **opposés** → accélérer/freiner inversés. Réglage dans **Paramètres → ACCÉL/FREIN : NORMAL / INVERSÉ** :
- `swapAB=false` (défaut) → `accelBtn=1, brakeBtn=0`
- `swapAB=true` → `accelBtn=0, brakeBtn=1`
- Persistant via `localStorage['swapAB']`. Honoré aussi par la nav menu (`_gpMenuState` : OK/Retour suivent `swapAB`).

> **Gâchettes — piège résolu (v3.1)** : `_buildGP` ne lit plus les axes via `(axe+1)/2`.
> Un stick au repos (valeur 0) y était lu comme un **demi-frein permanent** → le kart reculait
> tout seul (« en multi, ça ne fait que reculer »). On ne garde que `g.axes[6]>0`/`g.axes[7]>0`
> (gâchettes au repos à 0) et les boutons `LT/RT`.

### Double manette (split-screen)
`INPUT.update()` scanne `navigator.getGamepads()` : la 1re manette → J1 (`gamepad`),
la 2e → J2 (`gamepad2`). Chacune passe par `_buildGP`. En split-screen, le clavier J1 garde
les flèches uniquement (WASD réservé à J2). Les getters `p2left/p2right/p2accel/...` et
`p2steerAxis/p2accelAxis` routent l'entrée J2. La navigation menu (`pollMenuGamepad`) lit
les deux manettes (front partagé `_navPrev` pour éviter le double-déclenchement).

### Marche arrière
Maintenir le frein une fois le kart à l'arrêt complet le fait **reculer** (vitesse négative
plafonnée). Géré dans `updatePlayer`/`updateP2`.

Multi-touch supporté. Boutons tactiles larges pour usage en voiture.

### Navigation des menus (modèle de focus unifié)
Chaque écran retourne une liste de « lignes » via `menuRows()` :
- `type:'sel'` → ←→ change la valeur (`dec`/`inc`), `el` reçoit la surbrillance
- `type:'btn'` → ←→ change de bouton, A active

`menuNav(action)` dispatche `up/down/left/right/ok/back` ; `renderMenuFocus()` applique les classes `.nav-focus` / `.nav-btn-focus`. Clavier, manette (front détecté par `_navPrev`) et tactile partagent ce modèle.

> **Indicateur de focus conditionnel** : `renderMenuFocus()` n'ajoute aucune surbrillance si `!INPUT._gpConnected`. Sans manette branchée, aucun contour blanc n'apparaît — l'utilisateur tactile/souris ne voit pas de sélection « fantôme ». Le contour réapparaît dès qu'une manette est connectée.

---

## 14. HUD en jeu

Barre semi-transparente en haut :

| Zone | Contenu |
|------|---------|
| Gauche | `LAP 2/3` |
| Centre | Chronomètre `1:23.45` |
| Centre-droite | `128 km/h` |
| Droite | Position `2e` |

- Flash jaune au passage de tour
- Minimap (coin bas-droit) : circuit avec position des karts
- Bouton `⌂` (top-right in-game) → ouvre le menu PAUSE

### HUD split-screen (2 joueurs)
En split-screen le `#hud` mono-joueur est **masqué** (`body.sp-active #hud{display:none!important}`)
et remplacé par **deux barres DOM** : `#sp-hud1` (haut, étiquette bleue **J1**) et `#sp-hud2`
(bas, étiquette rouge **J2**, positionnée à `top:48.6%`). Chaque barre montre : tag, nom du perso,
tour, **icône de l'objet tenu** (canvas `sp1-ic`/`sp2-ic` via `drawPixelIcon`, depuis v3.3 — avant
c'était juste un texte), chrono partagé (`sp-time`) et position. Mis à jour par `_spHudKart()` dans `drawHUD()`.

> **Piège résolu (v3.0)** : il existait un 2e HUD dessiné sur le canvas (`drawSplitHUD`) qui se
> superposait aux barres DOM → double barre. `drawSplitHUD` ne dessine plus que l'alerte « mauvais
> sens » par viewport. De plus `VP2Y = VPH` (175) supprime la bande noire séparatrice de 10px ;
> `#sp-hud2` sert d'unique séparateur visuel.

### Notifications split-screen
`showNotif(text, dur, icon, forP2)` : `#item-notif` (J1, repositionné à 25% en split) et
`#item-notif-p2` (J2, à 75%). Tous les évènements d'item déclenchent la notif pour **J1 et J2**
(`if(k.isPlayer||k.isP2)`).

---

## 15. Performances

| Technique | Détail |
|-----------|--------|
| `dt` normalisé | `Math.min(delta/TARGET_DT, 3)` |
| `putImageData` unique | Tous les pixels Mode 7 en un seul appel |
| `imageSmoothingEnabled=false` | Upscaling nearest-neighbor pour sprites |
| Pas de garbage loop | Réutilisation des objets, pas d'allocations dans la game loop |
| Canvas résolution native | Pas d'upscaling CSS (1:1 pixel) |

---

## 16. Déploiement — Clé USB / WebView Android

### Prérequis
- Appareil : Radio aftermarket Android (ex. Hyundai Accent 2012) avec WebView intégrée
- App WebView capable de charger des fichiers locaux (`file://`) — ex. "Web Viewer" ou navigateur Firefox Android
- Autorisation audios : La WebView doit permettre `<audio>` et `cloneNode()` (standard)
- Clé USB formatée FAT32 pour compatibilité maximale
- Câble USB ou adaptateur pour brancher la clé à la radio Android

### Structure complète de la clé USB
```
/
├── index.html                              (120+ Ko — jeu complet)
├── menu-music.mp3                          (2.1 Mo — musique menu)
└── sfx/Sound effects 1/                    (18 .m4a, ~500 Ko)
    ├── Throw object.m4a
    ├── Boost.m4a
    ├── Lap.m4a
    ├── Wrong way.m4a
    ├── Laughing.m4a
    ├── First position (All).m4a
    ├── Hit somebody (Mr Boogerman).m4a
    ├── Hit somebody 3 (Boogerman).m4a
    ├── Hit somebody (babypie).m4a
    ├── Hit somebody 2 (Babypie).m4a
    ├── hit somebody (Aashi).m4a
    ├── Banana (Hanuman).m4a
    ├── Got hit and slipping (babypie).m4a
    ├── Got it (Hanuman).m4a
    ├── First place (Hanuman).m4a
    ├── Podium (Babypie).m4a
    ├── Last position (Boogerman).m4a
    └── Last position (Hanuman).m4a
```

### Étapes de déploiement
1. **Formater la clé USB / carte SD** en FAT32 (Windows : clic-droit > Formater ; Mac : Utilitaire de disque)
2. **Copier le dossier `punjabi-speed/`** entier à la racine (garde tout le jeu regroupé)
3. **Brancher la clé** à la radio Android
4. **Ouvrir Chrome** sur la radio
5. **Charger le fichier local** : taper dans la barre d'adresse :
   ```
   file:///mnt/usb0/punjabi-speed/index.html
   ```
   (ou `/sdcard/external_sd/punjabi-speed/index.html` selon le fabricant radio)
6. **Tester** : La page doit charger avec la musique menu + tous les SFX AAC

### Variantes d'adresse (selon la radio)
- **HCN / Hyundai-Kia aftermarket** : `file:///mnt/usb0/punjabi-speed/index.html`
- **Carte SD** : `file:///sdcard/external_sd/punjabi-speed/index.html`
- **Android générique** : `file:///storage/emulated/0/punjabi-speed/index.html` (stockage interne)

> **Conseil** : Mettre tout dans un dossier `punjabi-speed/` évite de mélanger avec les
> autres fichiers de la carte (films, données Android). Renommer le dossier (ou ajouter `?2`
> à l'URL) force aussi Chrome à ignorer le cache d'un ancien essai.

> **Écran noir au chargement ?** → presque toujours une incompatibilité Chrome 79 (voir §1bis).
> Vérifier `??`, `inset:0`, et le parsing du script.

### Résolution et layout
- Le jeu s'adapte à tout ratio 16:9 via CSS (`max-width:177.78vh`)
- Cible principale : **1280×720** · Fallback : **1024×600**
- Téléphones : paysage, boutons height-aware, safe-area (voir §1ter)
- Boutons tactiles positionnés pour usage au volant (bas d'écran, larges)

### Installation en tant qu'app (PWA — optionnel)
- `manifest.json` + `service-worker.js` permettent « Ajouter à l'écran d'accueil »
  sur navigateurs récents → icône dédiée, plein écran, cache hors-ligne.
- Sur Chrome 79 (radio) l'install PWA peut ne pas apparaître → le chargement `file://`
  reste la méthode de référence (toujours fonctionnelle).

---

## 16bis. Build & mise à jour de l'APK natif (Cordova)

L'app native est un wrapper **Cordova** dans `build-apk/` qui empaquette le jeu web dans
un `.apk` installable (icône, plein écran, pas de barre Chrome). ID : `com.vibecoding.punjabi`.

### Environnement (déjà installé sur le poste de dev)
- **JDK** : `C:\Program Files\Android\Android Studio\jbr`
- **Android SDK** : `C:\Users\BUREAU-ALEXIS\AppData\Local\Android\Sdk`
- **Cordova** : via `npx` (cordova-android, wrapper Gradle 8.14.2 en cache)

### Procédure de mise à jour (à refaire à chaque changement du jeu)
**Dans une vraie fenêtre PowerShell** (le démon Gradle a besoin d'une console interactive
pour sa socket loopback — il échoue dans un shell non-interactif) :

```powershell
# 1. Copier le jeu à jour dans le wrapper
cd "D:\Vibe Coding\punjabi-speed"
Copy-Item index.html,manifest.json,service-worker.js,menu-music.mp3 build-apk\www\ -Force
Remove-Item build-apk\www\sfx -Recurse -Force; Copy-Item sfx build-apk\www\ -Recurse
Remove-Item build-apk\www\icons -Recurse -Force -ErrorAction SilentlyContinue; Copy-Item icons build-apk\www\ -Recurse

# 2. Construire l'APK
cd build-apk
npx cordova build android
```

> Si `cordova build` ne trouve pas Gradle, lancer le wrapper directement :
> `cd platforms\android ; .\gradlew.bat assembleDebug`
> (s'assurer que `$env:JAVA_HOME` et `$env:ANDROID_HOME` pointent vers les chemins ci-dessus).

### Résultat
```
build-apk\platforms\android\app\build\outputs\apk\debug\app-debug.apk   (~5.2 Mo)
```
Copier ce fichier sur la clé USB → installer sur la radio (autoriser « sources inconnues »).
Comme l'`id` ne change pas, réinstaller **met à jour** le jeu en conservant l'app.

### Préférences `config.xml` (rappel)
- `Fullscreen=true`, `Orientation=landscape`, `AndroidHardwareAccelerated=true`
- **`MediaPlaybackRequiresUserAction=false`** → autorise l'autoplay audio du WebView (musique
  au démarrage). **Prend effet uniquement après un rebuild** de l'APK.

### Notes
- `build-apk/platforms`, `node_modules`, l'APK : **git-ignored** (`config.xml` lui est suivi).
- Pour un *vrai* numéro de version d'update, bumper `version` + `android-versionCode` dans
  `build-apk/config.xml` (sinon réinstall directe sur le même versionCode = OK quand même).
- `cordova prepare android` (sans build) suffit pour juste re-synchroniser `www/` → projet natif.

---

## 16ter. Développement local (`npm run dev`)

Serveur statique **zéro dépendance** (`dev-server.js` + `package.json`) pour tester dans un
navigateur, plus proche du réel que `file://` (autoplay et service worker fonctionnent) :

```bash
npm run dev          # → http://localhost:8080/   (aucun npm install requis)
```

`dev-server.js` (Node natif, `http`+`fs`) sert la racine, décode les URL (les SFX ont des
espaces/parenthèses) et mappe les MIME (`.mp3`→audio/mpeg, `.m4a`→audio/mp4, etc.).
Port configurable via `PORT`.

---

## 17. Ce qui reste hors scope

- Sauvegarde des scores (localStorage utilisé uniquement pour la langue)
- Multijoueur **réseau** (le split-screen local 2 joueurs existe, voir §13/§14)
- Ghost / mode chrono
- Circuits supplémentaires (au-delà des 3 existants)
- Personnalisation de kart (couleurs, etc.)

> *Note : l'APK natif n'est plus hors-scope — il est construit via Cordova (§16bis), en
> complément du chargement `file://` + PWA.*

---

## 18. Historique des changements

### v3.3 — 2026-06-30
- **DOSA/CHAPPAL en boîte sur Chrome 79 (vrai correctif)** : la détection de glyphe passait par
  l'alpha (`_canvasHasInk`) → la boîte tofu **opaque** de Chrome 79 le trompait, le PNG ne
  s'affichait jamais. Remplacé par `_canvasHasColor` (test de **saturation**). *Bug propre à
  Chrome 79 — invisible sur navigateur récent.*
- **P2 ne pouvait pas lancer en split-screen** : `updateAIItems` n'excluait pas `isP2`, donc l'IA
  tirait les objets de P2 automatiquement avant que l'humain n'appuie. Corrigé avec `isHuman(k)`.
  C'était aussi la cause de l'asymétrie perçue « P1 sans icône / P2 avec icône ». *Bug logique
  (web + APK).*
- **Joueur arrivé ne se figeait pas** : `updatePlayer`/`updateAI` font désormais un retour anticipé
  quand `k.finished` (le kart freine et ignore les commandes) → P1 s'arrête et la course continue
  jusqu'à ce que P2 finisse. La porte de fin (ligne ~1600) attendait déjà les deux. *Bug logique.*
- **Icône d'inventaire en split-screen** : vraie icône pixel (`sp1-ic`/`sp2-ic` via `drawPixelIcon`)
  au lieu d'un simple texte, pour les deux joueurs.
- Confirmé : l'APK = copie byte-identique de `index.html` (pas de version en retard) ; un bug
  logique est donc présent sur web ET APK, seuls les bugs de rendu emoji diffèrent (moteur).

### v3.2 — 2026-06-30
- **Icônes emoji récents** : remplacement du pixel art dessiné à la main (look trop différent)
  par un repli sur **image PNG** d'un vrai emoji rasterisé (`icons/dosa|onion|sandal|pepper.png`).
  `_buildPixelEmoji` essaie d'abord l'emoji natif (`fillText`, look d'origine sur navigateur
  récent) et ne bascule sur le PNG que si le glyphe manque (`_canvasHasInk` = false, Chrome 79).
  → Nouveau dossier `icons/` à inclure sur la clé USB et dans `build-apk/www/`.
- **Serveur de dev** : endpoint `POST /save-icon` (écrit `icons/<name>.png`) pour générer les
  PNG d'emoji depuis un navigateur sans corruption de copier-coller.

### v3.1 — 2026-06-30
- **Pixel art pour emoji trop récents (Chrome 79)** : 🫓🧅🩴🫑 (Emoji 12-13, invisibles sur la
  radio) dessinés à la main via `_ART_EMOJI`/`_drawPixelArt`, interceptés dans `_buildPixelEmoji`
  (couvre tous les chemins de rendu). Corrige la « DOSA invisible ».
- **Manette** : retrait de l'heuristique d'axe `(axe+1)/2` (un stick au repos était lu comme
  demi-frein → recul automatique en multi) ; **réglage `swapAB`** NORMAL/INVERSÉ (persistant,
  menu inclus) pour les manettes dont A/B sont aux index opposés.
- **Musique** : autoplay au chargement + retry geste/touche, et préférence Cordova
  `MediaPlaybackRequiresUserAction=false` (config.xml).
- **Notifications** : retrait des pops d'**usage/lancer** (gardé : ramassage + TOUCHÉ) — la
  double pop ramassage→lancer donnait l'impression d'une animation jouée deux fois.
- **Écran titre** : boutons en scaling proportionnel (`vmin`/`min()`, `flex:1 1 0` + `min-width:0`)
  pour ne plus se chevaucher sur petit écran.
- **Lancer** : Ctrl ne déclenche plus J1 en solo (J2 uniquement en split).
- **Dev** : serveur local zéro dépendance `npm run dev` (§16ter).
- **i18n** : clés `set_pedals`, `ab_normal`, `ab_swap` (FR/EN/PA/HI).

### v3.0 — 2026-06-29
- **Split-screen 2 joueurs** : double manette (J1/J2), HUD DOM J1/J2, notifs J1/J2,
  marche arrière, items P2, fin de course attend que **les deux** joueurs terminent.
- **Fix double barre HUD** en split (suppression du HUD canvas redondant, `VP2Y=VPH`).
- **Audio refondu** : pools de voix unifiés (`throw_all`/`hit_all`/`stun_all`/`drop_all`)
  remplaçant le système per-character ; toggle **VOIX / SYNTHÉ** (`useSynthSFX`) dans Réglages.
- **Input** : mapping NES (A=gaz, B=frein, X=item) + Xbox, lancer arrière (↓+item),
  cartes contrôles NES/Xbox côte à côte dans Réglages.
- **Items** : cuillère 6.0→**8.5**, oignon 4.0→**6.0** + plus **rare** (tirage pondéré).
- **APK natif** Cordova (`com.vibecoding.punjabi`) — voir §16bis.
- **i18n** : nouvelles clés `set_sfx_mode`, `sfx_voice`, `sfx_synth` (FR/EN/PA/HI).
