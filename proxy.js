/**
 * Proxy local HTTPS — EcoleDirecte
 * Gère automatiquement session + double auth
 * Usage : node proxy.js
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

const DEBUG  = process.env.DEBUG === '1';
const CYAN   = s => DEBUG ? `[36m${s}[0m` : s;
const GREEN  = s => DEBUG ? `[32m${s}[0m` : s;
const RED    = s => DEBUG ? `[31m${s}[0m` : s;
const YELLOW = s => DEBUG ? `[33m${s}[0m` : s;
const GRAY   = s => DEBUG ? `[90m${s}[0m` : s;
const BOLD   = s => DEBUG ? `[1m${s}[0m` : s;

function log(...args)      { if (DEBUG) console.log(...args); }
function logAlways(...args) { console.log(...args); }

const BUILD_VERSION = Date.now();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const PORT     = 3131;
const API_HOST = 'api.ecoledirecte.com';

let sslOptions;
try {
  sslOptions = { key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem') };
} catch {
  console.error('❌  Certificat introuvable. Lance : node generate-cert.js');
  process.exit(1);
}

let session = { cookies: {}, gtk: '' };

function parseCookies(setCookieHeaders) {
  const jar = {};
  (setCookieHeaders || []).forEach(c => {
    const [pair] = c.split(';');
    const idx = pair.indexOf('=');
    if (idx > 0) jar[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  });
  return jar;
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join('; ');
}

function apiRequest(method, path, body, extraHeaders) {
  return new Promise((resolve, reject) => {
    const cookieStr = cookieHeader(session.cookies);
    const isPJ = path.includes('/pj/');
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
      'Accept':       isPJ ? '*/*' : 'application/json, text/plain, */*',
      'Referer':      'https://www.ecoledirecte.com/',
      'Origin':       'https://www.ecoledirecte.com',
      'X-ApisVer':    '4.75.0',
      ...(session.gtk ? { 'X-Gtk': session.gtk } : {}),
      ...(cookieStr   ? { 'Cookie': cookieStr }  : {}),
      ...(extraHeaders || {}),
      ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
    };

    const req = https.request({ hostname: API_HOST, port: 443, path, method, headers }, res => {
      const newCookies = parseCookies(res.headers['set-cookie']);
      Object.assign(session.cookies, newCookies);
      if (newCookies['GTK']) session.gtk = newCookies['GTK'];

      const chunks = [];
      res.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const contentType = res.headers['content-type'] || '';
        // Pour les pièces jointes ou réponses non-JSON, transmettre le buffer brut
        const isBinary = path.includes('/pj/') || path.includes('telechargement') || (!contentType.includes('json') && !contentType.includes('text'));
        resolve({ status: res.statusCode, headers: res.headers, body: isBinary ? buffer : buffer.toString('utf8'), isBinary });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function initSession() {
  log(CYAN('  → Init session (GET gtk)...'));
  session = { cookies: {}, gtk: '' };
  await apiRequest('GET', '/v3/login.awp?gtk=1&v=4.75.0', null);
  log(GREEN(`  → GTK: ${session.gtk ? session.gtk.substring(0, 20) + '...' : 'VIDE'}`));
  log(GRAY(`  → Cookies: ${Object.keys(session.cookies).join(', ')}`));
}

const server = https.createServer(sslOptions, async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', '*');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsedUrl = new URL(req.url, 'https://localhost');
  const targetPath = parsedUrl.pathname + (parsedUrl.search || '');

  // Endpoint d'arrêt propre
  if (targetPath === '/shutdown' && req.method === 'POST') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ ok: true }));
    logAlways('\n  Arrêt demandé depuis le navigateur.');
    setTimeout(() => {
      // Tuer le processus cmd parent (fonctionne en mode debug /k et normal /c)
      const { execSync } = require('child_process');
      try {
        // Récupérer le PID du processus parent (cmd.exe) et le terminer
        execSync(`taskkill /PID ${process.ppid} /F /T`, { stdio: 'ignore' });
      } catch(e) {}
      process.exit(0);
    }, 200);
    return;
  }

  // Pour les fichiers statiques GET, pas besoin d'attendre le body
  const parsedPathOnly = new URL(req.url, 'https://localhost').pathname;
  const staticFiles2 = { '/': 'ecoledirecte.html', '/app.js': 'app.js', '/style.css': 'style.css', '/cache.js': 'cache.js', '/ecoledirecte.html': 'ecoledirecte.html', '/favicon.ico': 'favicon.ico' };
  if (staticFiles2[parsedPathOnly] && req.method === 'GET') {
    const filePath = path.join(__dirname, staticFiles2[parsedPathOnly]);
    try {
      let fileContent = fs.readFileSync(filePath);
      const ext = path.extname(filePath);
      // Remplacer __VERSION__ dans HTML et JS
      if (ext === '.html' || ext === '.js') {
        fileContent = fileContent.toString().replace(/__VERSION__/g, BUILD_VERSION);
      }
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain', 'Cache-Control': 'no-cache', 'Access-Control-Allow-Origin': '*' });
      res.end(fileContent);
    } catch(e) {
      res.writeHead(404); res.end('Not found');
    }
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', async () => {
    const t0 = Date.now();
    const method = req.method;
    if (DEBUG) {
      const methodColor = method === 'GET' ? CYAN(method) : method === 'POST' ? GREEN(method) : YELLOW(method);
      log(BOLD(`[${new Date().toLocaleTimeString()}]`) + ` ${methodColor} ${targetPath}`);
      if (body) {
        try { log(GRAY('  → Body: ') + decodeURIComponent(body).substring(0, 200)); }
        catch(e) { log(GRAY('  → Body: ') + body.substring(0, 200)); }
      }
      if (targetPath.includes('login.awp') && method === 'POST') {
        log(YELLOW('  → GTK session: ') + (session.gtk ? session.gtk.substring(0,30)+'...' : RED('VIDE')));
        log(YELLOW('  → X-Gtk client: ') + (req.headers['x-gtk'] ? req.headers['x-gtk'].substring(0,30)+'...' : RED('ABSENT')));
      }
    }

    try {
      const extraHeaders = {};
      if (req.headers['x-token'])    extraHeaders['X-Token']    = req.headers['x-token'];
      if (req.headers['2fa-token'])  extraHeaders['2fa-token']  = req.headers['2fa-token'];
      // Pour les PJ en GET, récupérer le token depuis le query string si absent du header
      if (targetPath.includes('/pj/')) {
        const qs = new URLSearchParams(parsedUrl.search || '');
        const qtok = qs.get('X-Token');
        if (qtok && !extraHeaders['X-Token']) extraHeaders['X-Token'] = qtok;
      }

      // Le GTK est initialisé au démarrage du proxy et renouvelé uniquement
      // quand le client fait lui-même un GET gtk=1 (ce que le HTML fait avant chaque login)
      if (targetPath.includes('login.awp') && targetPath.includes('gtk=1')) {
        await initSession();
      }

      const result = await apiRequest(req.method, targetPath, body || null, extraHeaders);

      if (DEBUG) {
        const duration = Date.now() - t0;
        let responseCode = '?';
        try { responseCode = (typeof result.body === 'string' ? JSON.parse(result.body) : {}).code ?? '—'; } catch(e) {}
        const codeColor = responseCode === 200 ? GREEN(responseCode) : RED(responseCode);
        log(GRAY(`  ← Code API: `) + codeColor + GRAY(` | ${duration}ms`));
        if (result.body && !result.isBinary) {
          const bodyStr = typeof result.body === 'string' ? result.body : '[binary]';
          if (bodyStr.length < 500) log(GRAY('  ← Body: ') + bodyStr.substring(0, 300));
          else log(GRAY(`  ← Body: [${bodyStr.length} chars]`));
        } else if (result.isBinary) {
          log(GRAY(`  ← Binary: [${result.body.length} bytes]`));
        }
      }

      // Pour les fichiers binaires, transmettre directement sans parser JSON
      if (result.isBinary) {
        const contentType = result.headers['content-type'] || 'application/octet-stream';
        const disposition = result.headers['content-disposition'] || '';

        res.writeHead(result.status, {
          'Content-Type': contentType,
          'Content-Disposition': disposition || `attachment; filename="${targetPath.split('/').pop().split('?')[0]}"`,
          'Access-Control-Allow-Origin': '*',
        });
        res.end(result.body);
        return;
      }

      const resHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'X-Gtk-Value',
      };
      // Renvoyer le GTK actuel au client après chaque initSession
      if (session.gtk) resHeaders['X-Gtk-Value'] = session.gtk;

      res.writeHead(200, resHeaders);
      res.end(result.body);

    } catch (err) {
      logAlways(RED(`Erreur : ${err.message}`));
      res.writeHead(502);
      res.end(JSON.stringify({ error: err.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', async () => {
  logAlways(`\n✅  Proxy Mon EcoleDirecte démarré sur https://localhost:${PORT}${DEBUG ? ' [MODE DEBUG]' : ''}\n`);
  if (DEBUG) {
    logAlways(CYAN('  Logs activés : URL, body, réponse, GTK, durée'));
    logAlways(GRAY('  ─────────────────────────────────────────────'));
  }
  await initSession();
  logAlways(DEBUG ? GRAY('  Prêt — en attente de connexions.\n') : '  Prêt.\n');
});
