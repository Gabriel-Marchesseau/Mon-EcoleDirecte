# CLAUDE.md — Mon EcoleDirecte

> Contexte projet pour Claude Code. À lire au démarrage de chaque session.

---

## Présentation

Client web **local** pour EcoleDirecte (plateforme scolaire française), initialement développé à titre personnel, devenu un projet open-source partagé sur GitHub — utilisable par tout élève ou parent ayant un compte EcoleDirecte. Tourne entièrement en local via un proxy HTTPS Node.js — aucune donnée ne transite par un tiers.

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
package.json                # node-forge, nodemon + "version" (numéro de version affiché dans l'UI)
bump-version.sh             # Incrémente le numéro de version — à lancer une fois par push
.githooks/pre-push          # Bloque le push sur main si la version n'a pas été bumpée
.gitattributes              # *.sh et .githooks/* en LF (core.autocrlf=true côté Windows)
install.sh / run.sh         # Installeur et lanceur Android/Termux (cf. section « Démarrage automatique sous Termux »)
install.ps1                 # Script d'installation PowerShell (configure hosts + portproxy)
run.ps1                     # Script de lancement PowerShell (cf. section « run.ps1 — détecter le proxy… »)
test/run-ps1.test.js        # Tests statiques de run.ps1 — `npm test` (node --test)
Installer_Mon_EcoleDirecte.bat
Lancer_Mon_EcoleDirecte.bat
CLAUDE.md                   # Ce fichier
CLAUDE-api.md               # API EcoleDirecte, proxy, cache IndexedDB, téléchargements
CLAUDE-ui.md                # Composants UI notables
```

---

## Fonctionnalités implémentées

| Onglet | État |
|--------|------|
| Accueil | Post-its de l'établissement (`timelineAccueilCommun.awp`), colorés par type (info/alerte/urgence), date et auteur |
| Emploi du temps | Grille hebdomadaire, nav semaines, sélecteur de semaine via calendrier natif (`edtOpenCalendar`), jours fériés (algo Pâques), jours Congés grisés (body uniquement), dialog au clic, color-coded, cours simultanés affichés côte à côte (`_layoutEdtDay`) |
| Notes | Tableau trié par trimestre + graphique Chart.js (zones colorées, hachures, légende cliquable, courbe moyenne classe par note) |
| Devoirs | Liste groupée par date, toggle fait/non-fait (API PUT), badge PJ, détail + PJ téléchargeables, sélection visuelle persistante, filtre "Faits" + filtre "Interros", badge count dans l'onglet |
| Cours | Trois sous-onglets : **Contenus de séances** (plage de dates, J-14 → aujourd'hui, groupé par jour, filtre par matière) + **Espaces de travail** (liste + explorateur arborescence, lazy-load sous-dossiers, ouverture fichiers dans Collabora Online via WOPI) + **Manuels** (liste manuels numériques, ouverture CAS) |
| Messages | Reçus/envoyés/brouillons/archivés, PJ téléchargeables, marquage lu, décoding entités HTML natif, sélection persistante, filtre "Non lus", bouton Archiver/Désarchiver dans le dialog (selon onglet actif) |
| Messages — Correspondances | Carnet de correspondance élève (lettres/docs reçus), badge PJ PDF, badge signature, `fetchCorrespondanceCount()` en arrière-plan dès le chargement Messages |
| Messages — Contacts | Liste contacts (Professeurs / Personnels / Autres), bouton "Écrire" → ouvre composition avec destinataire pré-rempli |
| Nouveau message | Dialog composition : éditeur enrichi (contenteditable), PJ drop zone, sélecteur destinataires (contact picker tabulé), modes Répondre / Transférer avec message cité |
| Vie scolaire | Six onglets : Absences (liste avec justificatifs, bouton Justifier + état "En attente" en vue enfant) + Sanctions/Encouragements + QCM + Sondages + **Porte-monnaie** (soldes et historique des écritures) + **Vie de classe** (`viedelaclasse.awp`, classeId via `getClasseIdForView()`) |
| Vie scolaire — Demandes absences | Sous-onglet visible uniquement en vue enfant (compte parent) : tableau des **autorisations de sortie** par jour/demi-journée (arrivée tardive, intercours, sortie anticipée) + liste des demandes passées + bouton "Nouvelle demande" (WIP, dialog formulaire) |
| Documents (parent) | Page autonome : liste par catégorie avec filtre, détail et téléchargement (`familledocuments.awp`) |
| Situation financière (parent) | Quatre sous-onglets : **Factures** (compte standard : solde, avenir, historique hors factures) + **Porte-monnaie** (comptes portemonnaie/pmactivite avec consommations en cours + sous-écritures) + **Mode de règlement** (mode, IBAN, titulaire) + **Paiements en ligne** (groupes de services/pm avec image, montant, détail base64) |
| Vie scolaire (parent) | Deux sous-onglets : **Dossier d'inscription** + **Sondages** |
| Mémos | Notes locales (IndexedDB), éditeur rich-text, date d'échéance, tri colonnes, filtres "Faits"/"Expirés", export/import CSV, résolution de conflits d'import |
| Onglet ··· | Appel API manuel libre |

Fonctionnalités transversales : dark mode, cache IndexedDB stale-while-revalidate (TTL 30 min), badges nouveautés, mode hors-ligne (session expirée → reconnexion silencieuse automatique ou cache conservé + bannière reconnexion), routeur SPA (URL par onglet), label fraîcheur, refresh forcé, arrêt proxy, double auth 2FA avec QCM et réponses automatiques configurables + sauvegarde auto des réponses manuelles, **paramètres page par défaut** (dialog engrenage, configurable par compte), **support compte parent** (5 onglets : Accueil, Messages, Documents, Situation financière, Vie scolaire), **sélecteur compte enfant** (vue élève depuis compte parent — EDT, notes, devoirs, absences/vie scolaire, messages pleinement fonctionnels ; vue persistée dans localStorage).

---

## Patterns JS critiques

```js
// ── Encoder des données dans un onclick inline ──────────────────────────
// TOUJOURS ajouter .replace(/'/g, '%27') — encodeURIComponent ne encode pas '
const encoded = encodeURIComponent(JSON.stringify({...})).replace(/'/g, '%27');
html += `<div onclick="maFonction('${encoded}')">`;
// Décodage côté récepteur
const data = JSON.parse(decodeURIComponent(encodedData));

// ── Décodage base64 UTF-8 (contenu EcoleDirecte) ───────────────────────
const texte = b64d(m.contenu);

// ── Décoder entités HTML (messages) ────────────────────────────────────
function decodeHtmlEntities(html) {
  const ta = document.createElement('textarea');
  ta.innerHTML = html; return ta.value;
}
// Toujours utiliser cette fonction — jamais de replace manuel
```

---

## CSS variables thème

```css
/* Light */  --bg --bg2 --bg3 --bg4 --text --text2 --text3 --text4 --border --border2 --input-bg
/* Dark */   body.dark { /* surcharge les mêmes variables */ }
```

- Toujours utiliser `var(--text2)` etc. — jamais de couleurs fixes pour les éléments adaptatifs
- Dark mode injecté dynamiquement via un `<style>` dans `app.js` (début du fichier)

---

## Bugs corrigés — à ne pas réintroduire

### Apostrophes dans les onclick inline
`encodeURIComponent` n'encode pas `'` → toujours `.replace(/'/g, '%27')` sur les données passées en attribut HTML.

### Type de fichier cahier de texte
`FICHIER_CDT` (pas `CLOUD_ELEVE`) pour les pièces jointes du cahier de texte.

### Marquage lu messages — compte parent
Pour un compte élève, le marquage lu utilise une requête séparée `verbe=put`. Pour un compte parent (`/v3/familles/`), cette requête n'a pas d'effet → `openMessageDialog()` n'envoie le `verbe=put` que si `_childEleveView || typeCompte === 'E'`.  
Le fetch du contenu utilise `verbe=get` pour **tous** les comptes (élève et parent). `_contentVerbe` est donc une constante `'get'` — pas de conditionnelle élève/parent.

### Clé cache EDT — inclut l'eleveId
La clé cache EDT est `edt:{eleveId}:{YYYY-MM-DD}` (pas `edt:{YYYY-MM-DD}` sans eleveId) — sinon, basculer entre différents enfants sur compte parent retourne les données du premier enfant en cache.

### Jours Congés dans l'EDT (typeCours === 'CONGE')
Les cours CONGE ont des horaires 00:00 → 23:59 → `top` très négatif → débordaient hors du body.  
Fix : `isCongeDay` map dans `renderEdtGrid()`, cours CONGE exclus de `byDay`, remplacés par une overlay grise sur le body uniquement.

### Cours simultanés superposés (EDT)
`.edt-event` est en `position:absolute;left:2px;right:2px` → deux cours au même créneau (ex. séance photo pendant le cours de Physique-Chimie) se recouvraient totalement, seul le dernier rendu était visible/cliquable.
Fix : `_layoutEdtDay()` répartit les cours chevauchants en colonnes (cf. CLAUDE-ui.md) et `renderEdtGrid()` pose `left`/`width` en % inline. Ne jamais revenir à un rendu pleine largeur systématique.

### Cours annulé chevauchant un cours remplaçant (EDT)
Quand un cours `isAnnule: true` se chevauche avec un cours non-annulé le même jour, le cours annulé est masqué de la grille (`byDay` filtré) et ses infos sont attachées au cours remplaçant via `_annulePar[]`. Le dialog du cours remplaçant affiche une section "Cours annulé" en rouge avec les détails du cours supprimé.

### Événements exceptionnels sans texte (typeCours === 'EVENEMENT')
Certains événements EcoleDirecte ont `text: " "` vide. Dans ce cas, `renderEdtGrid()` affiche `typeCours` comme libellé principal et la première ligne de `classe` comme sous-détail. Le dialog reçoit `classe` et l'affiche dans une ligne dédiée (🏫).

### Envoi de message — payload compte parent (code 550)
`getMsgPayloadParent()` ne doit pas inclure `idDossier`, `idClasseur`, `mtype` → EcoleDirecte retourne code 550.  
`transfertFiles: []` et `files: []` doivent toujours être présents dans le payload (même sans transfert).

### Envoi de message — désactivé en vue enfant
EcoleDirecte n'expose pas le bouton d'envoi quand un parent visualise un enfant. En vue enfant (`_childEleveView` actif) : bouton "Nouveau" masqué (`#msg-new-btn`), boutons Répondre/Transférer non rendus, `openNewMessageDialog()` retourne immédiatement.

