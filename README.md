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

La page intègre **3 thèmes visuels complets** avec éclairage ambiant (Ambilight), orbes lumineux animés et scanlines rétro. Vous pouvez basculer d'un thème à l'autre en un clic ou via le pavé numérique (<kbd>1</kbd>, <kbd>2</kbd>, <kbd>3</kbd>).

| Thème 1 : Kanagawa 🌊 | Thème 2 : Sakura 🌸 | Thème 3 : Cyberdeck ⚡ |
| :---: | :---: | :---: |
| <img src="images/gif.gif" width="240" /> | <img src="images/gif2.gif" width="240" /> | <img src="images/gif3.gif" width="240" /> |
| *Palette Cyan & Menthe froide* | *Palette Rose & Néo-Pastel* | *Palette Cyberpunk Violet & Néon* |

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
- **Sauvegarde & Restauration Totale (Export / Import JSON)** : Téléchargez un fichier de configuration `.json` ou restaurez-le en 1 clic (inclut signets, catégories, notes, tâches, flux RSS, widgets de topbar et réglages d'apparence).
- **Persistance locale** : Toutes vos modifications sont enregistrées dans le `localStorage` de votre navigateur.

### ⏱️ 3. Widgets de la Barre Supérieure (Topbar) — `js/widgets.js`
- **Minuteur Focus / Pomodoro** :
  - Décompte 25 min (Focus), 5 min (Pause courte) et 15 min (Pause longue) commutable en 1 clic.
  - Carillon doux mélodique généré via la Web Audio API (aucun fichier MP3 externe à charger, fonctionne 100% hors-ligne).
  - Affichage dynamique du temps restant dans le titre de l'onglet du navigateur (`(24:45) Startpage`).
- **Bloc-Notes Rapide (Scratchpad)** :
  - Tiroir de notes instantané pour noter idées, liens ou extraits de code.
  - Sauvegarde automatique en direct, compteur de mots et caractères, boutons de copie rapide et téléchargement `.txt`.
- **Ambiance Sonore & Lofi (Relaxation)** :
  - Générateur procédural audio (Pluie relaxante, Bruit brun apaisant pour concentration profonde) et flux Radio Lofi en direct avec curseur de volume.
- **Statut Système & Réseau** :
  - Latence réseau en direct (ping vers Cloudflare) avec indicateur vert/rouge.
  - Indicateur de niveau de batterie et statut de charge en temps réel.
- **Invite Terminal Personnalisable** :
  - Personnalisez le prompt `~/startpage` (ex: `user@deck:~`, `neo@matrix:~$`).
- **Gestionnaire d'affichage des Widgets** :
  - Activez ou désactivez n'importe quel widget de la topbar depuis le menu Personnaliser > <kbd>Widgets</kbd>.

### 🎨 4. Personnalisation de l'Apparence & Couleurs — `js/appearance.js`
- **Sélecteur de Couleurs d'Accentuation** :
  - Définissez vos propres couleurs néon pour l'accentuation principale et secondaire.
  - 6 palettes cyberpunk préréglées (*Kanagawa Cyan*, *Sakura Rose*, *Cyberdeck Violet*, *Matrix Emerald*, *Synthwave Amber*, *Neon Glace*).
- **Contrôle de l'Ambilight & Éclairage** :
  - Curseurs pour ajuster le rayon de flou (10px à 100px) et l'opacité (10% à 90%) de l'arrière-plan.
  - Interrupteur pour activer ou désactiver les scanlines rétro.

### 📅 5. Mini-Calendrier & Filtre d'échéances — `js/calendar.js`
- Vue calendaire complète du mois en cours avec mise en évidence du jour actuel.
- Navigation d'un mois à l'autre et bouton retour rapide à aujourd'hui (<kbd>auj</kbd>).
- **Filtre synchronisé** : Cliquez sur une date du calendrier pour afficher uniquement les tâches associées à ce jour.

### ✅ 6. Gestionnaire de Tâches (Tasks / To-Do List) — `js/tasks.js`
- Ajout de tâches avec date d'échéance optionnelle.
- Badges d'urgence dynamiques : `Auj.`, `J-X` (à venir) et `J+X` (en retard).
- Validation d'un clic pour rayer une tâche terminée, suppression rapide.
- Synchronisation complète avec le calendrier et persistance `localStorage`.

### 🌤️ 7. Météo Détaillée & Effets d'Arrière-Plan Dynamiques — `js/weather.js` & `js/weather-fx.js`
- **Widget Météo en direct & Modale complète** : Cliquez sur la pilule météo pour ouvrir les détails météo (température ressentie, humidité, vitesse du vent, indice UV) et les **prévisions complètes sur 3 jours**.
- **Sélection manuelle de la ville** : Entrez votre ville dans la modale ou revenez en un clic à la détection automatique par IP.
- **Effets météo d'arrière-plan sur Canvas** : Particules animées réagissant à la météo réelle (pluie et reflets, flocons de neige, éclairs d'orage, brume flottante ou étoiles néon scintillantes).
- **Contrôle manuel ON/OFF** : Bouton dans la topbar et interrupteur dans la modale pour activer/désactiver les effets à tout moment.

### 📰 8. Flux d'Actualités Personnalisables — `js/feeds.js`
- Onglets d'actualités intégrés avec skeleton loading (F1, Football, Tech).
- **Gestionnaire de flux RSS sur mesure** : Ajoutez vos propres flux RSS (blogs, actualités spécialisées, Reddit...) depuis le menu de personnalisation pour les consulter directement dans le widget.

---

## 🏗️ Architecture Propre & Modulaire

Le projet a été restructuré pour séparer distinctement la structure HTML, les feuilles de style de chaque thème et chaque module JavaScript fonctionnel :

```text
violet-startpage/
├── index.html                  # Structure HTML épurée & chargement modulaire
├── README.md                   # Documentation complète du projet
├── .gitignore                  # Fichiers et dossiers exclus de Git
│
├── css/                        # Feuilles de styles modulaires
│   ├── style.css               # Styles de base, Bento Grid, composants & responsive
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
│   ├── widgets.js              # Widgets topbar (Pomodoro, Notes, Ambiance, Ping/Batterie)
│   ├── bookmarks.js            # Signets adaptatifs, Drag & Drop & Export/Import JSON
│   ├── search.js               # Omnibox : moteur, calculatrice, bangs & autocomplétion
│   ├── calendar.js             # Mini-calendrier mensuel interactif
│   ├── tasks.js                # To-Do list, calcul des échéances & filtrage
│   ├── clock.js                # Horloge numérique et calendrier français
│   ├── weather.js              # Widget météo, géolocalisation & modale détaillée
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
