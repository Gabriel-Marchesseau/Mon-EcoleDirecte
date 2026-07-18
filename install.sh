#!/usr/bin/env bash
# ============================================================
#  Mon EcoleDirecte — Installation (Android / Termux)
#  Usage : bash install.sh
# ============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

# ── Couleurs ──────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}[OK]${RESET} $1"; }
err()  { echo -e "${RED}[ERREUR]${RESET} $1"; ERRORS+=("$1"); }
step() { echo -e "\n${CYAN}[..]${RESET} $1"; }
warn() { echo -e "${YELLOW}[AVERT]${RESET} $1"; }

ERRORS=()

echo ""
echo "  ====================================="
echo "   Mon EcoleDirecte — Installation"
echo "   Android / Termux"
echo "  ====================================="
echo ""

# ── 1. Fichiers requis ────────────────────────────────────
step "Vérification des fichiers requis..."
REQUIRED=("proxy.js" "ecoledirecte.html" "app.js" "style.css" "generate-cert.js")
MISSING=false
for f in "${REQUIRED[@]}"; do
  if [ -f "$DIR/$f" ]; then
    ok "$f présent"
  else
    err "$f MANQUANT"
    MISSING=true
  fi
done
if $MISSING; then
  echo ""
  echo -e "${RED}  Des fichiers requis sont manquants. Installation annulée.${RESET}"
  echo ""
  exit 1
fi

# ── 2. Node.js ────────────────────────────────────────────
step "Vérification de Node.js..."
if command -v node &>/dev/null; then
  NODE_VER=$(node --version)
  ok "Node.js $NODE_VER détecté"
else
  err "Node.js introuvable"
  echo ""
  echo -e "  ${YELLOW}Installez-le avec :${RESET}  pkg install nodejs"
  echo ""
  exit 1
fi

# ── 3. Dépendances npm ────────────────────────────────────
step "Installation des dépendances npm..."
if npm install 2>/dev/null; then
  ok "Dépendances installées (node-forge)"
else
  err "Échec de npm install"
fi

# ── 3b. Correction des vulnérabilités npm ─────────────────
step "Correction des vulnérabilités npm (audit fix)..."
if npm audit fix 2>/dev/null; then
  ok "Audit npm — corrections appliquées"
else
  warn "Certaines vulnérabilités n'ont pas pu être corrigées automatiquement (sans impact pour un usage local)"
fi

# ── 4. Certificats SSL ────────────────────────────────────
step "Vérification des certificats SSL..."
if [ -f "$DIR/cert.pem" ] && [ -f "$DIR/key.pem" ] && [ -f "$DIR/ca.pem" ]; then
  ok "Certificats déjà présents"
else
  echo "    Génération des certificats (quelques secondes)..."
  if node generate-cert.js; then
    if [ -f "$DIR/cert.pem" ] && [ -f "$DIR/key.pem" ] && [ -f "$DIR/ca.pem" ]; then
      ok "Certificats générés"
    else
      err "La génération des certificats a échoué"
    fi
  else
    err "Erreur lors de la génération des certificats"
  fi
fi

# ── 5. Raccourci écran d'accueil (Termux:Widget) ─────────
step "Création du raccourci écran d'accueil..."
SHORTCUTS_DIR="$HOME/.shortcuts"
mkdir -p "$SHORTCUTS_DIR"
# Pas d'espace dans le nom : le mécanisme des raccourcis dynamiques de
# Termux:Widget (~/.termux/widget/dynamic_shortcuts) invoque le script via
# `env "chemin"`, qui scinde un chemin contenant un espace en deux arguments
# ("Mon" / "EcoleDirecte.sh") et échoue avec "No such file or directory"
# (confirmé en test réel sur Mon-MELCloud). Le widget-liste classique n'a pas
# ce problème, mais on évite l'espace pour que les deux mécanismes fonctionnent.
#
# NON TESTÉ EN CONDITIONS RÉELLES sur ce projet (porté depuis Mon-MELCloud,
# à confirmer sur téléphone) : un script placé dans ~/.shortcuts/tasks/ (au
# lieu de ~/.shortcuts/ directement) est exécuté en arrière-plan par
# Termux:Widget via RunCommandService, sans jamais ouvrir de terminal/Activity
# Android - il n'apparaît donc pas dans l'écran multitâche, tout en gardant la
# notification Termux (avec bouton d'arrêt) comme avant.
SHORTCUTS_TASKS_DIR="$SHORTCUTS_DIR/tasks"
mkdir -p "$SHORTCUTS_TASKS_DIR"
SHORTCUT_FILE="$SHORTCUTS_TASKS_DIR/Mon-EcoleDirecte.sh"
OLD_SHORTCUT_FILE="$SHORTCUTS_DIR/Mon EcoleDirecte.sh"
OLD_ICON_FILE="$SHORTCUTS_DIR/icons/Mon EcoleDirecte.sh.png"
OLD_DYNAMIC_LINK="$HOME/.termux/widget/dynamic_shortcuts/Mon EcoleDirecte.sh"
if [ -f "$OLD_SHORTCUT_FILE" ]; then
  rm -f "$OLD_SHORTCUT_FILE" "$OLD_ICON_FILE" "$OLD_DYNAMIC_LINK"
  warn "Ancien raccourci \"Mon EcoleDirecte.sh\" (avec espace) supprimé"
