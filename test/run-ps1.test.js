// Tests statiques de run.ps1 (lanceur Windows). Lancer : npm test
//
// run.ps1 ne lit pas la liste des connexions TCP. Mesure du 2026-11-01 sur le PC de Martial :
// Get-NetTCPConnection, netstat et l'API .NET oublient par moments un port en ecoute (17 fois sur 40
// et 25 sur 40, port systeme 135 compris) alors que 40 connexions sur 40 reussissent et que le PID
// ne change pas ; -State Listen donne en plus des resultats differents entre Windows PowerShell 5.1
// et PowerShell 7. run.ps1 croyait alors le proxy arrete et en lancait un second, ne trouvait pas le
// process a arreter (-stop), ou concluait a un demarrage lent. Ces tests empechent le retour de la
// lecture de la liste des connexions et verrouillent ce que run.ps1 suppose du proxy (port, adresse
// d'ecoute, route /md5). Le comportement reel (demarrage, arret, nodemon, process etranger...) se
// verifie a la main : cf. CLAUDE.md, section « run.ps1 ».
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
const runPs1 = fs.readFileSync(path.join(ROOT, 'run.ps1'), 'utf8');
const proxyJs = fs.readFileSync(path.join(ROOT, 'proxy.js'), 'utf8');
// Sans les lignes de commentaire : un commentaire peut expliquer pourquoi on n'utilise plus une commande.
const code = runPs1.replace(/^\s*#.*$/gm, '');

test('run.ps1 ne lit pas la liste des connexions pour savoir si le proxy tourne', () => {
  assert.doesNotMatch(code, /Get-NetTCPConnection|-State\s+Listen|netstat/i);
  // Une vraie connexion TCP vers 127.0.0.1 : seule celle-ci fait foi.
  assert.match(code, /System\.Net\.Sockets\.TcpClient/);
  assert.match(code, /ConnectAsync\("127\.0\.0\.1", \$PORT\)/);
});

test('run.ps1 retrouve le process a arreter par le chemin COMPLET de proxy.js', () => {
  // D'autres projets (Mon MELCloud...) ont aussi un « node proxy.js » qu'il ne faut jamais arreter.
  assert.match(code, /\$SERVER_SCRIPT\s*=\s*Join-Path \$DIR "proxy\.js"/);
  assert.match(code, /Get-CimInstance Win32_Process -Filter "Name='node\.exe'"/);
  assert.match(code, /IndexOf\(\$SERVER_SCRIPT,/);
  // Lance avec ce chemin complet : sinon la ligne de commande ne le contient pas et -stop ne le retrouve pas.
  assert.match(code, /-ArgumentList "`"\$SERVER_SCRIPT`""/, 'node.exe recoit le chemin complet');
  // nodemon (mode debug) aussi : « nodemon ... proxy.js » lancerait un node.exe au chemin relatif.
  assert.match(code, /\$watchArgs `"\$SERVER_SCRIPT`"/, 'nodemon recoit le chemin complet');
  assert.doesNotMatch(code, /--watch ecoledirecte\.html proxy\.js/);
});

test('run.ps1 suppose le port, l\'adresse d\'ecoute et la route /md5 que proxy.js fournit', () => {
  const port = code.match(/^\$PORT = (\d+)$/m);
  assert.ok(port, '$PORT defini dans run.ps1');
  assert.match(proxyJs, new RegExp(`^const PORT\\s*= ${port[1]};`, 'm'), 'meme port que proxy.js');
  // Le proxy n'ecoute que sur 127.0.0.1 : c'est la seule adresse a sonder.
  assert.match(proxyJs, /server\.listen\(PORT, '127\.0\.0\.1'/);
  // Reconnaissance du proxy : GET /md5?s=<PROBE_INPUT> doit rendre {"hash": md5(PROBE_INPUT)}.
  assert.match(proxyJs, /pathname === '\/md5' && req\.method === 'GET'/);
  assert.match(proxyJs, /JSON\.stringify\(\{ hash \}\)/);
  const input = code.match(/^\$PROBE_INPUT = "([^"]+)"$/m);
  const hash = code.match(/^\$PROBE_HASH = "([0-9a-f]{32})"$/m);
  assert.ok(input && hash, '$PROBE_INPUT et $PROBE_HASH definis dans run.ps1');
  assert.equal(crypto.createHash('md5').update(input[1], 'utf8').digest('hex'), hash[1]);
  assert.match(code, /\/md5\?s=\$PROBE_INPUT/);
  // Repli de -stop pour un proxy lance a la main : son propre point d'arret.
  assert.match(proxyJs, /targetPath === '\/shutdown' && req\.method === 'POST'/);
  assert.match(code, /Invoke-ProxyRequest "POST" "\/shutdown"/);
});

test('run.ps1 : usage de l\'en-tete avec -debug / -stop / -SansNavigateur / -http (les parametres du script), pas --debug / --stop', () => {
  const header = runPs1.split('\n').slice(0, 13).join('\n');
  assert.match(header, /\.\\run\.ps1 -debug/);
  assert.match(header, /\.\\run\.ps1 -stop/);
  assert.match(header, /\.\\run\.ps1 -SansNavigateur/);
  assert.match(header, /\.\\run\.ps1 -http/);
  assert.doesNotMatch(header, /--debug|--stop/);
  assert.match(runPs1, /^param\(\[switch\]\$debug, \[switch\]\$stop, \[switch\]\$sansNavigateur, \[switch\]\$http\)$/m);
});

test('run.ps1 : un seul Read-Host (celui de Wait-ForKey, qui ne pose pas la question avec -SansNavigateur) et le mode HTTP', () => {
  assert.equal((code.match(/Read-Host/g) || []).length, 1);
  assert.match(code, /function Wait-ForKey \{\s*if \(-not \$sansNavigateur\) \{ Read-Host "Appuyez sur Entree pour fermer" \}\s*\}/);
  assert.ok((code.match(/Wait-ForKey/g) || []).length >= 4, 'une definition et trois appels');
  assert.match(code, /if \(\$sansNavigateur\) \{\s*Write-OK "Proxy pret sur \$APP_URL \(navigateur non ouvert\)"\s*exit 0\s*\}/);
  // Mode HTTP : -http ou fichier mode-http, HTTP_MODE=1 pour proxy.js (qui le lit), jamais herite sans mode HTTP
  assert.match(code, /\$httpMode = \$http\.IsPresent -or \(Test-Path \(Join-Path \$DIR "mode-http"\)\)/);
  assert.match(code, /\$env:HTTP_MODE = "1"/);
  assert.match(code, /Remove-Item Env:\\HTTP_MODE/);
  assert.match(proxyJs, /const HTTP_MODE = process\.env\.HTTP_MODE === '1';/);
  // Aucun certificat n'est exige en mode HTTP
  assert.match(code, /if \(-not \$httpMode -and -not \(Test-Path "\$DIR\\cert\.pem"\)\)/);
});

test('run.ps1 : le code (hors commentaires) est en ASCII pur', () => {
  // Windows PowerShell 5.1 lit un fichier UTF-8 sans BOM comme de l'ANSI : un accent dans une
  // chaine afficherait du charabia. Les commentaires, eux, peuvent contenir des caracteres non ASCII.
  assert.match(code, /^[\x00-\x7F]*$/);
});

// ---- Le comportement reel de run.ps1 : -SansNavigateur et le mode HTTP --------------------------------------------
//
// Contrat dont depend le Gestionnaire d'applications (D:\Documents\Martial\Gestionnaire-de-mes-applications), qui demarre
// ce serveur sur un PC Windows par SSH, sans personne devant l'ecran : avec -SansNavigateur, run.ps1 n'ouvre jamais le
// navigateur, ne pose jamais de question (Read-Host) et rend 0 si le proxy repond sur son port, 1 sinon. En mode HTTP
// (-http, ou fichier mode-http dans le dossier), il lance le proxy avec HTTP_MODE=1 et le sonde en HTTP : aucun
// certificat, aucune entree hosts. Ces tests lancent le VRAI run.ps1 avec le vrai PowerShell, sur une copie dans un
// dossier temporaire : le port est remplace par un port libre, « Start-Process $APP_URL » par l'ecriture d'un
// fichier-temoin (aucun navigateur ne s'ouvre pendant les tests) et proxy.js par un faux serveur qui repond a /md5 et
// /shutdown comme le vrai (HTTP si HTTP_MODE=1, sinon HTTPS avec key.pem et cert.pem du dossier). Le vrai proxy n'est
// jamais lance ni arrete, et generate-cert.js n'est jamais lance (il ecrit dans le dossier courant).
const { spawn, spawnSync, execFileSync } = require('node:child_process');
const http = require('node:http');
const https = require('node:https');
const net = require('node:net');
const os = require('node:os');

const POWERSHELL = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
const skip = process.platform === 'win32' && fs.existsSync(POWERSHELL) ? false : 'PowerShell de Windows introuvable';
const OPENSSL = ['C:\\Program Files\\Git\\usr\\bin\\openssl.exe', 'C:\\Program Files\\Git\\mingw64\\bin\\openssl.exe'].find((file) => fs.existsSync(file));
const skipHttps = skip || (OPENSSL ? false : 'openssl introuvable (certificat de test)');

const FAKE_PROXY = [
  "const http = require('http');",
  "const https = require('https');",
  "const fs = require('fs');",
  "const crypto = require('crypto');",
  "if (process.env.FAKE_PROXY === 'exit') process.exit(3);",
  "if (process.env.FAKE_PROXY === 'silent') { setInterval(() => {}, 1000); return; }",
  'const handler = (req, res) => {',
  "  const url = new URL(req.url, 'http://x');",
  "  if (url.pathname === '/md5' && req.method === 'GET') {",
  "    res.setHeader('Content-Type', 'application/json');",
  "    res.end(JSON.stringify({ hash: crypto.createHash('md5').update(url.searchParams.get('s') || '').digest('hex') }));",
  '    return;',
  '  }',
  "  if (url.pathname === '/shutdown' && req.method === 'POST') { res.end('ok'); setTimeout(() => process.exit(0), 50); return; }",
  '  res.statusCode = 404; res.end();',
  '};',
  "const server = process.env.HTTP_MODE === '1'",
  '  ? http.createServer(handler)',
  "  : https.createServer({ key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem') }, handler);",
  "server.listen(Number(process.env.PORT), '127.0.0.1');",
  '',
].join('\n');

function freePort() {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

function cleanEnv(extra) {
  const env = { ...process.env };
  // Les variables de l'appli ne doivent pas venir du PC de test (Windows ignore la casse des noms)
  for (const key of Object.keys(env)) if (/^(HTTP_MODE$|FAKE_PROXY$|PORT$)/i.test(key)) delete env[key];
  const nodeDir = path.dirname(process.execPath);
  return { ...env, PATH: `${nodeDir};${env.PATH || env.Path || ''}`, ...extra };
}

// Une copie de run.ps1 dans un dossier temporaire, avec un faux proxy.js. `https` : un certificat de test y est ajoute.
async function setup(t, { fake, withCert = false, modeFile = false, env: extraEnv = {} } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ecoledirecte-run-'));
  const port = await freePort();
  const swap = (text, from, to) => {
    assert.equal(text.split(from).length - 1, 1, `motif introuvable dans run.ps1 : ${from}`);
    return text.replace(from, () => to);
  };
  let script = swap(runPs1, '$PORT = 3131', `$PORT = ${port}`);
  script = swap(script, 'Start-Process $APP_URL', "Set-Content -Path (Join-Path $DIR 'navigateur-ouvert.txt') -Value $APP_URL");
  fs.writeFileSync(path.join(dir, 'run.ps1'), script);
  fs.writeFileSync(path.join(dir, 'proxy.js'), FAKE_PROXY);
  for (const name of ['ecoledirecte.html', 'app.js', 'style.css']) fs.writeFileSync(path.join(dir, name), '');
  fs.mkdirSync(path.join(dir, 'node_modules'));
  if (withCert) {
    execFileSync(OPENSSL, ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', path.join(dir, 'key.pem'), '-out', path.join(dir, 'cert.pem'), '-subj', '/CN=localhost', '-days', '2'], { stdio: 'ignore' });
  }
  if (modeFile) fs.writeFileSync(path.join(dir, 'mode-http'), '');
  const env = cleanEnv({ PORT: String(port), ...(fake ? { FAKE_PROXY: fake } : {}), ...extraEnv });
  const killAll = () => {
    // Tout node.exe dont la ligne de commande reprend ce dossier temporaire (le faux proxy) est arrete.
    spawnSync(POWERSHELL, ['-NoProfile', '-NonInteractive', '-Command',
      "Get-CimInstance Win32_Process -Filter \"Name='node.exe'\" | Where-Object { $_.CommandLine -and $_.CommandLine.IndexOf($env:T_DIR, [System.StringComparison]::OrdinalIgnoreCase) -ge 0 } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"],
    { env: { ...process.env, T_DIR: dir }, timeout: 30000 });
  };
  t.after(() => {
    killAll();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  const run = (...args) => new Promise((resolve) => {
    const child = spawn(POWERSHELL, ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(dir, 'run.ps1'), ...args], {
      cwd: dir, env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), 60000);
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    // « exit » et non « close » : le serveur lance par run.ps1 pourrait garder les tubes ouverts
    child.on('exit', (exitCode) => {
      clearTimeout(timer);
      resolve({ code: exitCode, stdout, stderr });
    });
  });
  // Le proxy repond-il a /md5, en HTTP ou en HTTPS (certificat de test accepte) ?
  const answers = (scheme) => new Promise((resolve) => {
    const client = scheme === 'https' ? https : http;
    const req = client.get({ host: '127.0.0.1', port, path: '/md5?s=x', timeout: 2000, rejectUnauthorized: false }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
  // Un proxy lance « a la main », avec un chemin relatif : run.ps1 -stop ne le retrouve pas par sa ligne de commande.
  const startByHand = (extra = {}) => spawn(process.execPath, ['proxy.js'], { cwd: dir, env: { ...env, ...extra }, windowsHide: true, stdio: 'ignore' });
  return { dir, port, run, answers, startByHand, opened: () => fs.existsSync(path.join(dir, 'navigateur-ouvert.txt')), openedWith: () => fs.readFileSync(path.join(dir, 'navigateur-ouvert.txt'), 'utf8').trim() };
}

async function waitFor(condition, ms = 10000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    if (await condition()) return true;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  return false;
}

test('-SansNavigateur -http : demarre le proxy en HTTP sans certificat, rend 0, aucun navigateur ; un second passage rend 0 ; -stop l\'arrete', { skip }, async (t) => {
  const pc = await setup(t);
  const first = await pc.run('-SansNavigateur', '-http');
  assert.equal(first.code, 0, first.stdout + first.stderr);
  assert.match(first.stdout, new RegExp(`Proxy demarre sur http://localhost:${pc.port}`));
  assert.match(first.stdout, /navigateur non ouvert/);
  assert.equal(await pc.answers('http'), true, 'le proxy repond en HTTP');
  assert.equal(pc.opened(), false, 'aucun navigateur ouvert');
  assert.doesNotMatch(first.stdout + first.stderr, /Appuyez sur Entree|cert\.pem manquant/);

  const second = await pc.run('-SansNavigateur', '-http');
  assert.equal(second.code, 0, second.stdout + second.stderr);
  assert.match(second.stdout, /tourne deja/);

  const stopped = await pc.run('-stop', '-http');
  assert.equal(stopped.code, 0);
  assert.match(stopped.stdout, /Proxy arrete/);
  assert.equal(await waitFor(async () => !(await pc.answers('http'))), true, 'le proxy est arrete');
});

test('un fichier mode-http dans le dossier rend le mode HTTP implicite (Start_Mon_EcoleDirecte.bat marche sur un PC installe par le Gestionnaire)', { skip }, async (t) => {
  const pc = await setup(t, { modeFile: true });
  const result = await pc.run('-SansNavigateur');
  assert.equal(result.code, 0, result.stdout + result.stderr);
  assert.match(result.stdout, new RegExp(`Proxy demarre sur http://localhost:${pc.port}`));
  assert.equal(await pc.answers('http'), true);
  // Sans -SansNavigateur, le navigateur s'ouvre (ici : fichier-temoin) a l'adresse HTTP
  const normal = await pc.run();
  assert.equal(normal.code, 0, normal.stdout + normal.stderr);
  assert.equal(pc.openedWith(), `http://localhost:${pc.port}`);
});

test('mode HTTPS (sans -http ni mode-http) : comportement d\'avant, avec certificat ; un HTTP_MODE herite de l\'environnement est retire', { skip: skipHttps }, async (t) => {
  // HTTP_MODE=1 dans l'environnement de run.ps1 ferait tourner le proxy en HTTP pendant que run.ps1 le sonde en HTTPS
  const pc = await setup(t, { withCert: true, env: { HTTP_MODE: '1' } });
  const result = await pc.run('-SansNavigateur');
  assert.equal(result.code, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Proxy demarre sur https:\/\/monecoledirecte\.local/);
  assert.equal(await pc.answers('https'), true, 'le proxy repond en HTTPS');
  assert.equal(await pc.answers('http'), false, 'et pas en HTTP');
  assert.equal(pc.opened(), false);
  const second = await pc.run('-SansNavigateur');
  assert.equal(second.code, 0);
  assert.match(second.stdout, /tourne deja/);
  const stopped = await pc.run('-stop');
  assert.match(stopped.stdout, /Proxy arrete/);
  assert.equal(await waitFor(async () => !(await pc.answers('https'))), true);
});

test('mode HTTPS sans certificat : erreur claire, rend 1 sans question', { skip }, async (t) => {
  const pc = await setup(t);
  const result = await pc.run('-SansNavigateur');
  assert.equal(result.code, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /cert\.pem manquant/);
  assert.doesNotMatch(result.stdout + result.stderr, /Appuyez sur Entree/);
  assert.equal(pc.opened(), false);
});

test('-stop retrouve un proxy lance a la main (chemin relatif) par son propre POST /shutdown, en HTTP comme en HTTPS', { skip: skipHttps }, async (t) => {
  const http1 = await setup(t);
  const byHand = http1.startByHand({ HTTP_MODE: '1' });
  t.after(() => byHand.kill());
  assert.equal(await waitFor(() => http1.answers('http')), true, 'le proxy lance a la main repond');
  const stopped = await http1.run('-stop', '-http');
  assert.match(stopped.stdout, /arret demande par \/shutdown/);
  assert.equal(await waitFor(async () => !(await http1.answers('http'))), true);

  const https1 = await setup(t, { withCert: true });
  const byHandTls = https1.startByHand();
  t.after(() => byHandTls.kill());
  assert.equal(await waitFor(() => https1.answers('https')), true);
  const stoppedTls = await https1.run('-stop');
  assert.match(stoppedTls.stdout, /arret demande par \/shutdown/);
  assert.equal(await waitFor(async () => !(await https1.answers('https'))), true);
});

test('-SansNavigateur : un proxy qui s\'arrete au demarrage -> 1 ; un proxy en vie qui ne repond jamais -> 1', { skip }, async (t) => {
  const crash = await setup(t, { fake: 'exit' });
  const crashed = await crash.run('-SansNavigateur', '-http');
  assert.equal(crashed.code, 1, crashed.stdout + crashed.stderr);
  assert.match(crashed.stdout, /s'est arrete au demarrage \(code 3\)/);
  assert.doesNotMatch(crashed.stdout + crashed.stderr, /Appuyez sur Entree/);

  const silent = await setup(t, { fake: 'silent' });
  const hung = await silent.run('-SansNavigateur', '-http');
  assert.equal(hung.code, 1, hung.stdout + hung.stderr);
  assert.match(hung.stdout, /Le proxy ne repond pas apres 8 s/);
  assert.doesNotMatch(hung.stdout + hung.stderr, /Appuyez sur Entree/);
  assert.equal(silent.opened(), false);
});

test('-SansNavigateur : un autre programme sur le port -> 1, sans question, il n\'est pas arrete', { skip }, async (t) => {
  const pc = await setup(t);
  const stranger = http.createServer((req, res) => { res.statusCode = 404; res.end('autre'); });
  await new Promise((resolve) => stranger.listen(pc.port, '127.0.0.1', resolve));
  t.after(() => stranger.close());
  const result = await pc.run('-SansNavigateur', '-http');
  assert.equal(result.code, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /occupe par un autre programme/);
  assert.doesNotMatch(result.stdout + result.stderr, /Appuyez sur Entree/);
  assert.equal(pc.opened(), false);
});

test('-SansNavigateur avec -debug : refuse (1), rien n\'est lance', { skip }, async (t) => {
  const pc = await setup(t);
  const result = await pc.run('-SansNavigateur', '-debug', '-http');
  assert.equal(result.code, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /s'excluent/);
  assert.equal(await pc.answers('http'), false);
});
