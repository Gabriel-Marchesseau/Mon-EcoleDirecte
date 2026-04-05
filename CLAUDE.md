# CLAUDE.md — Mon EcoleDirecte

> Contexte projet pour Claude Code. À lire au démarrage de chaque session.

---

## Présentation

Client web **local** pour EcoleDirecte (plateforme scolaire française), développé pour Gabriel (fils de Martial). Tourne entièrement en local via un proxy HTTPS Node.js — aucune donnée ne transite par un tiers.

**Stack** : vanilla HTML/CSS/JS (zéro framework), Node.js proxy, IndexedDB cache.  
**Plateforme** : Windows uniquement (scripts `.bat` / `.ps1`).  
**Port** : `https://localhost:3131` ou `https://monecoledirecte.local:3131`

---

## Architecture fichiers

```
proxy.js                    # Proxy HTTPS Node.js — cœur du serveur
ecoledirecte.html           # HTML + cache IndexedDB inline (objet edCache) + dark mode init
app.js                      # Toute la logique UI (~3300 lignes) — fichier principal
style.css                   # Thème light/dark via CSS variables
generate-cert.js            # Génère cert.pem / key.pem (SSL auto-signé, couvre monecoledirecte.local)
package.json                # node-forge, nodemon
install.ps1                 # Script d'installation PowerShell (configure hosts + portproxy)
run.ps1                     # Script de lancement PowerShell
Installer_Mon_EcoleDirecte.bat
Lancer_Mon_EcoleDirecte.bat
CLAUDE.md                   # Ce fichier
```

---

## Fonctionnalités implémentées