fi
# Migration : ancien raccourci créé directement dans ~/.shortcuts/ (visible
# dans le multitâche Android) avant le passage à ~/.shortcuts/tasks/.
OLD_DIRECT_SHORTCUT_FILE="$SHORTCUTS_DIR/Mon-EcoleDirecte.sh"
OLD_DIRECT_ICON_FILE="$SHORTCUTS_DIR/icons/Mon-EcoleDirecte.sh.png"
OLD_DIRECT_DYNAMIC_LINK="$HOME/.termux/widget/dynamic_shortcuts/Mon-EcoleDirecte.sh"
if [ -f "$OLD_DIRECT_SHORTCUT_FILE" ]; then
  rm -f "$OLD_DIRECT_SHORTCUT_FILE" "$OLD_DIRECT_ICON_FILE" "$OLD_DIRECT_DYNAMIC_LINK"
  warn "Ancien raccourci ~/.shortcuts/Mon-EcoleDirecte.sh (visible dans le multitâche) supprimé"
fi
cat > "$SHORTCUT_FILE" << EOF
#!/data/data/com.termux/files/usr/bin/bash
# "#!/usr/bin/env bash" échoue quand ce script est lancé via Termux:Widget
# (raccourci dynamique / RUN_COMMAND) : le PATH complet de Termux n'est chargé
# que dans une session interactive, pas dans ce contexte, donc "env" ne trouve
# pas "bash" (erreur "No such file or directory", confirmé en test réel sur
# Mon-MELCloud) - d'où le chemin absolu ci-dessus.
cd "$DIR"

# Termux:Widget ouvre systématiquement une nouvelle session à chaque appui sur
# le raccourci, sans moyen de réutiliser une session déjà ouverte (pas d'API
# Termux pour ça). Si une session précédente est déjà en train d'attendre
# ci-dessous (proxy actif), on évite d'en empiler une deuxième en double : on
# se contente de rouvrir le navigateur sur l'appli déjà démarrée, puis on
# quitte tout de suite au lieu de rebloquer sur la boucle d'attente.
LOCK_FILE="\${TMPDIR:-/tmp}/med-shortcut-session.pid"
if [ -f "\$LOCK_FILE" ] && kill -0 "\$(cat "\$LOCK_FILE" 2>/dev/null)" 2>/dev/null; then
  command -v termux-open-url &>/dev/null && termux-open-url "http://localhost:3131" 2>/dev/null
  echo "Mon EcoleDirecte tourne déjà (session précédente) - navigateur rouvert."
  sleep 2
  exit 0
fi
echo \$\$ > "\$LOCK_FILE"
trap 'rm -f "\$LOCK_FILE"' EXIT

bash run.sh
termux-open-url "http://localhost:3131" 2>/dev/null || am start -a android.intent.action.VIEW -d "http://localhost:3131" 2>/dev/null

# Une fois "bash run.sh" terminé (le proxy tourne en arrière-plan via nohup),
# ce script se terminerait aussi et la session Termux ouverte par le widget
# avec lui - Android tue alors le proxy peu après, faute de session/fenêtre
# au premier plan pour le retenir (confirmé en test réel). On bloque donc ici
# tant que le proxy tourne, pour garder la session vivante.
PID_FILE="\${TMPDIR:-/tmp}/med-proxy.pid"
while kill -0 "\$(cat "\$PID_FILE" 2>/dev/null)" 2>/dev/null; do
  sleep 5
done
EOF
chmod +x "$SHORTCUT_FILE"
ok "Raccourci créé dans ~/.shortcuts/tasks/"

step "Création de l'icône du widget..."
ICONS_DIR="$SHORTCUTS_DIR/icons"
mkdir -p "$ICONS_DIR"
# Termux:Widget attend un fichier nommé "<nom-du-script>.png" (extension .sh
# conservée, ex. "Mon-EcoleDirecte.sh.png"), pas juste le nom du script sans extension.
ICON_FILE="$ICONS_DIR/$(basename "$SHORTCUT_FILE").png"
if [ -f "$DIR/logo.png" ]; then
  cp "$DIR/logo.png" "$ICON_FILE"
  ok "Icône copiée dans ~/.shortcuts/icons/"
else
  warn "logo.png introuvable, Termux:Widget utilisera son icône par défaut"
fi

step "Préparation du raccourci individuel (icône seule)..."
DYNAMIC_DIR="$HOME/.termux/widget/dynamic_shortcuts"
mkdir -p "$DYNAMIC_DIR"
ln -sf "$SHORTCUT_FILE" "$DYNAMIC_DIR/$(basename "$SHORTCUT_FILE")"
ok "Lien créé dans ~/.termux/widget/dynamic_shortcuts/"

echo ""
echo -e "  ${CYAN}Pour afficher l'icône sur l'écran d'accueil :${RESET}"
echo "  Le widget \"liste\" de Termux:Widget (celui qui affiche un titre + une"
echo "  liste de scripts) n'affiche jamais d'icône individuelle. Pour une icône"
echo "  seule sur l'écran d'accueil :"
echo "  1. Installez l'app \"Termux:Widget\" depuis F-Droid"
echo "  2. Ouvrez l'app Termux:Widget elle-même -> bouton \"CREATE SHORTCUTS\""
echo "  3. Appui long sur l'icône de l'app Termux:Widget (tiroir d'applications)"
echo "  4. Faites glisser le raccourci \"Mon-EcoleDirecte\" sur l'écran d'accueil"
echo ""

# ── Bilan ─────────────────────────────────────────────────
echo ""
echo "  ====================================="
if [ ${#ERRORS[@]} -eq 0 ]; then
  echo -e "  ${GREEN}Installation terminée avec succès !${RESET}"
  echo ""
  echo "  Pour démarrer l'application :"
  echo -e "  ${CYAN}bash run.sh${RESET}"
else
  echo -e "  ${RED}Installation terminée avec ${#ERRORS[@]} erreur(s) :${RESET}"
  for e in "${ERRORS[@]}"; do
    echo -e "    ${RED}- $e${RESET}"
  done
fi
echo "  ====================================="
echo ""
