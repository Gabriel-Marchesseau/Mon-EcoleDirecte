#!/usr/bin/env bash
# ============================================================
#  Mon EcoleDirecte — Lancement (Android / Termux)
#  Usage : bash run.sh              (démarrer)
#          bash run.sh --no-open    (démarrer sans copier l'URL dans le presse-papier)
#          bash run.sh stop         (arrêter)
#
#  --no-open : ne copie pas l'URL dans le presse-papier. Utilisée par le script
#  de démarrage ~/.termux/mon-ecoledirecte-boot.sh (lancé à chaque ouverture de
#  Termux) : sans elle, chaque ouverture écrasait le presse-papier et pouvait
#  rester bloquée sur termux-clipboard-set si Termux:API ne répondait pas.
#
#  Plusieurs run.sh lancés en même temps (ex. ~/.bashrc lu deux fois par une
#  connexion Termux) sont sérialisés par un verrou (mkdir atomique) : un seul
#  démarre le proxy. Le fichier PID est écrit par le proxy lui-même (variable
#  MED_PID_FILE), seulement une fois le port obtenu.
# ============================================================

DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

PID_FILE="${TMPDIR:-/tmp}/med-proxy.pid"
LOCK_DIR="${PID_FILE}.lock"
LOG_FILE="$DIR/proxy.log"
APP_URL="http://localhost:3131"

# ── Arguments ─────────────────────────────────────────────
ACTION="start"
COPY_URL=true
for arg in "$@"; do
  case "$arg" in
    stop)      ACTION="stop" ;;
    --no-open) COPY_URL=false ;;
  esac
done

# ── Couleurs ──────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; RESET='\033[0m'

ok()   { echo -e "${GREEN}[OK]${RESET} $1"; }
err()  { echo -e "${RED}[ERREUR]${RESET} $1"; }
step() { echo -e "\n${CYAN}[..]${RESET} $1"; }
warn() { echo -e "${YELLOW}[AVERT]${RESET} $1"; }

# ── Outils : état du proxy ────────────────────────────────
# PID du proxy d'après le fichier PID (affiché seulement si ce process est vivant).
proxy_pid() {
  local p
  p="$(cat "$PID_FILE" 2>/dev/null)"
  case "$p" in ''|*[!0-9]*) return 1 ;; esac
  kill -0 "$p" 2>/dev/null || return 1
  echo "$p"
}

# Vrai si quelque chose répond sur le port du proxy, même si le fichier PID est
# absent ou périmé (proxy lancé par une ancienne version, fichier supprimé...).
proxy_answers() {
  command -v curl &>/dev/null || return 1
  curl -s -o /dev/null -m 2 "$APP_URL/favicon.ico"
}

# ── Verrou de démarrage (mkdir est atomique ; flock n'existe pas sous Termux) ──
LOCK_HELD=false

# Verrou périmé : son propriétaire (run.sh) n'existe plus, ou il date de plus de 30 s
# (un démarrage normal le garde ~2 s, 8 s au plus).
lock_is_stale() {
  local owner mtime now
  owner="$(cat "$LOCK_DIR/owner" 2>/dev/null)"
  if [ -n "$owner" ]; then
    kill -0 "$owner" 2>/dev/null || return 0
  fi
  mtime="$(stat -c %Y "$LOCK_DIR" 2>/dev/null)" || return 1
  now="$(date +%s)"
  [ $((now - mtime)) -gt 30 ]
}

# Attente bornée à ~10 s. Si le verrou n'est pas obtenu, on continue SANS lui : un
# éventuel double démarrage reste sans gravité (le proxy perdant échoue sur le port
# déjà pris sans écrire le fichier PID), mais le journal n'est alors pas remis à zéro.
acquire_lock() {
  local i
  for i in $(seq 1 20); do
    if mkdir "$LOCK_DIR" 2>/dev/null; then
      echo $$ > "$LOCK_DIR/owner" 2>/dev/null
      LOCK_HELD=true
      return 0
    fi
    if lock_is_stale; then
      # Déplacement atomique avant suppression (re-vérifié juste avant)
      lock_is_stale && mv "$LOCK_DIR" "$LOCK_DIR.old.$$" 2>/dev/null && rm -rf "$LOCK_DIR.old.$$"
      continue
    fi
    sleep 0.5
  done
  return 1
}

# Ne libère que le verrou qu'on détient réellement (jamais celui d'un autre run.sh
# qui l'aurait repris après l'avoir jugé périmé).
release_lock() {
  if $LOCK_HELD; then
    [ "$(cat "$LOCK_DIR/owner" 2>/dev/null)" = "$$" ] && rm -rf "$LOCK_DIR"
    LOCK_HELD=false
  fi
}
trap release_lock EXIT
trap 'exit 1' HUP INT TERM

