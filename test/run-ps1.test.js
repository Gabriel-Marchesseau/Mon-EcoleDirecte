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

test('run.ps1 : usage de l\'en-tete avec -debug / -stop (les parametres du script), pas --debug / --stop', () => {
  const header = runPs1.split('\n').slice(0, 7).join('\n');
  assert.match(header, /\.\\run\.ps1 -debug/);
  assert.match(header, /\.\\run\.ps1 -stop/);
  assert.doesNotMatch(header, /--debug|--stop/);
  assert.match(runPs1, /^param\(\[switch\]\$debug, \[switch\]\$stop\)$/m);
});

test('run.ps1 : le code (hors commentaires) est en ASCII pur', () => {
  // Windows PowerShell 5.1 lit un fichier UTF-8 sans BOM comme de l'ANSI : un accent dans une
  // chaine afficherait du charabia. Les commentaires, eux, peuvent contenir des caracteres non ASCII.
  assert.match(code, /^[\x00-\x7F]*$/);
});
