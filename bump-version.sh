#!/bin/sh
# ============================================================
#  Mon EcoleDirecte — Incremente le numero de version (package.json)
#  Usage : bash bump-version.sh
#  A lancer UNE SEULE FOIS PAR PUSH, juste avant `git add`/`git commit`
#  (pas a chaque modification) — cf. CLAUDE.md section "Numero de version".
# ============================================================

cd "$(dirname "$0")" || exit 1

extract_version() {
  # Pas d'ancrage ^ : tolere aussi bien "version" en debut de ligne (formatage
  # habituel de package.json) qu'ailleurs sur la ligne (JSON compacte).
  sed -nE 's/.*"version"[[:space:]]*:[[:space:]]*"([^"]*)".*/\1/p' | head -1
}

current=$(extract_version < package.json)
if [ -z "$current" ]; then
  echo "Impossible de lire \"version\" dans package.json - abandon." >&2
  exit 1
fi

today=$(date +%Y.%m.%d)

# Matching par PREFIXE (pas egalite stricte) : sinon la transition .2 -> .3
# retomberait sur $today nu et perdrait la progression du jour.
case "$current" in
  "$today")
    new_version="${today}.2"
    ;;
  "${today}".[0-9]*)
    suffix=${current#"${today}."}
    new_version="${today}.$((suffix + 1))"
    ;;
  *)
    new_version="$today"
    ;;
esac

sed -i -E 's/("version"[[:space:]]*:[[:space:]]*")[^"]*(".*)/\1'"$new_version"'\2/' package.json

echo "Version : $current -> $new_version"