| Onglet | État |
|--------|------|
| Emploi du temps | Grille hebdomadaire, nav semaines, jours fériés (algo Pâques), jours Congés grisés (body uniquement), dialog au clic, color-coded |
| Notes | Tableau trié par trimestre + graphique Chart.js (zones colorées, hachures, légende cliquable, courbe moyenne classe par note) |
| Devoirs | Liste groupée par date, toggle fait/non-fait (API PUT), badge PJ, détail + PJ téléchargeables, sélection visuelle persistante |
| Cours | Deux sous-onglets : **Contenus de séances** (plage de dates, J-14 → aujourd'hui, groupé par jour) + **Espaces de travail** (liste + explorateur arborescence + téléchargement fichiers) |
| Messages | Reçus/envoyés/brouillons/archivés, PJ téléchargeables, marquage lu, décoding entités HTML natif, sélection persistante |
| Messages — Correspondances | Carnet de correspondance élève (lettres/docs reçus), badge PJ PDF, badge signature, `fetchCorrespondanceCount()` en arrière-plan dès le chargement Messages |
| Messages — Contacts | Liste contacts (Professeurs / Personnels / Autres), bouton "Écrire" → ouvre composition avec destinataire pré-rempli |
| Nouveau message | Dialog composition : éditeur enrichi (contenteditable), PJ drop zone, sélecteur destinataires (contact picker tabulé) |
| Vie scolaire | Deux sections : Absences (liste avec justificatifs) + Sanctions/Encouragements |
| Onglet ··· | Appel API manuel libre |

Fonctionnalités transversales : dark mode, cache IndexedDB stale-while-revalidate (TTL 30 min), badges nouveautés, mode hors-ligne (session expirée → cache conservé + bannière reconnexion), routeur SPA (URL par onglet), label fraîcheur, refresh forcé, arrêt proxy, double auth 2FA avec QCM et réponses automatiques configurables.

---

## API EcoleDirecte

- **Base** : `https://api.ecoledirecte.com/v3/`
- **Auth** : token GTK + session cookie + `X-Token` header après login
- **Double auth** : code 250 → QCM base64 → PUT → re-login avec `fa:[{cn,cv}]`
- **Contenus** (devoirs, messages) encodés en base64 → `b64d()` pour décoder
- **Téléchargement PJ messages** : `leTypeDeFichier=PIECE_JOINTE`
- **Téléchargement docs cahier de texte** : `leTypeDeFichier=FICHIER_CDT` ← (pas CLOUD_ELEVE)
- **Toggle devoir fait/non-fait** : `PUT /v3/Eleves/{id}/cahierdetexte.awp?verbe=put` avec `{idDevoirsEffectues:[id], idDevoirsNonEffectues:[]}`
- **Vie scolaire** : `POST /v3/eleves/{id}/viescolaire.awp?verbe=get` → `{ absencesRetards, sanctionsEncouragements }`
- **Contacts messagerie** : `/v3/messagerie/contacts/professeurs.awp`, `personnels.awp`, `entreprises.awp`
- **Espaces de travail** : `POST /v3/E/{eleveId}/espacestravail.awp?verbe=get&typeModule=espaceTravail` → liste des espaces
- **Contenu espace** : `POST /v3/cloud/W/{espaceId}.awp?verbe=get` → arborescence `children[]` (dossiers/fichiers)
- **Téléchargement fichier espace** : même endpoint avec `&idFichier={id}` → binaire via `triggerDownload()`

---

## Proxy (`proxy.js`)

- Détecte les réponses binaires via `content-type` ou path (`telechargement`, `/pj/`)
- Renvoie le GTK au client via header `X-Gtk-Value` après `initSession()`
- Fichiers statiques servis directement, `__VERSION__` remplacé par timestamp
- Endpoint `POST /shutdown` pour arrêter le serveur depuis l'UI

---

## Variables globales clés (`app.js`)

```js
let token = '';                // X-Token EcoleDirecte (après login)
let twoFaToken = '';           // Token 2FA (double auth)
let accountData = null;        // Données compte (élèves, profil)
let sessionExpired = false;    // true si session expirée (mode hors-ligne cache)
let devoirsCache = null;       // Cache mémoire devoirs { [date]: [devoir, ...] }
let selectedDevoirKey = null;  // Clé du devoir sélectionné visuellement
let notesData = null;          // Données notes chargées
let notesPeriod = null;        // Période active (A001/A002/A003)
let msgData = null;            // Données messages chargées
let msgActiveTab = 'received'; // Onglet actif messages (received/sent/draft/archived/correspondance)
let selectedMessageId = null;  // ID message sélectionné visuellement
let vieScolaireSection = 'absences'; // Section active (absences/sanctions)
let newMsgRecipients = [];     // Destinataires du message en cours { id, nom, type }
let newMsgAttachments = [];    // Pièces jointes du message en cours (File[])
let contactsCache = { teachers: null, staff: null, tutors: null }; // Cache contacts messagerie

// Onglet Cours (sous-onglets séances / espaces de travail)
let _coursActiveTab = 'seances';   // sous-onglet actif ('seances' | 'espaces')
let _espacesCache = null;          // liste des espaces de travail (null = non chargé)
let _selectedEspaceId = null;      // ID de l'espace sélectionné dans la liste
let _espaceNavPath = [];           // pile de navigation dans l'arborescence [{libelle, children}, ...]

// Routeur SPA
const ROUTE_TO_TAB = { '/edt': 'edt', '/notes': 'notes', '/devoirs': 'devoirs',
  '/seances': 'seances', '/messages': 'messages', '/vie-scolaire': 'absences', '/perso': 'perso' };
const TAB_TO_ROUTE = { 'edt': '/edt', ... , 'absences': '/vie-scolaire' };
```

---

## Fonctions utilitaires clés (`app.js`)

```js
getProxy()                    // → window.location.origin
getEleveId()                  // → ID élève depuis accountData
b64d(s)                       // Décode base64 UTF-8 (contenu EcoleDirecte)
cleanHtml(s)                  // Nettoie le HTML (balises autorisées uniquement)
centeredSpinner()             // → HTML string du spinner centré
getFileIcon(filename)         // → emoji icône selon extension
updateFreshnessLabel(tabId, ts)
setBadge(tabId, count)
renderDevoirsFromCache()      // Re-render la liste devoirs depuis devoirsCache
applyDark(bool)               // Applique/retire le dark mode
dateRange(debut, fin)         // → tableau ['YYYY-MM-DD', ...]
resetContactsCache()          // Vide contactsCache (ex: après logout)

// Vie scolaire
switchVieScolaireTab(section)          // 'absences' | 'sanctions'
renderVieScolaireSection(data, section)
renderAbsences(data)
renderSanctions(data)

// Messages
switchMsgTab(tab)             // change l'onglet actif + charge Correspondances si besoin
fetchCorrespondanceCount()    // fetch silencieux en arrière-plan → peuple _correspondancesCache + met à jour le label
loadCorrespondance()          // affiche la liste Correspondances (utilise _correspondancesCache si peuplé, sinon fetch)
renderCorrespondanceList(resultEl) // render HTML depuis _correspondancesCache
openMsgToContact(id, nomEnc, type)     // ouvre composition avec destinataire pré-rempli
openNewMessageDialog(initialRecipient) // dialog composition (initialRecipient optionnel)
openContactPicker()           // sélecteur destinataires (contact picker tabulé)
renderNewMsgChips()           // affiche les chips destinataires dans le dialog
renderAttachmentList()        // affiche la liste des PJ dans le dialog

// Cours / Espaces de travail
switchCoursTab(tab)           // 'seances' | 'espaces' — bascule le sous-panel
loadEspacesTravail()          // charge la liste des espaces (utilise _espacesCache si peuplé)
renderEspacesList(espaces)    // render la liste des espaces
loadEspaceTravailContent(espaceId) // fetch arborescence + init _espaceNavPath
renderEspaceExplorer()        // render breadcrumb + contenu du nœud courant
navigateEspaceInto(childIdx)  // entre dans un sous-dossier
navigateEspaceTo(depth)       // remonte dans le breadcrumb
downloadEspaceFile(espaceId, fileId, filenameEnc) // télécharge via triggerDownload

// Profil
formatFrPhone(raw)            // formate un N° FR → (+33) 6 12 34 56 78
normalizeFrPhone(display)     // normalise pour l'API → +33XXXXXXXXX
```

---

## Cache IndexedDB (`edCache` — inline dans `ecoledirecte.html`)

```js
// Pattern stale-while-revalidate
await edCache.load(cacheKey, fetchFn, { onSpinner, onCached, onFresh, diffFn });

await edCache.get(key)        // → { data, ts } | null
await edCache.set(key, data)
await edCache.delete(key)
await edCache.clear()
edCache.isStale(entry)        // > 30 min ?
edCache.defaultDiff(a, b)     // JSON.stringify compare
```

**Clés de cache utilisées :**
```
edt:{YYYY-MM-DD}
notes:{eleveId}
messages:received:{YYYY-YYYY}
messages:sent:{YYYY-YYYY}
absences:{eleveId}            ← données vie scolaire (absences + sanctions)
devoirs:{eleveId}
devoirs-detail:{eleveId}:{date}
seances:{eleveId}:{YYYY-MM-DD}    ← une entrée par jour
```

---

## Téléchargement de fichiers

Toujours passer par `triggerDownload()` — jamais de `fetch()` direct pour les fichiers.

```js
// Signature
async function triggerDownload(url, fetchOptions, filename)
// Gère automatiquement : binaire brut, JSON+base64 (atob), erreur HTML EcoleDirecte

// PJ messages
leTypeDeFichier=PIECE_JOINTE
// Docs cahier de texte
leTypeDeFichier=FICHIER_CDT      ← IMPORTANT : pas CLOUD_ELEVE

// Headers obligatoires pour les téléchargements
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'X-Token': token,
  'X-ApisVer': '4.97.2'         ← version récente requise
};
if (twoFaToken) headers['2fa-token'] = twoFaToken;
```

---

## Patterns JS récurrents

```js
// ── Encoder des données dans un onclick inline ──────────────────────────
// TOUJOURS ajouter .replace(/'/g, '%27') — encodeURIComponent ne encode pas '
const encoded = encodeURIComponent(JSON.stringify({...})).replace(/'/g, '%27');
html += `<div onclick="maFonction('${encoded}')">`;
// Décodage côté récepteur
const data = JSON.parse(decodeURIComponent(encodedData));

// ── Décodage base64 UTF-8 (contenu EcoleDirecte) ───────────────────────
const texte = b64d(m.contenu);   // présent dans app.js

// ── Décoder entités HTML (messages) ────────────────────────────────────
function decodeHtmlEntities(html) {
  const ta = document.createElement('textarea');
  ta.innerHTML = html; return ta.value;
}
// Toujours utiliser cette fonction — jamais de replace manuel

// ── Plage de dates ──────────────────────────────────────────────────────
function dateRange(debut, fin) // → tableau ['YYYY-MM-DD', ...]
```

---

## CSS variables thème

```css
/* Light */  --bg --bg2 --bg3 --bg4 --text --text2 --text3 --text4 --border --border2 --input-bg
/* Dark */   body.dark { /* surcharge les mêmes variables */ }
```

- Toujours utiliser `var(--text2)` etc. — jamais de couleurs fixes pour les éléments adaptatifs
- Dark mode injecté dynamiquement via un `<style>` dans `app.js` (début du fichier)
- Règles dark spécifiques aux composants dans ce bloc injecté

**Règles dark importantes déjà définies :**
```css
body.dark .pj-badge { background: #1e3a5f !important; color: #93c5fd !important; }
body.dark .devoir-selected { box-shadow: inset 0 0 0 2px #1d4ed8; }
```

---

## Bugs corrigés — à ne pas réintroduire

### Apostrophes dans les onclick inline
`encodeURIComponent` n'encode pas `'` → toujours `.replace(/'/g, '%27')` sur les données passées en attribut HTML.
```js
// ✅ Correct
const enc = encodeURIComponent(JSON.stringify(obj)).replace(/'/g, '%27');
// ❌ Incorrect
const enc = encodeURIComponent(JSON.stringify(obj));
```

### Entités HTML dans les messages
Utiliser `decodeHtmlEntities()` (textarea natif), jamais de `.replace()` manuel.

### Documents devoirs (badges PJ)
`d.documents` est vide dans la liste sommaire. `enrichDevoirsWithDocs()` précharge les détails par jour en arrière-plan et met à jour `devoirsCache` puis appelle `renderDevoirsFromCache()`.

### Type de fichier cahier de texte
`FICHIER_CDT` (pas `CLOUD_ELEVE`) pour les pièces jointes du cahier de texte.

### Header 2fa-token pour les téléchargements
Toujours inclure conditionnellement : `if (twoFaToken) headers['2fa-token'] = twoFaToken;`

### Version API pour les téléchargements
Utiliser `X-ApisVer: 4.97.2` (pas `4.75.0`) pour les endpoints de téléchargement.

### Jours Congés dans l'EDT (typeCours === 'CONGE')
Les cours CONGE ont des horaires 00:00 → 23:59 → `top` très négatif → débordent hors du body et cachaient le header (date).  
Fix : `isCongeDay` map dans `renderEdtGrid()`, les cours CONGE sont exclus de `byDay` et remplacés par une overlay grise sur le body uniquement. `overflow:hidden` sur `.edt-day-body`, `z-index:3` sur `.edt-header`.

---

## Composants UI notables

### Badge PJ (pièces jointes)
```html
<span class="pj-badge" style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;white-space:nowrap">📎 N</span>
```

### Sélection visuelle devoir
```js
el.classList.add('devoir-selected');   // box-shadow inset #1d4ed8
```

### Dialog notes — bilan compétences
Couleurs dans `openNoteDialog()` via `COMP_LABEL_COLORS` :
- 1 → rouge, 2 → jaune, 3 → bleu, 4 → vert (adaptatif dark mode)

### Séances — date range picker
HTML dans `ecoledirecte.html` : classes `.seances-date-range`, `.seances-date-field`  
`onclick` sur le wrapper → `showPicker()` avec fallback `.click()`  
Dark mode : `color-scheme: dark` + `filter: invert(1)` sur l'icône calendrier

### Espaces de travail — explorateur
- Layout `.espaces-layout` (flex row) : `#espaces-list` (liste gauche, 200px) + `#espaces-detail` (contenu droit)
- Arborescence : `_espaceNavPath` est une pile de nœuds ; `renderEspaceExplorer()` affiche toujours le dernier
- Dossiers détectés via `Array.isArray(c.children)`, fichiers sinon
- Breadcrumb cliquable via `navigateEspaceTo(depth)` → tronque la pile

### Profil — dialog Compte/Sécurité
- `openProfile()` charge `/v3/profil.awp` ; fallback sur `accountData` si le fetch échoue
- Téléphone : affiché en `formatFrPhone()`, renvoyé en `normalizeFrPhone()` (format E.164 `+33…`)
- MDP : placeholder `••••••••` géré par `data-pfPlaceholder` → ignoré à la sauvegarde si non modifié

### Mode hors-ligne / session expirée
- `sessionExpired = true` quand le token est révoqué
- Bannière `#offline-banner` avec bouton "Se reconnecter" → `logout()`
- Le cache IndexedDB est conservé — navigation dans les données en cache possible sans token

### Routeur SPA
- `switchTab(id, fromPopstate)` → `history.pushState` si `!fromPopstate`
- `window.onpopstate` → `switchTab(tab, true)` pour navigation arrière/avant
- Tab `absences` → URL `/vie-scolaire`

---

## Workflow de développement

Martial travaille en itératif sur Windows. Claude Code lit/modifie les fichiers directement.

**À chaque session :**
1. Claude Code lit `CLAUDE.md` automatiquement au démarrage
2. Décrire le bug ou la fonctionnalité souhaitée
3. Claude Code patch directement les fichiers concernés

**Fichiers les plus souvent modifiés :**
- `app.js` — logique UI
- `ecoledirecte.html` — structure HTML des panels
- `style.css` — styles et thème
- `proxy.js` — si comportement serveur à changer

**Lancer en debug pour tester :**
```powershell
PowerShell -ExecutionPolicy Bypass -File run.ps1 -debug
```

---

## État des fonctionnalités — dernière session

Tous ces éléments sont intégrés dans les fichiers actuels :

- `openNoteDialog()` — dialog détail note avec bilan compétences coloré
- `renderNotesChart()` — courbe moyenne classe par note (points réels)
- `buildChart()._buildLegend()` — légende cliquable avec solo matière
- `toggleDevoirEffectue()` — toggle optimiste + rollback + invalidation cache
- `enrichDevoirsWithDocs()` — préchargement silencieux des docs pour badges PJ
- `triggerDownload()` — téléchargement robuste (base64/binaire/erreur HTML)
- `downloadDevoirDoc()` — `FICHIER_CDT` + `triggerDownload` + `2fa-token`
- `downloadAttachment()` — PJ messages via `triggerDownload` + `2fa-token`
- `decodeHtmlEntities()` + `renderMessageContent()` — décodage natif entités HTML
- Sélection visuelle devoir (`.devoir-selected`, box-shadow inset #1d4ed8)
- Protection apostrophes sur `nEncoded`, `cData`, `dEncoded`
- `loadSeances()` — plage de dates (début → fin), parallèle, groupé par jour (plus récent en premier)
- `dateRange(debut, fin)` — utilitaire plage de dates
- Panel séances — date range picker cliquable, dark mode calendrier natif
- Init séances — défaut J-14 → aujourd'hui
- Routeur SPA — URL mise à jour par onglet, navigation arrière/avant navigateur
- Mode hors-ligne — session expirée conserve cache, bannière + bouton reconnexion
- Onglet "Vie scolaire" (panel-absences) — Absences + Sanctions, `switchVieScolaireTab()`
- Messages : onglets Brouillons + Archivés + Correspondances (renommé, avec 's')
- Badge PJ messages (reçus/envoyés) — utilise `class="pj-badge"` comme les correspondances
- Correspondances — carnet de correspondance élève (`eleveCarnetCorrespondance.awp`), badges PDF + signature
- `fetchCorrespondanceCount()` — fetch silencieux au chargement Messages → compte visible d'emblée sans cliquer sur l'onglet
- `_correspondancesCache` — partagé entre `fetchCorrespondanceCount` et `loadCorrespondance` (évite double fetch réseau)
- `_correspondancesCount` — variable JS persistante → `renderMessages()` restaure le label à chaque rechargement
- Contacts messagerie — `loadCorrespondance()` (onglet Correspondances dans `switchMsgTab`), `contactsCache`
- Composition message — `openNewMessageDialog(initialRecipient)`, contact picker, PJ drop zone
- `openMsgToContact()` — ouvre composition avec destinataire pré-rempli depuis Contacts
- EDT jours Congés — header (date) visible, body grisé avec overlay, `isCongeDay` dans `renderEdtGrid()`
- Onglet "Cours" — sous-onglets Séances / Espaces de travail, `switchCoursTab()`, `_coursActiveTab`
- Espaces de travail — liste, explorateur arborescence, nav breadcrumb, téléchargement fichiers
- `formatFrPhone()` / `normalizeFrPhone()` — formatage/normalisation N° FR pour le profil
- Profil : fallback accountData si `/v3/profil.awp` échoue, placeholder `••••••••` pour MDP
- Hover states sur avatar, `.profile-info`, onglets principaux, boutons période notes, date fields séances
- `forceRefresh` gère les deux sous-panels de l'onglet Cours (espaces : vide cache + recharge ; séances : invalidation IndexedDB)
