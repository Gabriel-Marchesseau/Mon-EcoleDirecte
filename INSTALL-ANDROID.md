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

**Via F-Droid** *(recommandé — permet d'installer les deux apps)*

F-Droid est un store alternatif qui propose les versions à jour de Termux.

1. Ouvrez [f-droid.org](https://f-droid.org) dans votre navigateur et téléchargez l'APK F-Droid
2. Android va vous demander d'autoriser l'installation → acceptez
3. Installez F-Droid, ouvrez-le, puis installez **Termux** et **Termux:Widget**

**Via le Play Store** *(alternative si F-Droid pose problème)*

Recherchez **Termux** sur le Play Store et installez-le.

> Note : Termux:Widget n'est pas disponible sur le Play Store — l'icône sur l'écran d'accueil ne fonctionnera pas dans ce cas, mais l'application reste utilisable normalement.

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

L'installeur a déjà créé le script de lancement. Il reste à placer le widget :

1. Appuyez **longuement** sur l'écran d'accueil de votre téléphone
2. Choisissez **Widgets** → **Termux** → **Termux:Widget**
3. Placez le widget où vous voulez
4. L'icône **Mon EcoleDirecte** apparaît — appuyez dessus pour lancer l'application

---

## Étape 6 — Démarrer l'application

**Avec l'icône** *(après l'étape 5)* : appuyez simplement sur l'icône **Mon EcoleDirecte**.  
Le proxy démarre et le navigateur s'ouvre automatiquement sur l'application.

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
