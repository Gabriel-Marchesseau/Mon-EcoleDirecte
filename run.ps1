# ============================================================
#  Mon EcoleDirecte — Lancement
#  Usage : .\run.ps1           (mode normal)
#          .\run.ps1 --debug   (mode debug avec logs detailles)
#          .\run.ps1 --stop    (arrete le proxy en cours)
# ============================================================

param([switch]$debug, [switch]$stop)

$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $DIR

function Write-Step($msg) { Write-Host "[..] $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "[OK] $msg"  -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "[ERREUR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[AVERT] $msg" -ForegroundColor Yellow }

# ── Mode arret ────────────────────────────────────────────────
if ($stop) {
    # -State Listen : une connexion TimeWait (residuelle apres un arret recent,
    # OwningProcess=0) ne doit pas etre prise pour un proxy actif.
    $conn = Get-NetTCPConnection -LocalPort 3131 -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        try {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
            Write-OK "Proxy arrete (port 3131 libere)."
        } catch {
            Write-Err "Impossible d'arreter le proxy : $_"
        }
    } else {
        Write-Warn "Le proxy n'est pas en cours d'execution."
    }
    exit 0
}

Write-Host ""
Write-Host "  ================================" -ForegroundColor White
Write-Host "        Mon EcoleDirecte          " -ForegroundColor White
if ($debug) {
    Write-Host "           [MODE DEBUG]           " -ForegroundColor Yellow
}
Write-Host "  ================================" -ForegroundColor White
Write-Host ""

# ── 1. Verifier que l'installation a ete faite ───────────────
$ready = $true
if (-not (Test-Path "$DIR\cert.pem"))          { Write-Err "cert.pem manquant - lancez install.ps1"; $ready = $false }
if (-not (Test-Path "$DIR\node_modules"))      { Write-Err "node_modules manquant - lancez install.ps1"; $ready = $false }
if (-not (Test-Path "$DIR\proxy.js"))          { Write-Err "proxy.js manquant"; $ready = $false }
if (-not (Test-Path "$DIR\ecoledirecte.html")) { Write-Err "ecoledirecte.html manquant"; $ready = $false }
if (-not (Test-Path "$DIR\app.js"))            { Write-Err "app.js manquant"; $ready = $false }
if (-not (Test-Path "$DIR\style.css"))         { Write-Err "style.css manquant"; $ready = $false }

if (-not $ready) {
    Write-Host ""
    Write-Warn "Lancez d'abord 'Install_Mon_EcoleDirecte.bat'"
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}
Write-OK "Environnement pret"

# ── 2. Gestion du proxy existant ─────────────────────────────
# -State Listen : une connexion TimeWait residuelle (apres un arret recent via
# l'UI ou -stop, OwningProcess=0) etait a tort detectee comme "proxy deja
# lance", ce qui sautait le demarrage alors que rien ne tournait reellement -
# navigateur ouvert sur une page inaccessible (confirme en test reel).
$portInUse = Get-NetTCPConnection -LocalPort 3131 -State Listen -ErrorAction SilentlyContinue
$skipLaunch = $false

if ($portInUse) {
    if ($debug) {
        # En mode debug : arreter l'ancien proxy pour relancer en fenetre visible
        Write-Step "Arret du proxy existant pour relancer en mode debug..."
        try {
            Stop-Process -Id $portInUse.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        } catch {}
        Write-OK "Proxy precedent arrete"
    } else {
        Write-OK "Le proxy tourne deja sur le port 3131"
        $skipLaunch = $true
    }
}

# ── 3. Lancer le proxy ───────────────────────────────────────
if (-not $skipLaunch) {
    $nodemonPath = "$DIR\node_modules\.bin\nodemon.cmd"

    if ($debug) {
        Write-Step "Demarrage en mode DEBUG (nodemon + logs detailles)..."
        $watchArgs = "--watch proxy.js --watch app.js --watch style.css --watch ecoledirecte.html proxy.js"
        if (Test-Path $nodemonPath) {
            Start-Process -FilePath "cmd.exe" `
                -ArgumentList "/k cd /d `"$DIR`" && set `"DEBUG=1`" && `"$nodemonPath`" $watchArgs" `
                -WindowStyle Normal
        } else {
            Start-Process -FilePath "cmd.exe" `
                -ArgumentList "/k cd /d `"$DIR`" && set `"DEBUG=1`" && node proxy.js" `
                -WindowStyle Normal
        }
    } else {
        Write-Step "Demarrage du proxy..."
        # Lance node.exe directement (pas de wrapper cmd.exe /c && ...) : ce
        # wrapper echoue silencieusement avec -WindowStyle Hidden des que le
        # script appelant (run.ps1) est lui-meme lance de facon detachee/sans
        # fenetre (cas reel d'un double-clic sur le .bat) - confirme en test :
        # le port 3131 ne s'ouvre jamais, sans la moindre erreur visible.
        Start-Process -FilePath "node.exe" -ArgumentList "proxy.js" -WorkingDirectory $DIR -WindowStyle Hidden
    }

    # ── 4. Attendre que le port soit ouvert ──────────────────
    $maxWait = if ($debug) { 10 } else { 8 }
    $waited  = 0
    $started = $false
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        $conn = Get-NetTCPConnection -LocalPort 3131 -State Listen -ErrorAction SilentlyContinue
        if ($conn) { $started = $true; break }
    }

    if ($started) {
        Write-OK "Proxy demarre sur https://monecoledirecte.local"
        if ($debug) {
            Write-Host "  Logs URL, body, reponse, GTK et duree actives" -ForegroundColor Yellow
            Write-Host "  Fichiers surveilles : proxy.js, app.js, style.css, ecoledirecte.html" -ForegroundColor Yellow
        }
    } else {
        Write-Warn "Le proxy met du temps a demarrer, ouverture quand meme..."
    }
}

# ── 5. Ouvrir dans le navigateur ─────────────────────────────
Write-Step "Ouverture de Mon EcoleDirecte..."
Start-Process "https://monecoledirecte.local"
Write-OK "Mon EcoleDirecte est ouvert !"
Write-Host ""
if (-not $debug) {
    Start-Sleep -Seconds 3
}
