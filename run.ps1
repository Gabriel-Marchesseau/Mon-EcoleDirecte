# ============================================================
#  Mon EcoleDirecte — Lancement
#  Usage : .\run.ps1           (mode normal, fenetre cachee)
#          .\run.ps1 -debug    (mode debug : nodemon, fenetre visible avec les logs)
#          .\run.ps1 -stop     (arrete le proxy en cours)
# ============================================================

param([switch]$debug, [switch]$stop)

$DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $DIR

$PORT = 3131
$APP_URL = "https://monecoledirecte.local"
$SERVER_SCRIPT = Join-Path $DIR "proxy.js"

# Le proxy n'ecoute que sur 127.0.0.1 (server.listen(PORT, '127.0.0.1', ...) dans proxy.js) : c'est
# l'adresse sondee, pas "monecoledirecte.local" (entree du fichier hosts, absente sur certains PC).
# GET /md5?s=<PROBE_INPUT> rend {"hash": "<md5>"} : c'est ce que le proxy EcoleDirecte repond, et
# aucun autre programme sur le port n'aurait de raison de repondre ainsi (le test de test/ verifie
# que ce hash est bien celui de PROBE_INPUT).
$PROBE_INPUT = "mon-ecoledirecte"
$PROBE_HASH = "1252ce60fd155343ee60b997807bea24"

