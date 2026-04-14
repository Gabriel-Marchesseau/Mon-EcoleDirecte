# CLAUDE-ui.md — Composants UI notables

---

## Badge PJ (pièces jointes)
```html
<span class="pj-badge" style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;white-space:nowrap">📎 N</span>
```

## Sélection visuelle devoir
```js
el.classList.add('devoir-selected');   // box-shadow inset #1d4ed8
```

## Dialog notes — bilan compétences
Couleurs dans `openNoteDialog()` via `COMP_LABEL_COLORS` :
- 1 → rouge, 2 → jaune, 3 → bleu, 4 → vert (adaptatif dark mode)

## EDT — sélecteur semaine via calendrier
- Bouton `.edt-week-label-btn` avec `#edt-week-label` affichant la semaine courante
- `edtOpenCalendar(e)` : ouvre `#edt-date-picker` (input date caché), calcule le lundi de la semaine choisie et met à jour `edtWeekOffset`

## Séances — date range picker
HTML dans `ecoledirecte.html` : classes `.seances-date-range`, `.seances-date-field`  
`onclick` sur le wrapper → `showPicker()` avec fallback `.click()`  
Dark mode : `color-scheme: dark` + `filter: invert(1)` sur l'icône calendrier

## Séances — filtre matière
- Menu déroulant `#seances-matiere-menu` (position absolute, z-index:100) avec cases à cocher par matière
- Boutons "Tout" / "Aucun" pour sélection rapide
- Badge `#seances-matiere-badge` sur le bouton filtre quand un sous-ensemble est sélectionné
- `_seancesMatieresFilter = null` → toutes les matières affichées ; `Set<string>` → filtre actif

