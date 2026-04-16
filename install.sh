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
SHORTCUT_FILE="$SHORTCUTS_DIR/Mon EcoleDirecte.sh"
cat > "$SHORTCUT_FILE" << EOF
#!/usr/bin/env bash
cd "$DIR"
bash run.sh
sleep 3
am start -a android.intent.action.VIEW -d "http://localhost:3131" 2>/dev/null
EOF
chmod +x "$SHORTCUT_FILE"
ok "Raccourci créé dans ~/.shortcuts/"
echo ""
echo -e "  ${CYAN}Pour afficher l'icône sur votre écran d'accueil :${RESET}"
echo "  1. Installez l'app \"Termux:Widget\" depuis F-Droid"
echo "  2. Appuyez longuement sur l'écran d'accueil"
echo "     → Widgets → Termux → Termux:Widget"
echo "  3. Placez le widget — l'icône \"Mon EcoleDirecte\" apparaît"
echo "  → Un simple appui lance l'app et ouvre le navigateur"
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
