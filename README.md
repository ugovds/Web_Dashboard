# 🌌 Cyberdeck / Violet Startpage

<p align="center">
  <img src="images/gif.gif" alt="Aperçu Startpage" width="720" style="border-radius: 12px; box-shadow: 0 10px 35px rgba(0,0,0,0.6);" />
</p>

<p align="center">
  <b>Une page d'accueil (startpage) modulaire, moderne et immersive conçue pour booster votre productivité tout en sublimant votre navigateur.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3_Modulaire-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript_Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Font_Awesome-528DD7?style=for-the-badge&logo=font-awesome&logoColor=white" alt="Font Awesome" />
  <img src="https://img.shields.io/badge/JetBrains_Mono-000000?style=for-the-badge&logo=jetbrains&logoColor=white" alt="JetBrains Mono" />
</p>

---

## 📸 Aperçu des Thèmes

La page intègre **3 thèmes visuels complets** avec éclairage ambiant (Ambilight), orbes lumineux animés et scanlines rétro. Vous pouvez basculer d'un thème à l'autre en un clic dans la configuration ou via les raccourcis clavier (<kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>).

| Thème 1 : Kanagawa 🌊 | Thème 2 : Sakura 🌸 | Thème 3 : Cyberdeck ⚡ |
| :---: | :---: | :---: |
| <img src="images/gif.gif" width="240" /> | <img src="images/gif2.gif" width="240" /> | <img src="images/gif3.gif" width="240" /> |
| *Palette Cyan & Menthe froide* | *Palette Rose & Néo-Pastel* | *Palette Cyberpunk Violet & Néon* |

---

## 📐 Layout 100% Cyberdeck Bento (Zero Topbar)

L'interface a été épurée pour maximiser l'espace utile et supprimer la barre supérieure superflue :
- **Colonne Gauche (Visuel & Horloge)** :
  - **Artwork thématique** animé en haut.
  - **Station Horloge Cyberdeck** complète en bas (heure, date, semaine, barre de progression du jour %, fuseaux horaires).
- **Colonne Centrale (Navigation & Productivité)** :
  - **Omnibox de recherche intelligente** avec calculatrice et bangs.
  - **Grille de signets Bento adaptative** avec Drag & Drop.
- **Colonne Droite (Cyberdeck Multi-Vues à 9 Onglets)** :
  - Navigateur d'onglets ergonomique à défilement fluide avec indicateur animé.
  - Contient tous les outils, la météo complète et l'intégralité du centre de configuration en direct.

---

## ✨ Fonctionnalités Clés

### 🔍 1. Barre de Recherche Intelligente (Omnibox) — `js/search.js`
- **Raccourci instantané** : Appuyez sur la touche <kbd>/</kbd> n'importe où pour cibler immédiatement la recherche.
- **Moteurs de recherche & Préfixes rapides (Bangs)** :
  Tapez un préfixe pour changer instantanément de moteur de recherche :
  - `!yt <requête>` : Rechercher sur **YouTube**
  - `!gh <requête>` : Rechercher sur **GitHub**
  - `!tr <texte>` : Traduire avec **DeepL**
  - `!maps <lieu>` : Localiser sur **Google Maps**
  - `!img <terme>` : Rechercher sur **Google Images**
  - `!w <terme>` : Rechercher sur **Wikipédia**
  - `!d <requête>` : Rechercher sur **DuckDuckGo**
  - `!so <requête>` : Rechercher sur **StackOverflow**
  - `!arch <sujet>` : Consulter le wiki **ArchLinux**
  - `!r <terme>` : Rechercher sur **Reddit**
  - `!help` : Afficher l'aide interactive des commandes
- **Calculatrice en direct** : Saisissez une expression mathématique (ex: `15 * 4`, `(120/4) + 8`) et le résultat s'affiche en temps réel sans recharger la page.
- **Suggestions automatiques** : Autocomplétion Google en temps réel navigable au clavier (flèches <kbd>↑</kbd> <kbd>↓</kbd>).

### ⚡ 2. Signets & Personnalisation Complète (Nombre illimité de liens) — `js/bookmarks.js`
- **Plus de 6 liens par catégorie avec ajustement adaptatif** :
  - **Densité automatique** : La startpage adapte dynamiquement l'espacement et la taille de la police selon le nombre de liens (Normal <= 6, Compact 7-8, Dense 9-12, Défilement élégant > 12) pour que la grille Bento reste toujours impeccable sans déborder.
  - **Ajout & Suppression de liens** : Bouton <kbd>+ Nouveau lien</kbd> direct dans chaque catégorie en mode personnalisation et bouton de suppression rapide.
  - **Création & Édition de catégories** : Créez vos propres catégories (ex: Outils, Musique, Veille...) avec icônes Font Awesome ou modifiez/supprimez les catégories existantes.
