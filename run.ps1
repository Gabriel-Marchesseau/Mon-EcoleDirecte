# ============================================================
#  Mon EcoleDirecte — Lancement
#  Usage : .\run.ps1           (mode normal)
#          .\run.ps1 --debug   (mode debug avec logs detailles)
# ============================================================

param([switch]$debug)

$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $DIR

function Write-Step($msg) { Write-Host "[..] $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "[OK] $msg"  -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "[ERREUR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[AVERT] $msg" -ForegroundColor Yellow }

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
    Write-Warn "Lancez d'abord 'Installer Mon EcoleDirecte.bat'"
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}
Write-OK "Environnement pret"

# ── 2. Gestion du proxy existant ─────────────────────────────
$portInUse = Get-NetTCPConnection -LocalPort 3131 -ErrorAction SilentlyContinue
if ($portInUse) {
    if ($debug) {
        # En mode debug : arrêter l'ancien proxy pour relancer en fenêtre visible
        Write-Step "Arret du proxy existant pour relancer en mode debug..."
        try {
            Stop-Process -Id $portInUse.OwningProcess -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
        } catch {}
        Write-OK "Proxy precedent arrete"
    } else {
        Write-OK "Le proxy tourne deja sur le port 3131"
        goto_open = $true
    }
} else {
    $goto_open = $false
}

# ── 3. Lancer le proxy ───────────────────────────────────────
if (-not $goto_open) {
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
        Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/c cd /d `"$DIR`" && node proxy.js" `
            -WindowStyle Minimized
    }

    # ── 4. Attendre que le port soit ouvert ──────────────────
    $maxWait = if ($debug) { 10 } else { 8 }
    $waited  = 0
    $started = $false
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        $conn = Get-NetTCPConnection -LocalPort 3131 -ErrorAction SilentlyContinue
        if ($conn) { $started = $true; break }
    }

    if ($started) {
        Write-OK "Proxy demarre sur https://localhost:3131"
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
Start-Process "https://localhost:3131"
Write-OK "Mon EcoleDirecte est ouvert !"
Write-Host ""
if (-not $debug) {
    Start-Sleep -Seconds 3
}
