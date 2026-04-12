# CLAUDE-api.md — API, Proxy & Cache

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
- **Sous-dossiers espaces** : `POST /v3/cloud/W/{espaceId}.awp?verbe=get&idFolder={path}` → recharge uniquement le sous-dossier (chemin extrait de `folder.id` après `\W\{espaceId}`)
- **QCM** : `GET /v3/eleves/{id}/qcms/0/associations.awp?verbe=get` → liste des QCM à répondre
- **Sondages** : `GET /v3/edforms.awp?verbe=getlist` → liste des sondages
- **Manuels** : ouverts via endpoint CAS `/cas-redirect?url=...` (proxy suit la redirection authentifiée)
- **Accueil / post-its** : `POST /v3/E/{eleveId}/timelineAccueilCommun.awp?verbe=get` → `{ postits: [{type, contenu (base64), dateDebut, dateFin, auteur}] }`
- **Accueil parent** : `POST /v3/1/{accountId}/timelineAccueilCommun.awp?verbe=get&v=4.98.0` (vs `/v3/E/{eleveId}/...` pour l'élève)
- **Porte-monnaie (élève)** : `POST /v3/comptes/detail.awp?verbe=get&v=4.98.0` avec `data={eleveId}` → comptes portemonnaie de l'élève
- **Finances parent** : `POST /v3/comptes/detail.awp?verbe=get&v=4.98.0` avec `data={}` (sans eleveId) → tous les comptes famille `{ comptes: [{typeCompte, libelle, solde, accomptesEtCautions, avenir, ecritures}], parametrage }`
- **Mode de règlement parent** : `POST /v3/famillemodedereglement.awp?verbe=get&v=4.98.0` avec `data={}` → `{ demandeencours, modedereglement, iban, domiciliation, bic, tire }`
- **Paiements en ligne parent** : `POST /v3/boutique/paiementsenligne.awp?verbe=get&v=4.98.0` avec `data={}` → tableau de groupes `[{ libelle, paiements: [{id, idEleve, img, libelle, libellePanier, montant, montantModifiable, quantiteModifiable, typePaiement (pm|service), detail (base64), isPMPayable}] }]`
- **Soldes porte-monnaie (sans détail)** : `POST /v3/comptes/sansdetails.awp?verbe=get&v=4.98.0` avec `data={}` → `{ comptes: [{typeCompte, idEleve, solde, …}] }` — utilisé pour afficher le solde pm à côté des items de paiement
- **Documents famille** : `POST /v3/familledocuments.awp?archive=&verbe=get&v=4.98.0` → `{ administratifs, notes, factures, inscriptions, viescolaire, entreprises, listesPiecesAVerser }`
- **Messages parent** : `/v3/familles/{eleveId}/messages.awp` (lecture et envoi) à la place de `/v3/eleves/{eleveId}/messages.awp`
- **Marquage lu messages parent** : fetch du contenu avec `verbe=post` (marque comme lu simultanément) ; pas de requête `verbe=put` séparée contrairement au compte élève

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
paiements-enligne:{eleveId}   ← { paiements, soldesParEleve } — boutique/paiementsenligne.awp + comptes/sansdetails.awp
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