# ── Commande stop ─────────────────────────────────────────
if [ "$ACTION" = "stop" ]; then
  echo ""
  if PID="$(proxy_pid)"; then
    kill "$PID" 2>/dev/null
    # Attendre la fin réelle du process (max 3 s) : un redémarrage immédiat ne doit
    # pas trouver le port encore pris. Au-delà, arrêt forcé.
    for i in 1 2 3 4 5 6; do
      kill -0 "$PID" 2>/dev/null || break
      sleep 0.5
    done
    kill -0 "$PID" 2>/dev/null && kill -9 "$PID" 2>/dev/null
    rm -f "$PID_FILE"
    ok "Proxy arrêté."
  elif proxy_answers; then
    # Fichier PID absent ou périmé mais un proxy répond : on lui demande de s'arrêter
    # lui-même (endpoint /shutdown, présent dans toutes les versions).
    curl -s -o /dev/null -m 3 -X POST "$APP_URL/shutdown"
    for i in 1 2 3 4 5 6; do
      proxy_answers || break
      sleep 0.5
    done
    rm -f "$PID_FILE"
    if proxy_answers; then
      err "Un proxy répond toujours sur $APP_URL (PID inconnu) — impossible de l'arrêter."
    else
      ok "Proxy arrêté (PID inconnu : arrêt demandé via /shutdown)."
    fi
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
if PID="$(proxy_pid)"; then
  ok "Le proxy tourne déjà (PID $PID)"
else
  # Sous verrou : un autre run.sh lancé en même temps attend ici la fin du démarrage
  # du premier, puis constate que le proxy tourne (re-vérification ci-dessous).
  acquire_lock

  if PID="$(proxy_pid)"; then
    ok "Le proxy tourne déjà (PID $PID)"
  elif proxy_answers; then
    warn "Un proxy répond déjà sur $APP_URL, mais son PID est inconnu (fichier PID absent ou périmé)."
    warn "Pour le redémarrer proprement : bash run.sh stop, puis bash run.sh"
  else
    # ── Démarrer le proxy ─────────────────────────────────
    step "Démarrage du proxy..."
    # Le fichier PID n'est PAS touché ici : c'est le proxy qui l'écrit (MED_PID_FILE),
    # une fois le port obtenu. Le journal n'est remis à zéro que sous verrou (aucun
    # proxy vivant), et le proxy y écrit en ajout (>>) pour ne jamais le tronquer.
    $LOCK_HELD && rm -f "$LOG_FILE"
    HTTP_MODE=1 MED_PID_FILE="$PID_FILE" nohup node proxy.js >> "$LOG_FILE" 2>&1 &
    PROXY_PID=$!
    disown $PROXY_PID

    # Attendre que le proxy ait obtenu le port (max 8 s) : il écrit alors son PID
    # puis le message de démarrage. S'il meurt avant (port déjà pris...), inutile
    # d'attendre.
    STARTED=false
    ALIVE=true
    for i in $(seq 1 16); do
      sleep 0.5
      if [ "$(proxy_pid)" = "$PROXY_PID" ] || grep -q "démarré" "$LOG_FILE" 2>/dev/null; then
        STARTED=true
        break
      fi
      if ! kill -0 "$PROXY_PID" 2>/dev/null; then
        ALIVE=false
        break
      fi
    done

    if $STARTED; then
      ok "Proxy démarré (PID $PROXY_PID)"
    elif $ALIVE; then
      warn "Le proxy met du temps à démarrer (PID $PROXY_PID)"
      warn "Consultez proxy.log en cas d'erreur"
    elif PID="$(proxy_pid)" || proxy_answers; then
      # Mort au démarrage parce qu'un autre proxy a pris le port entre-temps
      ok "Le proxy tourne déjà (démarré par un autre lancement)"
    else
      err "Le proxy s'est arrêté au démarrage — dernières lignes de proxy.log :"
      tail -n 5 "$LOG_FILE" 2>/dev/null
      release_lock
      echo ""
      exit 1
    fi
  fi

  release_lock
fi

# ── Afficher l'URL ────────────────────────────────────────
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${GREEN}  Ouvrez votre navigateur et allez sur :${RESET}"
echo ""
echo -e "        ${CYAN}${APP_URL}${RESET}"
echo ""
echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""

# Copie automatique dans le presse-papier si Termux:API disponible (sauf --no-open).
# timeout : termux-clipboard-set reste bloqué indéfiniment quand l'appli Termux:API
# ne répond pas (constaté sur le téléphone : processus bloqués pendant des dizaines
# de minutes).
if $COPY_URL && command -v termux-clipboard-set &>/dev/null; then
  if echo -n "$APP_URL" | timeout 3 termux-clipboard-set; then
    echo -e "  ${YELLOW}URL copiée dans le presse-papier !${RESET}"
  else
    warn "Copie dans le presse-papier impossible (Termux:API ne répond pas)"
  fi
  echo ""
fi

echo "  Pour arrêter le proxy : bash run.sh stop"
echo ""
