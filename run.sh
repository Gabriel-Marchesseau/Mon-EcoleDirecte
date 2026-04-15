#!/usr/bin/env bash
# ============================================================
#  Mon EcoleDirecte — Lancement (Android / Termux)
#  Usage : bash run.sh          (démarrer)
#          bash run.sh stop     (arrêter)
# ============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PID_FILE="/tmp/med-proxy.pid"
LOG_FILE="$DIR/proxy.log"
APP_URL="https://localhost:3131"

# ── Couleurs ──────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}[OK]${RESET} $1"; }
err()  { echo -e "${RED}[ERREUR]${RESET} $1"; }
step() { echo -e "\n${CYAN}[..]${RESET} $1"; }
warn() { echo -e "${YELLOW}[AVERT]${RESET} $1"; }

# ── Commande stop ─────────────────────────────────────────
if [ "$1" = "stop" ]; then
  echo ""
  if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
    kill "$(cat "$PID_FILE")"
    rm -f "$PID_FILE"
    ok "Proxy arrêté."
  else
    warn "Le proxy n'est pas en cours d'exécution."
    rm -f "$PID_FILE"
  fi
  echo ""
  exit 0
fi

echo ""
echo "  ====================================="
echo "        Mon EcoleDirecte"
echo "  ====================================="
echo ""

# ── Vérifications préalables ──────────────────────────────
step "Vérification de l'environnement..."
READY=true
[ ! -f "$DIR/cert.pem" ]          && { err "cert.pem manquant — lancez : bash install.sh"; READY=false; }
[ ! -d "$DIR/node_modules" ]      && { err "node_modules manquant — lancez : bash install.sh"; READY=false; }
[ ! -f "$DIR/proxy.js" ]          && { err "proxy.js manquant"; READY=false; }
[ ! -f "$DIR/ecoledirecte.html" ] && { err "ecoledirecte.html manquant"; READY=false; }
[ ! -f "$DIR/app.js" ]            && { err "app.js manquant"; READY=false; }

if ! $READY; then
  echo ""
  warn "Lancez d'abord : bash install.sh"
  echo ""
  exit 1
fi
ok "Environnement prêt"

# ── Vérifier si le proxy tourne déjà ─────────────────────
if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  ok "Le proxy tourne déjà (PID $(cat "$PID_FILE"))"
else
  # ── Démarrer le proxy ───────────────────────────────────
  step "Démarrage du proxy..."
  rm -f "$PID_FILE" "$LOG_FILE"
  nohup node proxy.js > "$LOG_FILE" 2>&1 &
  echo $! > "$PID_FILE"

  # Attendre le message de démarrage (max 8s)
  STARTED=false
  for i in 1 2 3 4 5 6 7 8; do
    sleep 1
    if grep -q "démarré" "$LOG_FILE" 2>/dev/null; then
      STARTED=true
      break
    fi
  done

  if $STARTED; then
    ok "Proxy démarré (PID $(cat "$PID_FILE"))"
  else
    warn "Le proxy met du temps à démarrer (PID $(cat "$PID_FILE"))"
    warn "Consultez proxy.log en cas d'erreur"
  fi
fi

# ── Afficher l'URL ────────────────────────────────────────
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${GREEN}  Ouvrez Firefox et allez sur :${RESET}"
echo ""
echo -e "        ${CYAN}${APP_URL}${RESET}"
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Copie automatique dans le presse-papier si Termux:API disponible
if command -v termux-clipboard-set &>/dev/null; then
  echo -n "$APP_URL" | termux-clipboard-set
  echo -e "  ${YELLOW}URL copiée dans le presse-papier !${RESET}"
  echo ""
fi

echo "  Pour arrêter le proxy : bash run.sh stop"
echo ""