## Espaces de travail — explorateur
- Layout `.espaces-layout` (flex row) : `#espaces-list` (liste gauche, 200px) + `#espaces-detail` (contenu droit)
- Arborescence : `_espaceNavPath` est une pile de nœuds ; `renderEspaceExplorer()` affiche toujours le dernier
- Dossiers détectés via `Array.isArray(c.children)`, fichiers sinon
- Breadcrumb cliquable via `navigateEspaceTo(depth)` → tronque la pile
- Icône breadcrumb racine : SVG maison (remplace l'emoji `⌂`)
- Fichiers ouverts via `openEspaceFile()` → Collabora Online (WOPI) ; `_openCollaboraViewer()` fait un form POST vers `_blank` car `libreoffice.ecoledirecte.com` bloque l'iframe

## Profil — dialog Compte/Sécurité
- `openProfile()` charge `/v3/profil.awp` ; fallback sur `accountData` si le fetch échoue
- Téléphone : affiché en `formatFrPhone()`, renvoyé en `normalizeFrPhone()` (format E.164 `+33…`)
- MDP : placeholder `••••••••` géré par `data-pfPlaceholder` → ignoré à la sauvegarde si non modifié
- Validation inline : `pfValidateField(id)` / `pfShowError(id, msg)` / `pfCheckDirty()` — bouton Valider activé uniquement si champs modifiés et sans erreur
- Question secrète "Autre" : affiche le champ `#pf-question-custom-wrap` dynamiquement via `onchange`
- Layout stable : hauteur du wrapper fixée au maximum des deux sections pour éviter le saut au changement d'onglet
- Boutons Annuler/Valider communs en bas (hors des sections), `#pf-save-btn` détecte l'onglet actif

## Accueil — post-its
- Classes CSS : `.postits-list`, `.postit-card`, `.postit-card.type-{info|alerte|urgence}`, `.postit-meta`, `.postit-type`, `.postit-content`, `.postit-author`
- Couleurs de bordure gauche : info → `#1d4ed8`, alerte → `#ca8a04`, urgence → `#dc2626`
- Contenu décodé en base64 (`b64d()`) — peut contenir du HTML riche

## Paramètres — dialog page par défaut
- Bouton engrenage (SVG) dans le header, déclenche `openSettingsDialog()`
- Sélection mémorisée dans `localStorage` clé `ed_default_tab_{_currentAccountId}`
- Boutons de sélection avec état actif (fond `#1d4ed8`, texte blanc)
- `_settingsOverlayEl` — référence globale vers l'overlay (pour fermeture depuis inline onclick)

## Mode hors-ligne / session expirée
- `sessionExpired = true` quand le token est révoqué
- Avant d'entrer en mode hors-ligne, `silentReauth(savedSession)` tente un re-login automatique
- Si la reconnexion échoue : bannière `#offline-banner` avec bouton "Se reconnecter" → `logout()`
- Le cache IndexedDB est conservé — navigation dans les données en cache possible sans token
- `maybeAutoSaveSecRule(question, label)` — sauvegarde automatiquement la réponse 2FA après un clic manuel

## Routeur SPA
- `switchTab(id, fromPopstate)` → `history.pushState` si `!fromPopstate`
- `window.onpopstate` → `switchTab(tab, true)` pour navigation arrière/avant
- Tab `absences` → URL `/vie-scolaire`

## Composition message — dialog
- `openNewMessageDialog({initialRecipient, mode, subject, quotedHtml, forwardId, forwardFiles})`
- Modes : `null` (nouveau) | `'reply'` (répondre) | `'forward'` (transférer)
- `getMsgPayload(isDraft)` pour comptes élève ; `getMsgPayloadParent(isDraft)` pour comptes parent (structure `groupesDestinataires`)

## Sélecteur compte enfant (compte parent)
- `#child-account-bar` avec `#child-account-selector` — visible uniquement sur compte parent
- `switchChildAccountView(eleveId, initialTab?)` — bascule entre vue parent (5 onglets) et vue élève associé
- Vue enfant persistée dans `localStorage` clé `ed_child_view_{_currentAccountId}` — restaurée automatiquement au rechargement via `onLoggedIn()`
- En vue enfant : QCM et Sondages masqués (`#vs-tab-qcm`, `#vs-tab-sondages`), Demandes absences affiché (`#vs-tab-demandesabsences`)
- `_rebuildTabBar(tabs)` — centralise la création des onglets
- `getCorrespondancesEleveId()` — résout l'ID élève pour les correspondances (vue enfant → `_childEleveView.id` ; compte parent → premier enfant ; compte élève → `getEleveId()`)

## Vie scolaire — Demandes absences (vue enfant)
- Sous-onglet `#vs-tab-demandesabsences` (hidden par défaut, visible uniquement quand `_childEleveView` est actif)
- `loadDemandesAbsences()` → endpoint `autorisationsSortie.awp`, cache `autorisations-sortie:{eleveId}`
- `renderDemandesAbsences(data)` : tableau HTML des autorisations par jour/demi-journée (Lundi–Vendredi × Matin/Après-midi × 3 types), puis liste des demandes passées
- Types : `arriveeTardive`, `intercours`, `sortieAnticipee` — libellés depuis `data.parametrage.libellesAutorisations`
- Bouton "Justifier" sur chaque absence non justifiée → `openJustifierAbsenceDialog(absIdx)` (dialog avec confirmation OTP WIP)
- Bouton "+ Nouvelle demande" → `openNouvelleDemandeAbsenceDialog()` (dialog formulaire date/heure/motif, WIP — bouton Enregistrer valide le formulaire sans appel API)

## Responsive split-pane master/detail (≤ 768px)
- Classe `.split-pane` sur le wrapper flex des panneaux à deux colonnes (liste + détail)
- Sur mobile : les deux colonnes passent en `min-width:100%` et se décalent via `translateX` (CSS transition 0.28s)
- `.split-pane.show-detail` → panneau gauche sort à gauche, panneau droit glisse en vue
- Bouton `.split-back-btn` placé **immédiatement après** le `.split-pane` dans le HTML — pill fixe en bas de l'écran, visible uniquement via `adjacent sibling` CSS (`.split-pane.show-detail + .split-back-btn`)
- Toolbars (`.msg-toolbar`, `.devoirs-toolbar`, `.memos-toolbar`) masquées via `:has(.show-detail)` quand le détail est affiché
- `_initSplitSwipe(el, backFn)` — attache un swipe droit → retour (seuil 60 px, annulé si vertical) ; idempotent via `el._swipeInit`
- Panneaux concernés : `.devoirs-split`, `.msg-split`, `.memos-split`, `#cours-panel-espaces`
- Fonctions retour : `devoirBack()`, `msgBack()`, `memoBack()`, `espaceBack()`
- `msgBack()` remet aussi `selectedMessageId = null`
- `switchMsgTab()` retire `.show-detail` pour éviter de rester en vue détail au changement d'onglet messages

## Dark mode — règles importantes déjà définies
```css
body.dark .pj-badge { background: #1e3a5f !important; color: #93c5fd !important; }
body.dark .devoir-selected { box-shadow: inset 0 0 0 2px #1d4ed8; }
body.dark .child-account-select { ... }
body.dark .postit-content [style*="background"] { background: transparent !important; }
```

## Paiements en ligne — layout panier fixe en bas
- `#finances-result` passe en `flex-direction:column` via `switchFinancesTab('paiementsenligne')` (style.cssText direct)
- Layout : zone catalogue scrollable (`flex:1;overflow-y:auto`) + panier fixe en bas (`flex-shrink:0`)
- `_paiementsData` / `_panierPaiements` (Map) — état global du panier ; réinitialisés au forceRefresh
- `addToPanier(id)` / `removeFromPanier(id)` / `updatePanierQte(id, delta)` / `updatePanierMontant(id, value)`
- `_refreshPanierUI()` — re-render `#panier-paiements` + met à jour les boutons "Ajouter" dans le catalogue
- `openPaiementDialog()` — récapitulatif overlay (WIP, bouton Payer sans action réelle)
- Dark mode : `.btn-remove-panier:hover` couleur spécifique dans le bloc `darkStyle`

## Tab bar — défilement horizontal mobile (≤ 768px)
- `.tab-bar` passe en `overflow-x: auto; scrollbar-width: none` sur mobile
- `_updateTabBarOverflow()` : ajoute `.overflow-right` / `.overflow-left` selon la position de scroll → fade gradient via `mask-image` CSS (dégradé de 40px)
- Les deux classes peuvent coexister → `mask-image` combiné (fondu aux deux extrémités)
- Listener `scroll` attaché dans `_rebuildTabBar()` (idempotent via `bar._overflowListenerAttached`)
- `switchTab()` appelle `scrollIntoView({ block:'nearest', inline:'nearest' })` sur l'onglet actif pour le rendre visible
- `.tab-freshness-row` reçoit `background: var(--bg); border-left: 1px solid var(--border)` pour rester lisible au-dessus des onglets masqués

## Largeur onglets stable au bold
`.tab::before` avec `data-label` — empêche le saut de largeur lors du bold de l'onglet actif :
```css
.tab::before { content: attr(data-label); height: 0; overflow: hidden; font-weight: bold; display: block; }
```
