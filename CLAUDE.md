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
package.json                # node-forge, nodemon
install.ps1                 # Script d'installation PowerShell (configure hosts + portproxy)
run.ps1                     # Script de lancement PowerShell
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
| Emploi du temps | Grille hebdomadaire, nav semaines, sélecteur de semaine via calendrier natif (`edtOpenCalendar`), jours fériés (algo Pâques), jours Congés grisés (body uniquement), dialog au clic, color-coded |
| Notes | Tableau trié par trimestre + graphique Chart.js (zones colorées, hachures, légende cliquable, courbe moyenne classe par note) |
| Devoirs | Liste groupée par date, toggle fait/non-fait (API PUT), badge PJ, détail + PJ téléchargeables, sélection visuelle persistante, filtre "Faits" + filtre "Interros", badge count dans l'onglet |
| Cours | Trois sous-onglets : **Contenus de séances** (plage de dates, J-14 → aujourd'hui, groupé par jour, filtre par matière) + **Espaces de travail** (liste + explorateur arborescence, lazy-load sous-dossiers, ouverture fichiers dans Collabora Online via WOPI) + **Manuels** (liste manuels numériques, ouverture CAS) |
| Messages | Reçus/envoyés/brouillons/archivés, PJ téléchargeables, marquage lu, décoding entités HTML natif, sélection persistante, filtre "Non lus" |
| Messages — Correspondances | Carnet de correspondance élève (lettres/docs reçus), badge PJ PDF, badge signature, `fetchCorrespondanceCount()` en arrière-plan dès le chargement Messages |
| Messages — Contacts | Liste contacts (Professeurs / Personnels / Autres), bouton "Écrire" → ouvre composition avec destinataire pré-rempli |
| Nouveau message | Dialog composition : éditeur enrichi (contenteditable), PJ drop zone, sélecteur destinataires (contact picker tabulé), modes Répondre / Transférer avec message cité |
| Vie scolaire | Cinq onglets : Absences (liste avec justificatifs, bouton Justifier + état "En attente" en vue enfant) + Sanctions/Encouragements + QCM + Sondages + **Porte-monnaie** (soldes et historique des écritures) |
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
Pour un compte élève, le marquage lu utilise une requête séparée `verbe=put`. Pour un compte parent (`/v3/familles/`), cette requête n'a pas d'effet : c'est le fetch du contenu avec `verbe=post` qui marque simultanément le message comme lu.  
Fix : `openMessageDialog()` n'envoie le `verbe=put` que si `_childEleveView || typeCompte === 'E'` (la vue enfant depuis un compte parent utilise l'endpoint élève et nécessite le PUT).

### Clé cache EDT — inclut l'eleveId
La clé cache EDT est `edt:{eleveId}:{YYYY-MM-DD}` (pas `edt:{YYYY-MM-DD}` sans eleveId) — sinon, basculer entre différents enfants sur compte parent retourne les données du premier enfant en cache.

### Jours Congés dans l'EDT (typeCours === 'CONGE')
Les cours CONGE ont des horaires 00:00 → 23:59 → `top` très négatif → débordaient hors du body.  
Fix : `isCongeDay` map dans `renderEdtGrid()`, cours CONGE exclus de `byDay`, remplacés par une overlay grise sur le body uniquement.

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

## Références détaillées

- @CLAUDE-api.md — API EcoleDirecte, endpoints, proxy, cache IndexedDB, téléchargements
- @CLAUDE-ui.md — Composants UI notables (EDT, espaces de travail, profil, messages…)
