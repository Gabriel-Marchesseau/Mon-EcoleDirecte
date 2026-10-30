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

  # Versions corrigées de la mise à jour de sécurité d'octobre 2026 (faille Brotli, TLS...).
  # Une branche absente de la liste (22, 23, 25, <22) n'est pas corrigée / n'est plus supportée.
  node_is_patched() {
    local v="${1#v}" maj min pat
    IFS=. read -r maj min pat <<< "$v"
    local need
    case "$maj" in
      22) need="22.23.4" ;;
      24) need="24.22.1" ;;
      26) need="26.12.1" ;;
      *)  [ "$maj" -gt 26 ] 2>/dev/null && return 0 || return 1 ;;
    esac
    [ "$(printf '%s\n%s\n' "$need" "$v" | sort -V | head -n1)" = "$need" ]
  }

  if ! node_is_patched "$NODE_VER"; then
    warn "Node.js $NODE_VER n'a pas le correctif de sécurité d'octobre 2026 (ou n'est plus supportée)"
    if command -v pkg &>/dev/null; then
      step "Mise à jour de Node.js (pkg upgrade nodejs)..."
      pkg upgrade -y nodejs
      NODE_VER=$(node --version)
      if node_is_patched "$NODE_VER"; then
        ok "Node.js mis à jour : $NODE_VER"
      else
        warn "Node.js $NODE_VER : le dépôt Termux ne propose pas encore de version corrigée. À refaire plus tard : pkg update && pkg upgrade nodejs"
      fi
    else
      warn "Mettez Node.js à jour vers une version LTS corrigée (>= 24.22.1)"
    fi
  fi
else
  err "Node.js introuvable"
  echo ""
  echo -e "  ${YELLOW}Installez-le avec :${RESET}  pkg install nodejs"
  echo ""
  exit 1
fi

# ── 3. Dépendances npm ────────────────────────────────────
step "Installation des dépendances npm..."
# npm ci installe exactement les versions de package-lock.json (versionné, déjà
# corrigé des vulnérabilités connues) sans jamais le réécrire : contrairement à
# "npm install" + "npm audit fix", le dépôt git du téléphone reste propre et les
# "git pull" suivants ne sont pas bloqués par un package-lock.json modifié.
# --omit=dev : nodemon (outil de dev, inutile sur téléphone) n'est pas installé.
if npm ci --omit=dev --no-audit --no-fund 2>/dev/null; then
  ok "Dépendances installées (node-forge)"
else
  err "Échec de npm ci"
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

# ── 5. Retrait de l'ancien raccourci Termux:Widget ───────
# L'application se lance désormais depuis son icône PWA : on retire les raccourcis
# créés par les versions précédentes de cet installeur (noms actuel et anciens).
for f in "$HOME/.shortcuts/tasks/Mon-EcoleDirecte.sh"          "$HOME/.shortcuts/Mon-EcoleDirecte.sh"          "$HOME/.shortcuts/Mon EcoleDirecte.sh"          "$HOME/.shortcuts/icons/Mon-EcoleDirecte.sh.png"          "$HOME/.shortcuts/icons/Mon EcoleDirecte.sh.png"          "$HOME/.termux/widget/dynamic_shortcuts/Mon-EcoleDirecte.sh"          "$HOME/.termux/widget/dynamic_shortcuts/Mon EcoleDirecte.sh"; do
  if [ -e "$f" ] || [ -L "$f" ]; then
    rm -f "$f"
    ok "Ancien raccourci retiré : ${f#$HOME/}"
  fi
done

# ── 6. Démarrage automatique du proxy à l'ouverture de Termux ─
step "Configuration du démarrage automatique du proxy..."
# Termux:Boot n'est pas installable sur tous les téléphones et MacroDroid (essai
# Pro limité dans le temps) n'est pas une solution durable : le proxy est donc
# lancé par ~/.bashrc à chaque ouverture de Termux (session interactive). run.sh
# ne fait rien si le proxy tourne déjà. Le script de démarrage a un shebang
# absolu ("env" échoue hors session interactive).
# NON TESTÉ EN CONDITIONS RÉELLES (à valider sur téléphone).
BOOT_FILE="$HOME/.termux/mon-ecoledirecte-boot.sh"
mkdir -p "$HOME/.termux"
cat > "$BOOT_FILE" << EOF
#!/data/data/com.termux/files/usr/bin/bash
# Démarrage du proxy Mon EcoleDirecte (appelé depuis ~/.bashrc).
# termux-wake-lock garde Termux en service (notification permanente) pour
# qu'Android ne tue pas le proxy en arrière-plan.
termux-wake-lock
cd "$DIR"
bash run.sh > /dev/null 2>&1
EOF
chmod +x "$BOOT_FILE"
ok "Script créé : $BOOT_FILE"

BASHRC="$HOME/.bashrc"
BASHRC_BEGIN="# >>> mon-ecoledirecte >>>"
BASHRC_END="# <<< mon-ecoledirecte <<<"
touch "$BASHRC"
# Bloc géré par l'installeur : supprimé puis réécrit à chaque exécution
# (idempotent, et reflète un éventuel changement de chemin).
sed -i "/$BASHRC_BEGIN/,/$BASHRC_END/d" "$BASHRC"
cat >> "$BASHRC" << EOF
$BASHRC_BEGIN
# Démarre le proxy Mon EcoleDirecte en arrière-plan à l'ouverture de Termux
( "$BOOT_FILE" > /dev/null 2>&1 & )
$BASHRC_END
EOF
ok "Démarrage automatique ajouté à ~/.bashrc"

# ── Bilan ─────────────────────────────────────────────────
# Les étapes restantes (icône PWA, batterie, usage quotidien) sont affichées
# dans Chrome par la page /installation plutôt que dans le terminal.
INSTALL_URL="http://localhost:3131/installation"
echo ""
echo "  ====================================="
if [ ${#ERRORS[@]} -eq 0 ]; then
  # (Re)démarre le proxy pour qu'il serve la version tout juste installée
  step "Démarrage de Mon EcoleDirecte..."
  bash run.sh stop > /dev/null 2>&1
  ( "$BOOT_FILE" > /dev/null 2>&1 & )
  READY=false
  for i in $(seq 1 15); do
    sleep 1
    if curl -s -o /dev/null "$INSTALL_URL" 2>/dev/null; then READY=true; break; fi
  done
  echo ""
  if $READY; then
    echo -e "  ${GREEN}Installation terminée — la suite s'affiche dans Chrome.${RESET}"
    am start -a android.intent.action.VIEW -d "$INSTALL_URL" -p com.android.chrome > /dev/null 2>&1 \
      || termux-open-url "$INSTALL_URL" 2>/dev/null
  else
    echo -e "  ${YELLOW}Installation terminée, mais le serveur tarde à démarrer.${RESET}"
  fi
  echo "  Si Chrome ne s'ouvre pas : $INSTALL_URL"
else
  echo -e "  ${RED}Installation terminée avec ${#ERRORS[@]} erreur(s) :${RESET}"
  for e in "${ERRORS[@]}"; do
    echo -e "    ${RED}- $e${RESET}"
  done
fi
echo "  ====================================="
echo ""
