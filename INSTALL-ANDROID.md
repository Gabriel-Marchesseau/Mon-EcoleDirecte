# Mon EcoleDirecte — Installation Android (Termux)

> Ce guide permet de faire tourner Mon EcoleDirecte en local sur une tablette ou un téléphone Android, sans PC.

---

## Ce dont vous avez besoin

- Une tablette ou un téléphone Android (Android 8 minimum)
- **Firefox pour Android** (à installer depuis le Play Store si ce n'est pas déjà fait)
- Une connexion Wi-Fi (pour le téléchargement initial)

---

## Étape 1 — Installer Termux

Termux est un terminal Linux pour Android qui permet de faire tourner Node.js.

**Option A — Via le Play Store** *(plus simple)*

Recherchez **Termux** sur le Play Store et installez-le.

> Note : la version Play Store date de 2020 mais fonctionne pour notre usage.

**Option B — Via F-Droid** *(recommandé si l'option A pose problème)*

F-Droid est un store alternatif qui propose la version à jour de Termux.

1. Ouvrez [f-droid.org](https://f-droid.org) dans Firefox et téléchargez l'APK F-Droid
2. Android va vous demander d'autoriser l'installation depuis Firefox → acceptez
3. Installez F-Droid, ouvrez-le, puis cherchez **Termux** et installez-le

---

## Étape 2 — Préparer Termux

Ouvrez Termux et tapez ces commandes une par une :

```bash
pkg update
```
*(Répondez `y` si on vous demande de confirmer)*

```bash
pkg install nodejs git
```

Vérifiez que Node.js est bien installé :

```bash
node --version
```
Vous devriez voir quelque chose comme `v22.x.x`.

---

## Étape 3 — Télécharger l'application

```bash
git clone https://github.com/Gabriel-Marchesseau/Mon-EcoleDirecte.git
cd Mon-EcoleDirecte
```

---

## Étape 4 — Installer l'application

Autorisez d'abord Termux à accéder au stockage (nécessaire pour copier le certificat) :

```bash
termux-setup-storage
```

Android va vous demander une permission — acceptez.

Puis lancez l'installeur :

```bash
bash install.sh
```

L'installeur va :
- Vérifier les fichiers nécessaires
- Installer les dépendances Node.js
- Générer les certificats HTTPS
- Copier le certificat CA dans votre dossier Téléchargements

---

## Étape 5 — Installer le certificat de sécurité

Pour que Firefox accepte le HTTPS local, il faut installer une fois le certificat CA généré par l'application.

Le fichier `mon-ecoledirecte-ca.pem` a été copié dans votre dossier **Téléchargements**.

### Android 13 / 14

1. Ouvrez **Paramètres**
2. Allez dans **Sécurité et confidentialité** → **Plus de paramètres de sécurité**
3. Appuyez sur **Chiffrement et identifiants** → **Installer un certificat**
4. Choisissez **Certificat CA**
5. Android vous avertit que cette action est risquée → appuyez sur **Installer quand même**
6. Naviguez jusqu'à **Téléchargements** et sélectionnez `mon-ecoledirecte-ca.pem`

### Android 11 / 12

1. Ouvrez **Paramètres**
2. Allez dans **Sécurité** → **Paramètres de sécurité avancés**
3. Appuyez sur **Installer depuis la carte SD** (ou "Installer depuis le stockage")
4. Sélectionnez **Certificat CA**
5. Naviguez jusqu'à **Téléchargements** et sélectionnez `mon-ecoledirecte-ca.pem`

> **Pourquoi Firefox et pas Chrome ?**
> Chrome Android refuse les certificats CA installés par l'utilisateur — Firefox les accepte. Utilisez Firefox uniquement pour accéder à Mon EcoleDirecte.

---

## Étape 6 — Démarrer l'application

Dans Termux (depuis le dossier `Mon-EcoleDirecte`) :

```bash
bash run.sh
```

Ouvrez ensuite **Firefox** et allez sur :

```
https://localhost:3131
```

> Si Firefox affiche un avertissement de sécurité malgré l'installation du certificat, vérifiez l'étape 5 et relancez Firefox.

---

## Utilisation quotidienne

Chaque fois que vous souhaitez utiliser Mon EcoleDirecte :

1. Ouvrez **Termux**
2. Tapez :
   ```bash
   cd Mon-EcoleDirecte && bash run.sh
   ```
3. Ouvrez **Firefox** → `https://localhost:3131`

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

**"Certificat non valide" dans Firefox**
→ Vérifiez que le certificat CA a bien été installé (étape 5) et redémarrez Firefox.

**npm install échoue**
```bash
pkg install python make
npm install
```

**Node.js introuvable**
```bash
pkg install nodejs
```
