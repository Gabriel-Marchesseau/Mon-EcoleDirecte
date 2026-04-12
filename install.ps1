# ============================================================
#  Mon EcoleDirecte - Installation
#  Usage : clic droit > "Executer avec PowerShell"
#          ou depuis un terminal : .\install.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $DIR

# -- Verification droits administrateur ----------------------
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Red
    Write-Host "   DROITS ADMINISTRATEUR REQUIS" -ForegroundColor Red
    Write-Host "  ============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Ce script doit etre execute en tant qu'Administrateur" -ForegroundColor Yellow
    Write-Host "  pour pouvoir :" -ForegroundColor Yellow
    Write-Host "    - modifier le fichier hosts" -ForegroundColor White
    Write-Host "    - configurer le portproxy reseau" -ForegroundColor White
    Write-Host "    - installer le certificat CA dans Windows" -ForegroundColor White
    Write-Host ""
    Write-Host "  Comment relancer en Administrateur :" -ForegroundColor Cyan
    Write-Host "    1. Clic droit sur Installer_Mon_EcoleDirecte.bat" -ForegroundColor White
    Write-Host "    2. Choisir ""Executer en tant qu'administrateur""" -ForegroundColor White
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}

$OK   = "[OK] "
$ERR  = "[ERREUR] "
$INF  = "[..] "
$WARN = "[AVERT] "

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

# -- 1. Fichiers requis --------------------------------------
Write-Step "Verification des fichiers requis..."
$required = @("proxy.js", "ecoledirecte.html", "app.js", "style.css", "generate-cert.js")
$missingFiles = $false
foreach ($f in $required) {
    if (Test-Path "$DIR\$f") {
        Write-OK "$f present"
    } else {
        Write-Err "$f MANQUANT"
        $missingFiles = $true
    }
}
if ($missingFiles) {
    Write-Host ""
    Write-Host "  Des fichiers requis sont manquants. Installation annulee." -ForegroundColor Red
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}

# -- 2. Node.js ----------------------------------------------
Write-Step "Verification de Node.js..."
try {
    $nodeVer = & node --version 2>&1
    Write-OK "Node.js $nodeVer detecte"
} catch {
    Write-Warn "Node.js non trouve. Telechargement en cours..."
    $installer = "$env:TEMP\node_installer.msi"
    try {
        $ltsInfo = Invoke-RestMethod "https://nodejs.org/dist/index.json" | Where-Object { $_.lts } | Select-Object -First 1
        $version = $ltsInfo.version
        $url = "https://nodejs.org/dist/$version/node-$version-x64.msi"
        Write-Host "    Telechargement Node.js $version..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
        Write-Host "    Installation en cours (peut prendre quelques minutes)..." -ForegroundColor Cyan
        Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /norestart" -Wait
        $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
        $nodeVer = & node --version 2>&1
        Write-OK "Node.js $nodeVer installe avec succes"
    } catch {
        Write-Err "Impossible d'installer Node.js automatiquement. Installez-le manuellement depuis https://nodejs.org"
    }
}

# -- 3. Dependances npm --------------------------------------
Write-Step "Installation des dependances npm..."
try {
    & npm install 2>&1 | Out-Null
    Write-OK "Dependances installees (node-forge, nodemon)"
} catch {
    Write-Err "Echec de npm install : $_"
}

# -- 4. Certificats SSL --------------------------------------
Write-Step "Verification des certificats SSL..."
$certOk = (Test-Path "$DIR\cert.pem") -and (Test-Path "$DIR\key.pem") -and (Test-Path "$DIR\ca.pem")
if ($certOk) {
    Write-OK "Certificats SSL deja presents"
} else {
    Write-Host "    Generation des certificats..." -ForegroundColor Cyan
    try {
        & node generate-cert.js
        if ((Test-Path "$DIR\cert.pem") -and (Test-Path "$DIR\key.pem") -and (Test-Path "$DIR\ca.pem")) {
            Write-OK "Certificats SSL generes avec succes"
        } else {
            Write-Err "La generation des certificats a echoue"
        }
    } catch {
        Write-Err "Erreur lors de la generation des certificats : $_"
    }
}

# -- 4b. Installer la CA dans le magasin de confiance Windows
Write-Step "Installation de la CA locale dans le magasin de confiance Windows..."
if (Test-Path "$DIR\ca.pem") {
    try {
        $caName = "Mon EcoleDirecte Local CA"
        $existing = Get-ChildItem "Cert:\LocalMachine\Root" | Where-Object { $_.Subject -like "*$caName*" }
        if ($existing) {
            Write-OK "CA locale deja installee dans le magasin de confiance"
        } else {
            Import-Certificate -FilePath "$DIR\ca.pem" -CertStoreLocation "Cert:\LocalMachine\Root" | Out-Null
            Write-OK "CA locale installee - le navigateur ne signalera plus d'avertissement HTTPS"
        }
    } catch {
        Write-Err "Impossible d'installer la CA : $_"
        Write-Warn "Relancez install.ps1 en tant qu'Administrateur pour cette etape"
    }
} else {
    Write-Warn "ca.pem introuvable - saut de l'installation CA"
}

# -- 5. Entree hosts -----------------------------------------
Write-Step "Configuration de monecoledirecte.local dans le fichier hosts..."
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostEntry = "127.0.0.1`tmonecoledirecte.local"
try {
    $hostsContent = Get-Content $hostsPath -Raw -ErrorAction Stop
    if ($hostsContent -match "monecoledirecte\.local") {
        Write-OK "Entree hosts deja presente"
    } else {
        Add-Content -Path $hostsPath -Value "`n$hostEntry" -Encoding ASCII
        Write-OK "Entree hosts ajoutee : 127.0.0.1  monecoledirecte.local"
    }
} catch {
    Write-Err "Impossible de modifier le fichier hosts - relancez install.ps1 en tant qu'Administrateur"
}

# -- 6. Portproxy 443 -> 3131 --------------------------------
Write-Step "Configuration du portproxy HTTPS (443 -> 3131)..."
try {
    $existingProxy = & netsh interface portproxy show v4tov4 2>$null
    if ($existingProxy -match "443") {
        Write-OK "Portproxy deja configure"
    } else {
        & netsh interface portproxy add v4tov4 listenaddress=127.0.0.1 listenport=443 connectaddress=127.0.0.1 connectport=3131 | Out-Null
        Write-OK "Portproxy configure : https://monecoledirecte.local -> localhost:3131"
    }
} catch {
    Write-Err "Impossible de configurer le portproxy - relancez install.ps1 en tant qu'Administrateur"
}

# -- Bilan ---------------------------------------------------
Write-Host ""
Write-Host "  ================================" -ForegroundColor White
if ($errors.Count -eq 0) {
    Write-Host "  Installation terminee avec succes !" -ForegroundColor Green
    Write-Host "  Acces : https://monecoledirecte.local" -ForegroundColor Green
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
