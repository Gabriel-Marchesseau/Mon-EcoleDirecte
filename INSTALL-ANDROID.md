# Mon EcoleDirecte — Installation Android (Termux)

> Ce guide permet de faire tourner Mon EcoleDirecte en local sur une tablette ou un téléphone Android, sans PC.

---

## Ce dont vous avez besoin

- Une tablette ou un téléphone Android (Android 8 minimum)
- N'importe quel navigateur (Chrome, Firefox, Samsung Internet…)
- Une connexion Wi-Fi (pour le téléchargement initial)

---

## Étape 1 — Installer Termux (et Termux:Widget)

Termux est un terminal Linux pour Android qui permet de faire tourner Node.js.  
Termux:Widget permet d'ajouter un icône de lancement sur l'écran d'accueil.  
Termux:API permet à Android de garder le proxy en vie quand Termux est en arrière-plan.

**Via F-Droid** *(recommandé — les trois apps sont disponibles)*

F-Droid est un store alternatif qui propose les versions à jour de Termux.

1. Ouvrez [f-droid.org](https://f-droid.org) dans votre navigateur et téléchargez l'APK F-Droid
2. Android va vous demander d'autoriser l'installation → acceptez
3. Installez F-Droid, ouvrez-le, puis installez **Termux**, **Termux:Widget** et **Termux:API**

**Via le Play Store** *(alternative si F-Droid pose problème)*

Recherchez **Termux** sur le Play Store et installez-le.

> Note : Termux:Widget et Termux:API ne sont pas disponibles sur le Play Store — l'icône sur l'écran d'accueil ne fonctionnera pas, mais l'application reste utilisable normalement.

---

## Étape 2 — Préparer Termux

Ouvrez Termux et tapez ces commandes une par une :

```bash
pkg update && pkg upgrade
```
*(Répondez `y` si on vous demande de confirmer les mises à jour)*

```bash
pkg install nodejs git
```

Vérifiez que Node.js est bien installé :

```bash
node --version
```
Vous devriez voir quelque chose comme `v25.x.x`.

---

## Étape 3 — Télécharger l'application

```bash
git clone https://github.com/Gabriel-Marchesseau/Mon-EcoleDirecte.git
cd Mon-EcoleDirecte
```

---

## Étape 4 — Installer l'application

```bash
bash install.sh
```

L'installeur va :
- Vérifier les fichiers nécessaires
- Installer les dépendances Node.js
- Générer les certificats (utilisés uniquement par le proxy côté serveur)

---

## Étape 5 — Ajouter l'icône sur l'écran d'accueil

> Cette étape nécessite Termux:Widget installé via F-Droid (étape 1).

L'installeur a déjà créé le raccourci. Pour obtenir une icône individuelle (et non le widget "liste" qui affiche un titre + une liste de scripts) :

1. Ouvrez l'app **Termux:Widget** elle-même → bouton **CREATE SHORTCUTS**
2. Appuyez **longuement** sur l'icône de l'app Termux:Widget (tiroir d'applications)
3. Faites glisser le raccourci **Mon-EcoleDirecte** sur l'écran d'accueil
4. L'icône **Mon EcoleDirecte** apparaît — appuyez dessus pour lancer l'application

---

## Étape 5 bis — Installer l'application dans Chrome *(optionnel, évite les onglets en double)*

Chaque appui sur le raccourci Termux ouvre sinon un nouvel onglet. En installant l'application comme PWA, elle s'ouvre dans sa propre fenêtre, réutilisée à chaque fois.

1. Démarrez l'application (étape 6) et ouvrez `http://localhost:3131` dans **Chrome**
2. Menu **⋮** → **Installer l'application** (ou **Ajouter à l'écran d'accueil**)
3. Une icône **Mon EcoleDirecte** apparaît dans le tiroir d'applications

Ensuite : le raccourci Termux démarre le proxy (et ouvre la PWA si Chrome capture le lien), puis vous pouvez rouvrir l'application depuis l'icône installée.

---

## Étape 5 ter — Démarrer le proxy automatiquement avec le téléphone *(optionnel)*

Le proxy peut démarrer tout seul avec le téléphone : l'icône installée à l'étape 5 bis fonctionne alors à tout moment, sans passer par le raccourci Termux. *(Termux:Boot n'étant pas installable sur tous les téléphones, on passe par une app d'automatisation, ici **MacroDroid** du Play Store.)*

1. Relancez l'installeur (`bash install.sh`) : il active `allow-external-apps = true` dans `~/.termux/termux.properties` et crée le script `~/.termux/mon-ecoledirecte-boot.sh`
2. Réglages Android → Apps → **MacroDroid** → Autorisations : accordez **Exécuter des commandes dans Termux**
3. Réglages Android → Apps → **Termux** et **MacroDroid** → Batterie → **Sans restriction** — sinon Android peut arrêter le proxy en arrière-plan
4. Dans MacroDroid, créez une macro :
   - **Déclencheur** : Démarrage du téléphone (*Device Boot*)
   - **Action** : Envoyer un intent
     - Cible : **Service**
     - Action : `com.termux.RUN_COMMAND`
     - Package : `com.termux`
     - Classe : `com.termux.app.RunCommandService`
     - Extra (chaîne) : `com.termux.RUN_COMMAND_PATH` = `/data/data/com.termux/files/home/.termux/mon-ecoledirecte-boot.sh`
     - Extra (booléen) : `com.termux.RUN_COMMAND_BACKGROUND` = `true`

Le script s'exécute après le premier déverrouillage du téléphone et laisse une notification Termux permanente (c'est ce qui garde le proxy en vie). Pour arrêter le proxy : `bash run.sh stop`.

---

## Étape 6 — Démarrer l'application

**Avec l'icône** *(après l'étape 5)* : appuyez simplement sur l'icône **Mon EcoleDirecte**.  
Le proxy démarre et le navigateur s'ouvre automatiquement sur l'application. Le raccourci s'exécute en arrière-plan (une notification Termux avec bouton d'arrêt reste affichée) sans ouvrir de terminal visible ni apparaître dans l'écran multitâche.

**Sans l'icône** : ouvrez Termux et tapez :
```bash
cd Mon-EcoleDirecte && bash run.sh
```
Puis ouvrez votre navigateur sur :
```
http://localhost:3131
```

> L'application utilise HTTP en local — c'est normal et sécurisé : toutes les communications avec EcoleDirecte restent chiffrées en HTTPS côté serveur.

---

## Utilisation quotidienne

Appuyez sur l'icône **Mon EcoleDirecte** sur votre écran d'accueil.  
Le navigateur s'ouvre directement sur l'application.

Pour arrêter le proxy (depuis Termux) :
```bash
cd Mon-EcoleDirecte && bash run.sh stop
```

---

## Mise à jour de l'application

```bash
cd Mon-EcoleDirecte
git pull
```

Aucune réinstallation nécessaire — redémarrez simplement le proxy.

---

## En cas de problème

**Le proxy ne démarre pas**
```bash
cat proxy.log
```
Le fichier `proxy.log` contient les détails de l'erreur.

**npm install échoue**
```bash
pkg install python make
npm install
```

**Node.js introuvable**
```bash
pkg install nodejs
```