function Write-Step($msg) { Write-Host "[..] $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "[OK] $msg"  -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "[ERREUR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[AVERT] $msg" -ForegroundColor Yellow }

# Le port n'est pas lu dans la liste des connexions (Get-NetTCPConnection -State Listen) : sur ce
# PC, cette liste, netstat et l'API .NET oublient un port en ecoute un appel sur deux, port systeme
# 135 compris (mesure le 2026-11-01, 40/40 connexions reussies en parallele), et -State Listen ne
# donne pas le meme resultat sous Windows PowerShell 5.1 et sous PowerShell 7. Seule une vraie
# connexion fait foi. Une connexion TimeWait residuelle apres un arret recent (OwningProcess=0),
# que la liste montrait comme un proxy actif, est ici refusee : sans ecouteur, le port refuse.
function Test-ServerUp {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        return $client.ConnectAsync("127.0.0.1", $PORT).Wait(1000)
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

# Requete HTTPS sur le proxy, rend le texte brut de la reponse (en-tetes compris) ou $null.
# Le certificat est auto-signe (CA locale) : Invoke-WebRequest l'exige valide et son contournement
# differe entre Windows PowerShell 5.1 (pas de -SkipCertificateCheck) et PowerShell 7. Une connexion
# TLS ouverte a la main fait la meme chose dans les deux, de facon synchrone (le rappel de
# validation s'execute alors sur le thread du script). La destination est toujours 127.0.0.1 :
# le certificat n'identifie rien ici, c'est la reponse de l'API qui reconnait le proxy.
function Invoke-ProxyRequest($method, $path) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $client.ReceiveTimeout = 3000
        $client.SendTimeout = 3000
        if (-not $client.ConnectAsync("127.0.0.1", $PORT).Wait(1000)) { return $null }
        $callback = [System.Net.Security.RemoteCertificateValidationCallback]{ $true }
        $tls = New-Object System.Net.Security.SslStream($client.GetStream(), $false, $callback)
        $tls.AuthenticateAsClient("monecoledirecte.local")
        $request = "$method $path HTTP/1.1`r`nHost: monecoledirecte.local`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
        $bytes = [System.Text.Encoding]::ASCII.GetBytes($request)
        $tls.Write($bytes, 0, $bytes.Length)
        $tls.Flush()
        $reader = New-Object System.IO.StreamReader($tls, [System.Text.Encoding]::UTF8)
        return $reader.ReadToEnd()
    } catch {
        return $null
    } finally {
        $client.Dispose()
    }
}

# Un autre programme peut occuper le port : seule la reponse de l'API dit que c'est le proxy
# EcoleDirecte.
function Test-OurServer {
    $response = Invoke-ProxyRequest "GET" "/md5?s=$PROBE_INPUT"
    return ($null -ne $response) -and ($response -match "`"hash`"\s*:\s*`"$PROBE_HASH`"")
}

# Reconnu au chemin complet de proxy.js dans sa ligne de commande : d'autres projets (Mon MELCloud...)
# ont aussi un "node proxy.js" ou "node server.js", qu'il ne faut jamais arreter. Un proxy lance a la
# main avec un chemin relatif ("node proxy.js", "npm start") n'est donc pas retrouve ici : voir
# Stop-Proxy. En mode debug, nodemon et le node.exe qu'il lance portent tous deux ce chemin complet
# (il lui est donne tel quel, cf. plus bas).
function Get-ServerProcesses {
    Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue | Where-Object {
        $_.CommandLine -and $_.CommandLine.IndexOf($SERVER_SCRIPT, [System.StringComparison]::OrdinalIgnoreCase) -ge 0
    }
}

# Rend le nombre de process arretes (seule valeur renvoyee : les messages passent par Write-Host).
function Stop-Server {
    $found = @(Get-ServerProcesses)
    $ids = @($found | ForEach-Object { $_.ProcessId })
    # nodemon (le parent) d'abord, puis son enfant : l'enfant tue en premier, nodemon pourrait
    # le relancer avant d'etre arrete lui-meme.
    foreach ($process in ($found | Sort-Object { $ids -contains $_.ParentProcessId })) {
        Stop-Process -Id $process.ProcessId -Force -ErrorAction SilentlyContinue
        # Le port n'est libre qu'a la fin du process : on l'attend avant de re-sonder.
        Wait-Process -Id $process.ProcessId -Timeout 5 -ErrorAction SilentlyContinue
        Write-OK "Proxy arrete (PID $($process.ProcessId))"
    }
    return $found.Count
}

# Arrete le proxy : d'abord les process reconnus par le chemin de proxy.js ; sinon, si ce qui repond
# sur le port est bien le proxy EcoleDirecte (lance a la main avec un chemin relatif, ou par
# "npm start"), on lui demande de s'arreter par son propre POST /shutdown, comme le bouton « Fermer »
# de l'appli. Rien d'autre n'est jamais arrete. Rend $true si un proxy a ete arrete.
function Stop-Proxy {
    if ((Stop-Server) -gt 0) { return $true }
    if ((Test-ServerUp) -and (Test-OurServer)) {
        $null = Invoke-ProxyRequest "POST" "/shutdown"
        $waited = 0
        while ($waited -lt 10 -and (Test-ServerUp)) {
            Start-Sleep -Milliseconds 500
            $waited++
        }
        if (-not (Test-ServerUp)) {
            Write-OK "Proxy arrete (lance a la main, arret demande par /shutdown)"
            return $true
        }
    }
    return $false
}

# ── Mode arret ────────────────────────────────────────────────
if ($stop) {
    # Le proxy tourne sans fenetre visible (WindowStyle Hidden) : il n'y a pas de fenetre a fermer
    # pour l'arreter, d'ou ce switch dedie.
    if (-not (Stop-Proxy)) {
        if (Test-ServerUp) {
            Write-Warn "Le port $PORT repond, mais pas un proxy EcoleDirecte : rien n'a ete arrete."
        } else {
            Write-Warn "Le proxy n'est pas en cours d'execution."
        }
    }
    Start-Sleep -Seconds 2
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
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) { Write-Err "Node.js introuvable"; $ready = $false }

if (-not $ready) {
    Write-Host ""
    Write-Warn "Lancez d'abord 'Install_Mon_EcoleDirecte.bat'"
    Write-Host ""
    Read-Host "Appuyez sur Entree pour fermer"
    exit 1
}
Write-OK "Environnement pret"

# ── 2. Gestion du proxy existant ─────────────────────────────
$running = Test-ServerUp

if ($running) {
    if (-not (Test-OurServer)) {
        Write-Err "Le port $PORT est occupe par un autre programme : le proxy ne peut pas demarrer."
        Read-Host "Appuyez sur Entree pour fermer"
        exit 1
    }
    if ($debug) {
        # En mode debug : arreter l'ancien proxy pour relancer en fenetre visible
        Write-Step "Arret du proxy existant pour relancer en mode debug..."
        if (Stop-Proxy) {
            Write-OK "Proxy precedent arrete"
            $running = Test-ServerUp
        } else {
            Write-Warn "Impossible d'arreter ce proxy : il reste en place, sans fenetre de logs."
        }
    }
}

if ($running) {
    Write-OK "Le proxy tourne deja sur le port $PORT"
}

# ── 3. Lancer le proxy ───────────────────────────────────────
if (-not $running) {
    if ($debug) {
        Write-Step "Demarrage en mode DEBUG (nodemon + logs detailles)..."
        # cmd /k : la fenetre reste ouverte si le proxy plante, pour lire le message. Le chemin
        # complet de proxy.js est donne a nodemon (et non "proxy.js") : c'est ce qui permet a
        # -stop de retrouver le node.exe qu'il lance, dont la ligne de commande reprend ce chemin.
        $nodemonPath = "$DIR\node_modules\.bin\nodemon.cmd"
        $watchArgs = "--watch proxy.js --watch app.js --watch style.css --watch ecoledirecte.html"
        if (Test-Path $nodemonPath) {
            $command = "`"$nodemonPath`" $watchArgs `"$SERVER_SCRIPT`""
        } else {
            $command = "node `"$SERVER_SCRIPT`""
        }
        $server = Start-Process -FilePath "cmd.exe" `
            -ArgumentList "/k cd /d `"$DIR`" && set `"DEBUG=1`" && $command" `
            -WindowStyle Normal -PassThru
    } else {
        Write-Step "Demarrage du proxy..."
        # Lance node.exe directement (pas de wrapper cmd.exe /c && ...) : ce
        # wrapper echoue silencieusement avec -WindowStyle Hidden des que le
        # script appelant (run.ps1) est lui-meme lance de facon detachee/sans
        # fenetre (cas reel d'un double-clic sur le .bat) - confirme en test :
        # le port 3131 ne s'ouvre jamais, sans la moindre erreur visible. Le process
        # suivi est ainsi le proxy lui-meme, dont on lit la fin et le code de sortie.
        $server = Start-Process -FilePath "node.exe" -ArgumentList "`"$SERVER_SCRIPT`"" `
            -WorkingDirectory $DIR -WindowStyle Hidden -PassThru
    }
    # Sous Windows PowerShell, ExitCode reste vide si le handle n'a pas ete lu pendant que le process vivait.
    $null = $server.Handle

    # ── 4. Attendre que le port reponde ──────────────────────
    # Attente bornee par une horloge et non par un nombre de tours : sur un port ferme, Test-ServerUp
    # peut durer jusqu'a 1 s a lui seul (delai de connexion de Windows), ce qui doublerait l'attente.
    $maxWait = if ($debug) { 10 } else { 8 }
    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    while ($timer.Elapsed.TotalSeconds -lt $maxWait -and -not $server.HasExited -and -not (Test-ServerUp)) {
        Start-Sleep -Milliseconds 500
    }

    # En debug, le process suivi est cmd /k, qui reste ouvert meme si le proxy plante (le message
    # est alors dans sa fenetre).
    if ($server.HasExited -and -not $debug) {
        Write-Err "Le proxy s'est arrete au demarrage (code $($server.ExitCode)). Relancez avec -debug pour lire le message."
        Read-Host "Appuyez sur Entree pour fermer"
        exit 1
    }
    if (Test-ServerUp) {
        Write-OK "Proxy demarre sur $APP_URL"
        if ($debug) {
            Write-Host "  Logs URL, body, reponse, GTK et duree actives" -ForegroundColor Yellow
            Write-Host "  Fichiers surveilles : proxy.js, app.js, style.css, ecoledirecte.html" -ForegroundColor Yellow
        }
    } elseif ($debug) {
        Write-Warn "Le proxy ne repond pas : lisez la fenetre de logs. Ouverture quand meme..."
    } else {
        Write-Warn "Le proxy met du temps a demarrer, ouverture quand meme..."
    }
}

# ── 5. Ouvrir dans le navigateur ─────────────────────────────
Write-Step "Ouverture de Mon EcoleDirecte..."
Start-Process $APP_URL
Write-OK "Mon EcoleDirecte est ouvert !"
Write-Host ""
if (-not $debug) {
    Start-Sleep -Seconds 3
}