### Proxy — HTTP 200 systématique ignorait les erreurs EcoleDirecte
Le proxy renvoyait toujours HTTP 200 pour les réponses JSON, même quand `data.code !== 200`. Fix : le proxy parse le body et utilise `data.code` comme HTTP status (si valeur dans [100-599]).

### Périodes notes — période annuelle (BILAN / A000)
EcoleDirecte renvoie parfois des périodes de synthèse (ex. `A000`, bilan annuel) dont le `codePeriode` n'apparaît dans aucune note individuelle.  
Fix : `isAnnee = !_notesCodes.has(periode.codePeriode)` — si la période n'est pas dans les notes réelles, on affiche toutes les notes sans filtre de période.  
`detectCurrentPeriod()` restreint aussi la sélection automatique aux seules périodes ayant des notes réelles (évite de pointer sur une période vide au chargement).  
`buildNotesPeriodButtons()` ne filtre plus `A000` — tous les boutons de période sont affichés.

### run.ps1 — détecter le proxy par une vraie connexion TCP (plus de `Get-NetTCPConnection`, même `-State Listen`)
**Historique.** `run.ps1` lisait d'abord `Get-NetTCPConnection -LocalPort 3131` sans filtre : après un arrêt, une connexion `TimeWait` résiduelle (`OwningProcess = 0`) passait pour un proxy actif, `run.ps1` sautait le démarrage et le navigateur s'ouvrait sur une page inaccessible. Le correctif d'alors ajoutait `-State Listen` (3 usages : détection, boucle d'attente, `-stop`).  
**Pourquoi ce n'était pas fiable.** Mesuré le 2026-11-01 sur ce PC (Windows 11, build 26300) : `Get-NetTCPConnection`, `netstat` et l'API .NET **oublient par moments un port en écoute** (17 fois sur 40 et 25 sur 40, port système 135 compris), alors que 40 connexions sur 40 réussissent et que le PID ne change pas ; `-State Listen` donne en plus des résultats différents entre Windows PowerShell 5.1 et PowerShell 7. Conséquences : `run.ps1` pouvait croire le proxy arrêté et en lancer un second, ne pas trouver le process à arrêter (`-stop`), ou conclure « met du temps à démarrer » alors qu'il tournait.  
**Ce que fait `run.ps1` depuis le 2026-11-05** (même principe que le Gestionnaire d'applications et Mon MELCloud) — plus aucune lecture de la liste des connexions (un commentaire du fichier explique pourquoi, `npm test` refuse son retour) :
- **Le proxy tourne-t-il ?** `Test-ServerUp` = vraie connexion `TcpClient.ConnectAsync("127.0.0.1", $PORT).Wait(1000)`. `127.0.0.1` parce que `proxy.js` fait `server.listen(PORT, '127.0.0.1', …)` (jamais sur toutes les interfaces ; `monecoledirecte.local` vient du fichier hosts, pas sondé). **TimeWait** : sans écouteur, le port refuse la connexion, donc le bug d'origine ne revient pas — prouvé par essai (`TimeWait` bien présent, arrêt brutal + relance immédiate ×3 sous PowerShell 7, `-stop` puis relance sous 5.1 et 7 : démarrage à chaque fois).
- **Est-ce bien notre proxy ?** `Test-OurServer` : `GET /md5?s=mon-ecoledirecte` doit rendre `{"hash":"1252ce60…"}` (md5 de la chaîne, calculé par `proxy.js`). Aucune route de `proxy.js` ne rend un identifiant ou une version (la version n'est que dans le HTML servi) ; `/md5` est la seule route déterministe sans session ni réseau, et elle existe depuis longtemps (`git log -S"'/md5'"` : commit `db8458f`), donc un proxy déjà lancé avec un code ancien répond aussi. **HTTPS à certificat auto-signé** : `Invoke-WebRequest` exige un certificat valide et son contournement diffère entre 5.1 (pas de `-SkipCertificateCheck`) et 7 ; `Invoke-ProxyRequest` ouvre donc une connexion TLS à la main (`SslStream`, rappel de validation qui accepte tout — la cible est toujours `127.0.0.1`, c'est la réponse de l'API qui reconnaît le proxy), même code sous les deux versions, timeouts de 3 s. Un autre programme sur le port (TCP muet, HTTP, HTTPS à autre réponse) : « port occupé par un autre programme », jamais arrêté, `-stop` ne le touche pas (muet : 3 s de plus pour conclure).
- **Quel process arrêter ?** `Get-CimInstance Win32_Process -Filter "Name='node.exe'"` filtré sur le chemin COMPLET de `proxy.js` dans la ligne de commande (`$SERVER_SCRIPT`) : d'autres projets ont aussi un `node proxy.js`, jamais à arrêter. Le proxy est donc lancé avec ce chemin complet. **Un proxy lancé à la main** (`node proxy.js`, `npm start` : chemin relatif) n'est pas retrouvé ainsi : `Stop-Proxy` repasse alors, s'il répond bien comme le proxy EcoleDirecte, par son propre `POST /shutdown` (essayé pour `-stop` et `-debug`, sous 5.1 et 7). Rien d'autre n'est jamais arrêté.
- **Mode debug (nodemon)** : `nodemon.cmd` lançait `node proxy.js` en chemin relatif, que le filtre ne retrouve pas ; `run.ps1` donne maintenant à nodemon le chemin complet (`… --watch ecoledirecte.html "<dossier>\proxy.js"`). Mesuré : `cmd.exe /k` → `node …\nodemon.js` (ligne de commande avec le chemin complet) → `node.exe <chemin complet>` (nodemon retire les guillemets). `--watch` marche toujours (modifier `style.css` ou `app.js` relance l'enfant, nouveau PID). `-stop` arrête nodemon puis son enfant (le parent d'abord, pour qu'il ne relance pas l'enfant) ; `-debug` sur un debug déjà lancé, ou sur un proxy normal, l'arrête avant de relancer. Reste, comme avant : la fenêtre `cmd /k` reste ouverte à l'invite après l'arrêt, et les fenêtres s'empilent à chaque `-debug`. Tuer l'enfant seul laisse nodemon vivant et sans enfant (il ne relance pas après un arrêt forcé) : c'est ce que faisait l'ancien `-stop` (il ne tuait que le propriétaire du port).
- **Démarrage** : `Start-Process -PassThru`, `$null = $server.Handle` (sinon `ExitCode` reste vide sous Windows PowerShell), attente bornée par une **horloge** (8 s ; 10 s en debug) et non par un nombre de tours : sur un port fermé `Test-ServerUp` dure jusqu'à 1 s à lui seul (délai de connexion de Windows), ce qui doublait l'attente (22 s mesurés avec un proxy planté en debug, 13 s ensuite). Plantage au démarrage en mode normal : « Le proxy s'est arrêté au démarrage (code 1) », vérifié sous 5.1 et 7 avec un `cert.pem` illisible (le message du proxy n'est pas visible, d'où « Relancez avec `-debug` ») ; en debug, la fenêtre `cmd /k` garde le message et le script avertit. `Node.js introuvable` est maintenant détecté avant le lancement (essayé sous 5.1 et 7 avec `node.exe` absent du `PATH` ; `-stop` reste utilisable). `-stop` attend 2 s avant de fermer sa fenêtre (double-clic sur le `.bat` : le message restait invisible).
- **Vérifié le 2026-11-05** (copie du dossier hors dépôt, port 3171, ouverture du navigateur neutralisée ; Windows PowerShell 5.1.26100 **et** PowerShell 7.6.9) : démarrage, déjà lancé, `-stop`, `-stop` sans proxy, relance juste après un arrêt, `-debug` (depuis rien, depuis un proxy normal, depuis un debug ; `--watch` ; arrêt de nodemon et de son enfant), programmes étrangers sur le port (3 types × normal/`-debug`/`-stop`), plantage au démarrage (normal et debug), proxy lancé à la main, lancement détaché sans fenêtre (`.bat` via `cmd /c` caché, puis `pwsh` caché : proxy démarré, aucune fenêtre visible, `Stop_Mon_EcoleDirecte.bat` et `--stop` arrêtent bien). **Non fait** : lancement du `run.ps1` du dossier réel sur le port 3131 (il aurait ouvert le navigateur de Martial sur `https://monecoledirecte.local`) ; seuls `$PORT` et la ligne d'ouverture du navigateur diffèrent entre la copie et le fichier du dépôt. Piège de test : `Start-Process -Wait` attend aussi les descendants, donc le proxy (le test ne rend jamais la main) ; lancer sans `-Wait` et sonder le port.
- **Tests** : `npm test` (`node --test`, `test/run-ps1.test.js`) — tests **statiques** : pas de `Get-NetTCPConnection` / `-State Listen` / `netstat` hors commentaires, chemin complet de `proxy.js` pour node et nodemon, `$PORT` identique à celui de `proxy.js`, écoute sur `127.0.0.1`, route `/md5` et `/shutdown` présentes, `$PROBE_HASH` = md5 de `$PROBE_INPUT`, en-tête d'usage en `-debug` / `-stop`, code en ASCII pur (Windows PowerShell 5.1 lit un fichier UTF-8 sans BOM comme de l'ANSI). 8 mutations (retour de `-State Listen`, nodemon relatif, hash faux, port ou adresse d'écoute modifiés dans `proxy.js`, `--debug` dans l'en-tête, accent dans une chaîne, filtre sans chemin complet) toutes détectées. Le comportement réel, lui, ne se teste qu'à la main (cf. ci-dessus).

### run.ps1 — lancement proxy caché via cmd.exe silencieusement en échec
Le mode normal lançait `cmd.exe /c cd /d ... && node proxy.js` avec `-WindowStyle Hidden`. Ce wrapper échoue silencieusement (le port ne s'ouvre jamais, aucune erreur) dès que `run.ps1` lui-même est lancé de façon détachée/sans fenêtre (cas réel d'un double-clic sur `Start_Mon_EcoleDirecte.bat`).  
Fix : lancement direct de `node.exe` (`Start-Process -FilePath "node.exe" -ArgumentList "`"$SERVER_SCRIPT`"" -WorkingDirectory $DIR -WindowStyle Hidden -PassThru`, `$SERVER_SCRIPT` = chemin complet de `proxy.js`), sans wrapper `cmd.exe`. Impact côté `proxy.js` : `/shutdown` ne fait `taskkill` sur le process parent qu'en mode `DEBUG` (nodemon) — en mode normal le process node **est** le serveur, `process.exit(0)` suffit (tuer un ancien PID parent recyclé aurait été dangereux). Revérifié le 2026-11-05 avec la nouvelle version : `.bat` lancé sans fenêtre, proxy démarré, aucune fenêtre visible.

### Vie scolaire — code 210 affiché comme une erreur alors que le module est juste vide
L'onglet Absences affichait `Erreur : Code 210` en rouge. Ni l'endpoint ni la version d'API n'étaient en cause : `POST /v3/eleves/{eleveId}/viescolaire.awp?verbe=get` avec `data={}` reste correct. **Le code 210 (`message: "Aucune donnée à afficher !"`) signifie simplement qu'il n'y a aucune donnée** — cas normal en début d'année scolaire, ou pour un élève sans absence ni sanction. `loadAbsences()` le traitait comme un échec via son `if (d.code !== 200) throw`.  
Fix : `loadAbsences()` intercepte `d.code === 210` et retourne `{ absencesRetards: [], sanctionsEncouragements: [] }` — `renderAbsences()` / `renderSanctions()` gèrent déjà le vide ("Aucune absence enregistrée."). `d.data` null retombe aussi sur cet objet vide.  
**Leçon de diagnostic** : toujours afficher `d.message` avec le code avant de conclure. Un code ≠ 200 n'est pas forcément une erreur chez EcoleDirecte. Les messages d'erreur incluent désormais `d.message`.  
À noter : `API_VERSION` a été alignée sur l'appli officielle (`4.98.0` → `4.101.3`) au passage, mais ce **n'était pas** la cause du 210.

### Sélecteur d'année des messages — codé en dur, cassait à chaque rentrée
Le `<select id="msg-annee">` listait des années scolaires codées en dur (`2025-2026`, `2024-2025`, `2023-2024`). Une fois l'établissement basculé sur `2026-2027`, cette année n'apparaissait dans aucune option → messages de l'année en cours inaccessibles.  
Fix : l'option par défaut envoie désormais `anneeMessages: ""` (chaîne vide) au lieu d'une année codée en dur — comme le fait déjà `anneeScolaire: ""` pour les notes, le serveur résout lui-même l'année active. Libellé affiché : **"Année en cours"** (comme l'appli officielle), généré par `populateMsgAnneeSelect()` (appelée dans `onLoggedIn()`), qui ajoute aussi les 3 années précédentes calculées dynamiquement depuis la date du jour (bascule estimée début juillet) — plus jamais codées en dur, donc plus de régression à chaque rentrée.

### Jeton invalide (HTTP 520/525) — "Token invalide !" affiché dans les onglets
Le jeton EcoleDirecte peut être invalidé à tout moment ; la vérification de démarrage (1,5 s, sautée si le cache a < 30 min) ne suffisait pas et ne relançait rien après la reconnexion.  
Fix : un wrapper de `window.fetch` (`app.js`, près de `silentReauth`) intercepte les statuts 520/525 des requêtes `/v3/` authentifiées (hors `login`/`connexion`), appelle `refreshSession()` (reconnexion silencieuse, **promesse partagée** → une seule reconnexion pour N requêtes concurrentes) puis rejoue la requête avec le nouveau `X-Token`. Nécessite `u`/`p` dans `ed_session` (sinon `enterExpiredMode()`). Ne pas contourner en gérant 520 onglet par onglet.

### Messages — texte noir en mode sombre
Certains messages portent `color:#000 !important` inline, que la feuille de style ne peut pas surcharger. `renderMessageContent()` retire `color`/`background` des styles inline après `innerHTML` ; la règle CSS de `#msg-dialog-content` vise `*` (pas seulement div/p/span).

---

## Démarrage automatique sous Termux (`install.sh`, `run.sh`, `proxy.js`)

But : sur Android (Termux, HTTP sur `localhost:3131` via `HTTP_MODE=1`), le proxy démarre tout seul à l'ouverture de Termux. Pièges communs à tous les projets Termux de Martial : `~/.claude/termux-android.md` (même famille de défauts que sur **Mon MELCloud**, corrigés en parallèle).

- **Chaîne de démarrage** : `install.sh` écrit `~/.termux/mon-ecoledirecte-boot.sh` (`termux-wake-lock`, puis `bash run.sh --no-open`) et un bloc balisé `# >>> mon-ecoledirecte >>>` … `# <<< mon-ecoledirecte <<<` dans `~/.bashrc`, supprimé puis réécrit à chaque installation (idempotent). Le bloc lance le script de démarrage en arrière-plan.
- **`bash install.sh --sans-chrome`** : n'ouvre pas Chrome à la fin et détache le serveur de la session (`setsid`, car Android tue les process d'une session SSH qui se ferme). C'est l'appel du bouton « Installer » du Gestionnaire d'applications (`D:\Documents\Martial\Gestionnaire-de-mes-applications`), par SSH. Le code de sortie est 1 s'il y a eu une erreur (`ERRORS`), 0 sinon. Sans l'option, comportement inchangé.
- **Bloc idempotent par shell** (`MED_BOOT_DONE`) : `$PREFIX/etc/profile` de Termux source déjà `~/.bashrc` pour un shell de connexion ; un `~/.bash_profile` qui le source aussi (créé par l'installeur de Mon MELCloud, présent sur le téléphone de Martial) le fait donc lire **deux fois par connexion**. Mesuré avec un `HOME` temporaire : 2 exécutions avec `.bash_profile`, 1 sans. L'ancien bloc lançait ainsi le script de démarrage deux fois en même temps, à chaque ouverture de Termux. Le bloc teste désormais une variable exportée (`if [ -z "${MED_BOOT_DONE:-}" ]; then export MED_BOOT_DONE=1; …`) et n'agit que dans un shell interactif (`case $- in *i*)`, comme celui de Mon MELCloud : un `source ~/.bashrc` depuis un script ou une commande SSH ne lance rien. Une 2ᵉ session Termux indépendante relance bien le script (sans effet si le proxy tourne). `install.sh` ne crée pas `~/.bash_profile`.
- **`run.sh --no-open`** (même nom que dans Mon MELCloud) : ne copie pas l'URL dans le presse-papier. Utilisée par le script de démarrage. Sans elle, chaque ouverture de Termux écrasait le presse-papier de l'utilisateur et `termux-clipboard-set` restait **bloqué** quand l'appli Termux:API ne répondait pas (constaté : deux processus `termux-api Clipboard` bloqués 40 et 48 min, chacun retenant un `run.sh` et son script de démarrage). Le lancement manuel garde la copie, mais sous `timeout 3` ; l'avertissement « Copie dans le presse-papier impossible » remplace alors « URL copiée ».
- **Démarrage sans course** : deux `run.sh` simultanés passaient tous deux le test « déjà lancé » ; le perdant échouait sur « port déjà utilisé » mais avait fait `rm -f` du fichier PID et du journal puis écrit son propre `$!` (process mort) → `bash run.sh stop` impuissant, journal du proxy vivant perdu. Désormais `run.sh` prend un **verrou `mkdir`** (`${TMPDIR:-/tmp}/med-proxy.pid.lock`, `flock` n'existe pas sous Termux), attend ~10 s au plus, ignore un verrou **périmé** (propriétaire mort, ou plus de 30 s) et le libère par `trap` (y compris sur SIGTERM) ; il re-vérifie « déjà lancé » **sous** le verrou, et ne remet le journal à zéro que sous verrou (le proxy y écrit en ajout `>>`). Si le verrou n'est pas obtenu en ~10 s, il continue sans lui : un double démarrage est alors sans gravité (cf. point suivant).
- **Fichier PID écrit par le proxy** : `run.sh` lance `node proxy.js` avec `MED_PID_FILE=$PID_FILE` ; `proxy.js` (`registerPidFile()`, appelée dans le callback de `listen`) y écrit `process.pid` (écriture atomique tmp + rename) **seulement une fois le port obtenu** : un perdant ne l'écrit jamais. À la sortie, il ne supprime le fichier que s'il contient encore son PID (gestionnaire `SIGTERM` → `process.exit(0)` pour que `kill` déclenche ce nettoyage ; `SIGHUP` volontairement non géré, `nohup` l'ignore). `run.sh` ne touche plus au fichier PID au démarrage et considère le proxy démarré quand le fichier contient le PID lancé (ou que `démarré` apparaît dans le journal). Sans `MED_PID_FILE` (Windows, `run.ps1`), le proxy n'écrit rien et ne démarre aucun minuteur.
- **Le proxy recrée son fichier PID s'il disparaît** (`registerPidFile()`, même fonction) : **constat mesuré le 2026-10-31 sur le téléphone de Martial** — après fermeture puis réouverture de la session Termux, `$TMPDIR` (où vit `med-proxy.pid`) a été vidé alors que le proxy tournait toujours : fichier absent, proxy vivant, donc plus d'arrêt par PID. Après sa 1ʳᵉ écriture réussie, le proxy démarre un `setInterval` de **30 s** (surchargeable par `MED_PID_CHECK_MS`, entier > 0 et ≤ 2 147 483 647 ; absente ou invalide → 30000 ; sert aux tests), en **`.unref()`** (il ne retient jamais le process en vie). À chaque tick il lit le fichier et **réécrit son PID** (même technique atomique tmp + rename, via un `writePid()` partagé avec la 1ʳᵉ écriture) seulement si le fichier est **absent** (`ENOENT`), **vide/non numérique/0**, ou contient le PID d'un process **mort** (`process.kill(pid, 0)` lève `ESRCH`). Il n'y touche **jamais** s'il contient son propre PID ou celui d'un **autre process vivant** (un autre proxy légitime ; `EPERM` compte comme vivant). Toute erreur (dossier absent, lecture ou écriture impossible) est ignorée silencieusement, le fichier tmp orphelin d'une écriture ratée est supprimé. Gestionnaire `SIGTERM` et suppression à la sortie (seulement si le fichier contient encore son PID) inchangés ; le perdant d'un « port déjà utilisé » n'appelle jamais `registerPidFile()`, donc ne touche jamais au fichier. **`run.sh stop` garde son repli `POST /shutdown`** : il reste nécessaire pour un proxy d'une version antérieure (sans minuteur) et pendant les 30 s au plus qui suivent la disparition du fichier.
- **PID absent ou périmé** : `run.sh` ne démarre pas un 2ᵉ proxy si quelque chose répond déjà sur le port (message « PID inconnu »), et `bash run.sh stop` demande alors l'arrêt via `POST /shutdown` (présent dans toutes les versions) — cas du téléphone de Martial avant correctif, où le fichier PID pointait vers un process mort alors que le proxy tournait sous un autre PID. `stop` attend aussi la fin réelle du process (3 s max, puis `kill -9`) pour qu'un redémarrage immédiat (`install.sh`) ne trouve pas le port encore pris.
- **`installation.html`** : `.ok` devient `.step .ok` — `.step p` (couleur `--text2`) battait `.ok` par spécificité, donc le « ✓ Application déjà installée » n'était pas vert (vérifié dans le navigateur : gris avant, `#16a34a` après).
- **Vérifié (2026-10-31, sur Windows + WSL Ubuntu, pas sur Termux)** : bloc `~/.bashrc` extrait d'`install.sh` (1 exécution contre 2 avec l'ancien bloc, 0 en non interactif) ; `run.sh` contre un faux « node » (python, mêmes contrats : port, `MED_PID_FILE`, `/shutdown`) en 5 manches de 2 puis de 3 lancements simultanés (proxy unique, fichier PID = PID vivant, `stop` l'arrête, 10/10) alors que l'ancien `run.sh` laissait 2 proxys vivants et un `stop` impuissant dans 1 manche sur 5 ; verrou périmé, PID absent/périmé, presse-papier bloqué ; `proxy.js` réel (copie sur le port 3150) : 2 proxys → le fichier garde le PID du gagnant, 2 mutations détectées. **Minuteur de recréation du fichier PID (2026-10-31, Windows, `proxy.js` copié sur le port 3150, `MED_PID_CHECK_MS=100`)** : fichier supprimé → de retour en 99 à 117 ms (5/5), y compris après suppression du dossier entier puis recréation ; PID d'un autre process vivant jamais écrasé (~15 ticks) ; PID mort, texte, vide, `0`, `-7`, PID géant → réécrits en 89 à 113 ms (7/7) ; `POST /shutdown` → sortie code 0 en 214 ms, fichier supprimé puis jamais recréé, fichier tenu par un autre process conservé ; perdant du port : code 1 (`EADDRINUSE`), fichier jamais modifié ; période par défaut mesurée à 30 040 ms ; `unref` prouvé (la fonction seule se termine en ~37 ms, bloquée sans `.unref()`) ; 7 mutations (retrait de la recréation, de la garde « process vivant », de la réécriture finale, du test `ESRCH`, du traitement du vide/non numérique, de `unref`, de la lecture de `MED_PID_CHECK_MS`) toutes détectées. **Pas encore confirmé sur le téléphone** : `SIGTERM` sous Linux (pas de `node` dans le WSL du PC), vidage réel de `$TMPDIR` par Termux avec le minuteur en place, `run.sh` avec le vrai `node`, comportement réel de `termux-clipboard-set`. Pas de suite de tests du proxy ni de l'UI dans ce dépôt (seul `npm test` existe, tests statiques de `run.ps1`) : simulations manuelles, non committées.

---

## Numéro de version (`package.json`, hook `pre-push`)

But : savoir en un coup d'œil quelle version tourne sur quel appareil (PC de dev, téléphones), l'appli étant installée en plusieurs exemplaires. Même dispositif que dans **Mon MELCloud**.

- **Format** : date du jour (`AAAA.MM.JJ`, ex. `2026.09.16`), suffixe `.2`/`.3`… si plusieurs push le même jour (`bump-version.sh`, logique `case` par **préfixe** — pas égalité stricte, qui casserait la transition `.2 → .3` en retombant sur la date nue). Une date dit immédiatement l'ancienneté d'une install, sans croiser avec l'historique git.
- **`PROJECT_VERSION`** (`proxy.js`) : lu une fois au démarrage depuis `package.json`, en try/catch — un `package.json` illisible dégrade en badge absent, jamais en proxy qui refuse de démarrer. Nom délibérément distinct d'`API_VERSION` (version de l'API EcoleDirecte, aucun rapport).
- **Transport vers l'UI** : placeholder `__APP_VERSION__` substitué par le proxy dans le HTML/JS servi, à côté du `__VERSION__` déjà utilisé pour le cache-busting — pas de nouvel endpoint ni de fetch supplémentaire. Substitué **avant** `__VERSION__` (les deux motifs ne se recouvrent pas, mais l'ordre reste le plus sûr).
- **Affichage** : cf. CLAUDE-ui.md, section « Badge de version ».
- **`bump-version.sh`** : à lancer **une seule fois par push, juste avant `git add`/`git commit`** (pas à chaque modification, sinon le suffixe `.N` grimpe plus vite que le nombre réel de push). Étape systématique de tout push sur ce repo — la règle vit ici, le fichier de commande global `/push` (partagé entre projets) n'est pas modifié.
- **Hook `pre-push` bloquant** : refuse le push si la version n'a pas changé depuis le dernier push sur `main`. Compare les DEUX blobs committés (`git show <sha>:package.json`), jamais le working tree — un bump non committé ne compte pas. Vérifie `remote_ref` (branche de **destination**, pas `local_ref` — sinon `push origin ma-branche:main` échapperait au contrôle), `continue` si `remote_sha`/`local_sha` est tout-zéro (nouvelle branche / suppression). Asymétrique volontairement : fail-closed si la **nouvelle** version est illisible, fail-open si c'est l'**ancienne**. Le stdin est capturé en haut (`REFS=$(cat)`) puis relu via heredoc, pas via un pipe : un pipe placerait la boucle dans un sous-shell où `exit 1` ne terminerait que ce sous-shell.
- **Activation** (une fois par clone) : `git config core.hooksPath .githooks` — déjà fait sur le PC de Martial.
- **`.gitattributes`** : `*.sh` et `.githooks/*` en `text eol=lf`. Avec `core.autocrlf=true` (actif ici), un `\r` finirait dans le shebang et casserait l'exécution sous WSL/Termux — `install.sh` était déjà dans ce cas, corrigé au passage. Le hook est committé en mode `100755` (`git update-index --chmod=+x`), sinon un clone frais récupérerait un hook inerte.
- **Vérifié** : transitions de `bump-version.sh` (date → date, `.2 → .3 → .4`) et 4 scénarios du hook testés dans un dépôt git jetable (sans bump → bloque, avec bump → passe, nouvelle branche → ignorée, branche ≠ main → ignorée). Badge non encore vu sur un écran réel : demande un redémarrage du proxy.

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

**Arrêter le proxy** (mode normal = fenêtre `Hidden`, invisible barre des tâches/Alt+Tab, pas de fenêtre à fermer manuellement) :
```powershell
PowerShell -ExecutionPolicy Bypass -File run.ps1 -stop
```
Ou double-clic sur `Stop_Mon_EcoleDirecte.bat` / `Start_Mon_EcoleDirecte.bat --stop`.

**Tests** : `npm test` (tests statiques de `run.ps1`, cf. section « run.ps1 — détecter le proxy… »).

---

## Références détaillées

- @CLAUDE-api.md — API EcoleDirecte, endpoints, proxy, cache IndexedDB, téléchargements
- @CLAUDE-ui.md — Composants UI notables (EDT, espaces de travail, profil, messages…)
