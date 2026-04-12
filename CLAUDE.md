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
generate-cert.js            # Génère CA locale (ca.pem/ca-key.pem) + cert serveur signé (cert.pem/key.pem)
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
| Accueil | Post-its de l'établissement (`timelineAccueilCommun.awp`), colorés par type (info/alerte/urgence), date et auteur |
| Emploi du temps | Grille hebdomadaire, nav semaines, sélecteur de semaine via calendrier natif (`edtOpenCalendar`), jours fériés (algo Pâques), jours Congés grisés (body uniquement), dialog au clic, color-coded |
| Notes | Tableau trié par trimestre + graphique Chart.js (zones colorées, hachures, légende cliquable, courbe moyenne classe par note) |
| Devoirs | Liste groupée par date, toggle fait/non-fait (API PUT), badge PJ, détail + PJ téléchargeables, sélection visuelle persistante, filtre "Faits" + filtre "Interros", badge count dans l'onglet |
| Cours | Trois sous-onglets : **Contenus de séances** (plage de dates, J-14 → aujourd'hui, groupé par jour, filtre par matière) + **Espaces de travail** (liste + explorateur arborescence, lazy-load sous-dossiers, ouverture fichiers dans Collabora Online via WOPI) + **Manuels** (liste manuels numériques, ouverture CAS) |
| Messages | Reçus/envoyés/brouillons/archivés, PJ téléchargeables, marquage lu, décoding entités HTML natif, sélection persistante, filtre "Non lus" |
| Messages — Correspondances | Carnet de correspondance élève (lettres/docs reçus), badge PJ PDF, badge signature, `fetchCorrespondanceCount()` en arrière-plan dès le chargement Messages |
| Messages — Contacts | Liste contacts (Professeurs / Personnels / Autres), bouton "Écrire" → ouvre composition avec destinataire pré-rempli |
| Nouveau message | Dialog composition : éditeur enrichi (contenteditable), PJ drop zone, sélecteur destinataires (contact picker tabulé), modes Répondre / Transférer avec message cité |
| Vie scolaire | Cinq onglets : Absences (liste avec justificatifs) + Sanctions/Encouragements + QCM + Sondages + **Porte-monnaie** (soldes et historique des écritures) |
| Documents (parent) | Page autonome : liste par catégorie avec filtre, détail et téléchargement (`familledocuments.awp`) |
| Situation financière (parent) | Trois sous-onglets : **Factures** (compte standard : solde, avenir, historique hors factures) + **Porte-monnaie** (comptes portemonnaie/pmactivite avec sous-écritures) + **Mode de règlement** (mode, IBAN, titulaire) |
| Vie scolaire (parent) | Deux sous-onglets : **Dossier d'inscription** + **Sondages** |
| Mémos | Notes locales (IndexedDB), éditeur rich-text, date d'échéance, tri colonnes, filtres "Faits"/"Expirés", export/import CSV, résolution de conflits d'import |
| Onglet ··· | Appel API manuel libre |

Fonctionnalités transversales : dark mode, cache IndexedDB stale-while-revalidate (TTL 30 min), badges nouveautés, mode hors-ligne (session expirée → reconnexion silencieuse automatique ou cache conservé + bannière reconnexion), routeur SPA (URL par onglet), label fraîcheur, refresh forcé, arrêt proxy, double auth 2FA avec QCM et réponses automatiques configurables + sauvegarde auto des réponses manuelles, **paramètres page par défaut** (dialog engrenage, configurable par compte), **support compte parent** (5 onglets : Accueil, Messages, Documents, Situation financière, Vie scolaire), **sélecteur compte enfant** (vue élève depuis compte parent).

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
- **QCM** : `GET /v3/eleves/{id}/qcms/0/associations.awp?verbe=get` → liste des QCM à répondre
- **Sondages** : `GET /v3/edforms.awp?verbe=getlist` → liste des sondages
- **Manuels** : ouverts via endpoint CAS `/cas-redirect?url=...` (proxy suit la redirection authentifiée)
- **Accueil / post-its** : `POST /v3/E/{eleveId}/timelineAccueilCommun.awp?verbe=get` → `{ postits: [{type, contenu (base64), dateDebut, dateFin, auteur}] }`
- **Porte-monnaie (élève)** : `POST /v3/comptes/detail.awp?verbe=get&v=4.98.0` avec `data={eleveId}` → comptes portemonnaie de l'élève
- **Finances parent** : `POST /v3/comptes/detail.awp?verbe=get&v=4.98.0` avec `data={}` (sans eleveId) → tous les comptes famille `{ comptes: [{typeCompte, libelle, solde, accomptesEtCautions, avenir, ecritures}], parametrage }`
- **Mode de règlement parent** : `POST /v3/famillemodedereglement.awp?verbe=get&v=4.98.0` avec `data={}` → `{ demandeencours, modedereglement, iban, domiciliation, bic, tire }`
- **Documents famille** : `POST /v3/familledocuments.awp?archive=&verbe=get&v=4.98.0` → `{ administratifs, notes, factures, inscriptions, viescolaire, entreprises, listesPiecesAVerser }`
- **Messages parent** : `/v3/familles/{eleveId}/messages.awp` (lecture et envoi) à la place de `/v3/eleves/{eleveId}/messages.awp`
- **Marquage lu messages parent** : fetch du contenu avec `verbe=post` (marque comme lu simultanément) ; pas de requête `verbe=put` séparée contrairement au compte élève
- **Accueil parent** : `POST /v3/1/{accountId}/timelineAccueilCommun.awp?verbe=get&v=4.98.0` (vs `/v3/E/{eleveId}/...` pour l'élève)
- **Sous-dossiers espaces** : `POST /v3/cloud/W/{espaceId}.awp?verbe=get&idFolder={path}` → recharge uniquement le sous-dossier (chemin extrait de `folder.id` après `\W\{espaceId}`)

---

## Proxy (`proxy.js`)

- Détecte les réponses binaires via `content-type` ou path (`telechargement`, `/pj/`, `/wopi/`)
- Renvoie le GTK au client via header `X-Gtk-Value` après `initSession()`
- Fichiers statiques servis directement, `__VERSION__` remplacé par timestamp
- Endpoint `POST /shutdown` pour arrêter le serveur depuis l'UI
- Endpoint `GET /cas-redirect?url=...` — suit la redirection CAS authentifiée (headers X-Token, 2fa-token, X-Gtk transmis), gère les redirections HTML (`<meta refresh>`, `window.location`)
- Endpoint `GET /collabora-url` — fetche `libreoffice.ecoledirecte.com/hosting/discovery`, extrait l'URL `cool.html` et la renvoie en JSON (`{ viewUrl }`)
- Header `WOPI-Token` retransmis au client via `Access-Control-Expose-Headers` (nécessaire pour construire l'access_token Collabora)
- Routes SPA `/accueil`, `/documents-parent`, `/finances-parent`, `/vie-scolaire-parent` ajoutées (servent l'app HTML pour le routeur client)
- Page 404 personnalisée en français pour les chemins inconnus (hors `/v3/` et fichiers statiques)

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
let vieScolaireSection = 'absences'; // Section active (absences/sanctions/qcm/sondages)
let newMsgRecipients = [];     // Destinataires du message en cours { id, nom, type }
let newMsgAttachments = [];    // Pièces jointes du message en cours (File[])
let contactsCache = { teachers: null, staff: null, tutors: null }; // Cache contacts messagerie

// Onglet Cours (sous-onglets séances / espaces de travail / manuels)
let _coursActiveTab = 'seances';   // sous-onglet actif ('seances' | 'espaces' | 'manuels')
let _espacesCache = null;          // liste des espaces de travail (null = non chargé)
let _selectedEspaceId = null;      // ID de l'espace sélectionné dans la liste
let _espaceNavPath = [];           // pile de navigation dans l'arborescence [{libelle, children}, ...]
let _collaboraViewUrl = null;      // cache de l'URL cool.html (Collabora discovery)
let _seancesMatieresFilter = null; // Set des matières cochées (null = toutes)
let _seancesAllData = null;        // données séances brutes pour le filtre matière

// Onglet Mémos (stockage local, pas d'API)
let memosCache     = [];      // tableau en mémoire des mémos de l'élève actif
let selectedMemoId = null;   // UUID du mémo sélectionné
let memosFaitsOnly   = false; // filtre "Faits" actif
let memosExpiresOnly = false; // filtre "Expirés" actif
let memosSortBy  = 'dateCreation'; // 'titre' | 'dateEcheance' | 'dateCreation'
let memosSortDir = 'desc';         // 'asc' | 'desc'

// Routeur SPA
const ROUTE_TO_TAB = { '/accueil': 'accueil', '/edt': 'edt', '/notes': 'notes', '/devoirs': 'devoirs',
  '/seances': 'seances', '/messages': 'messages', '/vie-scolaire': 'absences',
  '/memos': 'memos', '/documents-parent': 'documents-parent', '/finances-parent': 'finances-parent',
  '/vie-scolaire-parent': 'viescolaire-parent' };
const TAB_TO_ROUTE = { 'accueil': '/accueil', ... , 'absences': '/vie-scolaire', 'memos': '/memos',
  'documents-parent': '/documents-parent', 'finances-parent': '/finances-parent', 'viescolaire-parent': '/vie-scolaire-parent' };

// Onglets courants et compte actif (initialisés dans onLoggedIn)
let _currentTabs = [];
let _currentAccountId = '';
let _settingsPendingDefault = 'accueil';
let _settingsOverlayEl = null;
let _childEleveView = null;        // null | { id, nom, prenom } — vue élève depuis compte parent

// Page Documents (parent)
let _vspDocsData = null;           // données brutes documents famille
let _selectedVspDocKey = null;     // clé du document sélectionné
let _vspDocFilter = null;          // null = toutes catégories | string = catégorie filtrée

// Page Situation financière (parent)
let _finActiveTab = 'situation';   // 'situation' | 'portemonnaie-parent' | 'modeReglement'
let _vspFinancesData = null;       // données comptes/detail.awp (partagé entre Factures et Porte-monnaie)

// Page Vie scolaire parent
let _vspActiveTab = 'dossier';     // 'dossier' | 'sondages'

// Nouveau message — modes
let _newMsgMode = null;            // null | 'reply' | 'forward'
let _newMsgForwardId = null;       // msgId pour le transfert
let _newMsgForwardFiles = [];      // fichiers à transférer
```

---

## Fonctions utilitaires clés (`app.js`)

```js
getProxy()                    // → window.location.origin
getEleveId()                  // → ID élève depuis accountData
getChildEleveId()             // → ID élève même depuis un compte parent (cherche dans profile.eleves[])
getCurrentAnnee()             // → année scolaire courante 'YYYY-YYYY'
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
switchVieScolaireTab(section)          // 'absences' | 'sanctions' | 'qcm' | 'sondages'
renderVieScolaireSection(data, section)
renderAbsences(data)
renderSanctions(data)

// Messages
switchMsgTab(tab)             // change l'onglet actif + charge Correspondances si besoin
fetchCorrespondanceCount()    // fetch silencieux en arrière-plan → peuple _correspondancesCache + met à jour le label
loadCorrespondance()          // affiche la liste Correspondances (utilise _correspondancesCache si peuplé, sinon fetch)
renderCorrespondanceList(resultEl) // render HTML depuis _correspondancesCache
openMsgToContact(id, nomEnc, type)     // ouvre composition avec destinataire pré-rempli
openNewMessageDialog({initialRecipient, mode, subject, quotedHtml, forwardId, forwardFiles}) // dialog composition — mode: null|'reply'|'forward'
openContactPicker()           // sélecteur destinataires (contact picker tabulé)
renderNewMsgChips()           // affiche les chips destinataires dans le dialog
renderAttachmentList()        // affiche la liste des PJ dans le dialog
replyMessage(msgId)           // ouvre composition en mode "Répondre" avec message cité
forwardMessage(msgId)         // ouvre composition en mode "Transférer" avec message cité
getMsgPayload(isDraft)        // payload envoi/brouillon pour comptes élève
getMsgPayloadParent(isDraft)  // payload envoi/brouillon pour comptes parent (/v3/familles/)

// Cours / Espaces de travail / Manuels
switchCoursTab(tab)           // 'seances' | 'espaces' | 'manuels' — bascule le sous-panel
loadEspacesTravail()          // charge la liste des espaces (utilise _espacesCache si peuplé)
renderEspacesList(espaces)    // render la liste des espaces
loadEspaceTravailContent(espaceId) // fetch arborescence + init _espaceNavPath
renderEspaceExplorer()        // render breadcrumb + contenu du nœud courant
navigateEspaceInto(childIdx)  // entre dans un sous-dossier
navigateEspaceTo(depth)       // remonte dans le breadcrumb
openEspaceFile(espaceIdEnc, fileIdEnc, filenameEnc) // ouvre dans Collabora Online (WOPI) via form POST _blank
_openCollaboraViewer(collaboraUrl, accessToken, idUser) // soumet le form POST vers _blank (iframe bloquée par X-Frame-Options)
loadManuels()                 // charge la liste des manuels numériques
renderManuels(manuels)        // render la liste des manuels
openManuel(urlEncoded)        // ouvre un manuel via /cas-redirect (CAS auth)

// Accueil
loadAccueil()                 // charge les post-its (`timelineAccueilCommun.awp`) depuis edCache
renderAccueil(data)           // render la liste de post-its
renderPostit(p)               // → HTML d'un post-it (type, contenu base64, dates, auteur)

// Paramètres
openSettingsDialog()          // dialog engrenage — sélection de l'onglet par défaut
settingsSelectTab(tabId)      // met à jour la sélection visuelle dans le dialog
saveSettingsDefault()         // persiste dans `localStorage` clé `ed_default_tab_{accountId}`

// Vie scolaire
loadPorteMonnaie()            // charge soldes + écritures (`comptes/detail.awp`) depuis edCache
renderPorteMonnaie(data)      // render les comptes avec solde coloré et historique

// Page Documents parent (autonome)
loadVspDocuments()            // charge la liste des documents famille (`familledocuments.awp`) depuis edCache
renderVspDocToolbar(data)     // render les boutons filtre par catégorie (only si > 1 catégorie peuplée)
toggleVspDocFilter(key)       // active/désactive le filtre par catégorie VSP_DOC_CATEGORIES
renderVspDocList(data)        // render les documents filtrés par `_vspDocFilter`
loadDossierInscription()      // charge le dossier d'inscription depuis edCache
loadVspSondages()             // charge les sondages parent (`edforms.awp`) depuis edCache
renderVspSondages(data)       // render la liste des sondages parent
loadVspFinances(tab)          // fetch `comptes/detail.awp` avec data={} (parent) → cache `finances-parent:{eleveId}`
renderVspSituationFinanciere(data) // render compte standard (solde, avenir, historique hors factures)
renderVspPorteMonnaie(data)   // render comptes portemonnaie/pmactivite avec sous-écritures détaillées
loadVspModeReglement()        // fetch `famillemodedereglement.awp` → cache `mode-reglement:{eleveId}`
renderVspModeReglement(data)  // render mode, IBAN, titulaire, domiciliation, BIC + bannière si demande en cours
_renderEcritureRow(e)         // → HTML d'une ligne d'écriture (libelle, date, montant coloré, bouton DL si idPieceJointe)

// Page Situation financière parent (sous-onglets)
switchFinancesTab(tab)        // 'situation' | 'portemonnaie-parent' | 'modeReglement'

// Page Vie scolaire parent (sous-onglets)
switchVspTab(tab)             // 'dossier' | 'sondages'

// Compte parent — vue enfant
_rebuildTabBar(tabs)          // reconstruit la barre d'onglets depuis un tableau { id, label }
switchChildAccountView(eleveId) // bascule vers la vue élève (ou null → retour compte parent)

// Espaces de travail
_getFolderPath(folder)        // extrait le chemin d'un dossier depuis `folder.id` (après `\W\{espaceId}`)
// navigateEspaceInto() est désormais async — lazy-load les enfants si `children` est vide

// Séances — filtre matière
_populateSeancesMatieresFilter()    // peuple le menu déroulant des matières
toggleSeancesMatiereMenu(e)         // ouvre/ferme le menu matières
toggleSeancesMatiereCheck(enc, checked) // coche/décoche une matière
setAllSeancesMatieresChecked(bool)  // tout cocher / tout décocher
_renderSeancesFiltered()            // re-render les séances selon le filtre actif
_updateSeancesMatiereBadge(total)   // met à jour le badge du bouton filtre

// EDT
edtOpenCalendar(e)            // ouvre le date picker natif pour choisir la semaine EDT

// Devoirs
updateDevoirsTabCount()       // met à jour le badge numérique de l'onglet Devoirs
toggleDevoirsInterro(btn)     // filtre "Interros seulement" (toggle)

// Messages
toggleMsgUnread(btn)          // filtre "Non lus seulement" (toggle)

// Vie scolaire — QCM / Sondages
loadQcm()                     // charge la liste des QCM depuis l'API
loadSondages()                // charge la liste des sondages depuis l'API
renderQcm(data)               // render les QCM
renderSondages(data)          // render les sondages

// Profil
formatFrPhone(raw)            // formate un N° FR → (+33) 6 12 34 56 78
normalizeFrPhone(display)     // normalise pour l'API → +33XXXXXXXXX

// Reconnexion silencieuse
silentReauth(savedSession)           // tente re-login avec identifiants sauvegardés (u/p)
silentDoubleAuth(twoFaToken, saved)  // résout automatiquement le 2FA via règles SEC_KEY
maybeAutoSaveSecRule(question, label) // mémorise la réponse 2FA après clic manuel

// Mémos (stockage local IndexedDB, aucun appel API EcoleDirecte)
loadMemos()                   // charge depuis IndexedDB → memosCache
saveMemos()                   // persiste memosCache → IndexedDB
renderMemosFromCache()        // render la liste avec tri/filtres actifs
applyMemoSelection()          // applique la sélection visuelle (selectedMemoId)
openMemoDetail(idEnc)         // affiche le détail dans #memo-detail-panel
openNewMemoDialog()           // dialog création mémo (rich-text editor)
openEditMemoDialog(idEnc)     // dialog édition mémo existant
saveMemoFromDialog(existingIdEnc) // crée ou met à jour selon existingIdEnc
toggleMemoFait(idEnc)         // toggle fait/non-fait + save
deleteMemo(idEnc)             // supprime avec confirm + save
toggleMemosFaits(btn)         // filtre "Faits" (mémos non faits)
toggleMemosExpires(btn)       // filtre "Expirés" (dateEcheance < today)
sortMemosBy(col)              // tri colonnes titre/dateEcheance/dateCreation
exportMemosCsv()              // export CSV UTF-8 BOM (colonne contenu_html — HTML préservé)
importMemosCsv(input)         // import CSV avec résolution de conflits (supporte contenu_html)
_parseCsvLine(line)           // parser CSV minimal (guillemets doublés)
_processMemoImportQueue(list, i) // traite les conflits un par un (récursif async)
_showMemoConflictDialog(imp, existing, callback) // dialog 3 boutons (Ignorer/Mettre à jour/Ajouter comme nouveau)

// Éditeur rich-text (mémos et nouveau message)
_syncRteToolbar(toolbarId)    // synchronise l'état visuel des boutons de la toolbar RTE (bold/italic/underline/fontSize actifs)

// Notes — boutons période dynamiques
buildNotesPeriodButtons()     // construit les boutons depuis notesData.periodes (remplace les boutons statiques HTML, s'adapte trimestres/semestres)
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
qcm:{eleveId}
sondages:{eleveId}
correspondances:{eleveId}
espaces:{eleveId}
espace-content:{espaceId}
manuels:{eleveId}
contacts:{tab}:{eleveId}      ← tab = teachers | staff | tutors
memos:{eleveId}               ← mémos locaux (pas d'API EcoleDirecte, stockage pur IndexedDB)
accueil:{eleveId}             ← post-its de l'établissement
portemonnaie:{eleveId}        ← soldes et écritures porte-monnaie
documents-parent:{eleveId}    ← documents famille (page Documents parent)
sondages-parent:{eleveId}     ← sondages parent (page Vie scolaire parent)
dossier-inscription:{eleveId} ← dossier d'inscription (page Vie scolaire parent)
finances-parent:{eleveId}     ← comptes/detail.awp data={} — partagé entre Situation financière et Porte-monnaie
mode-reglement:{eleveId}      ← famillemodedereglement.awp — Mode de règlement parent
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

### Marquage lu messages — compte parent
Pour un compte élève, le marquage lu utilise une requête séparée `verbe=put` sur `/v3/eleves/{id}/messages/{msgId}.awp`. Pour un compte parent (`/v3/familles/`), cette requête n'a pas d'effet : c'est le fetch du contenu avec `verbe=post` qui marque simultanément le message comme lu.  
Fix : `openMessageDialog()` n'envoie le `verbe=put` que si `typeCompte === 'E'` ; le fetch du contenu utilise `verbe=post` (au lieu de `verbe=get`) pour les comptes parent.

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

### EDT — sélecteur semaine via calendrier
- Bouton `.edt-week-label-btn` avec `#edt-week-label` affichant la semaine courante
- `edtOpenCalendar(e)` : ouvre `#edt-date-picker` (input date caché), calcule le lundi de la semaine choisie et met à jour `edtWeekOffset`

### Séances — date range picker
HTML dans `ecoledirecte.html` : classes `.seances-date-range`, `.seances-date-field`  
`onclick` sur le wrapper → `showPicker()` avec fallback `.click()`  
Dark mode : `color-scheme: dark` + `filter: invert(1)` sur l'icône calendrier

### Séances — filtre matière
- Menu déroulant `#seances-matiere-menu` (position absolute, z-index:100) avec cases à cocher par matière
- Boutons "Tout" / "Aucun" pour sélection rapide
- Badge `#seances-matiere-badge` sur le bouton filtre quand un sous-ensemble est sélectionné
- `_seancesMatieresFilter = null` → toutes les matières affichées ; `Set<string>` → filtre actif

### Espaces de travail — explorateur
- Layout `.espaces-layout` (flex row) : `#espaces-list` (liste gauche, 200px) + `#espaces-detail` (contenu droit)
- Arborescence : `_espaceNavPath` est une pile de nœuds ; `renderEspaceExplorer()` affiche toujours le dernier
- Dossiers détectés via `Array.isArray(c.children)`, fichiers sinon
- Breadcrumb cliquable via `navigateEspaceTo(depth)` → tronque la pile
- Icône breadcrumb racine : SVG maison (remplace l'emoji `⌂`)
- Fichiers ouverts via `openEspaceFile()` → Collabora Online (WOPI) ; `_openCollaboraViewer()` fait un form POST vers `_blank` car `libreoffice.ecoledirecte.com` bloque l'iframe

### Profil — dialog Compte/Sécurité
- `openProfile()` charge `/v3/profil.awp` ; fallback sur `accountData` si le fetch échoue
- Téléphone : affiché en `formatFrPhone()`, renvoyé en `normalizeFrPhone()` (format E.164 `+33…`)
- MDP : placeholder `••••••••` géré par `data-pfPlaceholder` → ignoré à la sauvegarde si non modifié
- Validation inline : `pfValidateField(id)` / `pfShowError(id, msg)` / `pfCheckDirty()` — bouton Valider activé uniquement si champs modifiés et sans erreur
- Question secrète "Autre" : affiche le champ `#pf-question-custom-wrap` dynamiquement via `onchange`
- Layout stable : hauteur du wrapper fixée au maximum des deux sections pour éviter le saut au changement d'onglet
- Boutons Annuler/Valider communs en bas (hors des sections), `#pf-save-btn` détecte l'onglet actif

### Accueil — post-its
- Classes CSS : `.postits-list`, `.postit-card`, `.postit-card.type-{info|alerte|urgence}`, `.postit-meta`, `.postit-type`, `.postit-content`, `.postit-author`
- Couleurs de bordure gauche : info → `#1d4ed8`, alerte → `#ca8a04`, urgence → `#dc2626`
- Contenu décodé en base64 (`b64d()`) — peut contenir du HTML riche

### Paramètres — dialog page par défaut
- Bouton engrenage (SVG) dans le header, déclenche `openSettingsDialog()`
- Sélection mémorisée dans `localStorage` clé `ed_default_tab_{_currentAccountId}`
- Boutons de sélection avec état actif (fond `#1d4ed8`, texte blanc)
- `_settingsOverlayEl` — référence globale vers l'overlay (pour fermeture depuis inline onclick)

### Mode hors-ligne / session expirée
- `sessionExpired = true` quand le token est révoqué
- Avant d'entrer en mode hors-ligne, `silentReauth(savedSession)` tente un re-login automatique (identifiants sauvegardés dans `localStorage`)
- Si le re-login réussit (y compris avec double auth automatique via règles 2FA), la session reprend sans interruption
- Si la reconnexion échoue : bannière `#offline-banner` avec bouton "Se reconnecter" → `logout()`
- Le cache IndexedDB est conservé — navigation dans les données en cache possible sans token
- `maybeAutoSaveSecRule(question, label)` — sauvegarde automatiquement la réponse 2FA après un clic manuel (si pas déjà couverte par une règle existante)

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
- Onglet "Vie scolaire" (panel-absences) — Absences + Sanctions + QCM + Sondages, `switchVieScolaireTab()`
- `loadQcm()` / `renderQcm()` — liste des QCM élève
- `loadSondages()` / `renderSondages()` — liste des sondages
- Messages : onglets Brouillons + Archivés + Correspondances (renommé, avec 's')
- Badge PJ messages (reçus/envoyés) — utilise `class="pj-badge"` comme les correspondances
- `toggleMsgUnread(btn)` — filtre "Non lus" dans la liste messages
- Correspondances — carnet de correspondance élève (`eleveCarnetCorrespondance.awp`), badges PDF + signature
- `fetchCorrespondanceCount()` — fetch silencieux au chargement Messages → compte visible d'emblée sans cliquer sur l'onglet
- `_correspondancesCache` — partagé entre `fetchCorrespondanceCount` et `loadCorrespondance` (évite double fetch réseau)
- `_correspondancesCount` — variable JS persistante → `renderMessages()` restaure le label à chaque rechargement
- Contacts messagerie — `loadCorrespondance()` (onglet Correspondances dans `switchMsgTab`), `contactsCache`
- Composition message — `openNewMessageDialog(initialRecipient)`, contact picker, PJ drop zone
- `openMsgToContact()` — ouvre composition avec destinataire pré-rempli depuis Contacts
- EDT jours Congés — header (date) visible, body grisé avec overlay, `isCongeDay` dans `renderEdtGrid()`
- EDT sélecteur de semaine — `edtOpenCalendar(e)` + `.edt-week-label-btn` + `#edt-date-picker`
- Onglet "Cours" — trois sous-onglets Séances / Espaces de travail / Manuels, `switchCoursTab()`, `_coursActiveTab`
- Séances — filtre par matière : `_populateSeancesMatieresFilter()`, `toggleSeancesMatiereMenu()`, `_renderSeancesFiltered()`
- Espaces de travail — liste, explorateur arborescence, nav breadcrumb, ouverture fichiers dans Collabora Online (WOPI) via `openEspaceFile()` + `_openCollaboraViewer()` (form POST `_blank`)
- Manuels — `loadManuels()` / `renderManuels()` + `openManuel()` via `/cas-redirect` proxy
- Proxy `/cas-redirect` — ouvre les URLs CAS authentifiées (X-Token + cookies de session)
- `formatFrPhone()` / `normalizeFrPhone()` — formatage/normalisation N° FR pour le profil
- Profil : fallback accountData si `/v3/profil.awp` échoue, placeholder `••••••••` pour MDP
- Profil : validation inline (pfValidateField/pfShowError/pfCheckDirty), question "Autre" avec champ libre, layout stable
- `updateDevoirsTabCount()` — badge count dans l'onglet Devoirs
- `toggleDevoirsInterro(btn)` — filtre "Interros seulement"
- Hover states sur avatar, `.profile-info`, onglets principaux, boutons période notes, date fields séances
- `forceRefresh` gère les trois sous-panels de l'onglet Cours (espaces : vide cache + recharge ; séances : invalidation IndexedDB ; manuels : rechargement)
- `.tab::before` avec `data-label` — empêche le saut de largeur lors du bold de l'onglet actif (CSS `height:0; overflow:hidden`)
- Reconnexion silencieuse — `silentReauth()` / `silentDoubleAuth()` / `silentSubmitDoubleAuth()` / `silentLoginWithFa()` relancent la session auto si token expiré
- `maybeAutoSaveSecRule()` — sauvegarde auto de la réponse 2FA après clic manuel (évite de re-répondre manuellement)
- Session `localStorage` — sauvegarde désormais `u`, `p`, `twoFaToken` pour la reconnexion silencieuse
- Cache étendu — QCM, Sondages, Manuels, Espaces de travail, contenu espace, Correspondances, Contacts migrent vers `edCache.load()` (stale-while-revalidate)
- Contact picker — ne vide plus le cache à l'ouverture (suppression du `resetContactsCache()` dans `openContactPicker()`)
- `forceRefresh` — invalide proprement les nouvelles clés cache IndexedDB (qcm, sondages, espaces, espace-content, manuels, correspondances)
- Onglet "Mémos" — notes locales (`panel-memos`, route `/memos`), stockage IndexedDB pur (aucune API), éditeur contenteditable, date d'échéance, filtres Faits/Expirés, tri colonnes, export/import CSV avec résolution de conflits
- `buildNotesPeriodButtons()` — boutons période Notes construits dynamiquement depuis l'API (adapte le label trimestre/semestre, remplace les boutons statiques dans le HTML)
- `logout()` — vide aussi `notesData` et `notesPeriod` (+ efface `#notes-period-btns`) pour éviter les boutons fantômes après reconnexion + réinitialise l'URL à `/`
- Icône filtre SVG (entonnoir) ajoutée dans les toolbars Devoirs, Séances, Messages (cohérence visuelle)
- Onglet "Accueil" — post-its établissement (`timelineAccueilCommun.awp`), types info/alerte/urgence colorés, `loadAccueil()` / `renderAccueil()` / `renderPostit()`
- Porte-monnaie (sous-onglet Vie scolaire) — `loadPorteMonnaie()` / `renderPorteMonnaie()` : soldes et historique écritures via `comptes/detail.awp`
- Support compte parent — `onLoggedIn()` détecte `typeCompte === 'E'` (élève) vs parent et génère un jeu d'onglets différent (Accueil + Messages + Documents + Situation financière + Vie scolaire)
- Paramètres page par défaut — `openSettingsDialog()` (bouton engrenage en header) permet de choisir l'onglet d'accueil par compte (`ed_default_tab_{accountId}`)
- Startup : priorité URL > page par défaut configurée (l'ancienne clé `ed_last_tab` ignorée)
- Espaces de travail : `navigateEspaceInto()` est désormais async — lazy-load des sous-dossiers vides via `idFolder` param ; `_getFolderPath()` extrait le chemin depuis `folder.id`
- Proxy 404 — page d'erreur 404 personnalisée en français pour les chemins inconnus
- `replyMessage(msgId)` / `forwardMessage(msgId)` — Répondre / Transférer depuis le dialog message (mode reply/forward avec message cité)
- `openNewMessageDialog()` étendu — supporte `mode`, `subject`, `quotedHtml`, `forwardId`, `forwardFiles` ; titre et bouton adaptatifs
- `getMsgPayloadParent(isDraft)` — payload message pour comptes parent (`/v3/familles/`) avec structure `groupesDestinataires`
- Messages parent — endpoint `/v3/familles/{eleveId}/messages.awp` pour lecture et envoi ; `getMsgPayloadParent()` pour l'envoi
- `_syncRteToolbar(toolbarId)` — synchronise l'état visuel bold/italic/underline/fontSize dans les toolbars RTE (mémos + nouveau message)
- Toolbar RTE — bouton "liste à puces" avec icône SVG, état actif reflété pour tous les boutons, liste `ul/ol` stylée dans `[contenteditable]` et panels detail
- Mémos CSV — colonne renommée `contenu_html` (préserve le HTML rich-text à l'export/import)
- `renderVspDocToolbar()` / `toggleVspDocFilter()` — filtre catégories documents famille (`VSP_DOC_CATEGORIES`) avec badge signature en attente
- `getCurrentAnnee()` / `getChildEleveId()` — nouveaux utilitaires (année scolaire courante, ID élève depuis compte parent)
- `onLoggedIn()` — `#user-meta` affiche maintenant le type de compte + nom de l'établissement + classe
- Proxy SPA — `/accueil` ajouté aux `SPA_ROUTES` (manquait, causait un 404 en refresh direct)
- QCM — propositions triées alphabétiquement (numériques : ordre numérique ; texte : `localeCompare`)
- Profil — questions secrètes triées alphabétiquement dans le `<select>`
- Messages parent — marquage lu corrigé : le fetch du contenu utilise `verbe=post` (au lieu de `verbe=get`) pour les comptes parent ; le `verbe=put` séparé n'est envoyé que pour les comptes élève
- Situation financière — les écritures avec `idPieceJointe` (factures téléchargeables) sont filtrées de l'historique (accessibles depuis la page Documents)
- `generate-cert.js` — génère désormais une CA locale (`ca.pem`) + certificat serveur signé par la CA (supprime l'avertissement navigateur si CA installée dans Windows)
- `install.ps1` — vérifie les droits admin au démarrage, installe `ca.pem` dans le magasin de confiance Windows (`Cert:\LocalMachine\Root`)
- `_rebuildTabBar(tabs)` — centralise la création des onglets (utilisé par `onLoggedIn` et `switchChildAccountView`)
- `switchChildAccountView(eleveId)` — bascule entre vue parent (5 onglets) et vue élève associé (EDT, Notes, Devoirs, Vie scolaire, Messages)
- Sélecteur compte enfant — `#child-account-bar` avec `#child-account-selector` (compte parent uniquement) ; classe `.child-account-select` dans style.css
- Réorganisation pages compte parent : **Documents** (page autonome, `/documents-parent`) + **Situation financière** (page autonome `/finances-parent` avec sous-onglets Factures/Porte-monnaie/Mode de règlement) + **Vie scolaire** réduit à Dossier d'inscription + Sondages
- `switchFinancesTab(tab)` — gère les sous-onglets de la page Situation financière
- `_finActiveTab` — onglet actif de la page finances (défaut `'situation'`)
- Dark mode — `body.dark .child-account-select` + `body.dark .postit-content [style*="background"]` transparent
