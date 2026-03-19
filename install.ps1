# ============================================================
#  Mon EcoleDirecte — Installation
#  Usage : clic droit > "Executer avec PowerShell"
#          ou depuis un terminal : .\install.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $DIR

$OK  = "[OK] "
$ERR = "[ERREUR] "
$INF = "[..] "
$WARN= "[AVERT] "

$errors = @()

function Write-Step($msg) { Write-Host "`n$INF$msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "$OK$msg"   -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "$ERR$msg"  -ForegroundColor Red; $script:errors += $msg }
function Write-Warn($msg) { Write-Host "$WARN$msg" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  ================================" -ForegroundColor White
Write-Host "   Mon EcoleDirecte - Installation" -ForegroundColor White
Write-Host "  ================================" -ForegroundColor White
Write-Host ""

# ── 1. Fichiers requis ───────────────────────────────────────
Write-Step "Verification des fichiers requis..."
$required = @("proxy.js", "ecoledirecte.html", "app.js", "style.css", "generate-cert.js")
$allPresent = $true
foreach ($f in $required) {
    if (Test-Path "$DIR\$f") {
        Write-OK "$f present"
    } else {
        Write-Err "$f MANQUANT"
        $allPresent = $false
    }
}

# ── 2. Node.js ───────────────────────────────────────────────
Write-Step "Verification de Node.js..."
try {
    $nodeVer = & node --version 2>&1
    Write-OK "Node.js $nodeVer detecte"
} catch {
    Write-Warn "Node.js non trouve. Telechargement en cours..."
    $installer = "$env:TEMP\node_installer.msi"
    try {
        # Recuperer la derniere version LTS
        $ltsInfo = Invoke-RestMethod "https://nodejs.org/dist/index.json" | Where-Object { $_.lts } | Select-Object -First 1
        $version = $ltsInfo.version
        $url = "https://nodejs.org/dist/$version/node-$version-x64.msi"
        Write-Host "    Telechargement Node.js $version..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Host "    Installation en cours (peut prendre quelques minutes)..." -ForegroundColor Cyan
        Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /norestart" -Wait
        # Recharger le PATH
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        $nodeVer = & node --version 2>&1
        Write-OK "Node.js $nodeVer installe avec succes"
    } catch {
        Write-Err "Impossible d'installer Node.js automatiquement. Installez-le manuellement depuis https://nodejs.org"
    }
}

# ── 3. Dependances npm ───────────────────────────────────────
Write-Step "Installation des dependances npm..."
try {
    & npm install 2>&1 | Out-Null
    Write-OK "Dependances installees (node-forge, nodemon)"
} catch {
    Write-Err "Echec de npm install : $_"
}

# ── 4. Certificat SSL ────────────────────────────────────────
Write-Step "Verification du certificat SSL..."
if ((Test-Path "$DIR\cert.pem") -and (Test-Path "$DIR\key.pem")) {
    Write-OK "Certificat SSL deja present"
} else {
    Write-Host "    Generation du certificat..." -ForegroundColor Cyan
    try {
        & node generate-cert.js
        if ((Test-Path "$DIR\cert.pem") -and (Test-Path "$DIR\key.pem")) {
            Write-OK "Certificat SSL genere avec succes"
        } else {
            Write-Err "La generation du certificat a echoue"
        }
    } catch {
        Write-Err "Erreur lors de la generation du certificat : $_"
    }
}

# ── Bilan ────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ================================" -ForegroundColor White
if ($errors.Count -eq 0) {
    Write-Host "  Installation terminee avec succes !" -ForegroundColor Green
    Write-Host "  Lancez run.ps1 pour demarrer l'application." -ForegroundColor Green
} else {
    Write-Host "  Installation terminee avec $($errors.Count) erreur(s) :" -ForegroundColor Red
    foreach ($e in $errors) {
        Write-Host "    - $e" -ForegroundColor Red
    }
}
Write-Host "  ================================" -ForegroundColor White
Write-Host ""
Read-Host "Appuyez sur Entree pour fermer"
