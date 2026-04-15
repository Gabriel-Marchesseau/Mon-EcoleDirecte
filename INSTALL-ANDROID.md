# Mon EcoleDirecte — Installation Android (Termux)

> Ce guide permet de faire tourner Mon EcoleDirecte en local sur une tablette ou un téléphone Android, sans PC.

---

## Ce dont vous avez besoin

- Une tablette ou un téléphone Android (Android 8 minimum)
- N'importe quel navigateur (Chrome, Firefox, Samsung Internet…)
- Une connexion Wi-Fi (pour le téléchargement initial)

---

## Étape 1 — Installer Termux

Termux est un terminal Linux pour Android qui permet de faire tourner Node.js.

**Option A — Via le Play Store** *(plus simple)*

Recherchez **Termux** sur le Play Store et installez-le.

> Note : la version Play Store date de 2020 mais fonctionne pour notre usage.

**Option B — Via F-Droid** *(recommandé si l'option A pose problème)*

F-Droid est un store alternatif qui propose la version à jour de Termux.

1. Ouvrez [f-droid.org](https://f-droid.org) dans votre navigateur et téléchargez l'APK F-Droid
2. Android va vous demander d'autoriser l'installation → acceptez
3. Installez F-Droid, ouvrez-le, puis cherchez **Termux** et installez-le

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

## Étape 5 — Démarrer l'application

Dans Termux (depuis le dossier `Mon-EcoleDirecte`) :

```bash
bash run.sh
```

Ouvrez ensuite votre navigateur et allez sur :

```
http://localhost:3131
```

> L'application utilise HTTP en local — c'est normal et sécurisé : toutes les communications avec EcoleDirecte restent chiffrées en HTTPS côté serveur.

---

## Utilisation quotidienne

Chaque fois que vous souhaitez utiliser Mon EcoleDirecte :

1. Ouvrez **Termux**
2. Tapez :
   ```bash
   cd Mon-EcoleDirecte && bash run.sh
   ```
3. Ouvrez votre navigateur → `http://localhost:3131`

Pour arrêter le proxy :
```bash
bash run.sh stop
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
