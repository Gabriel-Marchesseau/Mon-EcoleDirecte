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
  ok "Dépendances installées (node-forge, nodemon)"
else
  err "Échec de npm install"
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

# ── 5. Copie de ca.pem vers Downloads ─────────────────────
step "Copie du certificat CA vers le dossier Téléchargements..."
if [ -f "$DIR/ca.pem" ]; then
  if [ -d ~/storage/downloads ]; then
    cp "$DIR/ca.pem" ~/storage/downloads/mon-ecoledirecte-ca.pem
    ok "Certificat copié : Téléchargements/mon-ecoledirecte-ca.pem"
  else
    warn "Accès au stockage non configuré."
    echo ""
    echo "    Lancez cette commande, acceptez la permission, puis relancez install.sh :"
    echo ""
    echo -e "    ${CYAN}termux-setup-storage${RESET}"
    echo ""
    warn "Sans cette étape, vous devrez copier ca.pem manuellement."
  fi
fi

# ── Bilan ─────────────────────────────────────────────────
echo ""
echo "  ====================================="
if [ ${#ERRORS[@]} -eq 0 ]; then
  echo -e "  ${GREEN}Installation terminée avec succès !${RESET}"
  echo ""
  echo "  Prochaine étape : installer le certificat CA"
  echo "  (voir INSTALL-ANDROID.md, étape Certificat)"
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