- **Réorganisation par Glisser-Déposer (Drag & Drop)** : Réordonnez vos favoris ou déplacez-les d'une catégorie à l'autre en un simple glissé.
- **Sauvegarde & Restauration Totale (Export / Import JSON)** : Téléchargez un fichier de configuration `.json` ou restaurez-le en 1 clic (inclut signets, catégories, notes, tâches, flux RSS et réglages d'apparence).
- **Persistance locale** : Toutes vos modifications sont enregistrées dans le `localStorage` de votre navigateur.

### ⏱️ 3. Horloge Cyberdeck & Indicateurs Temporels — `js/clock.js`
- **Positionnée dans la colonne gauche** sous l'artwork pour un équilibre parfait.
- **Typographie au choix** : 5 polices intégrées sélectionnables d'un clic :
  - `JetBrains Mono` : Monospace technique cyberdeck.
  - `Orbitron` : HUD futuriste de science-fiction.
  - `Share Tech Mono` : Style terminal hacker / console.
  - `VT323` : Rétro-cathodique arcade des années 90.
  - `Inter` : Sans-serif moderne, épurée et géométrique.
- **Styles visuels de cadre** :
  - **Pilule Verre Néon** : Translucidité biseautée moderne.
  - **Crochets Cyber `[ ]`** : Style console hacker / dev.
  - **Lueur Intense Néon** : Aura lumineuse pulsante synchronisée.
  - **Digital Box LCD** : Cadran numérique rétro encadré.
  - **Minimaliste** : Zéro bordure, texte brut néon.
  - **Cadre Cyber HUD** : Coins biseautés et encadrement technique.
- **Indicateurs avancés** :
  - **Barre de progression de la journée (%)** : progression visuelle en temps réel de 0 à 100%.
  - **Informations complémentaires** : Numéro de semaine (`Sem. 45`) et jour de l'année (`Jour 307/365`).
  - **Sélecteur de Fuseaux Horaires** : Local, Tokyo (JST), New York (EST), Londres (GMT) et UTC.
  - Bascule 24 heures vs 12 heures AM/PM, affichage ou masquage des secondes (`:SS`), et 3 formats de date (Texte français, Numérique, ISO).
  - 3 tailles au choix : Compacte, Moyenne, Imposante.

### 🎛️ 4. Centre de Configuration Intégré au Deck Droit — `js/custom-hub.js`
- **Zéro pop-up bloquante** : Accessible directement via l'onglet **Config** de la colonne droite avec défilement fluide et sous-onglets horizontaux :
  - **Apparence** : Choix des thèmes, 10 palettes rapides instantanées, sélecteurs de couleurs personnalisés, flou, intensité de l'Ambilight et scanlines rétro avec rendu en direct sur toute la page.
  - **Horloge** : Réglages en temps réel de la police, du style de cadre, du fuseau horaire, du format et des options d'affichage.
  - **Signets** : Gestion complète des catégories et favoris avec contrôle de densité adaptative.
  - **Widgets** : Activation et désactivation individuelle de chaque widget.
  - **Flux RSS** : Gestion et validation d'URL pour vos flux d'actualités sur mesure.
  - **Sauvegarde** : Exportation et importation JSON en un clic, ou réinitialisation aux valeurs d'usine.

### 🌤️ 5. Station Météo Complète & Effets d'Arrière-Plan — `js/weather.js` & `js/weather-fx.js`
- **Intégrée dans l'onglet Météo du deck droit** :
  - Carte Hero météo en temps réel (icône animée, température, description).
  - Recherche manuelle de ville instantanée ou détection GPS/IP en 1 clic.
  - **Grille de métriques avancées** : Température ressentie, humidité, vent, indice UV.
  - **Prévisions complètes sur 3 jours** avec températures min/max.
  - **Effets météo dynamiques sur Canvas** : pluie, neige, orages, brume ou étoiles scintillantes réagissant à la météo réelle, avec interrupteur ON/OFF direct.

### 🧩 6. Centre des Widgets Multi-Vues (Colonne Droite) — `js/widgets.js`
- **Slider dynamique à 9 vues dans la colonne droite** :
  1. 📅 **Agenda** : Calendrier mensuel interactif avec badges et gestionnaire de tâches (To-Do list).
  2. 🌤️ **Météo** : Station météo complète et prévisions à 3 jours.
  3. 📰 **Actus** : Flux RSS réactifs (Tech, Sport, flux sur mesure).
  4. ⚡ **Système & Marchés** : Ping en temps réel, alimentation universelle (AC / Batterie), uptime, CPU/RAM et cotations boursières (S&P 500, Stoxx 600, Emerging Markets, NVIDIA...) avec menu de personnalisation intégré.
  5. ⏱️ **Focus** : Minuteur Pomodoro (25m / 5m / 15m), barre de progression et carillon Web Audio.
  6. 📝 **Notes** : Bloc-notes instantané avec sauvegarde automatique, compteurs et export texte.
  7. 🎧 **Ambiance** : Synthétiseur procédural (pluie, bruit brun), radio Lo-Fi cyber et visualiseur audio Canvas animé.
  8. 💬 **Quotes** : Citations cyberpunk et pensées inspirantes.
  9. ⚙️ **Config** : Centre de personnalisation complet en direct.

---

## 🏗️ Architecture Propre & Modulaire

Le projet est entièrement modulaire, sans dépendance lourde :

```text
violet-startpage/
├── index.html                  # Structure HTML cyberdeck 3 colonnes épurée
├── README.md                   # Documentation complète du projet
├── .gitignore                  # Fichiers et dossiers exclus de Git
│
├── css/                        # Feuilles de styles modulaires
│   ├── style.css               # Styles de base, Bento Grid 3 colonnes, widgets & responsive
│   └── themes/                 # Thèmes visuels autonomes
│       ├── kanagawa.css        # Thème 1 : Kanagawa (Cyan / Menthe froide)
│       ├── sakura.css          # Thème 2 : Sakura (Rose / Néo-pastel)
│       └── cyberdeck.css       # Thème 3 : Cyberdeck (Néon violet & cyan)
│
├── js/                         # Logique JavaScript modulaire
│   ├── app.js                  # Point d'entrée & bootstrapping DOMContentLoaded
│   ├── themes.js               # Gestionnaire de thèmes visuels
│   ├── appearance.js           # Personnalisation des couleurs, ambilight et scanlines
│   ├── weather-fx.js           # Effets météo d'arrière-plan dynamiques sur Canvas
│   ├── custom-hub.js           # Centre de personnalisation in-deck & navigation à 9 vues
│   ├── bookmarks.js            # Signets adaptatifs, Drag & Drop & Export/Import JSON
│   ├── search.js               # Omnibox : moteur, calculatrice, bangs & autocomplétion
│   ├── calendar.js             # Mini-calendrier mensuel interactif
│   ├── tasks.js                # To-Do list, calcul des échéances & filtrage
│   ├── clock.js                # Horloge cyberdeck gauche, progress bar jour & fuseaux
│   ├── weather.js              # Station météo in-deck, prévisions & géolocalisation
│   ├── widgets.js              # Widgets interactifs (Pomodoro, Notes, Ambiance, Système, Quotes)
│   ├── feeds.js                # Flux d'actualités en direct & flux RSS personnalisés
│   └── shortcuts.js            # Raccourcis clavier globaux
│
└── images/                     # Médias et animations des thèmes
    ├── gif.gif                 # Artwork Thème 1 (Kanagawa)
    ├── gif2.gif                # Artwork Thème 2 (Sakura)
    ├── gif3.gif                # Artwork Thème 3 (Cyberdeck)
    └── gif_origin.gif
```

---

## ⌨️ Raccourcis Clavier

| Raccourci | Action |
| :--- | :--- |
| <kbd>/</kbd> | Activer immédiatement la barre de recherche |
| <kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd> | Basculer entre les thèmes (Kanagawa / Sakura / Cyberdeck) |
| <kbd>Échap</kbd> | Fermer la modale d'édition ou masquer les suggestions |
| <kbd>Entrée</kbd> | Valider une recherche, ajouter une tâche ou enregistrer |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Naviguer dans les suggestions de recherche |

---

## 🚀 Installation & Utilisation

### Option A : Utilisation locale (Recommandée)
1. Clonez ce dépôt ou téléchargez l'archive :
   ```bash
   git clone https://github.com/ugovds/startup_page.git
   ```
2. Ouvrez simplement `index.html` dans votre navigateur Web (Chrome, Firefox, Brave, Edge...).
3. Pour définir comme nouvel onglet :
   - Utilisez une extension telle que **New Tab Override** ou **Custom New Tab URL**.
   - Indiquez le chemin vers votre fichier : `file:///chemin/vers/index.html`.

### Option B : Déploiement en ligne gratuit (GitHub Pages)
1. Rendez-vous sur votre dépôt GitHub : [https://github.com/ugovds/startup_page](https://github.com/ugovds/startup_page).
2. Rendez-vous dans **Settings** > **Pages**.
3. Sous **Branch**, sélectionnez `main` et `/ (root)`, puis cliquez sur **Save**.
4. Votre startpage sera instantanément accessible en ligne à l'adresse :
   ```text
   https://ugovds.github.io/startup_page/
   ```

---

## 🎨 Créer un Nouveau Thème

Grâce à la nouvelle architecture modulaire, ajouter un thème est un jeu d'enfant :
1. Créez un fichier `css/themes/mon-theme.css` avec vos variables CSS :
   ```css
   body[data-theme="4"] {
     --bg-deep: #0a0e14;
     --accent-primary: #ffaa00;
     --accent-secondary: #00e5ff;
     /* ... */
   }
   ```
2. Liez-le dans `index.html` ou importez-le dans `css/style.css`.
3. Déclarez l'artwork et le nom du thème dans `js/themes.js`.
