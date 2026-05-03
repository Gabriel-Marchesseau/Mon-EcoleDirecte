// ── Dark mode ────────────────────────────────────────────────────
// Appliquer la préférence sauvegardée au chargement

// Injecter les styles dark mode pour les éléments dynamiques
const darkStyle = document.createElement('style');
darkStyle.textContent = `
  body.dark .card { background: var(--bg2); border-color: var(--border); }
  body.dark input, body.dark textarea, body.dark select { background: var(--input-bg); color: var(--text); border-color: var(--border); }
  body.dark .btn { background: var(--bg3); color: var(--text); border-color: var(--border); }
  body.dark .btn:hover { background: var(--bg4); }
  body.dark .btn-primary { background: var(--text); color: var(--bg); border-color: var(--text); }
  body.dark .btn-primary:hover { background: var(--text2); }
  body.dark .tab { color: var(--text3); }
  body.dark .tab.active { color: var(--text); border-bottom-color: var(--text); }
  body.dark .tab-bar { border-bottom-color: var(--border); }
  body.dark .edt-grid { border-color: var(--border); }
  body.dark .edt-header { background: var(--bg3); border-bottom-color: var(--border); color: var(--text); }
  body.dark .edt-header.today { background: #e0e0e0; color: #1a1a1a; }
  body.dark .edt-header.past { color: var(--text4); }
  body.dark .edt-day-col { border-right-color: var(--border); }
  body.dark .edt-day-col.past { background: #1e1e1e; }
  body.dark .edt-day-col.today { background: #1e2a1e; }
  body.dark .edt-time-col { border-right-color: var(--border); }
  body.dark .edt-slot { border-bottom-color: var(--border2); }
  body.dark .result-box { background: var(--bg3); color: var(--text); }
  body.dark .divider { border-top-color: var(--border); }
  body.dark .status.info { background: #1e3a5f; color: #93c5fd; }
  body.dark .status.success { background: #1a3a2a; color: #6ee7b7; }
  body.dark .status.error { background: #3a1a1a; color: #fca5a5; }
  body.dark #security-panel { background: var(--bg3); border-color: var(--border); }
  .pj-badge { border: 1px solid #bfdbfe; display:inline-block; line-height:1.5; vertical-align:middle; }
  body.dark .pj-badge { background: #1e3a5f !important; color: #93c5fd !important; border-color: #1e40af !important; }
  body.dark .child-account-select { background: #2a2a2a !important; border-color: #444 !important; color: #e8e8e6 !important; }
  body.dark .child-account-select:hover { background: #333 !important; border-color: #666 !important; }
  body.dark #notes-view-toggle { background: #242424 !important; border-color: var(--border) !important; }
  .postits-list { display:flex;flex-direction:column;gap:16px;padding:4px 0; }
  .postit-card { border-radius:10px;border-left:4px solid #6b7280;background:var(--bg2);padding:16px;box-shadow:0 1px 4px rgba(0,0,0,.06); }
  .postit-card.type-info { border-left-color:#1d4ed8;background:#eff6ff; }
  .postit-card.type-alerte { border-left-color:#ca8a04;background:#fefce8; }
  .postit-card.type-urgence { border-left-color:#dc2626;background:#fff1f2; }
  body.dark .postit-card { background:var(--bg3); }
  body.dark .postit-card.type-info { background:#1e2a3a; }
  body.dark .postit-card.type-alerte { background:#2a2515; }
  body.dark .postit-card.type-urgence { background:#2a1515; }
  .postit-meta { display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--text3);margin-bottom:10px;gap:8px;flex-wrap:wrap; }
  .postit-type { text-transform:uppercase;font-size:11px;font-weight:600;letter-spacing:.05em; }
  .postit-type.type-info { color:#1d4ed8; }
  .postit-type.type-alerte { color:#ca8a04; }
  .postit-type.type-urgence { color:#dc2626; }
  .postit-content { font-size:13px;line-height:1.6;color:var(--text); }
  body.dark .postit-content, body.dark .postit-content * { color:var(--text) !important; }
  body.dark .postit-content [style*="background"], body.dark #msg-dialog-content [style*="background"] { background-color: transparent !important; }
  .postit-content ul, .postit-content ol { padding-left:1.5em;margin:6px 0; }
  .postit-content p { margin:4px 0; }
  .postit-author { font-size:12px;color:var(--text3);margin-top:10px;padding-top:8px;border-top:1px solid var(--border2); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; appearance:textfield; }
  .panier-card { transition:background .15s; }
  .panier-card:hover { background:var(--bg4) !important; }
  .panier-row { transition:background .15s; border-radius:6px; }
  .panier-row:hover { background:var(--bg2) !important; }
  .btn-add-panier { transition:filter .15s; }
  .btn-add-panier:not([disabled]):hover { filter:brightness(1.15); }
  .btn-remove-panier { transition:background .15s, color .15s; }
  .btn-remove-panier:hover { background:#fee2e2 !important; color:#991b1b !important; }
  body.dark .btn-remove-panier:hover { background:#3a1515 !important; color:#fca5a5 !important; }
`;
document.head.appendChild(darkStyle);
(function() {
  const saved = localStorage.getItem('ed_dark');
  // Si dark-pending est là (mis par le script inline du head), appliquer
  if (saved === '1' || document.documentElement.classList.contains('dark-pending')) {
    applyDark(true);
    document.documentElement.classList.remove('dark-pending');
  }
})();

let token = '';
let accountData = null;
let sessionExpired = false;


function getProxy() { return window.location.origin; }

// ── Version API EcoleDirecte ────────────────────────────────
const API_VERSION = '4.98.0';

// ── Routeur ────────────────────────────────────────────────
const ROUTE_TO_TAB = { '/accueil': 'accueil', '/edt': 'edt', '/notes': 'notes', '/devoirs': 'devoirs', '/seances': 'seances', '/messages': 'messages', '/vie-scolaire': 'absences', '/memos': 'memos', '/documents-parent': 'documents-parent', '/finances-parent': 'finances-parent', '/vie-scolaire-parent': 'viescolaire-parent' };
const TAB_TO_ROUTE = { 'accueil': '/accueil', 'edt': '/edt', 'notes': '/notes', 'devoirs': '/devoirs', 'seances': '/seances', 'messages': '/messages', 'absences': '/vie-scolaire', 'memos': '/memos', 'documents-parent': '/documents-parent', 'finances-parent': '/finances-parent', 'viescolaire-parent': '/vie-scolaire-parent' };

// Paramètres utilisateur — onglets courants + compte actif
let _currentTabs = [];
let _currentAccountId = '';
let _settingsPendingDefault = 'accueil';
let _settingsOverlayEl = null;
// Vue enfant (compte parent visualisant un élève associé)
let _childEleveView = null; // null | { id, nom, prenom, classeId }
function getTabFromPath() { return ROUTE_TO_TAB[location.pathname] || null; }
window.addEventListener('popstate', () => { const t = getTabFromPath(); if (t) switchTab(t, true); });
function getCurrentAnnee() {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 8 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function getEleveId() {
  if (!accountData) return '';
  const acc = accountData.accounts ? accountData.accounts[0] : accountData;
  return acc.id || '';
}
// Pour les endpoints /v3/eleves/{id}/... : renvoie l'ID de l'élève même depuis un compte parent
function getChildEleveId() {
  if (!accountData) return '';
  const acc = accountData.accounts ? accountData.accounts[0] : accountData;
  if (acc?.typeCompte === 'E') return acc.id || '';
  return acc?.profile?.eleves?.[0]?.id || acc?.eleves?.[0]?.id || acc.id || '';
}

function showStatus(el, msg, type) { el.innerHTML = `<div class="status ${type}">${msg}</div>`; }

async function checkProxy() {
  const badge = document.getElementById('proxy-badge');
  badge.className = 'badge pending'; badge.textContent = 'Vérification…';
  try {
    // Utilise un OPTIONS pour vérifier que le proxy répond sans déclencher initSession
    const r = await fetch(`${getProxy()}/v3/login.awp?v=${API_VERSION}`, { method: 'OPTIONS' });
    badge.className = 'badge ok'; badge.textContent = 'Connecté ✓';
  } catch(e) {
    badge.className = 'badge ko'; badge.textContent = 'Injoignable';
  }
}

async function getGtk() {
  try {
    const r = await fetch(`${getProxy()}/v3/login.awp?gtk=1&v=${API_VERSION}`);
    const gtk = r.headers.get('X-Gtk-Value') || '';
    return gtk;
  } catch { return ''; }
}

let twoFaToken = '';

async function doLogin() {
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  if (!u || !p) { showStatus(document.getElementById('login-status'), 'Renseigne tes identifiants.', 'error'); return; }
  document.getElementById('login-btn').disabled = true;
  document.getElementById('login-spinner').style.display = 'inline';
  const statusEl = document.getElementById('login-status');
  showStatus(statusEl, 'Connexion…', 'info');
  try {
    const gtk = await getGtk();
    const payload = { identifiant: u, motdepasse: p, isReLogin: false, uuid: '', fa: [] };
    const body = `data=${encodeURIComponent(JSON.stringify(payload))}`;
    const resp = await fetch(`${getProxy()}/v3/login.awp?v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-ApisVer': API_VERSION, 'X-Gtk': gtk },
      body
    });
    const data = await resp.json();
    if (data.code === 200) {
      token = data.token; accountData = data.data;
      localStorage.setItem('ed_session', JSON.stringify({ token: data.token, twoFaToken: '', accountData: data.data, fa: [], u, p }));
      onLoggedIn(data.data);
    } else if (data.code === 250) {
      // Double auth requise — récupérer le QCM
      twoFaToken = data.token;
      await loadDoubleAuth(data.token);
      document.getElementById('login-btn').disabled = false;
    } else {
      showStatus(statusEl, `Erreur ${data.code} : ${data.message || 'Identifiants invalides.'}`, 'error');
      document.getElementById('login-btn').disabled = false;
    }
  } catch(e) {
    showStatus(statusEl, `Erreur réseau : ${e.message}`, 'error');
    document.getElementById('login-btn').disabled = false;
  }
  document.getElementById('login-spinner').style.display = 'none';
}

async function loadDoubleAuth(twoFaTokenValue) {
  const statusEl = document.getElementById('login-status');
  showStatus(statusEl, 'Chargement de la question de sécurité…', 'info');
  try {
    const resp = await fetch(`${getProxy()}/v3/connexion/doubleauth.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        '2fa-token': twoFaTokenValue,
        'X-Token': twoFaTokenValue,
      },
      body: 'data={}'
    });
    const data = await resp.json();
    if (data.code === 200 && data.data) {
      showQcm(data.data, twoFaTokenValue);
    } else {
      showStatus(statusEl, `Erreur double auth (${data.code}) : ${data.message}`, 'error');
    }
  } catch(e) {
    showStatus(statusEl, `Erreur double auth : ${e.message}`, 'error');
  }
}

function showQcm(data, twoFaTokenValue) {
  const b64 = s => {
    try {
      // Décoder base64 puis gérer l'encodage UTF-8 correctement
      const binary = atob(s);
      try {
        return decodeURIComponent(binary.split('').map(c =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
      } catch { return binary; }
    } catch { return s; }
  };
  const question = b64(data.question || data.libelle || '');
  const propositions = data.propositions || data.choices || data.reponses || [];

  // Réponses automatiques — uniquement depuis les règles personnalisées (localStorage)
  const secRules = loadSecuritySettings();
  const qLow = question.toLowerCase();

  const matchingValues = secRules
    .filter(r => r.keyword && qLow.includes(r.keyword.toLowerCase()))
    .map(r => r.value);

  // Générer des variantes de casse et d'encodage pour chaque valeur
  const candidates = [];
  matchingValues.forEach(v => {
    candidates.push(v, v.toLowerCase(), v.toUpperCase(),
      v.charAt(0).toUpperCase() + v.slice(1),
      'fÃ©vrier', 'FÃ©vrier');
  });

  if (candidates.length > 0) {
    const match = propositions.find(pr => {
      const label = b64(pr.label || pr.libelle || pr.valeur || pr).trim();
      return candidates.some(k => label === k || label.toLowerCase() === k.toLowerCase());
    });
    if (match) {
      const raw = match.id || match.valeur || match;
      document.getElementById('login-status').innerHTML = '<div class="status info">Question de sécurité répondue automatiquement…</div>';
      setTimeout(() => submitDoubleAuth(raw, twoFaTokenValue), 300);
      return;
    }
  }

  // Pas de réponse auto trouvée — afficher manuellement
  document.getElementById('qcm-area').style.display = 'block';
  document.getElementById('qcm-question').textContent = question;
  const el = document.getElementById('qcm-choices');
  el.innerHTML = '';
  if (propositions.length === 0) {
    el.innerHTML = '<p style="font-size:14px;color:var(--text3);">Aucune proposition trouvée.</p>';
  }
  const grid = document.createElement('div');
  grid.className = 'qcm-grid';
  const sortedProps = propositions.slice().sort((a, b) => {
    const la = b64(a.label || a.libelle || a.valeur || a);
    const lb = b64(b.label || b.libelle || b.valeur || b);
    const na = parseFloat(la), nb = parseFloat(lb);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return la.localeCompare(lb, 'fr');
  });
  sortedProps.forEach(pr => {
    const raw = pr.id || pr.valeur || pr;
    const label = b64(pr.label || pr.libelle || pr.valeur || pr);
    const btn = document.createElement('button');
    btn.className = 'qcm-btn';
    btn.textContent = label;
    btn.onclick = () => submitDoubleAuth(raw, twoFaTokenValue, question, label);
    grid.appendChild(btn);
  });
  el.appendChild(grid);
  document.getElementById('login-status').innerHTML = '<div class="status info">Réponds à la question de sécurité.</div>';
}

async function submitDoubleAuth(choice, twoFaTokenValue, question = null, choiceLabel = null) {
  const statusEl = document.getElementById('login-status');
  showStatus(statusEl, 'Vérification…', 'info');
  try {
    const body = `data=${encodeURIComponent(JSON.stringify({ choix: choice }))}`;
    const resp = await fetch(`${getProxy()}/v3/connexion/doubleauth.awp?verbe=post&v=${API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        '2fa-token': twoFaTokenValue,
        'X-Token': twoFaTokenValue,
      },
      body
    });
    const data = await resp.json();
    if (data.code === 200 && data.data && data.data.cn) {
      // Réponse valide — sauvegarder automatiquement la règle si clic manuel
      if (question && choiceLabel) maybeAutoSaveSecRule(question, choiceLabel);
      // On a le token FA, on relance le login avec fa rempli
      const fa = [{ cn: data.data.cn, cv: data.data.cv }];
      await loginWithFa(fa);
    } else {
      showStatus(statusEl, `Mauvaise réponse (${data.code}) : ${data.message}`, 'error');
    }
  } catch(e) {
    showStatus(statusEl, `Erreur : ${e.message}`, 'error');
  }
}

function maybeAutoSaveSecRule(question, label) {
  const rules = loadSecuritySettings();
  const qLow = question.toLowerCase();
  // Ne pas ajouter si une règle couvre déjà cette question
  const alreadyCovered = rules.some(r => r.keyword && qLow.includes(r.keyword.toLowerCase()));
  if (!alreadyCovered) {
    rules.push({ keyword: question, value: label });
    localStorage.setItem(SEC_KEY, JSON.stringify(rules));
  }
}

let loginFa = [];

async function loginWithFa(fa) {
  loginFa = fa;
  const statusEl = document.getElementById('login-status');
  showStatus(statusEl, 'Finalisation de la connexion…', 'info');
  const u = document.getElementById('username').value.trim();
  const p = document.getElementById('password').value.trim();
  try {
    // Nouveau GTK frais juste avant le second login
    const gtk = await getGtk();
    const payload = { identifiant: u, motdepasse: p, isReLogin: false, uuid: '', fa };
    const body = `data=${encodeURIComponent(JSON.stringify(payload))}`;
    const resp = await fetch(`${getProxy()}/v3/login.awp?v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-ApisVer': API_VERSION, 'X-Gtk': gtk },
      body
    });
    const data = await resp.json();
    if (data.code === 200) {
      token = data.token; accountData = data.data;
      localStorage.setItem('ed_session', JSON.stringify({ token: data.token, twoFaToken, accountData: data.data, fa: loginFa, u, p }));
      onLoggedIn(data.data);
    } else {
      showStatus(statusEl, `Erreur login final (${data.code}) : ${data.message}`, 'error');
    }
  } catch(e) {
    showStatus(statusEl, `Erreur : ${e.message}`, 'error');
  }
}

// ── Reconnexion silencieuse (session expirée) ──────────────────────────────
async function silentReauth(savedSession) {
  if (!savedSession.u || !savedSession.p) { enterExpiredMode(); return; }
  try {
    const gtk = await getGtk();
    const fa = savedSession.fa || [];
    const payload = { identifiant: savedSession.u, motdepasse: savedSession.p, isReLogin: false, uuid: '', fa };
    const body = `data=${encodeURIComponent(JSON.stringify(payload))}`;
    const resp = await fetch(`${getProxy()}/v3/login.awp?v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-ApisVer': API_VERSION, 'X-Gtk': gtk },
      body
    });
    const data = await resp.json();
    if (data.code === 200) {
      token = data.token; twoFaToken = savedSession.twoFaToken || '';
      localStorage.setItem('ed_session', JSON.stringify({ ...savedSession, token: data.token, twoFaToken: savedSession.twoFaToken || '', accountData: data.data }));
    } else if (data.code === 250) {
      await silentDoubleAuth(data.token, savedSession);
    } else {
      enterExpiredMode();
    }
  } catch(e) {
    enterExpiredMode();
  }
}

async function silentDoubleAuth(twoFaTokenValue, savedSession) {
  try {
    const resp = await fetch(`${getProxy()}/v3/connexion/doubleauth.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', '2fa-token': twoFaTokenValue, 'X-Token': twoFaTokenValue },
      body: 'data={}'
    });
    const data = await resp.json();
    if (data.code !== 200 || !data.data) { enterExpiredMode(); return; }
    const b64 = s => {
      try {
        const bin = atob(s);
        try { return decodeURIComponent(bin.split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')); }
        catch { return bin; }
      } catch { return s; }
    };
    const question = b64(data.data.question || data.data.libelle || '');
    const propositions = data.data.propositions || data.data.choices || data.data.reponses || [];
    const secRules = loadSecuritySettings();
    const qLow = question.toLowerCase();
    const matchingValues = secRules.filter(r => r.keyword && qLow.includes(r.keyword.toLowerCase())).map(r => r.value);
    const candidates = [];
    matchingValues.forEach(v => { candidates.push(v, v.toLowerCase(), v.toUpperCase(), v.charAt(0).toUpperCase() + v.slice(1), 'fÃ©vrier', 'FÃ©vrier'); });
    const match = candidates.length > 0 && propositions.find(pr => {
      const label = b64(pr.label || pr.libelle || pr.valeur || pr).trim();
      return candidates.some(k => label === k || label.toLowerCase() === k.toLowerCase());
    });
    if (match) {
      await silentSubmitDoubleAuth(match.id || match.valeur || match, twoFaTokenValue, savedSession);
    } else {
      enterExpiredMode();
    }
  } catch(e) {
    enterExpiredMode();
  }
}

async function silentSubmitDoubleAuth(choice, twoFaTokenValue, savedSession) {
  try {
    const body = `data=${encodeURIComponent(JSON.stringify({ choix: choice }))}`;
    const resp = await fetch(`${getProxy()}/v3/connexion/doubleauth.awp?verbe=post&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', '2fa-token': twoFaTokenValue, 'X-Token': twoFaTokenValue },
      body
    });
    const data = await resp.json();
    if (data.code === 200 && data.data && data.data.cn) {
      await silentLoginWithFa([{ cn: data.data.cn, cv: data.data.cv }], twoFaTokenValue, savedSession);
    } else {
      enterExpiredMode();
    }
  } catch(e) {
    enterExpiredMode();
  }
}

async function silentLoginWithFa(fa, twoFaTokenValue, savedSession) {
  try {
    const gtk = await getGtk();
    const payload = { identifiant: savedSession.u, motdepasse: savedSession.p, isReLogin: false, uuid: '', fa };
    const body = `data=${encodeURIComponent(JSON.stringify(payload))}`;
    const resp = await fetch(`${getProxy()}/v3/login.awp?v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-ApisVer': API_VERSION, 'X-Gtk': gtk },
      body
    });
    const data = await resp.json();
    if (data.code === 200) {
      token = data.token; twoFaToken = twoFaTokenValue;
      localStorage.setItem('ed_session', JSON.stringify({ ...savedSession, token: data.token, twoFaToken: twoFaTokenValue, accountData: data.data, fa }));
    } else {
      enterExpiredMode();
    }
  } catch(e) {
    enterExpiredMode();
  }
}

const ROUTES = [
  { label: 'Notes',           method: 'POST', path: '/v3/eleves/{id}/notes.awp?verbe=get',        body: 'data={}' },
  { label: 'Emploi du temps', method: 'POST', path: '/v3/E/{id}/emploidutemps.awp?verbe=get',     body: 'data={"dateDebut":"2026-03-10","dateFin":"2026-03-16"}' },
  { label: 'Messages',        method: 'POST', path: '/v3/eleves/{id}/messages.awp?verbe=get',     body: 'data={"anneeMessages":"2025-2026"}' },
  { label: 'Cahier de textes',method: 'POST', path: '/v3/eleves/{id}/cahierdetexte.awp?verbe=get',body: 'data={}' },
  { label: 'Absences',        method: 'POST', path: '/v3/eleves/{id}/viescolaire.awp?verbe=get',  body: 'data={}' },
  { label: 'Infos compte',    method: 'POST', path: '/v3/eleves/{id}/infos.awp?verbe=get',        body: 'data={}' },
];

function _rebuildTabBar(tabs) {
  _currentTabs = tabs;
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = '';
  tabs.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (i === 0 ? ' active' : '');
    btn.textContent = t.label;
    btn.dataset.label = t.label;
    btn.dataset.tab = t.id;
    btn.onclick = () => switchTab(t.id);
    bar.appendChild(btn);
  });
  if (!bar._overflowListenerAttached) {
    bar.addEventListener('scroll', _updateTabBarOverflow);
    bar._overflowListenerAttached = true;
  }
  setTimeout(_updateTabBarOverflow, 0);
}

function _updateTabBarOverflow() {
  const bar = document.getElementById('tab-bar');
  if (!bar) return;
  bar.classList.toggle('overflow-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
  bar.classList.toggle('overflow-left', bar.scrollLeft > 2);
}

function _updateSubTabsOverflow(bar) {
  if (!bar) return;
  bar.classList.toggle('overflow-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 2);
  bar.classList.toggle('overflow-left', bar.scrollLeft > 2);
}

function _initSubTabsOverflow(bar) {
  if (!bar || bar._subTabsOverflowInit) return;
  bar._subTabsOverflowInit = true;
  bar.addEventListener('scroll', () => _updateSubTabsOverflow(bar));
  setTimeout(() => _updateSubTabsOverflow(bar), 0);
}

function _scrollSubTabActive(bar) {
  bar?.querySelector('.sub-tab.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function _initAllSubTabs() {
  document.querySelectorAll('.tab-panel.active .sub-tabs').forEach(bar => {
    _initSubTabsOverflow(bar);
    _scrollSubTabActive(bar);
  });
}

function openMobileNav() {
  const dark = document.body.classList.contains('dark');
  const dlgBg  = dark ? '#242424' : '#fff';
  const dlgText = getComputedStyle(document.body).getPropertyValue('--text').trim() || (dark ? '#e2e8f0' : '#1e293b');
  const dlgText3 = getComputedStyle(document.body).getPropertyValue('--text3').trim() || (dark ? '#94a3b8' : '#64748b');
  const activeBg = getComputedStyle(document.body).getPropertyValue('--bg4').trim() || (dark ? '#2d3348' : '#f1f5f9');
  const activeTab = document.querySelector('.tab.active')?.dataset.tab || '';

  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;z-index:1000;overflow-y:auto;background:${dlgBg};color:${dlgText};padding:1rem 1.5rem`;
  overlay.classList.add('dlg-overlay', 'mobile-nav-overlay');

  const items = _currentTabs.map(t => {
    const isActive = t.id === activeTab;
    const badge = tabBadges[t.id] || 0;
    return `<button onclick="switchTab('${t.id}');this.closest('.mobile-nav-overlay').remove()"
      style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 12px;border:none;border-radius:10px;cursor:pointer;font-size:15px;font-weight:${isActive?'500':'400'};font-family:inherit;background:${isActive?activeBg:'transparent'};color:${isActive?dlgText:dlgText3};margin-bottom:4px;text-align:left;appearance:none;-webkit-appearance:none">
      <span>${t.label}</span>
      ${badge > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:999px;padding:1px 7px;font-size:11px;font-weight:600;flex-shrink:0">${badge}</span>` : ''}
    </button>`;
  }).join('');

  overlay.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:4px 0">
      <span style="font-size:16px;font-weight:700;color:${dlgText}">Navigation</span>
      <button onclick="this.closest('.mobile-nav-overlay').remove()" style="background:none;border:none;cursor:pointer;font-size:14px;font-weight:500;color:var(--text2);font-family:inherit;padding:4px 0">← Retour</button>
    </div>
    ${items}`;

  document.body.appendChild(overlay);
}

function onLoggedIn(data) {
  _childEleveView = null;
  const msgNewBtn = document.getElementById('msg-new-btn');
  if (msgNewBtn) msgNewBtn.style.display = '';
  document.getElementById('login-card').style.display = 'none';
  document.getElementById('api-card').classList.add('active-card');
  const acc = data.accounts ? data.accounts[0] : data;
  const nom = acc.prenom ? `${acc.prenom} ${acc.nom || ''}` : (acc.login || 'Utilisateur');
  const initials = nom.split(' ').map(s => s[0] || '').join('').substring(0, 2).toUpperCase();
  document.getElementById('user-avatar').textContent = initials;
  document.getElementById('user-name').textContent = nom.trim();
  const isEleve = acc.typeCompte === 'E';
  const accountType = isEleve ? 'Compte élève' : 'Compte parent';
  const schoolName = acc.nomEtablissement || acc.profile?.nomEtablissement || '';
  const className  = acc.profile?.classe?.libelle || acc.libelleClasse || '';
  const metaParts  = [accountType, schoolName, className].filter(Boolean);
  const metaEl = document.getElementById('user-meta');
  if (metaEl) metaEl.textContent = metaParts.join(' · ');
  const classEl = document.getElementById('user-class');
  if (classEl) classEl.textContent = className || accountType;
  document.body.classList.toggle('is-eleve', isEleve);
  // Init onglets selon le type de compte
  const TABS = isEleve ? [
    { id: 'accueil',  label: 'Accueil' },
    { id: 'edt',      label: 'Emploi du temps' },
    { id: 'notes',    label: 'Notes' },
    { id: 'devoirs',  label: 'Devoirs' },
    { id: 'seances',  label: 'Cours' },
    { id: 'messages', label: 'Messages' },
    { id: 'absences', label: 'Vie scolaire' },
    { id: 'memos',    label: 'Mémos' },
  ] : [
    { id: 'accueil',            label: 'Accueil' },
    { id: 'messages',           label: 'Messages' },
    { id: 'documents-parent',   label: 'Documents' },
    { id: 'finances-parent',    label: 'Situation financière' },
    { id: 'viescolaire-parent', label: 'Vie scolaire' },
  ];
  _currentAccountId = acc.id || acc.idLogin || 'default';
  _rebuildTabBar(TABS);
  if (isEleve) updateDevoirsTabCount();
  // Correspondances : visible pour les élèves et pour les parents ayant au moins un enfant
  const corrTabBtn = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
  if (corrTabBtn) {
    const _corrEleves = !isEleve ? (acc.profile?.eleves || acc.eleves || []) : [];
    corrTabBtn.style.display = (isEleve || _corrEleves.length > 0) ? '' : 'none';
  }
  // Sélecteur compte enfant (compte parent uniquement)
  const childBar = document.getElementById('child-account-bar');
  const childSel = document.getElementById('child-account-selector');
  const childSchool = document.getElementById('child-account-school');
  if (!isEleve && childBar && childSel) {
    const eleves = acc.profile?.eleves || acc.eleves || [];
    childSel.innerHTML = '<option value="">Compte parent</option>';
    eleves.forEach(e => {
      const opt = document.createElement('option');
      opt.value = e.id;
      opt.textContent = e.prenom ? `${e.prenom} ${e.nom || ''}`.trim() : (e.login || `Élève ${e.id}`);
      childSel.appendChild(opt);
    });
    if (childSchool) childSchool.textContent = schoolName;
    // Pour le compte parent, le sélecteur ci-dessous suffit — user-meta masqué
    if (metaEl) metaEl.textContent = '';
    childBar.style.display = eleves.length ? 'flex' : 'none';
  } else if (childBar) {
    childBar.style.display = 'none';
  }
  // Restaurer la vue enfant si elle était active avant le rechargement
  const savedChildView = !isEleve ? localStorage.getItem(`ed_child_view_${_currentAccountId}`) : null;
  if (savedChildView) {
    const childSel = document.getElementById('child-account-selector');
    if (childSel) childSel.value = savedChildView;
    const childTabIds = new Set(_CHILD_VIEW_TABS.map(t => t.id));
    const urlTab = getTabFromPath();
    const lastTab = localStorage.getItem('ed_last_tab');
    const restoredTab = (urlTab && childTabIds.has(urlTab)) ? urlTab
      : (lastTab && childTabIds.has(lastTab)) ? lastTab
      : 'absences';
    switchChildAccountView(savedChildView, restoredTab);
    return;
  }

  const validTabIds = new Set(TABS.map(t => t.id));
  const savedDefault = localStorage.getItem(`ed_default_tab_${_currentAccountId}`);
  const defaultTab = (savedDefault && validTabIds.has(savedDefault)) ? savedDefault : 'accueil';
  // Priorité : onglet dans l'URL > page par défaut configurée (ed_last_tab ignoré)
  const urlTab = getTabFromPath();
  switchTab((urlTab && validTabIds.has(urlTab)) ? urlTab : defaultTab);

  // EDT : géré par edtWeekOffset
}

// ── Vue enfant depuis compte parent ────────────────────────────────────────

const _CHILD_VIEW_TABS = [
  { id: 'edt',      label: 'Emploi du temps' },
  { id: 'notes',    label: 'Notes' },
  { id: 'devoirs',  label: 'Devoirs' },
  { id: 'absences', label: 'Vie scolaire' },
  { id: 'messages', label: 'Messages' },
];

function switchChildAccountView(eleveId, initialTab) {
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  // Vider le panneau de détail message lors du changement de compte enfant
  document.querySelector('.msg-split')?.classList.remove('show-detail');
  const detailEl = document.getElementById('message-detail-panel');
  if (detailEl) {
    detailEl.style.alignItems = 'center';
    detailEl.style.justifyContent = 'center';
    detailEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center">Sélectionne un message<br>pour voir le contenu ici</span>`;
  }
  selectedMessageId = null;
  // Onglet actif au moment du changement de compte
  const activeTabEl = document.querySelector('.tab.active');
  const activeTabId = activeTabEl?.dataset?.tab || null;
  if (!eleveId) {
    // Retour au compte parent
    _childEleveView = null;
    localStorage.removeItem(`ed_child_view_${_currentAccountId}`);
    const PARENT_TABS = [
      { id: 'accueil',            label: 'Accueil' },
      { id: 'messages',           label: 'Messages' },
      { id: 'documents-parent',   label: 'Documents' },
      { id: 'finances-parent',    label: 'Situation financière' },
      { id: 'viescolaire-parent', label: 'Vie scolaire' },
    ];
    // Maintenir visibilité du sous-onglet Correspondances si des enfants sont disponibles
    const corrTabBtn = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
    if (corrTabBtn) {
      const _acc2 = accountData?.accounts ? accountData.accounts[0] : accountData;
      const _eleves2 = _acc2?.profile?.eleves || _acc2?.eleves || [];
      corrTabBtn.style.display = _eleves2.length ? '' : 'none';
    }
    // Masquer l'onglet Demandes absences (compte parent sans vue enfant)
    const demandesTabBtn = document.getElementById('vs-tab-demandesabsences');
    if (demandesTabBtn) demandesTabBtn.style.display = 'none';
    // Réafficher le bouton Nouveau message (retour en vue parent)
    const msgNewBtn = document.getElementById('msg-new-btn');
    if (msgNewBtn) msgNewBtn.style.display = '';
    _rebuildTabBar(PARENT_TABS);
    const parentTabIds = new Set(PARENT_TABS.map(t => t.id));
    const targetTab = initialTab && parentTabIds.has(initialTab) ? initialTab
      : activeTabId && parentTabIds.has(activeTabId) ? activeTabId
      : 'accueil';
    switchTab(targetTab);
  } else {
    const eleves = acc?.profile?.eleves || acc?.eleves || [];
    const eleve = eleves.find(e => String(e.id) === String(eleveId));
    if (!eleve) return;
    notesData = null; notesPeriod = null;
    _childEleveView = { id: eleve.id, nom: eleve.nom || '', prenom: eleve.prenom || '', classeId: eleve.classe?.id || eleve.idClasse || '' };
    localStorage.setItem(`ed_child_view_${_currentAccountId}`, String(eleveId));
    // Afficher le sous-onglet Correspondances dans Messages
    const corrTabBtn = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
    if (corrTabBtn) corrTabBtn.style.display = '';
    // Afficher l'onglet Demandes absences (vue enfant depuis compte parent)
    const demandesTabBtn = document.getElementById('vs-tab-demandesabsences');
    if (demandesTabBtn) demandesTabBtn.style.display = '';
    // Masquer le bouton Nouveau message (envoi non disponible en vue enfant)
    const msgNewBtn = document.getElementById('msg-new-btn');
    if (msgNewBtn) msgNewBtn.style.display = 'none';
    // Masquer les onglets QCM et Sondages (non disponibles depuis un compte parent)
    const qcmTabBtn = document.getElementById('vs-tab-qcm');
    if (qcmTabBtn) qcmTabBtn.style.display = 'none';
    const sondagesTabBtn = document.getElementById('vs-tab-sondages');
    if (sondagesTabBtn) sondagesTabBtn.style.display = 'none';
    _rebuildTabBar(_CHILD_VIEW_TABS);
    const childTabIds = new Set(_CHILD_VIEW_TABS.map(t => t.id));
    const targetTab = initialTab && childTabIds.has(initialTab) ? initialTab
      : activeTabId && childTabIds.has(activeTabId) ? activeTabId
      : 'edt';
    switchTab(targetTab);
  }
}

function _loadChildViewTab(id) {
  const childNom = `${_childEleveView.prenom} ${_childEleveView.nom}`.trim();
  const stub = `<div style="padding:40px 24px;text-align:center;color:var(--text3);font-size:14px">
    <div style="font-size:36px;margin-bottom:14px">🔧</div>
    <div style="font-weight:500;margin-bottom:6px">Fonctionnalité en cours de développement</div>
    <div style="font-size:12px">Données de <strong style="color:var(--text2)">${childNom}</strong> — bientôt disponible</div>
  </div>`;
  const resultMap = {
    edt:      'edt-result',
    notes:    'notes-result',
    devoirs:  'devoirs-result',
    messages: 'messages-result',
  };
  // Masquer spinners
  ['spin-edt','spin-notes','spin-devoirs','spin-absences','spin-messages'].forEach(sid => {
    const el = document.getElementById(sid); if (el) el.style.display = 'none';
  });
  // Vider le panneau de détail si présent
  const detailPanels = ['devoir-detail-panel', 'message-detail-panel'];
  detailPanels.forEach(did => {
    const el = document.getElementById(did);
    if (el) el.innerHTML = '';
  });
  const resultId = resultMap[id];
  if (resultId) {
    const el = document.getElementById(resultId);
    if (el) el.innerHTML = stub;
  }
}

function formatFrPhone(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  let nat;
  if (raw.trim().startsWith('+33'))                    nat = digits.slice(2);
  else if (digits.startsWith('33') && digits.length === 11) nat = digits.slice(2);
  else if (digits.startsWith('0')  && digits.length === 10) nat = digits.slice(1);
  else if (digits.length === 9)                        nat = digits;
  else return raw;
  if (nat.length !== 9) return raw;
  return `(+33) ${nat[0]} ${nat.slice(1,3)} ${nat.slice(3,5)} ${nat.slice(5,7)} ${nat.slice(7,9)}`;
}

function normalizeFrPhone(display) {
  if (!display) return '';
  const digits = display.replace(/\D/g, '');
  if (digits.startsWith('33') && digits.length === 11) return '+' + digits;
  if (digits.length === 9)                             return '+33' + digits;
  if (digits.startsWith('0')  && digits.length === 10) return '+33' + digits.slice(1);
  return display;
}

async function openProfile() {
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  if (!acc) return;
  const isParent = acc.typeCompte !== 'E';
  const loginId = acc.idLogin || acc.id || '';
  const dark = document.body.classList.contains('dark');

  const nom = acc.prenom ? `${acc.prenom} ${acc.nom || ''}` : (acc.login || 'Utilisateur');
  const initials = nom.split(' ').map(s => s[0] || '').join('').substring(0, 2).toUpperCase();

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow-y:auto';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay', 'profile-dlg-overlay');

  const dialog = document.createElement('div');
  dialog.classList.add('profile-dlg');
  dialog.style.cssText = `background:var(--bg);color:var(--text);border-radius:12px;padding:1.5rem;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.35);position:relative;margin:auto`;
  dialog.innerHTML = `
    <button class="profile-dlg-close" onclick="this.closest('.profile-dlg-overlay').remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:18px;color:var(--text3)">×</button>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
      <div style="width:52px;height:52px;border-radius:50%;background:#4f46e5;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:700;flex-shrink:0">${initials}</div>
      <div>
        <div style="font-size:17px;font-weight:600">${nom.trim()}</div>
        <div style="font-size:13px;color:var(--text3)">${acc.typeCompte === 'E' ? 'Compte élève' : 'Compte parent'}</div>
      </div>
      <button class="profile-dlg-back" onclick="this.closest('.profile-dlg-overlay').remove()" style="margin-left:auto">← Retour</button>
    </div>
    <div class="profile-mobile-actions">
      <button id="pma-dark-btn" onclick="toggleDark()" title="${dark ? 'Mode clair' : 'Mode sombre'}">
        <span class="pma-icon">${dark ? '☀️' : '🌙'}</span>${dark ? 'Mode clair' : 'Mode sombre'}
      </button>
      <button onclick="this.closest('.dlg-overlay').remove();openSettingsDialog()" title="Paramètres">
        <span class="pma-icon">⚙️</span>Paramètres
      </button>
      <button onclick="this.closest('.dlg-overlay').remove();logout()" title="Se déconnecter">
        <span class="pma-icon">⏏</span>Déconnexion
      </button>
      <button onclick="shutdownApp()" title="Fermer l'application">
        <span class="pma-icon">⏻</span>Fermer
      </button>
    </div>
    <div id="profile-form-area" style="font-size:14px;text-align:center;padding:16px 0"><span class="spinner"></span> Chargement…</div>`;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  let profileData = {};
  let coordsData  = null;
  try {
    const fetches = [
      fetch(`${getProxy()}/v3/logins/${loginId}.awp?verbe=get&v=${API_VERSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
        body: 'data={}'
      }),
      isParent ? fetch(`${getProxy()}/v3/famillecoordonnees.awp?verbe=get&v=${API_VERSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
        body: 'data={}'
      }) : Promise.resolve(null)
    ];
    const [resp, coordsResp] = await Promise.all(fetches);
    const json = await resp.json();
    if (json.code === 200) profileData = json.data || {};
    if (coordsResp) {
      const coordsJson = await coordsResp.json();
      if (coordsJson.code === 200) coordsData = coordsJson.data || null;
    }
  } catch(e) { console.error('[profile] fetch error:', e); }

  // Fallback sur les données déjà disponibles dans accountData
  if (!profileData.identifiant) profileData.identifiant = acc.login || acc.identifiant || '';
  if (!profileData.email)       profileData.email       = acc.email || '';
  if (!profileData.portable)    profileData.portable    = acc.portable || acc.mobile || '';

  const fs = `width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--input-bg);color:var(--text);font-size:14px;outline:none`;
  const ls = `font-size:13px;font-weight:600;color:var(--text2);margin-bottom:4px;display:block`;
  const hs = `font-size:11px;color:var(--text3);margin-top:3px`;
  const qOptions = (profileData.questionsPossibles || []).slice().sort((a, b) => a.localeCompare(b, 'fr'))
    .map(q => `<option value="${q}"${q === profileData.questionSecrete ? ' selected' : ''}>${q}</option>`).join('');

  function pwField(id) {
    return `<div style="position:relative;display:flex;align-items:center">
      <input id="${id}" type="password" style="${fs};padding-right:36px" autocomplete="new-password">
      <button type="button" onclick="const f=document.getElementById('${id}');f.type=f.type==='password'?'text':'password';this.textContent=f.type==='password'?'👁':'🙈'"
        style="position:absolute;right:6px;background:none;border:none;cursor:pointer;font-size:15px;padding:2px;color:var(--text3)">👁</button>
    </div>`;
  }

  const profileFormArea = document.getElementById('profile-form-area');
  profileFormArea.style.textAlign = 'left';
  profileFormArea.style.padding = '0';
  profileFormArea.innerHTML = `
    <div class="sub-tabs" style="margin-bottom:16px">
      <button id="pf-tab-compte"   class="sub-tab active"  onclick="switchProfileTab('compte')">Compte</button>
      <button id="pf-tab-securite" class="sub-tab"         onclick="switchProfileTab('securite')">Sécurité</button>
      ${isParent ? '<button id="pf-tab-infos" class="sub-tab" onclick="switchProfileTab(\'infos\')">Informations personnelles</button>' : ''}
    </div>

    <!-- Section Compte -->
    <div id="pf-sections-wrapper">
    <div id="pf-section-compte" style="display:grid;gap:14px">
      <div>
        <label style="${ls}">Nom d'utilisateur</label>
        <input id="pf-login" type="text" value="${(profileData.identifiant||'').replace(/"/g,'&quot;')}" style="${fs}" autocomplete="username">
        <p style="${hs}">Attention aux Majuscules/Minuscules</p>
        <div id="pf-err-pf-login" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
      <div>
        <label style="${ls}">Adresse Email</label>
        <input id="pf-email" type="email" value="${(profileData.email||'').replace(/"/g,'&quot;')}" style="${fs}" autocomplete="email">
        <div id="pf-err-pf-email" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
      <div>
        <label style="${ls}">Téléphone mobile <span style="font-weight:400;color:var(--text3)">(facultatif)</span></label>
        <input id="pf-tel" type="text" value="${formatFrPhone(profileData.portable||'').replace(/"/g,'&quot;')}" style="${fs}" autocomplete="tel" placeholder="(+33) 6 12 34 56 78">
        <div id="pf-err-pf-tel" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
    </div>

    <!-- Section Sécurité -->
    <div id="pf-section-securite" style="display:none;gap:14px">
      <div>
        <label style="${ls}">Mot de passe</label>
        ${pwField('pf-mdp')}
        <div id="pf-err-pf-mdp" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
      <div>
        <label style="${ls}">Confirmation du mot de passe</label>
        ${pwField('pf-mdp2')}
        <div id="pf-err-pf-mdp2" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
      <div>
        <label style="${ls}">Question secrète</label>
        <select id="pf-question" style="${fs}" onchange="const c=document.getElementById('pf-question-custom-wrap');c.style.display=this.value==='Autre'?'block':'none'">${qOptions}</select>
      </div>
      <div id="pf-question-custom-wrap" style="display:${profileData.questionSecrete==='Autre'?'block':'none'}">
        <label style="${ls}">Question personnalisée</label>
        <input id="pf-question-custom" type="text" value="${(profileData.questionSecretePerso||'').replace(/"/g,'&quot;')}" style="${fs}" placeholder="Votre question…">
        <div id="pf-err-pf-question-custom" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
      <div>
        <label style="${ls}">Réponse</label>
        <input id="pf-reponse" type="text" value="${(profileData.reponse||'').replace(/"/g,'&quot;')}" style="${fs}">
        <div id="pf-err-pf-reponse" style="font-size:12px;color:#dc2626;margin-top:3px;display:none"></div>
      </div>
    </div>
    ${isParent ? '<div id="pf-section-infos" style="display:none;overflow-y:auto;max-height:420px"></div>' : ''}
    </div>

    <!-- Statut + boutons communs, toujours en bas -->
    <div id="pf-status-compte"   style="font-size:13px;min-height:18px;margin-top:14px"></div>
    <div id="pf-status-securite" style="font-size:13px;min-height:18px;margin-top:14px;display:none"></div>
    ${isParent ? '<div id="pf-status-infos" style="font-size:13px;min-height:18px;margin-top:14px;display:none"></div>' : ''}
    <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
      <button id="pf-cancel-btn" onclick="this.closest('[style*=fixed]').remove()" style="padding:8px 22px;border-radius:8px;border:1px solid var(--border);background:var(--input-bg);color:var(--text);font-size:14px;cursor:pointer;font-weight:500">Annuler</button>
      <button id="pf-save-btn" onclick="const _t=document.getElementById('pf-tab-compte')?.classList.contains('active')?'compte':document.getElementById('pf-tab-securite')?.classList.contains('active')?'securite':null;if(_t)saveProfile(${loginId},_t)" style="padding:8px 22px;border-radius:8px;border:none;background:#4f46e5;color:#fff;font-size:14px;cursor:pointer;font-weight:600">Valider</button>
    </div>`;

  // Fixer la hauteur du wrapper à la plus grande section pour éviter le saut
  const _sec = document.getElementById('pf-section-securite');
  _sec.style.display = 'grid';
  const _customWrap = document.getElementById('pf-question-custom-wrap');
  const _customWasHidden = _customWrap.style.display === 'none';
  _customWrap.style.display = 'block'; // mesure avec le champ perso visible (cas max)
  const _maxH = Math.max(
    document.getElementById('pf-section-compte').offsetHeight,
    _sec.offsetHeight
  );
  if (_customWasHidden) _customWrap.style.display = 'none';
  _sec.style.display = 'none';
  document.getElementById('pf-sections-wrapper').style.minHeight = _maxH + 'px';

  // ── Scroll horizontal sub-tabs profil — gradient overflow ───────────
  const _pfSubTabs = profileFormArea.querySelector('.sub-tabs');
  if (_pfSubTabs) {
    function _pfSubTabsOverflow() {
      _pfSubTabs.classList.toggle('overflow-right', _pfSubTabs.scrollLeft + _pfSubTabs.clientWidth < _pfSubTabs.scrollWidth - 2);
      _pfSubTabs.classList.toggle('overflow-left',  _pfSubTabs.scrollLeft > 2);
    }
    _pfSubTabs.addEventListener('scroll', _pfSubTabsOverflow);
    setTimeout(_pfSubTabsOverflow, 0);
  }

  // ── Informations personnelles (parent uniquement) ────────────────────
  if (isParent) {
    const infosEl = document.getElementById('pf-section-infos');
    if (infosEl) {
      if (coordsData) {
        const r       = coordsData.responsable || {};
        const eleves  = coordsData.eleves || [];
        const regimes = coordsData.parametrages?.regimesScolaire || [];

        function _pfInfoRow(label, value) {
          if (!value) return '';
          return `<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:12px;color:var(--text3);min-width:150px;flex-shrink:0">${label}</span>
            <span style="font-size:13px;color:var(--text)">${value}</span>
          </div>`;
        }

        const addr = [coordsData.adresseLigne1, coordsData.adresseLigne2, coordsData.adresseLigne3].filter(Boolean).join(', ');
        const ville = [coordsData.codePostal, coordsData.ville].filter(Boolean).join(' ');

        let ih = `<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Responsable</div>`;
        ih += _pfInfoRow('Nom',                  r.nom || '');
        ih += _pfInfoRow('Email',                r.mailPerso || '');
        ih += _pfInfoRow('Email professionnel',  r.mailTravail || '');
        ih += _pfInfoRow('Tél. mobile',          r.telMobile || '');
        ih += _pfInfoRow('Tél. domicile',        r.telDomicile || '');
        ih += _pfInfoRow('Tél. travail',         r.telTravail || '');
        ih += _pfInfoRow('Profession',           r.profession || '');
        ih += _pfInfoRow('Société',              r.societe || '');
        ih += _pfInfoRow('CSP',                  r.csp?.libelle || '');

        if (addr || ville) {
          ih += `<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 6px">Adresse</div>`;
          ih += _pfInfoRow('Adresse', addr);
          ih += _pfInfoRow('Ville',   ville);
        }

        if (eleves.length) {
          ih += `<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 6px">Enfants</div>`;
          eleves.forEach(elv => {
            const regime = regimes.find(rg => rg.id === elv.idRegime);
            ih += `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
              <div style="font-size:14px;font-weight:600;margin-bottom:4px">${elv.prenom || ''}</div>
              ${_pfInfoRow('Tél. mobile',     elv.telMobile || '')}
              ${_pfInfoRow('Email',           elv.email     || '')}
              ${_pfInfoRow('Régime scolaire', regime?.libelle || '')}
            </div>`;
          });
        }

        infosEl.innerHTML = ih;
      } else {
        infosEl.innerHTML = `<div style="font-size:13px;color:var(--text3);padding:12px 0">Impossible de charger les informations personnelles.</div>`;
      }
    }
  }

  // Formatage téléphone au blur
  const telEl = document.getElementById('pf-tel');
  telEl.addEventListener('blur', () => { telEl.value = formatFrPhone(telEl.value); });

  // Champs MDP : étoiles placeholder qui s'effacent au clic
  const FAKE_PW = '••••••••';
  ['pf-mdp', 'pf-mdp2'].forEach(id => {
    const el = document.getElementById(id);
    el.value = FAKE_PW;
    el.dataset.pfPlaceholder = '1';
    el.addEventListener('focus', () => {
      if (el.dataset.pfPlaceholder) { el.value = ''; delete el.dataset.pfPlaceholder; }
    });
    el.addEventListener('blur', () => {
      if (!el.value) { el.value = FAKE_PW; el.dataset.pfPlaceholder = '1'; }
    });
  });

  // ── Validation & dirty ────────────────────────────────────────────────
  const pfBtn     = document.getElementById('pf-save-btn');
  const pfErrors  = new Set(); // IDs des champs en erreur
  const pfTouched = new Set(); // IDs des champs ayant perdu le focus au moins une fois

  const pfInitCompte = {
    login: document.getElementById('pf-login').value,
    email: document.getElementById('pf-email').value,
    tel:   document.getElementById('pf-tel').value,
  };
  const pfInitSecurite = {
    question: document.getElementById('pf-question').value,
    custom:   document.getElementById('pf-question-custom').value,
    reponse:  document.getElementById('pf-reponse').value,
  };

  function pfShowError(id, msg) {
    const el = document.getElementById('pf-err-' + id);
    if (!el) return;
    if (msg) { el.textContent = msg; el.style.display = ''; }
    else     { el.textContent = ''; el.style.display = 'none'; }
  }

  function pfValidateField(id, show) {
    let error = '';
    const val = (document.getElementById(id)?.value || '').trim();
    switch (id) {
      case 'pf-login':
        if (!val) error = "Le nom d'utilisateur ne doit pas être vide.";
        break;
      case 'pf-email':
        if (!val) error = "L'adresse email ne doit pas être vide.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) error = "Adresse email invalide.";
        break;
      case 'pf-tel': {
        const raw = document.getElementById('pf-tel')?.value || '';
        if (raw.trim()) {
          const norm = normalizeFrPhone(raw);
          if (!norm.startsWith('+33') || norm.replace(/\D/g,'').length !== 11)
            error = "Numéro de téléphone invalide.";
        }
        break;
      }
      case 'pf-mdp': {
        const el = document.getElementById('pf-mdp');
        if (!el?.dataset.pfPlaceholder) {
          const pw = el?.value || '';
          if (pw.length < 12)       error = "Minimum 12 caractères.";
          else if (!/[A-Z]/.test(pw)) error = "Au moins une majuscule requise.";
          else if (!/[a-z]/.test(pw)) error = "Au moins une minuscule requise.";
          else if (!/[0-9]/.test(pw)) error = "Au moins un chiffre requis.";
        }
        break;
      }
      case 'pf-mdp2': {
        const mdpEl  = document.getElementById('pf-mdp');
        const mdp2El = document.getElementById('pf-mdp2');
        if (!mdpEl?.dataset.pfPlaceholder) {
          const mdp  = mdpEl?.value || '';
          const mdp2 = mdp2El?.dataset.pfPlaceholder ? '' : (mdp2El?.value || '');
          if (mdp !== mdp2) error = "La confirmation ne correspond pas au mot de passe.";
        }
        break;
      }
      case 'pf-question-custom': {
        const wrap = document.getElementById('pf-question-custom-wrap');
        if (wrap?.style.display !== 'none' && !val)
          error = "La question personnalisée ne doit pas être vide.";
        break;
      }
      case 'pf-reponse':
        if (!val) error = "La réponse ne doit pas être vide.";
        break;
    }
    if (error) pfErrors.add(id); else pfErrors.delete(id);
    if (show) pfShowError(id, error);
    return !error;
  }

  const pfCompteFields   = ['pf-login', 'pf-email', 'pf-tel'];
  const pfSecuriteFields = ['pf-mdp', 'pf-mdp2', 'pf-question-custom', 'pf-reponse'];

  function pfCheckDirty() {
    const isCompte = document.getElementById('pf-tab-compte').classList.contains('active');
    let dirty = false;
    if (isCompte) {
      dirty = document.getElementById('pf-login').value !== pfInitCompte.login ||
              document.getElementById('pf-email').value !== pfInitCompte.email ||
              document.getElementById('pf-tel').value   !== pfInitCompte.tel;
    } else {
      dirty = !document.getElementById('pf-mdp').dataset.pfPlaceholder  ||
              !document.getElementById('pf-mdp2').dataset.pfPlaceholder ||
              document.getElementById('pf-question').value        !== pfInitSecurite.question ||
              document.getElementById('pf-question-custom').value !== pfInitSecurite.custom   ||
              document.getElementById('pf-reponse').value         !== pfInitSecurite.reponse;
    }
    const currentFields = isCompte ? pfCompteFields : pfSecuriteFields;
    const hasErrors = currentFields.some(id => pfErrors.has(id));
    const enabled = dirty && !hasErrors;
    pfBtn.disabled = !enabled;
    pfBtn.style.opacity = enabled ? '1' : '0.45';
    pfBtn.style.cursor  = enabled ? 'pointer' : 'not-allowed';
  }

  // Initialisation : bouton désactivé
  pfBtn.disabled = true;
  pfBtn.style.opacity = '0.45';
  pfBtn.style.cursor = 'not-allowed';

  // Listeners sur chaque champ
  pfCompteFields.concat(pfSecuriteFields).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => {
      pfTouched.add(id);
      pfValidateField(id, true);
      pfCheckDirty();
    });
    el.addEventListener('input', () => {
      if (pfTouched.has(id)) pfValidateField(id, true); // MAJ erreur en live si déjà touchée
      pfCheckDirty();
    });
  });
  // Le select question peut invalider/valider le champ perso
  document.getElementById('pf-question').addEventListener('change', () => {
    if (pfTouched.has('pf-question-custom')) pfValidateField('pf-question-custom', true);
    pfCheckDirty();
  });

  // Exposé pour switchProfileTab (réajuste le bouton à chaque changement d'onglet)
  window._pfCheckDirty = pfCheckDirty;
  overlay.addEventListener('remove', () => { delete window._pfCheckDirty; });
}

function switchProfileTab(section) {
  document.getElementById('pf-section-compte').style.display    = section === 'compte'   ? 'grid' : 'none';
  document.getElementById('pf-section-securite').style.display  = section === 'securite' ? 'grid' : 'none';
  const infosEl = document.getElementById('pf-section-infos');
  if (infosEl) infosEl.style.display = section === 'infos' ? '' : 'none';
  document.getElementById('pf-status-compte').style.display     = section === 'compte'   ? ''     : 'none';
  document.getElementById('pf-status-securite').style.display   = section === 'securite' ? ''     : 'none';
  const infosStatus = document.getElementById('pf-status-infos');
  if (infosStatus) infosStatus.style.display = section === 'infos' ? '' : 'none';
  document.getElementById('pf-tab-compte').classList.toggle('active',   section === 'compte');
  document.getElementById('pf-tab-securite').classList.toggle('active', section === 'securite');
  document.getElementById('pf-tab-infos')?.classList.toggle('active', section === 'infos');
  // Masquer le bouton Valider et adapter le libellé Annuler/Fermer pour l'onglet lecture seule
  const saveBtn   = document.getElementById('pf-save-btn');
  const cancelBtn = document.getElementById('pf-cancel-btn');
  if (saveBtn)   saveBtn.style.display = section === 'infos' ? 'none' : '';
  if (cancelBtn) cancelBtn.textContent  = section === 'infos' ? 'Fermer' : 'Annuler';
  window._pfCheckDirty?.();
}

async function saveProfile(loginId, section) {
  const statusId = `pf-status-${section}`;
  const status = document.getElementById(statusId);
  const btn    = document.getElementById('pf-save-btn');

  let payload = {};

  if (section === 'compte') {
    payload = {
      identifiant: document.getElementById('pf-login')?.value || '',
      email:       document.getElementById('pf-email')?.value || '',
      portable:    normalizeFrPhone(document.getElementById('pf-tel')?.value || ''),
    };
  } else {
    const mdpEl  = document.getElementById('pf-mdp');
    const mdp2El = document.getElementById('pf-mdp2');
    const mdp  = mdpEl?.dataset.pfPlaceholder  ? '' : (mdpEl?.value  || '');
    const mdp2 = mdp2El?.dataset.pfPlaceholder ? '' : (mdp2El?.value || '');
    if (mdp && mdp !== mdp2) {
      status.style.color = '#dc2626';
      status.textContent = 'Les mots de passe ne correspondent pas.';
      return;
    }
    const qVal = document.getElementById('pf-question')?.value || '';
    payload = {
      questionSecrete: qVal === 'Autre' ? (document.getElementById('pf-question-custom')?.value || '') : qVal,
      reponse:         document.getElementById('pf-reponse')?.value  || '',
    };
    if (mdp) { payload.motDePasse = mdp; payload.motDePasseConf = mdp2; }
  }

  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  status.style.color = 'var(--text3)';
  status.textContent = 'Enregistrement…';

  try {
    const resp = await fetch(`${getProxy()}/v3/logins/${loginId}.awp?verbe=put&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data=' + encodeURIComponent(JSON.stringify(payload))
    });
    const json = await resp.json();
    if (json.code === 200) {
      status.style.color = '#16a34a';
      status.textContent = 'Modifications enregistrées.';
      // Réinitialiser l'état dirty : le bouton repasse désactivé
      if (btn) { btn.disabled = true; btn.style.opacity = '0.45'; btn.style.cursor = 'not-allowed'; btn.textContent = 'Valider'; }
    } else {
      status.style.color = '#dc2626';
      status.textContent = json.message || `Erreur ${json.code}`;
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.textContent = 'Valider'; }
    }
  } catch(e) {
    status.style.color = '#dc2626';
    status.textContent = 'Erreur réseau.';
    if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; btn.textContent = 'Valider'; }
  }
}

async function shutdownApp() {
  if (!confirm('Fermer Mon EcoleDirecte et arrêter le serveur ?')) return;
  try {
    await fetch(`${getProxy()}/shutdown`, { method: 'POST' });
  } catch(e) { /* normal, le serveur s'arrête */ }
  window.close();
}

function logout() {
  edCache.clear();
  sessionExpired = false;
  token = ''; accountData = null;
  notesData = null; notesPeriod = null;
  _childEleveView = null;
  const pbc = document.getElementById('notes-period-btns');
  if (pbc) pbc.innerHTML = '';
  const childBar = document.getElementById('child-account-bar');
  if (childBar) childBar.style.display = 'none';
  const childSel = document.getElementById('child-account-selector');
  if (childSel) childSel.innerHTML = '';
  localStorage.removeItem('ed_session');
  history.replaceState({}, '', '/');
  document.getElementById('login-card').style.display = 'block';
  document.getElementById('api-card').classList.remove('active-card');
  document.getElementById('login-status').innerHTML = '';
  document.getElementById('login-btn').disabled = false;
  document.getElementById('qcm-area').style.display = 'none';
  document.getElementById('username').value = '';
  document.getElementById('password').value = '';
  // Remettre le texte par défaut de la bannière hors-ligne
  const banner = document.getElementById('offline-banner');
  if (banner) { banner.innerHTML = '⚠ Mode hors-ligne — données en cache'; banner.classList.remove('visible'); }
}

function enterExpiredMode() {
  sessionExpired = true;
  token = '';
  // Ne pas vider le cache ni accountData — navigation en cache possible
  const banner = document.getElementById('offline-banner');
  if (banner) {
    banner.innerHTML = '⚠ Session expirée — naviguez avec les données en cache. <button onclick="logout()" style="margin-left:10px;padding:2px 10px;border-radius:8px;border:none;background:#fef3c7;color:#92400e;font-size:12px;font-weight:600;cursor:pointer">Se reconnecter</button>';
    banner.classList.add('visible');
  }
}

function openEdtDialog(encodedData) {
  const c = JSON.parse(decodeURIComponent(encodedData));

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:2rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');

  const dot = `<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${c.color};margin-right:8px;flex-shrink:0"></span>`;

  const dark = document.body.classList.contains('dark');
  const dlgBg     = dark ? '#242424' : '#fff';
  const dlgText   = dark ? '#f0f0ee' : '#1a1a1a';
  const dlgBorder = dark ? '#333'    : '#f5f5f0';

  let badges = '';
  if (c.annule) badges += `<span style="background:#fef2f2;color:#b91c1c;font-size:14px;padding:2px 8px;border-radius:10px;font-weight:500">Annulé</span> `;
  if (c.modifie && !c.annule) badges += `<span style="background:#fffbeb;color:#92400e;font-size:14px;padding:2px 8px;border-radius:10px;font-weight:500">Modifié</span> `;
  if (c.type && c.type !== 'COURS') badges += `<span style="background:#eff6ff;color:#1d4ed8;font-size:14px;padding:2px 8px;border-radius:10px;font-weight:500">${c.type}</span>`;

  const rowDefs = [
    { icon: '🕐', label: 'Horaire',    value: `${c.debut} → ${c.fin}` },
    { icon: '📚', label: 'Matière',    value: c.text },
    { icon: '👤', label: 'Professeur', value: c.prof || '—' },
    { icon: '📍', label: 'Salle',      value: c.salle || '—' },
  ];
  if (c.classe && c.classe.trim()) {
    rowDefs.push({ icon: '🏫', label: 'Classe', value: c.classe.split('\n')[0] });
  }
  const rows = rowDefs.map(r => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid ${dlgBorder}">
      <span style="font-size:16px;width:24px;text-align:center">${r.icon}</span>
      <span style="color:var(--text3);font-size:14px;min-width:80px">${r.label}</span>
      <span style="font-size:14px;font-weight:500;color:${dlgText}">${r.value}</span>
    </div>`).join('');

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.25rem;max-width:360px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.35);position:relative;max-height:calc(100vh - 4rem);overflow-y:auto`;
  dialog.innerHTML = `
    <button onclick="this.closest('[style*=fixed]').remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:18px;color:${dark?'#666':'#aaa'}">×</button>
    <div style="display:flex;align-items:center;margin-bottom:12px">
      ${dot}
      <span style="font-weight:600;font-size:15px">${c.text}</span>
    </div>
    ${badges ? `<div style="margin-bottom:12px">${badges}</div>` : ''}
    ${rows}`;

  // Section cours annulé remplacé
  if (c.coursAnnules && c.coursAnnules.length > 0) {
    c.coursAnnules.forEach(ann => {
      const annDot = `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${ann.color || '#ccc'};margin-right:6px;flex-shrink:0"></span>`;
      const annRows = [
        { icon: '🕐', label: 'Horaire',    value: `${ann.debut} → ${ann.fin}` },
        { icon: '📚', label: 'Matière',    value: ann.text },
        { icon: '👤', label: 'Professeur', value: ann.prof || '—' },
        { icon: '📍', label: 'Salle',      value: ann.salle || '—' },
      ].map(r => `
        <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid ${dlgBorder}">
          <span style="font-size:15px;width:24px;text-align:center">${r.icon}</span>
          <span style="color:var(--text3);font-size:13px;min-width:80px">${r.label}</span>
          <span style="font-size:13px;font-weight:500;color:${dlgText}">${r.value}</span>
        </div>`).join('');
      const annSection = document.createElement('div');
      annSection.style.cssText = `margin-top:14px;padding:10px;border-radius:8px;background:${dark?'#2a1a1a':'#fff5f5'};border:1px solid ${dark?'#5c1f1f':'#fecaca'}`;
      annSection.innerHTML = `
        <div style="display:flex;align-items:center;margin-bottom:8px">
          ${annDot}
          <span style="font-size:13px;font-weight:600;color:#b91c1c">${ann.text}</span>
          <span style="margin-left:8px;background:#fef2f2;color:#b91c1c;font-size:11px;padding:1px 7px;border-radius:10px;font-weight:500">Cours annulé</span>
        </div>
        ${annRows}`;
      dialog.appendChild(annSection);
    });
  }

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function openNoteDialog(encodedData) {
  const n = JSON.parse(decodeURIComponent(encodedData));
  const dark = document.body.classList.contains('dark');
  const dlgBg     = dark ? '#242424' : '#fff';
  const dlgText   = dark ? '#f0f0ee' : '#1a1a1a';
  const dlgBorder = dark ? '#333'    : '#f0f0ee';
  const dlgSub    = dark ? '#888'    : '#888';

  // Calculs note
  const noteSur  = parseFloat(n.noteSur) || 20;
  const nVal     = parseFloat((n.valeur||'').replace(',','.'));
  const nMoyC    = parseFloat((n.moyenneClasse||'').replace(',','.'));
  const nMin     = parseFloat((n.minClasse||'').replace(',','.'));
  const nMax     = parseFloat((n.maxClasse||'').replace(',','.'));
  const nVal20   = noteSur !== 20 ? nVal * 20 / noteSur : nVal;
  const nMoyC20  = !isNaN(nMoyC) && noteSur !== 20 ? nMoyC * 20 / noteSur : nMoyC;
  const noteColor = isNaN(nVal20) ? dlgText : nVal20 < 10 ? '#b91c1c' : (!isNaN(nMoyC20) && nVal20 >= nMoyC20) ? '#15803d' : '#ca8a04';

  // Couleurs et labels compétences
  const COMP_COLORS       = ['#b91c1c','#ca8a04','#1d4ed8','#15803d'];
  const COMP_LABEL_COLORS = dark
    ? ['#fca5a5','#fcd34d','#93c5fd','#6ee7b7']
    : ['#b91c1c','#ca8a04','#1d4ed8','#15803d'];
  const COMP_BG     = dark
    ? ['#3a1a1a','#2e2408','#1e3a5f','#1a3a2a']
    : ['#fef2f2','#fffbeb','#eff6ff','#f0fdf4'];
  const COMP_LABELS = ['Non atteints','Partiellement atteints','Atteints','Dépassés'];

  // Section compétences
  const elems = n.elementsProgramme || [];
  let compsHtml = '';
  if (elems.length) {
    compsHtml = `
      <div style="margin-top:14px;border-top:1px solid ${dlgBorder};padding-top:12px">
        <div style="font-size:11px;font-weight:600;color:${dlgSub};text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">
          Bilan des compétences
        </div>
        ${elems.map(e => {
          const idx    = Math.min(Math.max(parseInt(e.valeur) - 1, 0), 3);
          const color  = COMP_COLORS[idx];
          const labelColor = COMP_LABEL_COLORS[idx];
          const bg     = COMP_BG[idx];
          const label  = COMP_LABELS[idx];
          const titre  = e.libelleCompetence || '';
          const descr  = e.descriptif || '';
          return `<div style="margin-bottom:8px;padding:8px 10px;border-radius:8px;background:${bg};border-left:3px solid ${color}">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:${descr?'4px':'0'}">
              <span style="font-size:13px;font-weight:500;color:${dlgText};line-height:1.4">${titre}</span>
              <span style="flex-shrink:0;font-size:11px;font-weight:600;color:${labelColor};white-space:nowrap">${label}</span>
            </div>
            ${descr ? `<div style="font-size:12px;color:${dlgSub};line-height:1.4">${descr}</div>` : ''}
          </div>`;
        }).join('')}
      </div>`;
  }

  // Infos note
  const rows = [
    { label: 'Date',          value: n.date || '—' },
    { label: 'Matière',       value: n.discipline || n.libelleMatiere || '—' },
    n.libelleMatiere && n.libelleMatiere !== n.discipline
      ? { label: 'Sous-matière', value: n.libelleMatiere }
      : null,
    { label: 'Devoir',        value: n.devoir || '—' },
    { label: 'Coefficient',   value: n.coef || '—' },
    { label: 'Min. classe',   value: isNaN(nMin)  ? '—' : nMin },
    { label: 'Moy. classe',   value: isNaN(nMoyC) ? '—' : nMoyC },
    { label: 'Max. classe',   value: isNaN(nMax)  ? '—' : nMax },
    n.nonSignificatif ? { label: 'Remarque', value: 'Note non significative' } : null,
  ].filter(Boolean);

  const rowsHtml = rows.map(r =>
    `<div style="display:flex;align-items:baseline;gap:8px;padding:5px 0;border-bottom:1px solid ${dlgBorder}">
      <span style="font-size:13px;color:${dlgSub};min-width:110px;flex-shrink:0">${r.label}</span>
      <span style="font-size:13px;color:${dlgText};font-weight:500">${r.value}</span>
    </div>`
  ).join('');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:2rem;overflow-y:auto';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.25rem;max-width:440px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.35);position:relative;max-height:90vh;overflow-y:auto`;
  dialog.onclick = e => e.stopPropagation();
  dialog.innerHTML = `
    <button onclick="this.closest('.note-dialog-overlay').remove()"
      style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:${dark?'#666':'#aaa'};line-height:1">×</button>
    <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:14px;padding-right:24px">
      <span style="font-weight:700;font-size:22px;color:${noteColor}">${n.valeur}</span>
      <span style="font-size:14px;color:${dlgSub}">/ ${n.noteSur}</span>
      <span style="flex:1;font-size:14px;font-weight:500;color:${dlgText};margin-left:4px">${n.devoir || ''}</span>
    </div>
    ${rowsHtml}
    ${compsHtml}`;

  overlay.classList.add('note-dialog-overlay', 'dlg-overlay');
  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function cleanHtml(s) {
  if (!s) return '';
  let result = s
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    // Supprimer background-color et color inline pour respecter le dark mode
    .replace(/background-color\s*:\s*[^;"]*/gi, '')
    .replace(/(?<![a-z-])color\s*:\s*(rgb\([^)]+\)|#[0-9a-fA-F]{3,6}|[a-zA-Z]+(?!-))/g, '')
    .replace(/font-size\s*:\s*medium/gi, '')
    // Rendre les liens cliquables avec style
    .replace(/<a(\s[^>]*)>/gi, (_, attrs) => {
      const href = (attrs.match(/href=["']([^"']+)["']/) || [])[1] || '';
      return `<a href="${href}" target="_blank" rel="noopener" style="color:#1d4ed8;text-decoration:underline"${attrs}>`;
    })
    .replace(/(^|[\s(])(https?:\/\/[^\s<)"]+)/g,
      (_, pre, url) => `${pre}<a href="${url}" target="_blank" rel="noopener" style="color:#1d4ed8;text-decoration:underline">${url}</a>`)
    // Supprimer les font-family inline pour imposer system-ui
    .replace(/font-family\s*:[^;"']*(;|(?=["']))/gi, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#([0-9]+);/g, (_, c) => String.fromCharCode(parseInt(c)))
    // Normaliser les font-size < 12px → 12px
    .replace(/font-size\s*:\s*([\d.]+)pt/gi, (_, v) => {
      const px = Math.round(parseFloat(v) * 1.333);
      return `font-size:${Math.max(px, 12)}px`;
    })
    .replace(/font-size\s*:\s*([\d.]+)px/gi, (_, v) => {
      return `font-size:${Math.max(parseFloat(v), 12)}px`;
    })
    .trim();
  return result;
}

function applyDevoirSelection() {
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('[data-devoir-key]').forEach(el => {
    const isSelected = el.dataset.devoirKey === selectedDevoirKey;
    el.classList.toggle('devoir-selected', isSelected);
    el.style.background = isSelected ? (dark ? 'var(--bg4)' : '#e0e7ff') : 'var(--bg3)';
    el.style.boxShadow = isSelected ? 'inset 3px 0 0 #1d4ed8' : '';
  });
}

async function openDevoirDialog(encodedData, triggerEl) {
  const d = JSON.parse(decodeURIComponent(encodedData));
  const dark = document.body.classList.contains('dark');
  const panel = document.getElementById('devoir-detail-panel');
  if (!panel) return;

  // Sélection visuelle dans la liste
  if (triggerEl) selectedDevoirKey = triggerEl.dataset.devoirKey;
  applyDevoirSelection();
  document.querySelector('.devoirs-split')?.classList.add('show-detail');

  const inter = d.interrogation ? '<span class="devoir-badge-interro" style="font-size:14px;padding:2px 8px;border-radius:10px;margin-left:8px">Interro</span>' : '';
  const fait  = d.effectue ? '<span class="devoir-badge-fait" style="font-size:14px;padding:2px 8px;border-radius:10px;margin-left:8px">Fait ✅</span>' : '';

  // Pièces jointes connues depuis le cache liste (d.documents)
  const docsFromList = d.documents || [];

  // Affichage immédiat avec spinner
  panel.style.alignItems = 'flex-start';
  panel.style.justifyContent = 'flex-start';
  panel.innerHTML = `
    <div style="width:100%">
      <div style="font-weight:600;font-size:14px;margin-bottom:6px">${d.matiere}${inter}${fait}</div>
      ${d.donneLe ? `<div style="font-size:11px;color:var(--text4);margin-bottom:10px">Donné le ${d.donneLe}</div>` : ''}
      <div id="devoir-detail-content" style="font-size:14px;color:var(--text)">
        <span class="spinner"></span>
      </div>
    </div>`;

  const eleveId = _childEleveView?.id || getEleveId();
  const cacheKey = `devoirs-detail:${eleveId}:${d.date}`;

  const renderDocs = (docs) => {
    if (!docs || !docs.length) return '';
    return `<div style="margin-top:10px;padding:8px 10px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
      <div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Pièces jointes (${docs.length})</div>
      ${docs.map(doc => `
        <div onclick="downloadDevoirDoc(${doc.id},'${(doc.libelle||doc.name||'document').replace(/'/g,"\'")}')"
          style="display:flex;align-items:center;gap:6px;padding:4px;border-radius:4px;cursor:pointer;font-size:13px"
          onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background='transparent'">
          <span>${getFileIcon(doc.libelle||doc.name||'')}</span>
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${doc.libelle||doc.name||'Document'}</span>
        </div>`).join('')}
    </div>`;
  };

  const renderDetail = (dayData) => {
    const contentEl = document.getElementById('devoir-detail-content');
    if (!contentEl) return;
    const matieres = dayData?.matieres || [];
    const matiere = matieres.find(m => (m.matiere || m.libelleMatiere || '').toUpperCase() === d.matiere.toUpperCase()) || matieres[0];
    if (!matiere) { contentEl.innerHTML = `<span style="color:var(--text4)">Aucun détail.</span>`; return; }
    const contenu = matiere.contenu ? cleanHtml(b64d(matiere.contenu)) : '';
    const aFaireArr = Array.isArray(matiere.aFaire) ? matiere.aFaire : (matiere.aFaire ? [matiere.aFaire] : []);

    // Collecter tous les documents de tous les aFaire + niveau matière
    const allDocs = [
      ...(matiere.documents || []),
      ...aFaireArr.flatMap(af => af.documents || []),
    ];

    // Mettre à jour le badge PJ dans la liste si des docs ont été trouvés
    if (allDocs.length && triggerEl) {
      const devoirKey = triggerEl.dataset.devoirKey;
      const listItem = document.querySelector(`[data-devoir-key="${devoirKey}"]`);
      if (listItem && !listItem.querySelector('.pj-badge')) {
        const badge = document.createElement('span');
        badge.className = 'pj-badge';
        badge.style.cssText = 'font-size:11px;color:#1d4ed8;margin-left:6px';
        badge.textContent = `📎${allDocs.length}`;
        const nameSpan = listItem.querySelector('span[style*="font-weight:500"]');
        if (nameSpan) nameSpan.insertAdjacentElement('afterend', badge);
      }
    }

    const aFaireItems = aFaireArr.map(af => {
      const texte = af.contenu ? cleanHtml(b64d(af.contenu)) : '';
      const afDocs = af.documents || [];
      const docsHtml = renderDocs(afDocs);
      return (texte || docsHtml) ? `<div style="padding:8px;border-radius:6px;background:var(--bg3);border:1px solid var(--border);margin-top:6px;line-height:1.6">
        ${texte}${docsHtml}
      </div>` : '';
    }).join('');
    // Documents au niveau de la matière (non liés à un aFaire spécifique)
    const matDocs = matiere.documents || [];
    contentEl.innerHTML = `
      ${contenu ? `<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:600;color:var(--text4);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">Contenu de séance</div><div style="line-height:1.6">${contenu}</div></div>` : ''}
      ${aFaireItems ? `<div><div style="font-size:11px;font-weight:600;color:var(--text4);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px">À faire</div>${aFaireItems}</div>` : ''}
      ${matDocs.length ? renderDocs(matDocs) : ''}
      ${!contenu && !aFaireItems && !matDocs.length ? '<span style="color:var(--text4)">Aucun détail disponible.</span>' : ''}`;
  };

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/Eleves/${eleveId}/cahierdetexte/${d.date}.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={}'
    });
    const data = await resp.json();
    if (data.code !== 200) throw new Error(`Code ${data.code}`);
    return data.data;
  }, {
    onCached: data => renderDetail(data),
    onFresh:  data => renderDetail(data),
    diffFn:   edCache.defaultDiff,
  }).catch(e => {
    const el = document.getElementById('devoir-detail-content');
    if (el) el.innerHTML = `<span style="color:#b91c1c">Erreur : ${e.message}</span>`;
  });
}

function toggleDevoirsDate(bodyId, arrowId) {
  const body  = document.getElementById(bodyId);
  const arrow = document.getElementById(arrowId);
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display  = open ? 'none' : 'block';
  if (arrow) arrow.style.transform = open ? 'rotate(0deg)' : 'rotate(90deg)';
}

function clearDevoirsDate() {
  document.getElementById('devoirs-date').value = '';
}

// Si on est samedi (6) ou dimanche (0), on affiche la semaine prochaine par défaut
const _todayDay = new Date().getDay();
let edtWeekOffset = (_todayDay === 0 || _todayDay === 6) ? 1 : 0;

function getMondayOfWeek(offset) {
  const today = new Date();
  const day = today.getDay();
  const diffToMon = (day === 0 ? -6 : 1 - day);
  const mon = new Date(today);
  mon.setDate(today.getDate() + diffToMon + offset * 7);
  mon.setHours(0,0,0,0);
  return mon;
}

function edtNav(dir) {
  edtWeekOffset += dir;
  runEdt();
}

function edtOpenCalendar(e) {
  if (e) e.preventDefault(); // empêche le label de déclencher un second clic natif
  const picker = document.getElementById('edt-date-picker');
  const mon = getMondayOfWeek(edtWeekOffset);
  const pad = n => String(n).padStart(2, '0');
  picker.value = `${mon.getFullYear()}-${pad(mon.getMonth()+1)}-${pad(mon.getDate())}`;
  picker.onchange = () => {
    if (!picker.value) return;
    const picked = new Date(picker.value + 'T00:00:00');
    const todayMon = getMondayOfWeek(0);
    const pickedDay = picked.getDay();
    const diffToMon = pickedDay === 0 ? -6 : 1 - pickedDay;
    const pickedMon = new Date(picked);
    pickedMon.setDate(picked.getDate() + diffToMon);
    pickedMon.setHours(0, 0, 0, 0);
    edtWeekOffset = Math.round((pickedMon - todayMon) / (7 * 24 * 60 * 60 * 1000));
    picker.onchange = null;
    runEdt();
  };
  try { picker.showPicker(); } catch { picker.click(); }
}

// Jours fériés France (mois 1-indexé)
const FERIES = ['01-01','05-01','05-08','07-14','08-15','11-01','11-11','12-25'];
function isFerie(date) {
  const mmdd = `${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  // Pâques dynamique (algo Oudin)
  const y = date.getFullYear();
  const n = y % 19, c = Math.floor(y/100), u = Math.floor(c/4);
  const s = Math.floor((c+8)/25), p = Math.floor((c-s+1)/3);
  const m = (19*n+c-u-p+15)%30;
  const a = Math.floor(y%4), b = Math.floor(y%7);
  const d = (2*a+4*b-m-32*Math.floor(m/29)+m*Math.floor((m+21)/30)+89)%7;
  const dayEaster = m + d - 9;
  const easterDate = new Date(y, 2, dayEaster + (dayEaster > 31 ? -31 : 0));
  if (dayEaster > 31) easterDate.setMonth(3);
  const lundiPaques = new Date(easterDate); lundiPaques.setDate(easterDate.getDate()+1);
  const ascension = new Date(easterDate); ascension.setDate(easterDate.getDate()+39);
  const pentecote = new Date(easterDate); pentecote.setDate(easterDate.getDate()+50);
  const specials = [lundiPaques, ascension, pentecote].map(d2 =>
    `${String(d2.getMonth()+1).padStart(2,'0')}-${String(d2.getDate()).padStart(2,'0')}`);
  return FERIES.includes(mmdd) || specials.includes(mmdd);
}

let notesData = null;
let notesPeriod = null; // sera définie après chargement
let notesView = 'table'; // 'table' ou 'chart'

function detectCurrentPeriod(periodes) {
  const today = new Date().toISOString().substring(0,10);
  for (const p of periodes) {
    if (p.dateDebut <= today && p.dateFin >= today) return p.codePeriode;
  }
  // Sinon prendre le dernier non-annuel non clôturé
  return periodes[periodes.length - 1]?.codePeriode || periodes[0]?.codePeriode;
}

let msgCounts = { received: 0, sent: 0, draft: 0, archived: 0 };

async function loadMessages() {
  // En vue enfant (compte parent visualisant un élève), utiliser l'ID et l'endpoint de l'élève
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  const annee = document.getElementById('msg-annee').value;
  const cacheKey = `messages:${eleveId}:${annee}`;

  const fetchBoth = async () => {
    if (sessionExpired) throw new Error('Session expirée');
    const _acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    const _msgBase = (_childEleveView || _acc?.typeCompte === 'E') ? `/v3/eleves/${eleveId}/messages.awp` : `/v3/familles/${eleveId}/messages.awp`;
    const fetchTab = async type => {
      const resp = await fetch(`${getProxy()}${_msgBase}?force=false&typeRecuperation=${type}&idClasseur=0&orderBy=date&order=desc&query=&onlyRead=&page=0&itemsPerPage=100&getAll=0&verbe=get&v=${API_VERSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
        body: `data=${encodeURIComponent(JSON.stringify({ anneeMessages: annee }))}`
      });
      return resp.json();
    };
    const [dataReceived, dataSent, dataDraft, dataArchived] = await Promise.all([
      fetchTab('received'), fetchTab('sent'), fetchTab('draft'), fetchTab('archived')
    ]);
    // Si la réponse principale (Reçus) est non-200, c'est une erreur de session → lever une exception
    // pour ne pas cacher de données vides qui masqueraient les vrais messages au chargement suivant
    if (dataReceived.code !== 200) throw new Error(dataReceived.message || `Session expirée (code ${dataReceived.code})`);
    return {
      received: dataReceived.data?.messages?.received || [],
      sent:     dataSent.code === 200     ? (dataSent.data?.messages?.sent || [])         : [],
      draft:    dataDraft.code === 200    ? (dataDraft.data?.messages?.draft || dataDraft.data?.messages?.received || []) : [],
      archived: dataArchived.code === 200 ? (dataArchived.data?.messages?.archived || dataArchived.data?.messages?.received || []) : [],
    };
  };

  const applyMessages = ({ received = [], sent = [], draft = [], archived = [] }, isFresh, oldData) => {
    msgCounts = { received: received.length, sent: sent.length, draft: draft.length, archived: archived.length };
    [...received, ...sent, ...draft, ...archived].forEach(m => { cachedMessages[m.id] = m; });
    msgData = { messages: { received, sent, draft, archived } };
    document.getElementById('messages-result').innerHTML = renderMessages(msgData);
    applyMessageSelection();
    document.getElementById('spin-messages').style.display = 'none';
    updateFreshnessLabel('messages', Date.now());
    if (getCorrespondancesEleveId()) {
      if (msgActiveTab === 'correspondance') loadCorrespondance();
      else fetchCorrespondanceCount();
    }
    if (isFresh && oldData) {
      const newCount = received.length + sent.length;
      const oldCount = (oldData.received?.length || 0) + (oldData.sent?.length || 0);
      if (newCount > oldCount) setBadge('messages', newCount - oldCount);
    }
  };

  await edCache.load(cacheKey, fetchBoth, {
    onSpinner: () => { document.getElementById('spin-messages').style.display = 'inline'; document.getElementById('messages-result').innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { applyMessages(data, false, null); updateFreshnessLabel('messages', ts || Date.now()); },
    onFresh:   (data, _, old) => applyMessages(data, true, old),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    document.getElementById('messages-result').innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    document.getElementById('spin-messages').style.display = 'none';
  });
}

let vieScolaireSection = 'absences';

function switchVieScolaireTab(section) {
  vieScolaireSection = section;
  document.getElementById('viescolaire-tabs').querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
  document.getElementById(`vs-tab-${section}`).classList.add('active');
  const _vsBar = document.getElementById('viescolaire-tabs');
  _initSubTabsOverflow(_vsBar); _scrollSubTabActive(_vsBar);
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  if (section === 'qcm') { loadQcm(); return; }
  if (section === 'sondages') { loadSondages(); return; }
  if (section === 'portemonnaie') { loadPorteMonnaie(); return; }
  if (section === 'demandesabsences') { loadDemandesAbsences(); return; }
  if (section === 'viedeclasse') { loadVieDeClasse(); return; }
  // Absences / sanctions : re-render depuis le cache sans refetch
  edCache.get(`absences:${eleveId}`).then(entry => {
    if (entry) document.getElementById('absences-result').innerHTML = renderVieScolaireSection(entry.data, section);
  });
}

async function loadAbsences() {
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  const cacheKey = `absences:${eleveId}`;

  const render = (data, isFresh, oldData) => {
    document.getElementById('absences-result').innerHTML = renderVieScolaireSection(data, vieScolaireSection);
    document.getElementById('spin-absences').style.display = 'none';
    updateFreshnessLabel('absences', Date.now());
    if (isFresh && oldData && edCache.defaultDiff(oldData, data)) setBadge('absences', 1);
  };

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/eleves/${eleveId}/viescolaire.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers,
      body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { document.getElementById('spin-absences').style.display = 'inline'; document.getElementById('absences-result').innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { render(data, false, null); updateFreshnessLabel('absences', ts || Date.now()); },
    onFresh:   (data, _, old) => render(data, true, old),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    document.getElementById('absences-result').innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    document.getElementById('spin-absences').style.display = 'none';
  });
}

async function loadQcm() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `qcm:${eleveId}`;
  const resultEl = document.getElementById('absences-result');
  const spinEl = document.getElementById('spin-absences');

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/eleves/${eleveId}/qcms/0/associations.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data) => { resultEl.innerHTML = renderQcm(data); spinEl.style.display = 'none'; },
    onFresh:   (data) => { resultEl.innerHTML = renderQcm(data); spinEl.style.display = 'none'; },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

async function loadSondages() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `sondages:${eleveId}`;
  const resultEl = document.getElementById('absences-result');
  const spinEl = document.getElementById('spin-absences');

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/edforms.awp?verbe=getlist&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: `data=${encodeURIComponent(JSON.stringify({ eleveId }))}`
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data) => { resultEl.innerHTML = renderSondages(data); spinEl.style.display = 'none'; },
    onFresh:   (data) => { resultEl.innerHTML = renderSondages(data); spinEl.style.display = 'none'; },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

async function loadPorteMonnaie() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `portemonnaie:${eleveId}`;
  const resultEl = document.getElementById('absences-result');
  const spinEl = document.getElementById('spin-absences');

  const render = data => {
    // En vue enfant : filtrer uniquement les comptes de cet enfant et masquer l'historique
    if (_childEleveView) {
      const childId = String(_childEleveView.id);
      const filtered = { ...data, comptes: (data?.comptes || []).filter(c => String(c.idEleve) === childId) };
      return renderPorteMonnaie(filtered, false);
    }
    return renderPorteMonnaie(data, true);
  };

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/comptes/detail.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: `data=${encodeURIComponent(JSON.stringify({ eleveId }))}`
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data) => { resultEl.innerHTML = render(data); spinEl.style.display = 'none'; },
    onFresh:   (data) => { resultEl.innerHTML = render(data); spinEl.style.display = 'none'; },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderPorteMonnaie(data, showHistory = true) {
  const comptes = data?.comptes || [];
  if (!comptes.length) return '<p style="color:var(--text3);font-size:14px">Aucun compte disponible.</p>';

  let html = '';
  comptes.forEach(c => {
    const solde = typeof c.solde === 'number' ? c.solde : 0;
    const soldeCouleur = solde < 0 ? '#b91c1c' : (solde < 5 ? '#b45309' : '#15803d');
    const ecritures = Array.isArray(c.ecritures) ? c.ecritures : [];

    html += `<div style="background:var(--bg3);border-radius:10px;padding:14px 16px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-weight:600;font-size:15px">${c.libelle || c.libelleCompte || c.codeCompte}</div>
          ${c.codeCompte ? `<div style="color:var(--text3);font-size:12px">${c.codeCompte}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:${soldeCouleur}">${solde.toFixed(2)} €</div>
          <div style="font-size:11px;color:var(--text3)">Solde disponible</div>
        </div>
      </div>`;

    if (showHistory) {
      if (ecritures.length) {
        html += `<div style="border-top:1px solid var(--border);padding-top:8px">
          <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Historique</div>`;
        ecritures.forEach(e => {
          const montant = typeof e.montant === 'number' ? e.montant : 0;
          const signe = montant > 0 ? '+' : '';
          const mCouleur = montant < 0 ? '#b91c1c' : (montant > 0 ? '#15803d' : 'var(--text3)');
          const dateStr = e.date ? e.date.split('T')[0].split('-').reverse().join('/') : '';
          html += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--border2);font-size:13px">
            <div>
              <span style="color:var(--text)">${e.libelle || '—'}</span>
              ${dateStr ? `<span style="color:var(--text3);font-size:11px;margin-left:8px">${dateStr}</span>` : ''}
            </div>
            <span style="font-weight:600;color:${mCouleur};white-space:nowrap;margin-left:12px">${signe}${montant.toFixed(2)} €</span>
          </div>`;
        });
        html += `</div>`;
      } else {
        html += `<div style="color:var(--text3);font-size:13px;margin-top:6px">Aucune écriture.</div>`;
      }
    }

    html += `</div>`;
  });

  return html;
}

function renderQcm(data) {
  const items = Array.isArray(data) ? data : (data?.qcms || data?.associations || []);
  if (!items.length) return '<p style="color:var(--text3);font-size:14px">Aucun QCM disponible.</p>';
  let html = `<div style="font-weight:500;font-size:14px;margin-bottom:8px">${items.length} QCM</div>`;
  items.forEach(q => {
    const titre = (q.titre || q.title || q.libelle || '').trim();
    const matiere = (q.matiere || q.matiereLibelle || '').trim();
    const date = (q.date || q.dateDebut || '').trim();
    const statut = (q.statut || q.status || '').trim();
    const done = statut && statut.toLowerCase() !== 'non_effectue' && statut.toLowerCase() !== 'non effectué';
    html += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${titre || 'QCM sans titre'}</span>
        ${done
          ? '<span style="color:#15803d;font-weight:500;font-size:13px">Effectué</span>'
          : '<span style="color:#b45309;font-weight:500;font-size:13px">À faire</span>'}
      </div>
      ${matiere ? `<div style="color:var(--text2)">${matiere}</div>` : ''}
      ${date ? `<div style="color:var(--text3);font-size:13px">${date}</div>` : ''}
    </div>`;
  });
  return html;
}

function renderSondages(data) {
  const items = Array.isArray(data) ? data : (data?.forms || data?.sondages || []);
  if (!items.length) return '<p style="color:var(--text3);font-size:14px">Aucun sondage disponible.</p>';
  let html = `<div style="font-weight:500;font-size:14px;margin-bottom:8px">${items.length} sondage(s)</div>`;
  items.forEach(s => {
    const titre = (s.titre || s.title || s.libelle || '').trim();
    const date = (s.date || s.dateDebut || s.dateFin || '').trim();
    const statut = (s.statut || s.status || '').trim();
    const done = statut && statut.toLowerCase() !== 'non_effectue' && statut.toLowerCase() !== 'non effectué';
    const description = (s.description || '').trim();
    html += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${titre || 'Sondage sans titre'}</span>
        ${done
          ? '<span style="color:#15803d;font-weight:500;font-size:13px">Répondu</span>'
          : '<span style="color:#b45309;font-weight:500;font-size:13px">En attente</span>'}
      </div>
      ${description ? `<div style="color:var(--text2)">${description}</div>` : ''}
      ${date ? `<div style="color:var(--text3);font-size:13px">${date}</div>` : ''}
    </div>`;
  });
  return html;
}

let devoirsCache = null;
let selectedDevoirKey = null;
let devoirsInterroOnly = false;

function toggleDevoirsInterro(btn) {
  devoirsInterroOnly = !devoirsInterroOnly;
  btn.setAttribute('aria-pressed', devoirsInterroOnly ? 'true' : 'false');
  renderDevoirsFromCache();
}

function toggleDevoirsHide(btn) {
  const active = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  renderDevoirsFromCache();
}

function updateDevoirsTabCount() {
  const btn = document.querySelector('.tab[data-tab="devoirs"]');
  if (!btn) return;
  let label = '-/-';
  if (devoirsCache) {
    let total = 0, done = 0;
    for (const devoirs of Object.values(devoirsCache)) {
      for (const d of devoirs) { total++; if (d.effectue) done++; }
    }
    label = `${done}/${total}`;
  }
  btn.dataset.label = `Devoirs (${label})`;
  btn.innerHTML = `<span>Devoirs <span style="font-size:0.75em;opacity:0.8">(${label})</span></span>`;
}

function renderDevoirsFromCache() {
  if (!devoirsCache) return;
  const path = `/v3/Eleves/${getEleveId()}/cahierdetexte.awp?verbe=get`;
  const container = document.getElementById('devoirs-result');
  let data = devoirsCache;
  if (devoirsInterroOnly) {
    const filtered = {};
    for (const [date, devoirs] of Object.entries(devoirsCache)) {
      const kept = devoirs.filter(d => d.interrogation);
      if (kept.length) filtered[date] = kept;
    }
    data = filtered;
  }
  if (container) container.innerHTML = renderData(path, data);
  applyDevoirSelection();
  updateDevoirsTabCount();
}

async function toggleDevoirEffectue(devoirId, date, currentState) {
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId || !devoirId) return;
  const newState = !currentState;

  // Mise à jour optimiste du cache mémoire
  if (devoirsCache && devoirsCache[date]) {
    const d = devoirsCache[date].find(d => String(d.id ?? d.idDevoir) === String(devoirId));
    if (d) d.effectue = newState;
  }
  renderDevoirsFromCache();

  // Appel API PUT
  try {
    const idNum = parseInt(devoirId, 10);
    const body = {
      idDevoirsEffectues:    newState ? [idNum] : [],
      idDevoirsNonEffectues: newState ? [] : [idNum],
    };
    const resp = await fetch(`${getProxy()}/v3/Eleves/${eleveId}/cahierdetexte.awp?verbe=put&v=${API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Token': token,
        'X-ApisVer': API_VERSION,
      },
      body: `data=${encodeURIComponent(JSON.stringify(body))}`,
    });
    const data = await resp.json();
    if (data.code !== 200) throw new Error(`Code ${data.code}`);
    // Invalider le cache IndexedDB pour forcer un re-fetch au prochain chargement
    await edCache.delete(`devoirs:${eleveId}`);
  } catch(e) {
    // Rollback si erreur
    if (devoirsCache && devoirsCache[date]) {
      const d = devoirsCache[date].find(d => String(d.id ?? d.idDevoir) === String(devoirId));
      if (d) d.effectue = currentState;
    }
    renderDevoirsFromCache();
    console.error('toggleDevoirEffectue erreur :', e.message);
  }
}

// Retourne un tableau de dates YYYY-MM-DD entre debut et fin inclus
function dateRange(debut, fin) {
  const dates = [];
  const d = new Date(debut);
  const f = new Date(fin);
  while (d <= f) {
    dates.push(d.toISOString().substring(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

async function loadSeances() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const debut = document.getElementById('seances-date-debut')?.value;
  const fin   = document.getElementById('seances-date-fin')?.value;
  const container = document.getElementById('seances-result');
  const spinner   = document.getElementById('spin-seances');

  if (!debut || !fin) {
    container.innerHTML = '<span style="color:var(--text4);font-size:14px">Sélectionne une période pour voir les contenus de séances.</span>';
    return;
  }
  if (debut > fin) {
    container.innerHTML = '<span style="color:#b91c1c;font-size:14px">La date de début doit être antérieure à la date de fin.</span>';
    return;
  }

  const dates = dateRange(debut, fin);
  // Limiter à 60 jours pour éviter trop de requêtes
  if (dates.length > 60) {
    container.innerHTML = '<span style="color:#b91c1c;font-size:14px">La période ne peut pas dépasser 60 jours.</span>';
    return;
  }

  // Réinitialiser le filtre matières pour la nouvelle plage
  _seancesMatieresChecked = null;
  _seancesData = null;
  const filterEl = document.getElementById('seances-matiere-filter');
  if (filterEl) filterEl.style.display = 'none';

  if (spinner) spinner.style.display = 'inline';
  container.innerHTML = centeredSpinner();

  // Charger toutes les dates en parallèle via cache
  let allResults = [];
  await Promise.all(dates.map(async dateVal => {
    const cacheKey = `seances:${eleveId}:${dateVal}`;
    let data = null;
    try {
      await edCache.load(cacheKey, async () => {
        const resp = await fetch(`${getProxy()}/v3/Eleves/${eleveId}/cahierdetexte/${dateVal}.awp?verbe=get&v=${API_VERSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
          body: 'data={}'
        });
        const d = await resp.json();
        if (d.code !== 200) throw new Error(`Code ${d.code}`);
        return d.data;
      }, {
        onCached: d => { data = d; },
        onFresh:  d => { data = d; },
        diffFn:   edCache.defaultDiff,
      });
    } catch(e) {
      // Ignorer les erreurs par date (week-end, férié...)
    }
    if (data) allResults.push({ dateVal, data });
  }));

  // Trier par date desc
  allResults.sort((a, b) => b.dateVal.localeCompare(a.dateVal));
  _seancesData = allResults;

  // Peupler le sélecteur de matières
  _populateSeancesMatieresFilter();

  if (spinner) spinner.style.display = 'none';
  _renderSeancesFiltered();
  updateFreshnessLabel('seances', Date.now());
}

function _populateSeancesMatieresFilter() {
  const allMatieres = new Set();
  for (const { data } of (_seancesData || [])) {
    for (const m of (data?.matieres || [])) {
      if (m.matiere) allMatieres.add(m.matiere);
    }
  }

  const filterEl = document.getElementById('seances-matiere-filter');
  const listEl   = document.getElementById('seances-matiere-list');
  if (!filterEl || !listEl) return;

  if (allMatieres.size === 0) {
    filterEl.style.display = 'none';
    _seancesMatieresChecked = null;
    return;
  }

  filterEl.style.display = '';

  // Par défaut : toutes les matières cochées
  _seancesMatieresChecked = new Set(allMatieres);

  const sorted = [...allMatieres].sort((a, b) => a.localeCompare(b, 'fr'));
  listEl.innerHTML = sorted.map(m => {
    const checked = _seancesMatieresChecked.has(m);
    const enc = encodeURIComponent(m).replace(/'/g, '%27');
    return `<label style="display:flex;align-items:center;gap:8px;padding:6px 12px;cursor:pointer;font-size:13px" onmouseenter="this.style.background='var(--bg3)'" onmouseleave="this.style.background=''">
      <input type="checkbox" ${checked ? 'checked' : ''} onchange="toggleSeancesMatiereCheck('${enc}', this.checked)" style="cursor:pointer">
      <span>${m}</span>
    </label>`;
  }).join('');

  _updateSeancesMatiereBadge(allMatieres.size);
}

function _updateSeancesMatiereBadge(total) {
  const badge = document.getElementById('seances-matiere-badge');
  if (!badge || !_seancesMatieresChecked) return;
  const checked = _seancesMatieresChecked.size;
  if (checked < total) {
    badge.style.display = '';
    badge.textContent = checked;
  } else {
    badge.style.display = 'none';
  }
}

function toggleSeancesMatiereMenu(e) {
  e.stopPropagation();
  const menu = document.getElementById('seances-matiere-menu');
  if (!menu) return;
  const open = menu.style.display !== 'none';
  menu.style.display = open ? 'none' : '';
  if (!open) {
    // Fermer au prochain clic dehors
    setTimeout(() => {
      document.addEventListener('click', function _close(ev) {
        if (!document.getElementById('seances-matiere-filter')?.contains(ev.target)) {
          menu.style.display = 'none';
          document.removeEventListener('click', _close);
        }
      });
    }, 0);
  }
}

function toggleSeancesMatiereCheck(enc, checked) {
  const matiere = decodeURIComponent(enc);
  if (!_seancesMatieresChecked) return;
  if (checked) _seancesMatieresChecked.add(matiere);
  else         _seancesMatieresChecked.delete(matiere);
  const allMatieres = new Set();
  for (const { data } of (_seancesData || [])) {
    for (const m of (data?.matieres || [])) { if (m.matiere) allMatieres.add(m.matiere); }
  }
  _updateSeancesMatiereBadge(allMatieres.size);
  _renderSeancesFiltered();
}

function setAllSeancesMatieresChecked(checked) {
  const allMatieres = new Set();
  for (const { data } of (_seancesData || [])) {
    for (const m of (data?.matieres || [])) { if (m.matiere) allMatieres.add(m.matiere); }
  }
  _seancesMatieresChecked = checked ? new Set(allMatieres) : new Set();
  // Mettre à jour les checkboxes dans le menu
  document.querySelectorAll('#seances-matiere-list input[type=checkbox]').forEach(cb => { cb.checked = checked; });
  _updateSeancesMatiereBadge(allMatieres.size);
  _renderSeancesFiltered();
}

function _renderSeancesFiltered() {
  const container = document.getElementById('seances-result');
  if (!container || !_seancesData) return;

  function fmtDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function renderMatiere(m) {
    const contenuSrc = m.contenuDeSeance?.contenu || '';
    const contenuRaw = contenuSrc ? cleanHtml(b64d(contenuSrc)).trim() : '';
    const contenu = contenuRaw.replace(/<[^>]*>/g, '').trim() ? contenuRaw : '';
    if (!contenu) return '';
    return `<div style="margin-bottom:10px;padding:10px 12px;border-radius:8px;background:var(--bg3);border:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="font-weight:600;font-size:14px">${m.matiere}</span>
        ${m.interrogation ? '<span class="devoir-badge badge-interro">Interro</span>' : ''}
        ${m.nomProf ? `<span style="font-size:12px;color:var(--text4);margin-left:auto">${m.nomProf}</span>` : ''}
      </div>
      <div style="font-size:14px;line-height:1.6">${contenu}</div>
    </div>`;
  }

  let html = '';
  for (const { dateVal, data } of _seancesData) {
    const matieres = (data?.matieres || []).filter(m =>
      !_seancesMatieresChecked || _seancesMatieresChecked.size === 0 || _seancesMatieresChecked.has(m.matiere)
    );
    const items = matieres.map(m => renderMatiere(m)).filter(Boolean).join('');
    if (!items) continue;
    html += `<div style="margin-bottom:18px">
      <div style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid var(--border2)">${fmtDate(dateVal)}</div>
      ${items}
    </div>`;
  }

  if (!html) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;padding:3rem"><span style="color:var(--text4);font-size:14px;text-align:center">Aucun contenu de séance sur cette période.</span></div>';
  } else {
    container.innerHTML = html;
  }
}

let _coursActiveTab = 'seances';
let _seancesData = null;       // [{dateVal, data}] résultats bruts de la dernière plage chargée
let _seancesMatieresChecked = null; // Set<string> des matières affichées (null = toutes)
let _espacesCache = null;
let _selectedEspaceId = null;
let _manuelsCache = null;

function switchCoursTab(tab) {
  _coursActiveTab = tab;
  ['seances', 'espaces', 'manuels'].forEach(t => {
    const btn = document.getElementById(`cours-tab-${t}`);
    if (btn) btn.classList.toggle('active', t === tab);
  });
  const _coursBar = document.querySelector('#panel-seances .sub-tabs');
  _initSubTabsOverflow(_coursBar); _scrollSubTabActive(_coursBar);
  document.getElementById('cours-panel-seances').style.display = tab === 'seances' ? 'flex' : 'none';
  const espPanel = document.getElementById('cours-panel-espaces');
  espPanel.style.display = tab === 'espaces' ? 'flex' : 'none';
  const manuelsPanel = document.getElementById('cours-panel-manuels');
  if (manuelsPanel) manuelsPanel.style.display = tab === 'manuels' ? 'flex' : 'none';
  if (tab === 'espaces') { loadEspacesTravail(); _initSplitSwipe(document.getElementById('cours-panel-espaces'), espaceBack); }
  if (tab === 'manuels') loadManuels();
}

async function openManuel(urlEncoded) {
  const url = decodeURIComponent(urlEncoded);
  // URL CAS → passer par le proxy pour obtenir l'URL finale avec ticket CAS
  if (url.includes('/cas/') || url.includes('cas/goToService')) {
    try {
      const headers = { 'X-Token': token };
      if (twoFaToken) headers['2fa-token'] = twoFaToken;
      const resp = await fetch(`${getProxy()}/cas-redirect?url=${encodeURIComponent(url)}`, { headers });
      const data = await resp.json();
      if (data.url) { window.open(data.url, '_blank'); return; }
    } catch(e) {}
  }
  window.open(url, '_blank');
}

async function loadManuels() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const resultEl = document.getElementById('manuels-result');
  if (!resultEl) return;
  const cacheKey = `manuels:${eleveId}`;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/Eleves/${eleveId}/manuelsNumeriques.awp?verbe=get&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(`Code ${data.code}`);
    return data.data || [];
  }, {
    onSpinner: () => { resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data) => { _manuelsCache = data; renderManuels(data); },
    onFresh:   (data) => { _manuelsCache = data; renderManuels(data); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    console.error('[loadManuels]', e);
    resultEl.innerHTML = `<span style="color:#b91c1c;font-size:13px">Erreur lors du chargement des manuels.</span>`;
  });
}

function renderManuels(manuels) {
  const resultEl = document.getElementById('manuels-result');
  if (!resultEl) return;
  if (!manuels.length) {
    resultEl.innerHTML = '<span style="color:var(--text4);font-size:14px">Aucun manuel numérique.</span>';
    return;
  }
  resultEl.innerHTML = `<div style="display:flex;flex-wrap:wrap;gap:16px;padding:4px 0">${
    manuels.map(m => {
      const url = m.url || m.lienEleve || '';
      const couverture = m.urlCouverture || m.couverture || m.vignette || '';
      const titre = m.libelle || m.titre || m.nom || 'Manuel';
      const urlEncoded = encodeURIComponent(url).replace(/'/g, '%27');
      const handler = url ? `onclick="openManuel('${urlEncoded}')" style="cursor:pointer"` : '';
      const hoverStyle = url ? `onmouseover="this.style.transform='translateY(-3px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'"` : '';
      return `<div ${handler} ${hoverStyle}
        style="transition:transform .15s,box-shadow .15s;box-shadow:0 2px 8px rgba(0,0,0,0.08);border-radius:6px;display:inline-flex">
        ${couverture
          ? `<img src="${couverture}" alt="${titre}" title="${titre}" style="width:180px;height:120px;object-fit:contain;border-radius:6px;box-shadow:0 2px 6px rgba(0,0,0,0.18);display:block">`
          : `<div title="${titre}" style="width:180px;height:120px;background:var(--bg3);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:40px">📖</div>`
        }
      </div>`;
    }).join('')
  }</div>`;
}

async function loadEspacesTravail() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const listEl = document.getElementById('espaces-list');
  if (!listEl) return;
  const cacheKey = `espaces:${eleveId}`;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/E/${eleveId}/espacestravail.awp?verbe=get&typeModule=espaceTravail&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(`Code ${data.code}`);
    return data.data || [];
  }, {
    onSpinner: () => { listEl.innerHTML = centeredSpinner(); },
    onCached:  (data) => { _espacesCache = data; renderEspacesList(data); },
    onFresh:   (data) => { _espacesCache = data; renderEspacesList(data); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    listEl.innerHTML = `<span style="color:#b91c1c;font-size:13px">Erreur lors du chargement des espaces de travail.</span>`;
  });
}

function renderEspacesList(espaces) {
  const listEl = document.getElementById('espaces-list');
  if (!listEl) return;
  if (!espaces.length) {
    listEl.innerHTML = '<span style="color:var(--text4);font-size:13px">Aucun espace de travail.</span>';
    return;
  }
  const dark = document.body.classList.contains('dark');
  listEl.innerHTML = espaces.map(e => {
    const resume = e.resume ? b64d(e.resume.replace(/\n/g, '')) : '';
    const isSelected = _selectedEspaceId === e.id;
    const bg = isSelected ? (dark ? 'var(--bg4)' : '#e0e7ff') : 'transparent';
    const shadow = isSelected ? 'inset 3px 0 0 #1d4ed8' : '';
    return `<div data-espace-id="${e.id}" onclick="loadEspaceTravailContent(${e.id})"
      onmouseover="if(${e.id}!==_selectedEspaceId)this.style.background='var(--bg3)'"
      onmouseout="if(${e.id}!==_selectedEspaceId)this.style.background='transparent'"
      style="padding:8px 10px;border-bottom:1px solid var(--border2);font-size:14px;cursor:pointer;border-radius:4px;background:${bg};box-shadow:${shadow}">
      <div style="font-weight:600;font-size:13px;margin-bottom:${resume ? '2px' : '0'}">${e.titre}</div>
      ${resume ? `<div style="font-size:12px;color:var(--text3);line-height:1.4">${resume}</div>` : ''}
    </div>`;
  }).join('');
}

// État de l'explorateur d'espace de travail
let _espaceNavPath = []; // pile de nœuds : [{libelle, children}, ...]

async function loadEspaceTravailContent(espaceId) {
  _selectedEspaceId = espaceId;
  _espaceNavPath = [];
  if (_espacesCache) renderEspacesList(_espacesCache);
  document.getElementById('cours-panel-espaces')?.classList.add('show-detail');

  const detailEl = document.getElementById('espaces-detail');
  if (!detailEl) return;
  const cacheKey = `espace-content:${espaceId}`;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/cloud/W/${espaceId}.awp?verbe=get&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(`Code ${data.code}`);
    return (data.data && data.data[0]) || {};
  }, {
    onSpinner: () => { detailEl.innerHTML = centeredSpinner(); },
    onCached:  (root) => { _espaceNavPath = [root]; renderEspaceExplorer(); },
    onFresh:   (root) => { _espaceNavPath = [root]; renderEspaceExplorer(); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    console.error('[loadEspaceTravailContent]', e);
    detailEl.innerHTML = `<span style="color:#b91c1c;font-size:13px">Erreur lors du chargement du contenu.</span>`;
  });
}

function renderEspaceExplorer() {
  const detailEl = document.getElementById('espaces-detail');
  if (!detailEl || !_espaceNavPath.length) return;

  const currentNode = _espaceNavPath[_espaceNavPath.length - 1];
  const children = currentNode.children || [];

  // ── Breadcrumb ──────────────────────────────────────────────────
  const crumbs = _espaceNavPath.map((node, i) => {
    const label = i === 0 ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;display:inline-block"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><polyline points="9 21 9 12 15 12 15 21"/></svg>' : node.libelle || 'Dossier';
    if (i < _espaceNavPath.length - 1) {
      return `<span onclick="navigateEspaceTo(${i})" style="cursor:pointer;color:#1d4ed8">${label}</span>`;
    }
    return `<span style="font-weight:600;color:var(--text)">${label}</span>`;
  }).join('<span style="color:var(--text4);margin:0 5px">›</span>');

  // ── Liste des enfants ────────────────────────────────────────────
  const items = children.map((c, idx) => {
    const isFolder = Array.isArray(c.children);
    const label = c.libelle || c.titre || (isFolder ? 'Dossier' : 'Fichier');
    const icon = isFolder ? '📁' : getFileIcon(label);
    const meta = [c.date, c.depositaire ? `Par ${c.depositaire}` : ''].filter(Boolean).join(' · ');

    if (isFolder) {
      return `<div onclick="navigateEspaceInto(${idx})"
        onmouseover="this.style.background='var(--bg3)'"
        onmouseout="this.style.background='transparent'"
        style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border2);cursor:pointer;border-radius:4px;transition:background 0.1s">
        <span style="font-size:18px;flex-shrink:0">${icon}</span>
        <div style="min-width:0;flex:1">
          <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
          ${meta ? `<div style="font-size:11px;color:var(--text4);margin-top:1px">${meta}</div>` : ''}
        </div>
      </div>`;
    } else {
      const filenameEnc = encodeURIComponent(label).replace(/'/g, '%27');
      const espaceIdEnc = encodeURIComponent(_selectedEspaceId).replace(/'/g, '%27');
      const fileIdEnc = encodeURIComponent(c.id).replace(/'/g, '%27');
      const titleEsc = label.replace(/"/g, '&quot;');
      return `<div onclick="openEspaceFile('${espaceIdEnc}','${fileIdEnc}','${filenameEnc}')"
        onmouseover="this.style.background='var(--bg3)'"
        onmouseout="this.style.background='transparent'"
        style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-bottom:1px solid var(--border2);cursor:pointer;border-radius:4px;transition:background 0.1s"
        title="Télécharger ${titleEsc}">
        <span style="font-size:18px;flex-shrink:0">${icon}</span>
        <div style="min-width:0;flex:1">
          <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${label}</div>
          ${meta ? `<div style="font-size:11px;color:var(--text4);margin-top:1px">${meta}</div>` : ''}
        </div>
      </div>`;
    }
  }).join('');

  const empty = !children.length
    ? '<div style="padding:24px 0;text-align:center;color:var(--text4);font-size:13px">Dossier vide</div>'
    : '';

  detailEl.innerHTML = `
    <div style="font-size:12px;color:var(--text3);margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border2)">${crumbs}</div>
    <div>${items}${empty}</div>`;
}

function _getFolderPath(folder) {
  // folder.id example: "\0061051K\W\468\sauvegarde\Méthodologies"
  // Extracts the path after "\W\{espaceId}": "\sauvegarde\Méthodologies"
  const id = folder.id || '';
  const marker = `\\W\\${_selectedEspaceId}`;
  const idx = id.indexOf(marker);
  if (idx === -1) return null;
  const path = id.substring(idx + marker.length);
  return path || null;
}

async function navigateEspaceInto(childIdx) {
  const currentNode = _espaceNavPath[_espaceNavPath.length - 1];
  let child = (currentNode.children || [])[childIdx];
  if (!child) return;

  // If the folder's children aren't loaded yet, fetch them via idFolder
  if (Array.isArray(child.children) && child.children.length === 0) {
    const folderPath = _getFolderPath(child);
    if (folderPath) {
      const detailEl = document.getElementById('espaces-detail');
      if (detailEl) detailEl.innerHTML = centeredSpinner();
      try {
        const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
        if (twoFaToken) headers['2fa-token'] = twoFaToken;
        const resp = await fetch(
          `${getProxy()}/v3/cloud/W/${_selectedEspaceId}.awp?verbe=get&idFolder=${encodeURIComponent(folderPath)}&v=${API_VERSION}`,
          { method: 'POST', headers, body: 'data={}' }
        );
        const data = await resp.json();
        if (data.code === 200 && data.data && data.data[0]) {
          child = data.data[0];
        }
      } catch (e) {
        console.error('[navigateEspaceInto]', e);
      }
    }
  }

  _espaceNavPath.push(child);
  renderEspaceExplorer();
}

function navigateEspaceTo(depth) {
  _espaceNavPath = _espaceNavPath.slice(0, depth + 1);
  renderEspaceExplorer();
}

let _collaboraViewUrl = null; // cache de l'URL cool.html (discovery)

async function openEspaceFile(espaceIdEnc, fileIdEnc, filenameEnc) {
  const espaceId = decodeURIComponent(espaceIdEnc);
  const fileId   = decodeURIComponent(fileIdEnc);
  const filename = decodeURIComponent(filenameEnc);
  const eleveId  = getEleveId();
  const headers  = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
  if (twoFaToken) headers['2fa-token'] = twoFaToken;

  // Étape 1 — grant WOPI + MD5 + discovery en parallèle
  const grantResp = fetch(`${getProxy()}/v3/E/${eleveId}/grant/WOPI.awp?verbe=get&v=${API_VERSION}`, { method: 'POST', headers, body: 'data={}' });
  const [grantRespObj, md5Data, viewUrlData] = await Promise.all([
    grantResp,
    fetch(`${getProxy()}/md5?s=${encodeURIComponent(fileId)}`).then(r => r.json()),
    _collaboraViewUrl ? Promise.resolve({ viewUrl: _collaboraViewUrl }) : fetch(`${getProxy()}/collabora-url`).then(r => r.json()),
  ]);
  const grantData = await grantRespObj.json();
  // Le wopiToken vient du header WOPI-Token (pas du corps JSON) — cf. credentialsStore EcoleDirecte
  const wopiToken = grantRespObj.headers.get('WOPI-Token') || grantData.token;

  if (grantData.code !== 200) throw new Error(`Grant WOPI échoué: ${grantData.code}`);
  _collaboraViewUrl = viewUrlData.viewUrl;

  // Étape 2 — construire le WOPI file ID : codeOgec¤CLOUD¤filename¤md5(fileId)
  // (même algo que EcoleDirecte : Db.MD5.generate(o) avec o = chemin complet)
  const toB64     = str => btoa(String.fromCharCode(...new TextEncoder().encode(str)));
  const filenameFp = fileId.split(/[\\/]/).pop();              // dernier segment du chemin
  const folderPath = fileId.slice(0, fileId.length - filenameFp.length); // chemin sans nom de fichier
  const eleveCode  = fileId.replace(/^\\\\/, '').split('\\')[2];         // parts[2]
  const wopiFileId = toB64(`${eleveCode}\xA4CLOUD\xA4${filenameFp}\xA4${md5Data.hash}`).replace(/=+$/, '');
  const fp         = toB64(folderPath); // avec padding = (requis)

  // Étape 3 — WOPISrc pointe directement vers api.ecoledirecte.com (pas le proxy)
  const wopiSrc = `https://api.ecoledirecte.com/restv3/ws/wopi/files/${wopiFileId}?fp=${fp}`;

  // Étape 4 — access_token : grantToken¤base64(json) — format EcoleDirecte
  const tokenJson = JSON.stringify({
    data: JSON.stringify({ idEntity: parseInt(espaceId, 10), typeEntity: 'W' }),
    idUser: eleveId,
    typeUser: 'E',
    ro: 1,
    typeFichier: 'CLOUD',
  });
  const accessToken = `${wopiToken}\xA4${btoa(tokenJson)}`;

  // Étape 5 — URL Collabora + form POST vers iframe (même mécanisme qu'EcoleDirecte)
  // On retire les paramètres variables de l'URL discovery ({...}&WOPISrc=…) pour construire proprement
  const collaboraBase = _collaboraViewUrl.replace(/\{[^}]*\}/g, '').replace(/\?.*$/, '');
  const collaboraUrl  = `${collaboraBase}?lang=fr-FR&WOPISrc=${encodeURIComponent(wopiSrc)}`;

  _openCollaboraViewer(collaboraUrl, accessToken, eleveId);
}

function _openCollaboraViewer(collaboraUrl, accessToken, idUser) {
  // libreoffice.ecoledirecte.com bloque l'intégration iframe depuis des domaines non-ecoledirecte.com
  // → form POST ciblant _blank (nouvel onglet), même mécanisme qu'EcoleDirecte mais sans iframe
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = collaboraUrl;
  form.target = '_blank';
  [['access_token', accessToken], ['typeUser', 'E'], ['idUser', String(idUser)]].forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden'; input.name = name; input.value = value;
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

async function loadDevoirs() {
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  const cacheKey = `devoirs:${eleveId}`;
  const path = `/v3/Eleves/${eleveId}/cahierdetexte.awp?verbe=get`;
  const spinner   = document.getElementById('spin-devoirs');
  const container = document.getElementById('devoirs-result');

  const render = (data, isFresh, oldData) => {
    devoirsCache = data;
    container.innerHTML = renderData(path, data);
    if (spinner) spinner.style.display = 'none';
    updateFreshnessLabel('devoirs', Date.now());
    if (isFresh && oldData && edCache.defaultDiff(oldData, data)) setBadge('devoirs', 1);
    updateDevoirsTabCount();
    // Enrichir les badges PJ en arrière-plan sans bloquer l'affichage
    enrichDevoirsWithDocs(eleveId, data);
  };

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { if (spinner) spinner.style.display = 'inline'; container.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { render(data, false, null); updateFreshnessLabel('devoirs', ts || Date.now()); },
    onFresh:   (data, _, old) => render(data, true, old),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    container.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    if (spinner) spinner.style.display = 'none';
  });
}

// Précharge en arrière-plan les détails par jour pour afficher les badges PJ
// sans bloquer le rendu initial. Utilise le cache IndexedDB si disponible.
async function enrichDevoirsWithDocs(eleveId, listData) {
  const dates = Object.keys(listData || {});
  let changed = false;
  await Promise.all(dates.map(async date => {
    try {
      const cacheKey = `devoirs-detail:${eleveId}:${date}`;
      let dayData = null;
      // Lire le cache IndexedDB d'abord
      const cached = await edCache.get(cacheKey);
      if (cached) {
        dayData = cached.data;
      } else {
        // Fetch silencieux
        const resp = await fetch(`${getProxy()}/v3/Eleves/${eleveId}/cahierdetexte/${date}.awp?verbe=get&v=${API_VERSION}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
          body: 'data={}'
        });
        const json = await resp.json();
        if (json.code === 200) {
          dayData = json.data;
          await edCache.set(cacheKey, dayData);
        }
      }
      if (!dayData) return;
      // Construire un map matiere → docs depuis les aFaire
      const matieres = dayData.matieres || [];
      matieres.forEach(m => {
        const aFaireArr = Array.isArray(m.aFaire) ? m.aFaire : (m.aFaire ? [m.aFaire] : []);
        const allDocs = [
          ...(m.documents || []),
          ...aFaireArr.flatMap(af => af.documents || []),
        ];
        if (!allDocs.length) return;
        const matiereUp = (m.matiere || m.libelleMatiere || '').toUpperCase();
        // Trouver le devoir correspondant dans devoirsCache
        const devoir = (devoirsCache?.[date] || []).find(
          d => (d.matiere || '').toUpperCase() === matiereUp
        );
        if (devoir && (!devoir.documents || !devoir.documents.length)) {
          devoir.documents = allDocs;
          changed = true;
        }
      });
    } catch(e) { /* silencieux — les badges resteront vides pour cette date */ }
  }));
  // Re-rendre la liste uniquement si des docs ont été trouvés
  if (changed) renderDevoirsFromCache();
}

async function loadNotes() {
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  const cacheKey = `notes:${eleveId}`;

  const applyNotes = (data, isFresh, oldData) => {
    notesData = data;
    if (!notesPeriod) notesPeriod = detectCurrentPeriod(notesData.periodes || []);
    buildNotesPeriodButtons();
    renderNotes();
    document.getElementById('spin-notes').style.display = 'none';
    updateFreshnessLabel('notes', Date.now());
    if (isFresh && oldData && edCache.defaultDiff(oldData?.notes, data?.notes))
      setBadge('notes', (data.notes?.length || 0) - (oldData.notes?.length || 0));
  };

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/eleves/${eleveId}/notes.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={"anneeScolaire":""}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { document.getElementById('spin-notes').style.display = 'inline'; document.getElementById('notes-result').innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { applyNotes(data, false, null); updateFreshnessLabel('notes', ts || Date.now()); },
    onFresh:   (data, _, old) => applyNotes(data, true, old),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    document.getElementById('notes-result').innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    document.getElementById('spin-notes').style.display = 'none';
  });
}

function selectNotesPeriod(period) {
  notesPeriod = period;
  notesFilter.clear();
  notesListOpen = false;
  updateNotesPeriodButtons();
  if (notesData) renderNotes();
  else loadNotes();
}

function buildNotesPeriodButtons() {
  const container = document.getElementById('notes-period-btns');
  if (!container || !notesData) return;
  const periodes = (notesData.periodes || []).filter(p => p.codePeriode !== 'A000');
  container.innerHTML = periodes.map(p =>
    `<button class="notes-period-btn" data-period="${p.codePeriode}" onclick="selectNotesPeriod('${p.codePeriode}')">${p.periode}</button>`
  ).join('');
  container._subTabsOverflowInit = false;
  updateNotesPeriodButtons();
  _initSubTabsOverflow(container);
}

function updateNotesPeriodButtons() {
  const container = document.getElementById('notes-period-btns');
  document.querySelectorAll('.notes-period-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.period === notesPeriod);
  });
  _scrollSubTabActive(container);
}

function toggleNotesView() {
  notesView = notesView === 'table' ? 'chart' : 'table';
  document.getElementById('notes-view-toggle').textContent = notesView === 'table' ? '📊' : '📋';
  if (notesData) renderNotes();
}

function renderNotes() {
  const container = document.getElementById('notes-result');
  if (!notesData) return;
  const periodes = notesData.periodes || [];
  const notes = notesData.notes || [];
  const periode = periodes.find(p => p.codePeriode === notesPeriod);
  if (!periode) { container.innerHTML = '<em style="color:var(--text3)">Période introuvable.</em>'; return; }

  if (notesView === 'table') {
    container.innerHTML = renderNotesTable(periode, notes);
    // Restaurer l'état ouvert/fermé
    if (notesListOpen) {
      const body = document.getElementById('notes-list-body');
      const arrow = document.getElementById('notes-list-arrow');
      if (body) body.style.display = 'block';
      if (arrow) arrow.style.transform = 'rotate(90deg)';
    }
  } else {
    container.innerHTML = `
      <div id="notes-chart-wrap" style="display:flex;gap:16px">
        <div id="notes-legend" style="min-width:160px;max-width:200px;overflow-y:auto;padding-right:4px;display:flex;flex-direction:column;gap:4px;flex-shrink:0"></div>
        <div style="flex:1;min-width:0;position:relative"><canvas id="notes-chart" style="width:100%;max-height:420px"></canvas></div>
      </div>`;
    renderNotesChart(periode, notes);
  }
}

let notesSortCol = 'groupe';
let notesSortDir = 1;
let notesFilter = new Map(); // code -> nom de la discipline
let notesListOpen = false; // état expand/collapse de la liste des notes

function calcMoyenne(disciplines) {
  // Calcule la moyenne pondérée par les coefficients
  let sumEleve = 0, sumClasse = 0, totalCoef = 0;
  disciplines.forEach(d => {
    const moy  = parseFloat((d.moyenne||'').replace(',','.'));
    const moyC = parseFloat((d.moyenneClasse||'').replace(',','.'));
    const coef = parseFloat(d.coef) || 1;
    if (!isNaN(moy)  && d.coef > 0) { sumEleve  += moy  * coef; totalCoef += coef; }
    if (!isNaN(moyC) && d.coef > 0) { sumClasse += moyC * coef; }
  });
  if (totalCoef === 0) return { eleve: '—', classe: '—' };
  return {
    eleve:  Math.round(sumEleve  / totalCoef * 100) / 100,
    classe: Math.round(sumClasse / totalCoef * 100) / 100,
  };
}

function renderNotesTable(periode, allNotes) {
  const em = periode.ensembleMatieres || {};
  const allDisc = em.disciplines || [];

  // Mapping idMatiere → nom du groupe parent (tous les items, pas seulement groupeMatiere:true)
  const groupeMap = {};
  allDisc.forEach(d => { if (d.id) groupeMap[String(d.id)] = d.discipline; });

  let disciplines = allDisc.filter(d => !d.groupeMatiere && d.moyenne !== '' && d.moyenne !== undefined && !d.sousMatiere);

  // Enrichir chaque discipline avec son label de groupe
  disciplines = disciplines.map(d => ({
    ...d,
    groupeLabel: d.idGroupeMatiere ? (groupeMap[String(d.idGroupeMatiere)] || '') : ''
  }));

  // Tri
  disciplines = [...disciplines].sort((a, b) => {
    let va, vb;
    if (notesSortCol === 'groupe') {
      const cmp = (a.groupeLabel||'').localeCompare(b.groupeLabel||'');
      if (cmp !== 0) return notesSortDir * cmp;
      return a.discipline.localeCompare(b.discipline);
    }
    if (notesSortCol === 'matiere') { va = a.discipline; vb = b.discipline; return notesSortDir * va.localeCompare(vb); }
    if (notesSortCol === 'moyenne') { va = parseFloat((a.moyenne||'0').replace(',','.')); vb = parseFloat((b.moyenne||'0').replace(',','.')); }
    if (notesSortCol === 'classe')  { va = parseFloat((a.moyenneClasse||'0').replace(',','.')); vb = parseFloat((b.moyenneClasse||'0').replace(',','.')); }
    return notesSortDir * (va - vb);
  });

  let html = '';

  if (disciplines.length) {
    const disciplinesAvecMoy = disciplines.filter(d => d.moyenne !== '' && d.moyenne !== undefined);
    const moyCalc = calcMoyenne(disciplinesAvecMoy.length ? disciplinesAvecMoy : disciplines);
    const moyColor = isNaN(moyCalc.eleve) ? '#1a1a1a' : moyCalc.eleve < 10 ? '#b91c1c' : moyCalc.eleve < moyCalc.classe ? '#ca8a04' : '#15803d';
    const arrow = (col) => notesSortCol === col ? (notesSortDir === 1 ? ' ↑' : ' ↓') : '';
    const thStyle = "padding:5px 6px;cursor:pointer;user-select:none;white-space:nowrap;color:var(--text3);font-size:14px;font-weight:500";
    const thStyleC = "padding:5px 6px;cursor:pointer;user-select:none;white-space:nowrap;color:var(--text3);font-size:14px;font-weight:500;text-align:center";

    html += `<div style="font-weight:500;font-size:14px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
      ${periode.periode} — Moyenne générale : <strong style="color:${moyColor}">${moyCalc.eleve}/20</strong>
      <span style="font-size:14px;color:var(--text3);font-weight:400"> (classe : ${moyCalc.classe})</span>
    </div>`;

    const fmt1 = v => isNaN(v) ? '—' : Math.round(v * 10) / 10;

    html += '<table id="notes-sort-table" style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:16px">'
         + '<thead><tr style="border-bottom:1px solid var(--border)">'
         + `<th style="${thStyle}" onclick="sortNotes('matiere')">Matière${arrow('matiere')}</th>`
         + `<th style="${thStyle}" onclick="sortNotes('groupe')">Discipline${arrow('groupe')}</th>`
         + `<th style="${thStyleC}">Min</th>`
         + `<th style="${thStyleC}" onclick="sortNotes('classe')">Moy. classe${arrow('classe')}</th>`
         + `<th style="${thStyleC}">Max</th>`
         + `<th style="${thStyleC}">Coef</th>`
         + `<th style="${thStyleC}" onclick="sortNotes('moyenne')">Ma moy.${arrow('moyenne')}</th>`
         + '</tr></thead><tbody>';

    // Construire un mapping discipline → libelleMatiere depuis les notes
    const disciplineToLibelle = {};
    allNotes.forEach(n => { if (n.libelleMatiere) disciplineToLibelle[n.libelleMatiere.toUpperCase()] = n.libelleMatiere; });
    const getLibelle = d => disciplineToLibelle[d.discipline?.toUpperCase()] || d.discipline;

    disciplines.forEach((d, idx) => {
      const moy  = parseFloat((d.moyenne||'').replace(',','.'));
      const moyC = parseFloat((d.moyenneClasse||'').replace(',','.'));
      const color = isNaN(moy) ? '#888' : moy < 10 ? '#b91c1c' : moy >= moyC ? '#15803d' : '#ca8a04';
      const isActive = notesFilter.has(d.codeMatiere || d.discipline);
      const rowHighlight = isActive ? 'background:var(--bg4);box-shadow:inset 3px 0 0 var(--text3);' : '';
      const minC = d.moyenneMin  ? fmt1(parseFloat((d.moyenneMin||'').replace(',','.')))  : '—';
      const maxC = d.moyenneMax  ? fmt1(parseFloat((d.moyenneMax||'').replace(',','.')))  : '—';
      const coef = d.coef !== undefined ? d.coef : '—';
      const hideGroupe = notesSortCol === 'groupe' && idx > 0 && disciplines[idx - 1].groupeLabel === d.groupeLabel;
      const groupeCell = hideGroupe ? `<td style="padding:5px 6px"></td>`
                                    : `<td style="padding:5px 6px;white-space:nowrap;color:var(--text3);font-size:13px;vertical-align:top">${d.groupeLabel||'—'}</td>`;
      html += `<tr class="notes-filter-row" data-code="${d.codeMatiere||''}" data-disc="${d.discipline.replace(/"/g,'&quot;')}" style="border-top:1px solid #f5f5f0;cursor:pointer;${rowHighlight}">
        <td style="padding:5px 6px">${d.discipline}</td>
        ${groupeCell}
        <td style="padding:5px 6px;text-align:center;color:var(--text3)">${minC}</td>
        <td style="padding:5px 6px;text-align:center;color:var(--text3)">${d.moyenneClasse||'—'}</td>
        <td style="padding:5px 6px;text-align:center;color:var(--text3)">${maxC}</td>
        <td style="padding:5px 6px;text-align:center;color:var(--text4)">${coef}</td>
        <td style="padding:5px 6px;text-align:center;font-weight:500;color:${color}">${d.moyenne||'—'}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  } else {
    html += `<div style="color:var(--text3);font-size:14px;padding:8px 0 12px">Aucune moyenne disponible pour cette période.</div>`;
  }

  // Section notes collapsible
  const periodNotes = allNotes.filter(n => n.codePeriode === periode.codePeriode && !n.nonSignificatif && n.valeur);
  // Mapping codeMatiere → libelleMatiere parent via LSUN
  const lsunAll = Object.values(notesData?.LSUN || {}).flat();
  const codeToDisc = {};
  allNotes.forEach(n => {
    if (n.codeMatiere && !codeToDisc[n.codeMatiere]) {
      const entry = lsunAll.find(e => e.codeMatiere === n.codeMatiere);
      codeToDisc[n.codeMatiere] = entry ? entry.libelleMatiere : n.libelleMatiere;
    }
  });

  const filteredNotes = notesFilter.size > 0
    ? periodNotes.filter(n => {
        if (notesFilter.has(n.codeMatiere)) return true;
        if (notesFilter.has(n.libelleMatiere)) return true;
        if (n.codeMatiere && notesFilter.has(codeToDisc[n.codeMatiere])) return true;
        return false;
      })
    : periodNotes;

  const filterBadges = notesFilter.size > 0
    ? `<span style="display:inline-flex;flex-wrap:wrap;align-items:center;gap:4px">
        ${[...notesFilter.entries()].map(([code, name]) =>
          `<span onclick="removeNotesFilter('${code.replace(/'/g,"\'")}');event.stopPropagation()"
           style="background:var(--bg4);border:1px solid var(--border);border-radius:10px;padding:2px 8px;font-size:14px;cursor:pointer"
           title="Retirer ce filtre">${name}</span>`).join('')}
        <button onclick="clearNotesFilter();event.stopPropagation()" title="Supprimer tous les filtres" style="background:none;border:none;cursor:pointer;color:var(--text3);font-size:24px;padding:0 2px;line-height:1">×</button>
      </span>`
    : '';

  if (periodNotes.length) {
    html += `<div style="border-top:1px solid var(--border);padding-top:8px">
      <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <button onclick="toggleNotesList(this)" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;font-size:14px;font-weight:500;color:var(--text);padding:4px 0;text-align:left;flex-shrink:0">
          <span id="notes-list-arrow" style="font-size:14px;color:var(--text3);transition:transform .2s">▶</span>
          Notes ${(periode.periode||'').toLowerCase().includes('semestre') ? 'du semestre' : 'du trimestre'}
          <span style="font-weight:400;color:var(--text3);font-size:14px">(${filteredNotes.length}${notesFilter.size > 0 ? ' / ' + periodNotes.length : ''})</span>
        </button>
        ${filterBadges}
      </div>
      <div id="notes-list-body" style="display:none;margin-top:6px">`;
    const thN = 'padding:3px 0;font-size:14px;font-weight:500;color:var(--text4);text-transform:uppercase;letter-spacing:.04em;border-bottom:1px solid var(--border)';
    html += `<div style="display:flex;align-items:center;gap:8px;padding:3px 0;margin-bottom:2px">
      <span style="min-width:70px;${thN}">Date ↓</span>
      <span style="min-width:140px;${thN}">Matière</span>
      <span style="min-width:205px;${thN}">Sous-matière</span>
      <span style="flex:1;${thN}">Devoir</span>
      <span style="min-width:36px;text-align:center;${thN}">Min</span>
      <span style="min-width:36px;text-align:center;${thN}">Moy</span>
      <span style="min-width:36px;text-align:center;${thN}">Max</span>
      <span style="min-width:36px;text-align:center;${thN}">Coef</span>
      <span style="min-width:44px;text-align:right;${thN}">Note</span>
    </div>`;
    [...filteredNotes].sort((a,b) => b.date.localeCompare(a.date)).forEach(n => {
      const sur20   = `<span style="color:var(--text4);font-size:14px">/${n.noteSur}</span>`;
      const nVal    = parseFloat((n.valeur||'').replace(',','.'));
      const nMoyC   = n.moyenneClasse ? parseFloat(n.moyenneClasse) : NaN;
      const nMin    = n.minClasse     ? parseFloat(n.minClasse)     : '—';
      const nMax    = n.maxClasse     ? parseFloat(n.maxClasse)     : '—';
      const nCoef   = n.coef          ? parseFloat(n.coef)          : '—';
      const noteSur = parseFloat(n.noteSur) || 20;
      // Normaliser sur 20 pour la comparaison avec la moyenne classe
      const nVal20  = noteSur !== 20 ? nVal * 20 / noteSur : nVal;
      const nMoyC20 = !isNaN(nMoyC) && noteSur !== 20 ? nMoyC * 20 / noteSur : nMoyC;
      const noteColor = isNaN(nVal20) ? 'var(--text)' : nVal20 < 10 ? '#b91c1c' : (!isNaN(nMoyC20) && nVal20 >= nMoyC20) ? '#15803d' : '#ca8a04';
      const nEncoded = encodeURIComponent(JSON.stringify({
        date: n.date, valeur: n.valeur, noteSur: n.noteSur, devoir: n.devoir,
        libelleMatiere: n.libelleMatiere, codeMatiere: n.codeMatiere,
        discipline: codeToDisc[n.codeMatiere] || n.libelleMatiere || '',
        coef: n.coef, moyenneClasse: n.moyenneClasse,
        minClasse: n.minClasse, maxClasse: n.maxClasse,
        nonSignificatif: n.nonSignificatif,
        elementsProgramme: n.elementsProgramme || [],
      })).replace(/'/g, '%27');
      html += `<div class="note-row" onclick="openNoteDialog('${nEncoded}')"
        style="display:flex;align-items:center;gap:8px;padding:5px 0 5px 6px;border-bottom:1px solid var(--border2);font-size:14px;cursor:pointer">
        <span style="color:var(--text4);min-width:70px;">${n.date}</span>
        <span style="min-width:140px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${codeToDisc[n.codeMatiere] || n.libelleMatiere || ''}</span>
        <span style="min-width:205px;color:var(--text3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(() => { const parent = codeToDisc[n.codeMatiere] || ''; return (n.libelleMatiere && n.libelleMatiere !== parent) ? n.libelleMatiere : '—'; })()}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n.devoir}</span>
        <span style="min-width:36px;text-align:center;color:var(--text3)">${nMin}</span>
        <span style="min-width:36px;text-align:center;color:var(--text3)">${isNaN(nMoyC)?'—':nMoyC}</span>
        <span style="min-width:36px;text-align:center;color:var(--text3)">${nMax}</span>
        <span style="min-width:36px;text-align:center;color:var(--text4)">${nCoef}</span>
        <span style="font-weight:600;min-width:44px;text-align:right;color:${noteColor}">${n.valeur} ${sur20}</span>
      </div>`;
    });
    html += '</div></div>';
  }
  return html;
}


function toggleNotesFilter(matiere) {
  if (notesFilter.has(matiere)) {
    notesFilter.delete(matiere);
  } else {
    notesFilter.set(matiere, matiere);
    notesListOpen = true;
  }

  if (notesData) renderNotes();
}

function removeNotesFilter(matiere) {
  notesFilter.delete(matiere);
  if (notesData) renderNotes();
}

function clearNotesFilter() {
  notesFilter.clear();
  if (notesData) renderNotes();
}

// Délégation de clic sur les lignes du tableau — évite les problèmes d'échappement inline
document.addEventListener('click', function(e) {
  const row = e.target.closest('.notes-filter-row');
  if (!row) return;
  if (!row.closest('#notes-sort-table')) return;
  const code = row.dataset.code || row.dataset.disc;
  const name = row.dataset.disc;
  if (code) toggleNotesFilter(code, name);
});

function sortNotes(col) {
  if (notesSortCol === col) notesSortDir *= -1;
  else { notesSortCol = col; notesSortDir = 1; }
  if (notesData) renderNotes();
}

function toggleNotesList(btn) {
  notesListOpen = !notesListOpen;
  const body = document.getElementById('notes-list-body');
  const arrow = document.getElementById('notes-list-arrow');
  if (body) body.style.display = notesListOpen ? 'block' : 'none';
  if (arrow) arrow.style.transform = notesListOpen ? 'rotate(90deg)' : 'rotate(0deg)';
}

const CHART_COLORS = ['#e24b4a','#1d9e75','#378add','#BA7517','#8B5CF6','#D4537E','#0F6E56','#639922','#534AB7','#D85A30','#185FA5','#3B6D11'];

function renderNotesChart(periode, allNotes) {
  const periodNotes = allNotes.filter(n => n.codePeriode === periode.codePeriode && !n.nonSignificatif && n.valeur && parseFloat(n.noteSur) > 0);
  if (!periodNotes.length) { document.getElementById('notes-chart').insertAdjacentHTML('afterend','<em style="color:var(--text3);font-size:14px">Pas assez de notes pour afficher le graphique.</em>'); return; }

  // Grouper par matière (sans sous-matières) — points élève ET points moyenne classe
  const byMatiere = {};
  const byMatiereClasse = {};
  periodNotes.forEach(n => {
    if (n.codeSousMatiere) return;
    const key = n.libelleMatiere;
    const noteSur = parseFloat(n.noteSur) || 20;
    // Points élève
    if (!byMatiere[key]) byMatiere[key] = [];
    const val20 = (parseFloat((n.valeur||'').replace(',','.')) / noteSur) * 20;
    if (!isNaN(val20)) byMatiere[key].push({ x: n.date, y: Math.round(val20*100)/100, label: n.devoir });
    // Points moyenne classe par note (normalisés sur 20)
    if (!byMatiereClasse[key]) byMatiereClasse[key] = [];
    const moyC = parseFloat((n.moyenneClasse||'').replace(',','.'));
    if (!isNaN(moyC)) {
      const moyC20 = noteSur !== 20 ? Math.round((moyC / noteSur) * 20 * 100) / 100 : Math.round(moyC * 100) / 100;
      byMatiereClasse[key].push({ x: n.date, y: moyC20 });
    }
  });

  const matieres = Object.keys(byMatiere).sort();

  const datasets = matieres.map((m, i) => ({
    label: m,
    data: byMatiere[m].sort((a,b)=>a.x.localeCompare(b.x)),
    borderColor: CHART_COLORS[i % CHART_COLORS.length],
    backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '22',
    tension: 0.3,
    pointRadius: 5,
    pointHoverRadius: 7,
    borderWidth: 2,
    _moyClasseData: (byMatiereClasse[m] || []).sort((a,b)=>a.x.localeCompare(b.x)),
    _isSolo: false,
    _isClasseAvg: false,
  }));

  if (typeof Chart === 'undefined') {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
    s.onload = () => buildChart(datasets, periode);
    document.head.appendChild(s);
  } else {
    buildChart(datasets, periode);
  }
}

// Plugin fond coloré + ligne 10 + hachure solo
const bgZonesPlugin = {
  id: 'bgZones',
  beforeDraw(chart) {
    const {ctx, chartArea: {top, bottom, left, right}, scales: {y}} = chart;
    if (!y) return;
    const dark = document.body.classList.contains('dark');

    // Fond du canvas
    ctx.save();
    ctx.fillStyle = dark ? '#1e1e1e' : '#ffffff';
    ctx.fillRect(left, top, right - left, bottom - top);
    ctx.restore();

    // Zones dégradées — teintes adaptées au mode
    const zones = dark ? [
      { from: 0,  to: 8,  colors: ['#7f1d1d','#713f12'] },
      { from: 8,  to: 12, colors: ['#713f12','#1e3a5f'] },
      { from: 12, to: 20, colors: ['#1e3a5f','#14532d'] },
    ] : [
      { from: 0,  to: 8,  colors: ['#fecaca','#fef08a'] },
      { from: 8,  to: 12, colors: ['#fef08a','#bfdbfe'] },
      { from: 12, to: 20, colors: ['#bfdbfe','#bbf7d0'] },
    ];
    const alpha = dark ? '99' : '55';
    zones.forEach(z => {
      const yTop = y.getPixelForValue(z.to);
      const yBot = y.getPixelForValue(z.from);
      const grad = ctx.createLinearGradient(0, yTop, 0, yBot);
      grad.addColorStop(0, z.colors[1] + alpha);
      grad.addColorStop(1, z.colors[0] + alpha);
      ctx.fillStyle = grad;
      ctx.fillRect(left, yTop, right - left, yBot - yTop);
    });

    // Ligne pointillée à 10
    const y10 = y.getPixelForValue(10);
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = dark ? 'rgba(200,200,200,0.4)' : 'rgba(100,100,100,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(left, y10);
    ctx.lineTo(right, y10);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  },

  afterDatasetsDraw(chart) {
    if (chart._activeSolo === null) return;
    const {ctx, scales: {y}, data} = chart;
    const soloIdx = chart._activeSolo;
    const soloDs = data.datasets[soloIdx];
    if (!soloDs) return;

    const meta = chart.getDatasetMeta(soloIdx);
    const y10 = y.getPixelForValue(10);

    // Ne prendre que les points réellement visibles (avec donnée non nulle)
    const pts = meta.data
      .map((pt, i) => ({ pt, val: soloDs.data[i] }))
      .filter(({ pt, val }) => val !== null && val !== undefined && !isNaN(pt.x) && !isNaN(pt.y))
      .map(({ pt }) => pt);

    if (pts.length < 2) return;

    // Hachure uniquement entre le 1er et le dernier point
    const xStart = pts[0].x;
    const xEnd   = pts[pts.length - 1].x;

    // Couleurs de hachure selon les zones (teintes vives des dégradés de fond)
    // Zone rouge (0-8) : rouge → jaune vif
    // Zone orange (8-12) : jaune → bleu vif
    // Zone verte (12-20) : bleu → vert vif
    const hatchZones = [
      { from: 0,  to: 8,  colors: ['#f87171', '#fbbf24'] },
      { from: 8,  to: 12, colors: ['#fbbf24', '#60a5fa'] },
      { from: 12, to: 20, colors: ['#60a5fa', '#34d399'] },
    ];

    ctx.save();
    ctx.beginPath();
    ctx.rect(xStart, y.getPixelForValue(20) - 2, xEnd - xStart, y.getPixelForValue(0) - y.getPixelForValue(20) + 4);
    ctx.clip();

    // Tracer le chemin de la courbe élève
    const curvePath = new Path2D();
    pts.forEach((pt, i) => {
      if (i === 0) curvePath.moveTo(pt.x, pt.y);
      else curvePath.lineTo(pt.x, pt.y);
    });
    for (let i = pts.length - 1; i >= 0; i--) {
      curvePath.lineTo(pts[i].x, y10);
    }
    curvePath.closePath();

    // Dessiner une hachure par zone avec sa couleur dégradée
    hatchZones.forEach(zone => {
      const yTop = y.getPixelForValue(zone.to);
      const yBot = y.getPixelForValue(zone.from);

      // Créer motif de hachure avec dégradé
      const patCanvas = document.createElement('canvas');
      patCanvas.width = 8; patCanvas.height = 8;
      const pc = patCanvas.getContext('2d');
      // Fond transparent
      pc.clearRect(0, 0, 8, 8);
      // Ligne de hachure colorée
      const grad = pc.createLinearGradient(0, 8, 8, 0);
      grad.addColorStop(0, zone.colors[0] + 'bb');
      grad.addColorStop(1, zone.colors[1] + 'bb');
      pc.strokeStyle = grad;
      pc.lineWidth = 2;
      pc.beginPath(); pc.moveTo(0, 8); pc.lineTo(8, 0); pc.stroke();
      pc.beginPath(); pc.moveTo(-4, 8); pc.lineTo(4, 0); pc.stroke();
      pc.beginPath(); pc.moveTo(4, 8); pc.lineTo(12, 0); pc.stroke();
      const pattern = ctx.createPattern(patCanvas, 'repeat');

      // Clipper sur la zone verticale + la courbe
      ctx.save();
      ctx.beginPath();
      ctx.rect(xStart, yTop, xEnd - xStart, yBot - yTop);
      ctx.clip();
      ctx.fillStyle = pattern;
      ctx.fill(curvePath);
      ctx.restore();
    });

    ctx.restore();
  }
};

function updateSoloState(chart) {
  const solo = chart._activeSolo;
  const ds = chart.data.datasets;

  // Retirer l'ancien dataset moyenne classe s'il existe
  const existingIdx = ds.findIndex(d => d._isClasseAvg);
  if (existingIdx !== -1) { ds.splice(existingIdx, 1); }

  if (solo !== null) {
    // Recalculer l'index après suppression éventuelle
    const soloDs = ds[solo];
    const moyClasseData = soloDs?._moyClasseData || [];
    if (soloDs && moyClasseData.length > 0) {
      // Créer dataset courbe moyenne classe, aligné sur allDates
      const allDates = chart.data.labels;
      const moyByDate = {};
      moyClasseData.forEach(p => { moyByDate[p.x] = p.y; });
      const classeDs = {
        label: `Classe (${soloDs.label})`,
        data: allDates.map(d => moyByDate[d] !== undefined ? moyByDate[d] : null),
        borderColor: 'rgba(150,150,150,0.8)',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 3,
        pointHoverRadius: 5,
        tension: 0.3,
        spanGaps: true,
        _isClasseAvg: true,
        _isSolo: false,
        _moyClasseData: [],
      };
      ds.push(classeDs);
    }
  }

  // Visibilité : solo visible, classe visible, reste caché
  ds.forEach((d, i) => {
    if (d._isClasseAvg) { chart.setDatasetVisibility(i, solo !== null); return; }
    chart.setDatasetVisibility(i, solo === null || i === solo);
  });

  chart.update();
  if (chart._buildLegend) chart._buildLegend();
}

const CHART_COLORS_DARK = ['#f87171','#34d399','#60a5fa','#fbbf24','#a78bfa','#f472b6','#2dd4bf','#86efac','#818cf8','#fb923c','#38bdf8','#4ade80'];

function buildChart(datasets, periode) {
  const ctx = document.getElementById('notes-chart');
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  const dark = document.body.classList.contains('dark');

  // Adapter les couleurs des courbes au mode
  datasets = datasets.map((ds, i) => ({
    ...ds,
    borderColor: dark ? CHART_COLORS_DARK[i % CHART_COLORS_DARK.length] : ds.borderColor,
    backgroundColor: (dark ? CHART_COLORS_DARK[i % CHART_COLORS_DARK.length] : ds.borderColor) + '33',
    _origBorderColor: ds.borderColor,
  }));

  const allDates = [...new Set(datasets.flatMap(d => d.data.map(p => p.x)))].sort();

  const chartInst = new Chart(ctx, {
    type: 'line',
    plugins: [bgZonesPlugin],
    data: { labels: allDates, datasets: datasets.map(ds => ({
      ...ds,
      data: allDates.map(date => {
        const pt = ds.data.find(p => p.x === date);
        return pt ? pt.y : null;
      }),
      spanGaps: true,
    }))},
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'category',
          ticks: {
            font: { size: 10 },
            maxRotation: 45,
            color: dark ? '#888' : '#666',
            callback: function(val, i) {
              const d = allDates[i];
              if (!d) return '';
              const parts = d.split('-');
              return `${parts[2]}/${parts[1]}`;
            }
          },
          grid: { color: dark ? '#2a2a2a' : '#f0f0ee' }
        },
        y: {
          min: 0, max: 20,
          ticks: { font: { size: 10 }, stepSize: 2, color: dark ? '#888' : '#666', callback: v => v + '/20' },
          grid: { color: dark ? '#2a2a2a' : '#f0f0ee' }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: items => {
              const d = items[0]?.label;
              if (!d) return '';
              const parts = d.split('-');
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            },
            label: item => item.raw !== null ? `${item.dataset.label} : ${item.raw}/20` : null,
            filter: item => item.raw !== null,
          }
        }
      },
      interaction: { mode: 'index', intersect: false },
    }
  });
  chartInst._activeSolo = null;
  ctx._chart = chartInst;

  // Construire la légende dans #notes-legend
  chartInst._buildLegend = function() {
    const legendEl = document.getElementById('notes-legend');
    if (!legendEl) return;
    const dark = document.body.classList.contains('dark');
    legendEl.innerHTML = '';
    chartInst.data.datasets
      .filter(ds => !ds._isClasseAvg)
      .forEach((ds, i) => {
        const isSolo   = chartInst._activeSolo === i;
        const isHidden = chartInst._activeSolo !== null && !isSolo;
        const item = document.createElement('div');
        item.style.cssText = `
          display:flex;align-items:center;gap:6px;padding:4px 6px;border-radius:6px;
          cursor:pointer;font-size:12px;transition:background .1s;
          opacity:${isHidden ? '0.35' : '1'};
          background:${isSolo ? (dark ? 'var(--bg4)' : 'var(--bg3)') : 'transparent'};
        `;
        item.onmouseover = () => { if (!isSolo) item.style.background = dark ? 'var(--bg3)' : 'var(--bg4)'; };
        item.onmouseout  = () => { if (!isSolo) item.style.background = 'transparent'; };
        item.onclick = () => {
          chartInst._activeSolo = isSolo ? null : i;
          updateSoloState(chartInst);
        };
        item.innerHTML = `
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
            background:${ds.borderColor};flex-shrink:0"></span>
          <span style="color:var(--text);line-height:1.3">${ds.label}</span>
        `;
        legendEl.appendChild(item);
      });
  };
  chartInst._buildLegend();
}

// ── Accueil — post-its ────────────────────────────────────────────────────

const POSTIT_TYPE_LABELS = { info: 'Info', alerte: 'Alerte', urgence: 'Urgence' };

async function loadAccueil() {
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  const accountId = acc?.id || '';
  const isEleve = acc?.typeCompte === 'E';
  const resultEl = document.getElementById('accueil-result');
  const spinEl   = document.getElementById('spin-accueil');
  if (!resultEl) return;

  const accueilUrl = isEleve
    ? `${getProxy()}/v3/E/${accountId}/timelineAccueilCommun.awp?verbe=get&v=${API_VERSION}`
    : `${getProxy()}/v3/1/${accountId}/timelineAccueilCommun.awp?verbe=get&v=${API_VERSION}`;

  await edCache.load(`accueil:${accountId}`, async () => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-Token': token,
      'X-ApisVer': API_VERSION
    };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(accueilUrl, {
      method: 'POST',
      headers,
      body: 'data={}'
    });
    const json = await resp.json();
    if (json.code !== 200) throw new Error(json.message || `Code ${json.code}`);
    return json.data;
  }, {
    onSpinner: () => { if (spinEl) spinEl.style.display = 'inline'; resultEl.innerHTML = ''; },
    onCached: (data, ts) => { if (spinEl) spinEl.style.display = 'none'; renderAccueil(data); updateFreshnessLabel('accueil', ts); },
    onFresh:  (data)     => { if (spinEl) spinEl.style.display = 'none'; renderAccueil(data); updateFreshnessLabel('accueil', Date.now()); },
    diffFn: (a, b) => edCache.defaultDiff(a, b)
  });
  if (spinEl) spinEl.style.display = 'none';
}

function renderAccueil(data) {
  const resultEl = document.getElementById('accueil-result');
  if (!resultEl) return;
  const postits = data?.postits || [];
  if (!postits.length) {
    resultEl.innerHTML = '<div style="text-align:center;color:var(--text4);font-size:14px;padding:40px 0">Aucun post-it pour le moment.</div>';
    return;
  }
  resultEl.innerHTML = `<div class="postits-list">${postits.map(renderPostit).join('')}</div>`;
}

function renderPostit(p) {
  const type = (p.type || '').toLowerCase();
  const typeLabel = POSTIT_TYPE_LABELS[type] || type || 'Info';

  let contenu = '';
  try { contenu = b64d((p.contenu || '').replace(/\n/g, '')); } catch(e) { contenu = p.contenu || ''; }

  const dateDebut = p.dateDebut || '';
  const dateFin   = p.dateFin   || '';
  let dateStr = '';
  if (dateDebut && dateFin && dateDebut !== dateFin) dateStr = `Du ${dateDebut} au ${dateFin}`;
  else if (dateDebut) dateStr = dateDebut;

  const auteur = p.auteur ? [p.auteur.prenom, p.auteur.nom].filter(s => s && s.trim() && s.trim() !== '-').join(' ').trim() : '';

  return `<div class="postit-card type-${type}">
    <div class="postit-meta">
      <span class="postit-type type-${type}">${typeLabel}</span>
      ${dateStr ? `<span style="font-size:12px;color:var(--text3)">${dateStr}</span>` : ''}
    </div>
    <div class="postit-content">${contenu}</div>
    ${auteur ? `<div class="postit-author">— ${auteur}</div>` : ''}
  </div>`;
}

// ── Paramètres — page par défaut ─────────────────────────────────────────

function openSettingsDialog() {
  const dark   = document.body.classList.contains('dark');
  const dlgBg  = dark ? '#242424' : '#fff';
  const dlgText = dark ? '#f0f0ee' : '#1a1a1a';

  _settingsPendingDefault = localStorage.getItem(`ed_default_tab_${_currentAccountId}`) || 'accueil';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');
  _settingsOverlayEl = overlay;

  const tabBtns = _currentTabs.map(t => {
    const isSel = t.id === _settingsPendingDefault;
    return `<button data-tabid="${t.id}" onclick="settingsSelectTab('${t.id}')" style="text-align:left;padding:10px 14px;border-radius:8px;cursor:pointer;font-size:14px;width:100%;background:${isSel ? '#1d4ed8' : (dark ? 'var(--bg3)' : 'var(--bg2)')};color:${isSel ? '#fff' : 'var(--text)'};border:${isSel ? '2px solid #1d4ed8' : '1.5px solid var(--border)'};font-weight:${isSel ? '500' : 'normal'}">${t.label}</button>`;
  }).join('');

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.5rem;max-width:360px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.35);position:relative`;
  dialog.innerHTML = `
    <button onclick="_settingsOverlayEl&&_settingsOverlayEl.remove()" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:18px;color:${dark?'#666':'#aaa'}">×</button>
    <div style="font-size:16px;font-weight:600;margin-bottom:4px">Paramètres</div>
    <div style="font-size:13px;color:var(--text3);margin-bottom:14px">Page affichée par défaut à l'ouverture</div>
    <div id="settings-tab-btns" style="display:flex;flex-direction:column;gap:6px;margin-bottom:20px">${tabBtns}</div>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button onclick="_settingsOverlayEl&&_settingsOverlayEl.remove()" class="btn" style="height:34px;font-size:13px;padding:0 14px">Annuler</button>
      <button onclick="saveSettingsDefault()" class="btn btn-primary" style="height:34px;font-size:13px;padding:0 14px">Valider</button>
    </div>`;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);
}

function settingsSelectTab(tabId) {
  _settingsPendingDefault = tabId;
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('#settings-tab-btns button').forEach(btn => {
    const isSel = btn.dataset.tabid === tabId;
    btn.style.background   = isSel ? '#1d4ed8' : (dark ? 'var(--bg3)' : 'var(--bg2)');
    btn.style.color        = isSel ? '#fff' : 'var(--text)';
    btn.style.border       = isSel ? '2px solid #1d4ed8' : '1.5px solid var(--border)';
    btn.style.fontWeight   = isSel ? '500' : 'normal';
  });
}

function saveSettingsDefault() {
  if (_settingsPendingDefault) {
    localStorage.setItem(`ed_default_tab_${_currentAccountId}`, _settingsPendingDefault);
  }
  if (_settingsOverlayEl) _settingsOverlayEl.remove();
}

async function forceRefresh(tab) {
  // Session expirée → aller se reconnecter
  if (!token) { logout(); return; }

  const btn = document.getElementById('tab-refresh-btn');
  if (btn) btn.classList.add('spinning');

  // Supprimer le cache de cet onglet
  const eleveId = _childEleveView?.id || getEleveId();
  if (tab === 'accueil') {
    await edCache.delete(`accueil:${eleveId}`);
    await loadAccueil();
  } else if (tab === 'edt') {
    const mon = getMondayOfWeek(edtWeekOffset);
    const fmt = d => d.toISOString().substring(0,10);
    await edCache.delete(`edt:${eleveId}:${fmt(mon)}`);
    await runEdt();
  } else if (tab === 'notes') {
    await edCache.delete(`notes:${eleveId}`);
    notesPeriod = null;
    await loadNotes();
  } else if (tab === 'messages') {
    const annee = document.getElementById('msg-annee').value;
    await edCache.delete(`messages:${eleveId}:${annee}`);
    if (msgActiveTab === 'correspondance') {
      await edCache.delete(`correspondances:${eleveId}`);
      _correspondancesCache = [];
    }
    await loadMessages();
  } else if (tab === 'absences') {
    if (vieScolaireSection === 'qcm') { await edCache.delete(`qcm:${eleveId}`); await loadQcm(); return; }
    if (vieScolaireSection === 'sondages') { await edCache.delete(`sondages:${eleveId}`); await loadSondages(); return; }
    if (vieScolaireSection === 'portemonnaie') { await edCache.delete(`portemonnaie:${getEleveId()}`); await loadPorteMonnaie(); return; }
    await edCache.delete(`absences:${eleveId}`);
    await loadAbsences();
  } else if (tab === 'devoirs') {
    const dateVal = document.getElementById('devoirs-date')?.value || '';
    await edCache.delete(dateVal ? `devoirs:${eleveId}:${dateVal}` : `devoirs:${eleveId}`);
    await loadDevoirs();
  } else if (tab === 'seances') {
    if (_coursActiveTab === 'espaces') {
      await edCache.delete(`espaces:${eleveId}`);
      if (_selectedEspaceId) await edCache.delete(`espace-content:${_selectedEspaceId}`);
      _espacesCache = null;
      _selectedEspaceId = null;
      const detailEl = document.getElementById('espaces-detail');
      if (detailEl) detailEl.innerHTML = '<span style="color:var(--text4);font-size:14px">Sélectionne un espace de travail.</span>';
      await loadEspacesTravail();
    } else if (_coursActiveTab === 'manuels') {
      await edCache.delete(`manuels:${eleveId}`);
      _manuelsCache = null;
      await loadManuels();
    } else {
      const debut = document.getElementById('seances-date-debut')?.value || '';
      const fin   = document.getElementById('seances-date-fin')?.value || '';
      if (debut && fin) {
        for (const d of dateRange(debut, fin)) {
          await edCache.delete(`seances:${eleveId}:${d}`);
        }
      }
      await loadSeances();
    }
  } else if (tab === 'memos') {
    renderMemosFromCache();
  } else if (tab === 'documents-parent') {
    await edCache.delete(`documents-parent:${eleveId}`);
    _vspDocsData = null; _selectedVspDocKey = null;
    await loadVspDocuments();
  } else if (tab === 'finances-parent') {
    if (_VSP_FINANCE_TABS.has(_finActiveTab)) {
      await edCache.delete(`finances-parent:${eleveId}`);
      _vspFinancesData = null;
      await loadVspFinances(_finActiveTab);
    } else if (_finActiveTab === 'portemonnaie-parent') {
      await edCache.delete(`portemonnaie-parent:${eleveId}`);
      await loadVspPorteMonnaieParent();
    } else if (_finActiveTab === 'modeReglement') {
      await edCache.delete(`mode-reglement:${eleveId}`);
      await loadVspModeReglement();
    } else if (_finActiveTab === 'paiementsenligne') {
      await edCache.delete(`paiements-enligne:${eleveId}`);
      _paiementsData = null; _panierPaiements.clear();
      await loadVspPaiementsEnLigne();
    }
  } else if (tab === 'viescolaire-parent') {
    if (_vspActiveTab === 'dossier') {
      await edCache.delete(`dossier-inscription:${eleveId}`);
      await loadDossierInscription();
    } else if (_vspActiveTab === 'sondages') {
      await edCache.delete(`sondages-parent:${eleveId}`);
      await loadVspSondages();
    }
  }

  const btn2 = document.getElementById('tab-refresh-btn');
  if (btn2) btn2.classList.remove('spinning');
}

// Mode hors-ligne
window.addEventListener('ed-offline', () => {
  const banner = document.getElementById('offline-banner');
  if (banner) banner.classList.add('visible');
});

// Cacher la bannière au prochain fetch réussi
const _origFetch = window.fetch;
window.fetch = async (...args) => {
  const resp = await _origFetch(...args);
  if (resp.ok) {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.classList.remove('visible');
  }
  return resp;
};

function centeredSpinner() {
  return `<div style="display:flex;align-items:center;justify-content:center;padding:3rem"><span class="spinner"></span></div>`;
}

async function runEdt() {
  const eleveId = _childEleveView?.id || getEleveId();
  if (!eleveId) return;
  const mon = getMondayOfWeek(edtWeekOffset);
  const fri = new Date(mon); fri.setDate(mon.getDate() + 6);
  const fmt = d => d.toISOString().substring(0,10);
  const cacheKey = `edt:${eleveId}:${fmt(mon)}`;

  const moisFr = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];
  document.getElementById('edt-week-label').textContent =
    `Semaine du ${mon.getDate()} ${moisFr[mon.getMonth()]} au ${fri.getDate()} ${moisFr[fri.getMonth()]} ${fri.getFullYear()}`;

  const render = (data, isFresh, oldData) => {
    document.getElementById('edt-result').innerHTML = renderEdtGrid(data, mon);
    document.getElementById('spin-edt').style.display = 'none';
    updateFreshnessLabel('edt', Date.now());
    if (isFresh && oldData && edCache.defaultDiff(oldData, data)) setBadge('edt', 1);
  };

  await edCache.load(cacheKey, async () => {
    const resp = await fetch(`${getProxy()}/v3/E/${eleveId}/emploidutemps.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: `data=${encodeURIComponent(JSON.stringify({ dateDebut: fmt(mon), dateFin: fmt(fri) }))}`
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { document.getElementById('spin-edt').style.display = 'inline'; document.getElementById('edt-result').innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { render(data, false, null); updateFreshnessLabel('edt', ts || Date.now()); },
    onFresh:   (data, _, old) => render(data, true, old),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    document.getElementById('edt-result').innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    document.getElementById('spin-edt').style.display = 'none';
  });
}

function renderEdtGrid(cours, monday) {
  const today = new Date(); today.setHours(0,0,0,0);
  const START_H = 8, END_H = 18;
  const TOTAL_MIN = (END_H - START_H) * 60;
  const SLOT_H = 40; // px par heure
  const GRID_H = SLOT_H * (END_H - START_H);
  const jours = ['Lun','Mar','Mer','Jeu','Ven'];
  const moisFr = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

  // Indexer les cours par jour (lundi=0..vendredi=4)
  const byDay = {0:[],1:[],2:[],3:[],4:[]};
  const isCongeDay = {0:false,1:false,2:false,3:false,4:false};
  (cours || []).forEach(c => {
    const d = new Date(c.start_date.replace(' ','T'));
    const dayIdx = d.getDay() - 1; // lundi=0
    if (dayIdx >= 0 && dayIdx <= 4) {
      if (c.typeCours === 'CONGE') {
        isCongeDay[dayIdx] = true;
      } else {
        byDay[dayIdx].push(c);
      }
    }
  });

  // Masquer les cours annulés qui se chevauchent avec un cours non-annulé,
  // et attacher leurs infos au cours remplaçant pour affichage dans le dialog.
  for (let i = 0; i < 5; i++) {
    const day = byDay[i];
    const annules = day.filter(c => c.isAnnule);
    const actifs  = day.filter(c => !c.isAnnule);
    const toHide  = new Set();
    annules.forEach(ann => {
      const annStart = new Date(ann.start_date.replace(' ','T')).getTime();
      const annEnd   = new Date(ann.end_date.replace(' ','T')).getTime();
      actifs.forEach(act => {
        const actStart = new Date(act.start_date.replace(' ','T')).getTime();
        const actEnd   = new Date(act.end_date.replace(' ','T')).getTime();
        if (annStart < actEnd && annEnd > actStart) {
          toHide.add(ann.id);
          if (!act._annulePar) act._annulePar = [];
          act._annulePar.push(ann);
        }
      });
    });
    byDay[i] = day.filter(c => !toHide.has(c.id));
  }

  // Colonnes heure
  let timeCol = '<div class="edt-time-col">';
  timeCol += '<div class="edt-header" style="height:36px"></div>';
  timeCol += `<div style="position:relative;height:${GRID_H}px">`;
  for (let h = START_H; h < END_H; h++) {
    const top = (h - START_H) * SLOT_H;
    timeCol += `<div class="edt-time" style="position:absolute;top:${top}px;left:0;right:0;height:${SLOT_H}px">${h}h</div>`;
  }
  timeCol += '</div></div>';

  // Colonnes jours
  let dayCols = '';
  for (let i = 0; i < 5; i++) {
    const dayDate = new Date(monday); dayDate.setDate(monday.getDate() + i);
    const isPast  = dayDate < today;
    const isToday = dayDate.getTime() === today.getTime() && !isFerie(today);
    const isFer   = isFerie(dayDate);
    const cls = isPast ? 'past' : isToday ? 'today' : '';
    const hdrCls = isPast ? 'past' : isToday ? 'today' : '';
    const label = `${jours[i]} ${dayDate.getDate()} ${moisFr[dayDate.getMonth()]}`;

    dayCols += `<div class="edt-day-col ${cls}">`;
    dayCols += `<div class="edt-header ${hdrCls}" style="height:36px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">
      <span>${jours[i]}</span>
      <span style="font-size:14px;font-weight:400">${dayDate.getDate()} ${moisFr[dayDate.getMonth()]}</span>
    </div>`;
    dayCols += `<div class="edt-day-body" style="position:relative;height:${GRID_H}px;overflow:hidden">`;

    if (isFer) {
      dayCols += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text4);z-index:1;pointer-events:none">Férié</div>`;
    } else if (isCongeDay[i]) {
      dayCols += `<div style="position:absolute;inset:0;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text4);z-index:1;pointer-events:none">Congés</div>`;
    }

    // Couche 2 : cours (z-index 1, devant les lignes)
    byDay[i].forEach(c => {
      const start = new Date(c.start_date.replace(' ','T'));
      const end   = new Date(c.end_date.replace(' ','T'));
      const topMin = (start.getHours() - START_H) * 60 + start.getMinutes();
      const durMin = (end - start) / 60000;
      const topPx  = (topMin / 60) * SLOT_H;
      const hPx    = Math.max((durMin / 60) * SLOT_H - 2, 18);
      const bg     = c.isAnnule ? '#f5f5f5' : (c.color || '#e0e7ff');
      // Calculer couleur texte (sombre sur fond clair)
      const hex = c.color ? c.color.replace('#','') : 'e0e7ff';
      const r=parseInt(hex.substring(0,2),16), g=parseInt(hex.substring(2,4),16), b=parseInt(hex.substring(4,6),16);
      const lum = (0.299*r + 0.587*g + 0.114*b);
      const fg = c.isAnnule ? '#aaa' : (lum > 160 ? '#1a1a1a' : '#fff');
      const displayText = c.text && c.text.trim() ? c.text : c.typeCours;
      const cData = encodeURIComponent(JSON.stringify({
        text: displayText, salle: c.salle || '', prof: c.prof || '',
        debut: c.start_date.split(' ')[1].substring(0,5),
        fin: c.end_date.split(' ')[1].substring(0,5),
        annule: c.isAnnule, modifie: c.isModifie,
        color: c.color, type: c.typeCours || '',
        classe: c.classe || '',
        coursAnnules: (c._annulePar || []).map(a => ({
          text: a.text, prof: a.prof || '', salle: a.salle || '',
          debut: a.start_date.split(' ')[1].substring(0,5),
          fin: a.end_date.split(' ')[1].substring(0,5),
          color: a.color
        }))
      })).replace(/'/g, '%27');
      const detail2 = c.salle ? c.salle : (c.classe && c.classe.trim() && !c.text.trim() ? c.classe.split('\n')[0] : '');
      dayCols += `<div class="edt-event${c.isAnnule?' annule':''}${c.isModifie?' edt-has-modifie':''}" onclick="openEdtDialog('${cData}')" style="top:${topPx}px;height:${hPx}px;background:${bg};border-left:3px solid ${c.isAnnule?'var(--border)':c.color};cursor:pointer">
        ${c.isModifie ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" width="23" height="20" style="position:absolute;top:2px;right:2px;" title="Cours modifié"><polygon points="10,1 19,17 1,17" fill="#f59e0b" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><text x="10" y="15.5" text-anchor="middle" font-size="11" font-weight="900" fill="#000">!</text></svg>` : ''}
        <div class="edt-event-name" style="color:${fg}">${displayText}</div>
        ${hPx > 28 ? `<div class="edt-event-detail" style="color:${fg}">${detail2}</div>` : ''}
      </div>`;
    });
    dayCols += '</div></div>';
  }

  return `<div class="edt-grid">${timeCol}${dayCols}</div>`;
}

function switchTab(id, fromPopstate = false) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + id));
  document.querySelector(`.tab[data-tab="${id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  setTimeout(_initAllSubTabs, 0);
  localStorage.setItem('ed_last_tab', id);
  clearBadge(id);
  const mct = document.getElementById('mobile-current-tab');
  if (mct) mct.textContent = _currentTabs.find(t => t.id === id)?.label || '';
  renderFreshnessLabel(id);
  // Mettre à jour l'URL sans recharger la page
  const route = TAB_TO_ROUTE[id] || '/edt';
  if (!fromPopstate && location.pathname !== route) history.pushState({ tab: id }, '', route);
  // Connecter le bouton refresh global à l'onglet actif
  const refreshBtn = document.getElementById('tab-refresh-btn');
  if (refreshBtn) {
    refreshBtn.onclick = () => forceRefresh(id);
  }
  // Mode vue enfant (compte parent visualisant un élève) — afficher stubs sauf pour les onglets implémentés
  if (_childEleveView && id !== 'absences' && id !== 'edt' && id !== 'notes' && id !== 'devoirs' && id !== 'messages') {
    _loadChildViewTab(id);
    return;
  }
  if (id === 'accueil') loadAccueil();
  else if (id === 'edt') { runEdt(); _initEdtSwipe(); }
  else if (id === 'notes') loadNotes();
  else if (id === 'absences') {
    switchVieScolaireTab(vieScolaireSection || 'absences');
    if (vieScolaireSection !== 'qcm' && vieScolaireSection !== 'sondages' && vieScolaireSection !== 'portemonnaie' && vieScolaireSection !== 'demandesabsences' && vieScolaireSection !== 'viedeclasse') loadAbsences();
  }
  else if (id === 'devoirs') { loadDevoirs(); _initSplitSwipe(document.querySelector('.devoirs-split'), devoirBack); }
  else if (id === 'seances') {
    const today = new Date();
    const todayStr = today.toISOString().substring(0, 10);
    const j14 = new Date(today); j14.setDate(j14.getDate() - 14);
    const j14Str = j14.toISOString().substring(0, 10);
    const debutInput = document.getElementById('seances-date-debut');
    const finInput   = document.getElementById('seances-date-fin');
    if (debutInput && !debutInput.value) debutInput.value = j14Str;
    if (finInput   && !finInput.value)   finInput.value   = todayStr;
    // Afficher le bon sous-panel
    switchCoursTab(_coursActiveTab || 'seances');
    if (_coursActiveTab === 'seances' || !_coursActiveTab) loadSeances();
    else if (_coursActiveTab === 'manuels') loadManuels();
  }
  else if (id === 'messages') { loadMessages(); _initMsgSwipe(); }
  else if (id === 'memos') { loadMemos(); _initSplitSwipe(document.querySelector('.memos-split'), memoBack); }
  else if (id === 'documents-parent') { loadVspDocuments(); _initSplitSwipe(document.querySelector('.docs-split'), vspDocBack); }
  else if (id === 'finances-parent') switchFinancesTab(_finActiveTab);
  else if (id === 'viescolaire-parent') switchVspTab(_vspActiveTab);
}

// ── Vie scolaire parent ────────────────────────────────────────────────────
let _vspActiveTab = 'dossier';
let _vspDocsData = null;
let _selectedVspDocKey = null;
let _vspDocFilter = null; // null = toutes catégories, string = clé de catégorie filtrée
let _vspFinancesData = null;
let _finActiveTab = 'situation';
let _paiementsData = null;       // données brutes paiements en ligne (catalog + soldes)
let _panierPaiements = new Map(); // itemId → { item, qte, montantSaisi }

const _VSP_FINANCE_TABS = new Set(['situation']);

function switchVspTab(tab) {
  _vspActiveTab = tab;
  document.querySelectorAll('#vsp-tabs .sub-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const _vspBar = document.getElementById('vsp-tabs');
  _initSubTabsOverflow(_vspBar); _scrollSubTabActive(_vspBar);
  if (tab === 'dossier')  loadDossierInscription();
  else if (tab === 'sondages') loadVspSondages();
}

function switchFinancesTab(tab) {
  _finActiveTab = tab;
  document.querySelectorAll('#finances-tabs .sub-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const _finBar = document.getElementById('finances-tabs');
  _initSubTabsOverflow(_finBar); _scrollSubTabActive(_finBar);
  const resultEl = document.getElementById('finances-result');
  if (resultEl) {
    if (tab === 'paiementsenligne') {
      resultEl.style.cssText = 'flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0';
    } else {
      resultEl.style.cssText = 'flex:1;overflow-y:auto;min-height:0';
    }
  }
  if (_VSP_FINANCE_TABS.has(tab)) loadVspFinances(tab);
  else if (tab === 'portemonnaie-parent') loadVspPorteMonnaieParent();
  else if (tab === 'modeReglement') loadVspModeReglement();
  else if (tab === 'paiementsenligne') loadVspPaiementsEnLigne();
}

async function loadVspFinances(tab) {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `finances-parent:${eleveId}`;
  const resultEl = document.getElementById('finances-result');
  const spinEl   = document.getElementById('spin-finances-parent');
  if (!resultEl) return;

  const renderForTab = data => {
    if (tab === 'situation')           return renderVspSituationFinanciere(data);
    if (tab === 'portemonnaie-parent') return renderVspPorteMonnaie(data);
    return '';
  };

  // Si les données sont déjà en mémoire, re-render sans refetch
  if (_vspFinancesData) {
    resultEl.innerHTML = renderForTab(_vspFinancesData);
    return;
  }

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/comptes/detail.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST', headers, body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; _vspFinancesData = data; resultEl.innerHTML = renderForTab(data); updateFreshnessLabel('finances-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; _vspFinancesData = data; resultEl.innerHTML = renderForTab(data); updateFreshnessLabel('finances-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

async function loadVspPorteMonnaieParent() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `portemonnaie-parent:${eleveId}`;
  const resultEl = document.getElementById('finances-result');
  const spinEl   = document.getElementById('spin-finances-parent');
  if (!resultEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/comptes/detail.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST', headers,
      body: `data=${encodeURIComponent(JSON.stringify({ eleveId }))}`
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspPorteMonnaie(data); updateFreshnessLabel('finances-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspPorteMonnaie(data); updateFreshnessLabel('finances-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function _renderEcritureRow(e) {
  const montant = typeof e.montant === 'number' ? e.montant : 0;
  const signe   = montant > 0 ? '+' : '';
  const mCoul   = montant < 0 ? '#b91c1c' : (montant > 0 ? '#15803d' : 'var(--text3)');
  const dateStr = e.date ? e.date.split('T')[0].split('-').reverse().join('/') : '';
  const dlBtn = e.idPieceJointe
    ? `<button onclick="downloadVspFile(${e.idPieceJointe},'${encodeURIComponent(e.libelle || 'facture').replace(/'/g,'%27')}.pdf','Facture')" title="Télécharger"
        style="margin-left:6px;padding:2px 7px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);color:var(--text2);font-size:11px;cursor:pointer">📄</button>`
    : '';
  return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border2);font-size:13px">
    <div style="flex:1;min-width:0;display:flex;align-items:center;flex-wrap:wrap;gap:4px">
      <span style="color:var(--text)">${e.libelle || '—'}</span>
      ${dateStr ? `<span style="color:var(--text3);font-size:11px">${dateStr}</span>` : ''}
      ${dlBtn}
    </div>
    <span style="font-weight:600;color:${mCoul};white-space:nowrap;margin-left:12px">${signe}${montant.toFixed(2)} €</span>
  </div>`;
}

function renderVspSituationFinanciere(data) {
  const comptes = (data?.comptes || []).filter(c => c.typeCompte === 'standard');
  if (!comptes.length) return '<p style="color:var(--text3);font-size:14px">Aucun compte disponible.</p>';
  let html = '';
  comptes.forEach(c => {
    const solde   = typeof c.solde === 'number' ? c.solde : 0;
    const soldeCoul = solde < 0 ? '#b91c1c' : (solde === 0 ? 'var(--text3)' : '#15803d');
    html += `<div style="background:var(--bg3);border-radius:10px;padding:14px 16px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-weight:600;font-size:15px">${c.libelle || c.libelleCompte}</div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:${soldeCoul}">${solde >= 0 ? '+' : ''}${solde.toFixed(2)} €</div>
          <div style="font-size:11px;color:var(--text3)">Solde</div>
        </div>
      </div>`;

    if (c.accomptesEtCautions?.length) {
      html += `<div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:10px">
        <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Acomptes et cautions</div>`;
      c.accomptesEtCautions.forEach(a => {
        html += `<div style="font-size:13px;color:var(--text);padding:4px 0;border-bottom:1px solid var(--border2)">${a}</div>`;
      });
      html += '</div>';
    }

    if (c.avenir?.length) {
      html += `<div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:10px">
        <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">À venir</div>`;
      c.avenir.forEach(a => {
        const dateStr = a.date ? a.date.split('-').reverse().join('/') : '';
        const m = typeof a.montant === 'number' ? a.montant : 0;
        const mCoul = m < 0 ? '#b91c1c' : '#b45309';
        html += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--border2);font-size:13px">
          <div><span style="color:var(--text)">${a.libelle || '—'}</span>${dateStr ? `<span style="color:var(--text3);font-size:11px;margin-left:8px">${dateStr}</span>` : ''}</div>
          <span style="font-weight:600;color:${mCoul};white-space:nowrap;margin-left:12px">${m >= 0 ? '+' : ''}${m.toFixed(2)} €</span>
        </div>`;
      });
      html += '</div>';
    }

    if (c.ecritures?.length) {
      html += `<div style="border-top:1px solid var(--border);padding-top:10px">
        <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Historique</div>`;
      c.ecritures.filter(e => !e.idPieceJointe).forEach(e => { html += _renderEcritureRow(e); });
      html += '</div>';
    }

    html += '</div>';
  });
  return html;
}

function renderVspPorteMonnaie(data) {
  const comptes = (data?.comptes || []).filter(c => c.typeCompte === 'portemonnaie' || c.typeCompte === 'pmactivite');
  if (!comptes.length) return '<p style="color:var(--text3);font-size:14px">Aucun porte-monnaie disponible.</p>';
  let html = '';
  comptes.forEach(c => {
    const solde   = typeof c.solde === 'number' ? c.solde : 0;
    const soldeCoul = solde < 0 ? '#b91c1c' : (solde < 5 ? '#b45309' : '#15803d');
    const ecritures = Array.isArray(c.ecritures) ? c.ecritures : [];
    html += `<div style="background:var(--bg3);border-radius:10px;padding:14px 16px;margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div>
          <div style="font-weight:600;font-size:15px">${c.libelle || c.libelleCompte}</div>
          ${c.codeCompte ? `<div style="color:var(--text3);font-size:12px">${c.codeCompte}</div>` : ''}
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;color:${soldeCoul}">${solde.toFixed(2)} €</div>
          <div style="font-size:11px;color:var(--text3)">Solde</div>
        </div>
      </div>`;
    const avenir = Array.isArray(c.avenir) ? c.avenir : [];
    if (avenir.length) {
      html += `<div style="border-top:1px solid var(--border);padding-top:10px;margin-bottom:10px">
        <div style="font-size:12px;font-weight:600;color:#b91c1c;margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Consommations en cours</div>`;
      avenir.forEach(a => {
        const m = typeof a.montant === 'number' ? a.montant : 0;
        const absM = Math.abs(m);
        const dateStr = a.date ? a.date.split('T')[0].split('-').reverse().join('/') : '';
        html += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:5px 0;border-bottom:1px solid var(--border2);font-size:13px">
          <div><span style="color:var(--text)">${a.libelle || '—'}</span>${dateStr ? `<span style="color:var(--text3);font-size:11px;margin-left:8px">${dateStr}</span>` : ''}</div>
          <span style="font-weight:600;color:#b91c1c;white-space:nowrap;margin-left:12px">-${absM.toFixed(2)} €</span>
        </div>`;
      });
      html += '</div>';
    }
    if (ecritures.length) {
      html += `<div style="border-top:1px solid var(--border);padding-top:8px">
        <div style="font-size:12px;font-weight:600;color:var(--text2);margin-bottom:6px;text-transform:uppercase;letter-spacing:.04em">Historique</div>`;
      ecritures.forEach(e => {
        html += _renderEcritureRow(e);
        if (e.ecritures?.length) {
          const parentIsDebit = typeof e.montant === 'number' && e.montant < 0;
          html += `<div style="margin:2px 0 6px 12px;padding-left:10px;border-left:2px solid var(--border2)">`;
          e.ecritures.forEach(s => {
            const sm = typeof s.montant === 'number' ? s.montant : 0;
            const absM = Math.abs(sm);
            const sc = parentIsDebit ? '#b91c1c' : (sm < 0 ? '#b91c1c' : (sm > 0 ? '#15803d' : 'var(--text3)'));
            const sd = s.date ? s.date.split('T')[0].split('-').reverse().join('/') : '';
            html += `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text2);padding:2px 0">
              <span>${s.libelle || '—'}${sd ? ` <span style="color:var(--text3)">${sd}</span>` : ''}</span>
              <span style="color:${sc};white-space:nowrap;margin-left:8px">${parentIsDebit ? '-' : (sm > 0 ? '+' : '')}${absM.toFixed(2)} €</span>
            </div>`;
          });
          html += '</div>';
        }
      });
      html += '</div>';
    } else {
      html += '<div style="color:var(--text3);font-size:13px;margin-top:6px">Aucune écriture.</div>';
    }
    html += '</div>';
  });
  return html;
}

async function loadVspModeReglement() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `mode-reglement:${eleveId}`;
  const resultEl = document.getElementById('finances-result');
  const spinEl   = document.getElementById('spin-finances-parent');
  if (!resultEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/famillemodedereglement.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST', headers, body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspModeReglement(data); updateFreshnessLabel('finances-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspModeReglement(data); updateFreshnessLabel('finances-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderVspModeReglement(data) {
  if (!data) return '<p style="color:var(--text3);font-size:14px">Aucune information disponible.</p>';

  const kv = (label, value) => {
    if (!value && value !== false) return '';
    const display = typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : String(value);
    return `<div style="display:flex;gap:12px;padding:7px 0;border-bottom:1px solid var(--border2);font-size:13px">
      <span style="color:var(--text3);flex:0 0 160px">${label}</span>
      <span style="color:var(--text);font-weight:500">${display}</span>
    </div>`;
  };

  let html = `<div style="background:var(--bg3);border-radius:10px;padding:14px 16px;margin-bottom:14px">`;

  if (data.demandeencours) {
    html += `<div style="margin-bottom:12px;padding:8px 12px;border-radius:8px;background:#fffbeb;border:1px solid #fde68a;font-size:13px;color:#b45309;font-weight:500">
      ⏳ Une demande de modification est en cours
    </div>`;
  }

  html += kv('Mode de règlement', data.modedereglement);
  html += kv('Titulaire', data.tire);
  html += kv('IBAN', data.iban);
  html += kv('Domiciliation', data.domiciliation);
  html += kv('BIC', data.bic);

  html += '</div>';
  return html;
}

async function loadVspPaiementsEnLigne() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `paiements-enligne:${eleveId}`;
  const resultEl = document.getElementById('finances-result');
  const spinEl   = document.getElementById('spin-finances-parent');
  if (!resultEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const [rPaiements, rSoldes] = await Promise.all([
      fetch(`${getProxy()}/v3/boutique/paiementsenligne.awp?verbe=get&v=${API_VERSION}`, { method: 'POST', headers, body: 'data={}' }),
      fetch(`${getProxy()}/v3/comptes/sansdetails.awp?verbe=get&v=${API_VERSION}`,        { method: 'POST', headers, body: 'data={}' }),
    ]);
    const [dPaiements, dSoldes] = await Promise.all([rPaiements.json(), rSoldes.json()]);
    if (dPaiements.code !== 200) throw new Error(dPaiements.message || `Code ${dPaiements.code}`);
    const soldesParEleve = {};
    if (dSoldes.code === 200 && Array.isArray(dSoldes.data?.comptes)) {
      dSoldes.data.comptes
        .filter(c => c.typeCompte === 'portemonnaie' || c.typeCompte === 'pmactivite')
        .forEach(c => { if (c.idEleve != null) soldesParEleve[String(c.idEleve)] = typeof c.solde === 'number' ? c.solde : null; });
    }
    return { paiements: dPaiements.data, soldesParEleve };
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; _paiementsData = data; resultEl.innerHTML = renderVspPaiementsEnLigne(data); updateFreshnessLabel('finances-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; _paiementsData = data; resultEl.innerHTML = renderVspPaiementsEnLigne(data); updateFreshnessLabel('finances-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function addToPanier(itemId) {
  if (!_paiementsData) return;
  let found = null;
  for (const g of (_paiementsData.paiements || [])) {
    for (const p of (g.paiements || [])) { if (p.id === itemId) { found = p; break; } }
    if (found) break;
  }
  if (!found) return;
  if (_panierPaiements.has(itemId)) {
    if (found.quantiteModifiable) _panierPaiements.get(itemId).qte++;
  } else {
    _panierPaiements.set(itemId, { item: found, qte: 1, montantSaisi: typeof found.montant === 'number' ? found.montant : 0 });
  }
  _refreshPanierUI();
}

function removeFromPanier(itemId) {
  _panierPaiements.delete(itemId);
  _refreshPanierUI();
}

function updatePanierQte(itemId, delta) {
  const entry = _panierPaiements.get(itemId);
  if (!entry) return;
  entry.qte = Math.max(1, entry.qte + delta);
  _refreshPanierUI();
}

function updatePanierMontant(itemId, value) {
  const entry = _panierPaiements.get(itemId);
  if (!entry) return;
  entry.montantSaisi = Math.max(0, parseFloat(value) || 0);
  // Mise à jour du sous-total et total sans re-render complet
  const row = document.querySelector(`[data-panier-row="${CSS.escape(itemId)}"]`);
  if (row) {
    const st = row.querySelector('[data-panier-st]');
    if (st) st.textContent = (entry.montantSaisi * entry.qte).toFixed(2) + ' €';
  }
  _updatePanierTotal();
}

function _updatePanierTotal() {
  let total = 0;
  _panierPaiements.forEach(({ item, qte, montantSaisi }) => {
    const u = item.montantModifiable ? montantSaisi : (typeof item.montant === 'number' ? item.montant : 0);
    total += u * qte;
  });
  const el = document.getElementById('panier-total');
  if (el) el.textContent = total.toFixed(2) + ' €';
}

function _refreshPanierUI() {
  const panierEl = document.getElementById('panier-paiements');
  if (!panierEl) return;
  panierEl.innerHTML = _renderPanierPaiements();
  // Mettre à jour l'état des boutons "Ajouter"
  document.querySelectorAll('[data-panier-id]').forEach(btn => {
    const id = btn.dataset.panierId;
    const inCart = _panierPaiements.has(id);
    const entry = _panierPaiements.get(id);
    const locked = inCart && entry && !entry.item.quantiteModifiable;
    btn.textContent = inCart ? '✓ Ajouté' : 'Ajouter au panier';
    btn.style.background = inCart ? '#15803d' : '#1d4ed8';
    btn.disabled = locked;
    btn.style.opacity = locked ? '0.65' : '1';
    btn.style.cursor  = locked ? 'default' : 'pointer';
  });
}

function _renderPanierPaiements() {
  if (_panierPaiements.size === 0) {
    return `<div style="color:var(--text3);font-size:13px;text-align:center;padding:16px 0">Votre panier est vide.</div>`;
  }
  let total = 0;
  let rows = '';
  _panierPaiements.forEach((entry, itemId) => {
    const { item, qte, montantSaisi } = entry;
    const montantUnit = item.montantModifiable ? montantSaisi : (typeof item.montant === 'number' ? item.montant : 0);
    const sousTotal = montantUnit * qte;
    total += sousTotal;
    const eid = encodeURIComponent(itemId).replace(/'/g, '%27');

    const montantUnitHtml = item.montantModifiable
      ? `<input type="number" min="0" step="1" value="${montantSaisi.toFixed(2)}"
           onchange="updatePanierMontant('${eid}',this.value)"
           style="width:68px;text-align:right;border:1px solid var(--border);border-radius:6px;padding:3px 6px;background:var(--input-bg);color:var(--text);font-size:13px"> €`
      : `${montantUnit.toFixed(2)} €`;

    const qteHtml = item.quantiteModifiable
      ? `<div style="display:flex;align-items:center;gap:4px">
           <button onclick="updatePanierQte('${eid}',-1)" style="width:22px;height:22px;border-radius:50%;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px;line-height:1;cursor:pointer;padding:0">−</button>
           <span style="min-width:18px;text-align:center;font-size:13px">${qte}</span>
           <button onclick="updatePanierQte('${eid}',1)"  style="width:22px;height:22px;border-radius:50%;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:14px;line-height:1;cursor:pointer;padding:0">+</button>
         </div>`
      : `<span style="font-size:13px;color:var(--text2)">${qte}</span>`;

    rows += `<div class="panier-row" data-panier-row="${itemId}" style="display:flex;align-items:center;gap:10px;padding:8px 4px;border-bottom:1px solid var(--border2)">
      <div style="flex:1;min-width:0;font-size:13px;font-weight:500;color:var(--text)">${item.libellePanier || item.libelle}</div>
      <div style="white-space:nowrap;color:var(--text2);font-size:13px">${montantUnitHtml}</div>
      <div style="white-space:nowrap;text-align:center">${qteHtml}</div>
      <div data-panier-st style="white-space:nowrap;min-width:64px;text-align:right;font-weight:600;font-size:13px;color:var(--text)">${sousTotal.toFixed(2)} €</div>
      <button class="btn-remove-panier" onclick="removeFromPanier('${eid}')" title="Supprimer"
        style="flex-shrink:0;width:24px;height:24px;border-radius:50%;border:1px solid var(--border);background:var(--bg2);color:#b91c1c;font-size:13px;line-height:1;cursor:pointer;padding:0">✕</button>
    </div>`;
  });
  return rows + `<div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;padding-top:10px;margin-top:2px">
    <span style="font-size:13px;color:var(--text2)">Total</span>
    <span id="panier-total" style="font-size:18px;font-weight:700;color:var(--text)">${total.toFixed(2)} €</span>
  </div>`;
}

function openPaiementDialog() {
  let rows = '';
  let total = 0;
  _panierPaiements.forEach(({ item, qte, montantSaisi }) => {
    const u = item.montantModifiable ? montantSaisi : (typeof item.montant === 'number' ? item.montant : 0);
    const st = u * qte;
    total += st;
    rows += `<div style="display:flex;justify-content:space-between;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--border2);font-size:13px">
      <span style="color:var(--text)">${item.libellePanier || item.libelle}</span>
      <span style="color:var(--text2);white-space:nowrap;margin-left:12px">${qte} × ${u.toFixed(2)} € = <strong>${st.toFixed(2)} €</strong></span>
    </div>`;
  });
  if (!rows) rows = `<p style="color:var(--text3);font-size:13px">Panier vide.</p>`;

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;display:flex;align-items:center;justify-content:center';
  overlay.innerHTML = `
    <div style="background:var(--bg);border-radius:12px;padding:24px;width:min(480px,90vw);max-height:80vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)">
      <div style="font-size:16px;font-weight:700;color:var(--text);margin-bottom:16px">Récapitulatif du panier</div>
      <div style="margin-bottom:16px">${rows}</div>
      ${total > 0 ? `<div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-bottom:16px;padding-top:4px">
        <span style="font-size:13px;color:var(--text2)">Total</span>
        <span style="font-size:18px;font-weight:700;color:var(--text)">${total.toFixed(2)} €</span>
      </div>` : ''}
      <div style="background:#fef9c3;border:1px solid #fde047;border-radius:8px;padding:10px 14px;font-size:13px;color:#854d0e;margin-bottom:20px">
        🚧 WIP — coming soon
      </div>
      <div style="display:flex;justify-content:flex-end">
        <button onclick="this.closest('[style*=fixed]').remove()" style="padding:7px 18px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:600;cursor:pointer">Fermer</button>
      </div>
    </div>`;
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  document.body.appendChild(overlay);
}

function renderVspPaiementsEnLigne(data) {
  const paiementsGroups = Array.isArray(data?.paiements) ? data.paiements : (Array.isArray(data) ? data : []);
  const soldesParEleve  = data?.soldesParEleve || {};
  if (!paiementsGroups.length) return '<p style="color:var(--text3);font-size:14px">Aucun paiement en ligne disponible.</p>';

  let html = '';
  paiementsGroups.forEach(group => {
    html += `<div style="margin-bottom:20px">
      <div style="font-size:13px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">${group.libelle || ''}</div>`;

    (group.paiements || []).forEach(p => {
      const montant = typeof p.montant === 'number' ? p.montant : 0;
      const typeBadge = p.typePaiement === 'pm'
        ? `<span style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500">Porte-monnaie</span>`
        : `<span style="font-size:11px;background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:10px;font-weight:500">Service</span>`;
      const imgUrl = p.img ? `https:${p.img}` : '';
      const imgHtml = imgUrl
        ? `<img src="${imgUrl}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:8px;flex-shrink:0" onerror="this.style.display='none'">`
        : `<div style="width:48px;height:48px;border-radius:8px;background:var(--bg4);flex-shrink:0"></div>`;
      let detail = '';
      if (p.detail) {
        try { detail = b64d(p.detail.replace(/\n/g, '')); } catch(e) { detail = ''; }
      }

      // Colonne prix (droite)
      const inCart = _panierPaiements.has(p.id);
      const locked = inCart && !p.quantiteModifiable;
      const btnLabel = inCart ? '✓ Ajouté' : 'Ajouter au panier';
      const btnBg    = inCart ? '#15803d' : '#1d4ed8';
      const encodedId = encodeURIComponent(p.id).replace(/'/g, '%27');

      let priceHtml = `<div style="text-align:right;white-space:nowrap;flex-shrink:0;min-width:96px">
        <div style="font-size:16px;font-weight:700;color:var(--text)">${montant.toFixed(2)} €</div>`;
      if (p.montantModifiable) {
        priceHtml += `<div style="font-size:11px;color:var(--text3)">Montant libre</div>`;
      }
      if (p.typePaiement === 'pm' && p.idEleve != null) {
        const solde = soldesParEleve[String(p.idEleve)];
        if (solde != null) {
          const soldeCoul = solde < 0 ? '#b91c1c' : (solde < 5 ? '#b45309' : '#15803d');
          priceHtml += `<div style="margin-top:8px;padding-top:6px;border-top:1px solid var(--border2)">
            <div style="font-size:11px;color:var(--text3)">Solde actuel</div>
            <div style="font-size:14px;font-weight:600;color:${soldeCoul}">${solde.toFixed(2)} €</div>
          </div>`;
        }
      }
      priceHtml += `<button data-panier-id="${p.id}" onclick="addToPanier('${encodedId}')"
        class="btn-add-panier" ${locked ? 'disabled' : ''}
        style="margin-top:10px;padding:5px 10px;border-radius:7px;border:none;background:${btnBg};color:#fff;font-size:12px;font-weight:600;cursor:${locked ? 'default' : 'pointer'};opacity:${locked ? '0.65' : '1'};white-space:nowrap"
        >${btnLabel}</button>`;
      priceHtml += '</div>';

      html += `<div class="panier-card" style="background:var(--bg3);border-radius:10px;padding:12px 14px;margin-bottom:8px;display:flex;gap:12px;align-items:flex-start">
        ${imgHtml}
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:${detail ? '6px' : '0'}">
            <span style="font-weight:600;font-size:14px;color:var(--text)">${p.libelle || '—'}</span>
            ${typeBadge}
          </div>
          ${detail ? `<div style="font-size:12px;color:var(--text3);white-space:pre-line">${detail}</div>` : ''}
        </div>
        ${priceHtml}
      </div>`;
    });

    html += '</div>';
  });

  // Liste scrollable + panier fixe en bas (flex column sur #finances-result)
  html = `<div style="flex:1;overflow-y:auto;min-height:0;padding-bottom:8px">${html}</div>
  <div style="flex-shrink:0;padding-top:6px">
    <div style="background:var(--bg3);border-radius:10px;padding:14px 16px;box-shadow:0 -2px 8px rgba(0,0,0,.07)">
      <div style="font-size:13px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px">🛒 Panier</div>
      <div id="panier-paiements" style="max-height:250px;overflow-y:auto">${_renderPanierPaiements()}</div>
      <div style="display:flex;justify-content:flex-end;margin-top:12px">
        <button onclick="openPaiementDialog()" style="padding:8px 20px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Payer</button>
      </div>
    </div>
  </div>`;

  return html;
}

async function loadVspSondages() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `sondages-parent:${eleveId}`;
  const resultEl = document.getElementById('vsp-result');
  const spinEl   = document.getElementById('spin-vsp');
  if (!resultEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/edforms.awp?verbe=getlist&v=${API_VERSION}`, {
      method: 'POST', headers, body: `data=${encodeURIComponent(JSON.stringify({ anneeForms: getCurrentAnnee(), typeEntity: '1', idEntity: eleveId }))}`
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspSondages(data); updateFreshnessLabel('viescolaire-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVspSondages(data); updateFreshnessLabel('viescolaire-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderVspSondages(data) {
  const items = Array.isArray(data) ? data : (data?.forms || data?.sondages || []);
  const title = `<div style="font-weight:600;font-size:15px;margin-bottom:12px">Formulaires et sondages (${items.length})</div>`;
  if (!items.length) return title + `<div style="background:var(--bg3);border-radius:8px;padding:12px 16px;font-size:13px;color:var(--text2)">Aucun formulaire / sondage disponible actuellement !</div>`;
  let rows = '';
  items.forEach(s => {
    const titre = (s.titre || s.title || s.libelle || '').trim();
    const date = (s.date || s.dateDebut || s.dateFin || '').trim();
    const statut = (s.statut || s.status || '').trim();
    const done = statut && statut.toLowerCase() !== 'non_effectue' && statut.toLowerCase() !== 'non effectué';
    const description = (s.description || '').trim();
    rows += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${titre || 'Formulaire sans titre'}</span>
        ${done ? '<span style="color:#15803d;font-weight:500;font-size:13px">Répondu</span>'
               : '<span style="color:#b45309;font-weight:500;font-size:13px">En attente</span>'}
      </div>
      ${description ? `<div style="color:var(--text2)">${description}</div>` : ''}
      ${date ? `<div style="color:var(--text3);font-size:13px">${date}</div>` : ''}
    </div>`;
  });
  return title + rows;
}

async function loadVspDocuments() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `documents-parent:${eleveId}`;
  const listEl = document.getElementById('vsp-doc-list');
  const spinEl = document.getElementById('spin-documents-parent');
  if (!listEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/familledocuments.awp?archive=&verbe=get&v=${API_VERSION}`, {
      method: 'POST', headers, body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; listEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; _vspDocsData = data; renderVspDocToolbar(data); listEl.innerHTML = renderVspDocList(data); updateFreshnessLabel('documents-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; _vspDocsData = data; renderVspDocToolbar(data); listEl.innerHTML = renderVspDocList(data); updateFreshnessLabel('documents-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    listEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

const VSP_DOC_CATEGORIES = [
  { key: 'administratifs', label: 'Administratifs',               shortLabel: 'Administratifs' },
  { key: 'notes',          label: 'Bulletins et relevés de notes', shortLabel: 'Bulletins' },
  { key: 'factures',       label: 'Factures',                     shortLabel: 'Factures' },
  { key: 'inscriptions',   label: 'Inscriptions',                 shortLabel: 'Inscriptions' },
  { key: 'viescolaire',    label: 'Vie scolaire',                 shortLabel: 'Vie scolaire' },
  { key: 'entreprises',    label: 'Entreprises',                  shortLabel: 'Entreprises' },
];

function _vspPersonnesMap(data) {
  const map = {};
  (data?.listesPiecesAVerser?.personnes || []).forEach(p => { map[p.id] = `${p.prenom} ${p.nom}`; });
  return map;
}

function renderVspDocToolbar(data) {
  const toolbarEl = document.getElementById('vsp-doc-toolbar');
  if (!toolbarEl) return;
  const activeCats = VSP_DOC_CATEGORIES.filter(cat => (data[cat.key] || []).length > 0);
  if (activeCats.length <= 1) { toolbarEl.innerHTML = ''; return; }
  const svgFilter = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="opacity:.45;flex-shrink:0;color:var(--text2)"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`;
  let html = svgFilter;
  activeCats.forEach(cat => {
    const items = data[cat.key] || [];
    const count = items.length;
    const hasPendingSig = items.some(d => d.signatureDemandee && !d.signature?.dateValidation);
    const pressed = _vspDocFilter === cat.key ? 'true' : 'false';
    const sigIcon = hasPendingSig ? ' ✍' : '';
    html += `<button class="vsp-cat-filter-btn" aria-pressed="${pressed}" onclick="toggleVspDocFilter('${cat.key}')">${cat.shortLabel}${sigIcon} (${count})</button>`;
  });
  toolbarEl.innerHTML = html;
}

function toggleVspDocFilter(key) {
  _vspDocFilter = (_vspDocFilter === key) ? null : key;
  _selectedVspDocKey = null;
  if (_vspDocsData) {
    renderVspDocToolbar(_vspDocsData);
    document.getElementById('vsp-doc-list').innerHTML = renderVspDocList(_vspDocsData);
    const detailEl = document.getElementById('vsp-doc-detail');
    if (detailEl) { detailEl.style.alignItems = 'center'; detailEl.style.justifyContent = 'center'; detailEl.innerHTML = '<span style="color:var(--text4);font-size:13px;text-align:center">Sélectionne un document<br>pour voir le détail ici</span>'; }
  }
}

function renderVspDocList(data) {
  const personnes = _vspPersonnesMap(data);
  let html = '';
  let firstVisible = true;
  const catsToShow = _vspDocFilter
    ? VSP_DOC_CATEGORIES.filter(c => c.key === _vspDocFilter)
    : VSP_DOC_CATEGORIES;
  catsToShow.forEach(cat => {
    const items = data[cat.key] || [];
    if (!items.length) return;
    const sepStyle = firstVisible ? '' : 'margin-top:20px;border-top:1px solid var(--border2);padding-top:12px;';
    firstVisible = false;
    html += `<div style="font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;padding:10px 4px 4px;${sepStyle}">${cat.label} (${items.length})</div>`;
    items.forEach((doc, i) => {
      const key = `${cat.key}:${i}`;
      const isSigned  = !!doc.signature?.dateValidation;
      const needsSig  = doc.signatureDemandee && !isSigned;
      const dateStr   = (doc.date || '').substring(0, 10);
      const eleveNom  = doc.idEleve ? (personnes[doc.idEleve] || '') : '';
      const sigBadge  = isSigned  ? `<span style="color:#15803d;font-size:11px;font-weight:600;flex-shrink:0">✓</span>`
                      : needsSig  ? `<span style="font-size:11px;font-weight:600;flex-shrink:0;background:#b45309;color:#fff;padding:1px 7px;border-radius:10px;white-space:nowrap">✍ À signer</span>`
                      : '';
      const isSelected = _selectedVspDocKey === key;
      const needsSigBorder = needsSig && !isSelected ? 'border-left:3px solid #b45309;padding-left:5px;' : '';
      html += `<div data-vsp-doc-key="${key}" onclick="openVspDocDetail('${cat.key}',${i})"
        style="display:flex;align-items:flex-start;padding:7px 4px;border-bottom:1px solid var(--border2);font-size:13px;cursor:pointer;border-radius:4px;${needsSigBorder}${isSelected ? 'box-shadow:inset 3px 0 0 #1d4ed8;background:var(--bg3)' : ''}"
        onmouseover="if('${key}'!==_selectedVspDocKey)this.style.background='var(--bg3)'"
        onmouseout="if('${key}'!==_selectedVspDocKey)this.style.background='transparent'">
        <div style="flex:1;min-width:0">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
            <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${doc.libelle}</span>
            ${sigBadge}
          </div>
          <div style="color:var(--text3);font-size:12px;margin-top:1px">${[dateStr, eleveNom].filter(Boolean).join(' · ')}</div>
        </div>
      </div>`;
    });
  });
  return html || `<p style="color:var(--text3);font-size:14px">Aucun document disponible.</p>`;
}

function openVspDocDetail(category, idx) {
  const key = `${category}:${idx}`;
  _selectedVspDocKey = key;
  document.querySelectorAll('[data-vsp-doc-key]').forEach(el => {
    const sel = el.dataset.vspDocKey === key;
    el.style.boxShadow = sel ? 'inset 3px 0 0 #1d4ed8' : '';
    el.style.background = sel ? 'var(--bg3)' : 'transparent';
  });

  const detailEl = document.getElementById('vsp-doc-detail');
  if (!detailEl || !_vspDocsData) return;
  const doc = (_vspDocsData[category] || [])[idx];
  if (!doc) return;

  const personnes = _vspPersonnesMap(_vspDocsData);
  const isSigned = !!doc.signature?.dateValidation;
  const needsSig = doc.signatureDemandee && !isSigned;
  const dateStr  = (doc.date || '').substring(0, 10);
  const eleveNom = doc.idEleve ? (personnes[doc.idEleve] || '') : '';
  const typeStr  = doc.type || '';
  const catLabel = VSP_DOC_CATEGORIES.find(c => c.key === category)?.label || '';

  let sigHtml = '';
  if (isSigned) {
    const sigDate = doc.signature.dateValidation.substring(0, 10);
    const tel = doc.signature.tel ? ` · ${doc.signature.tel}` : '';
    sigHtml = `<div style="margin-top:14px;padding:10px 14px;border-radius:8px;background:#f0fdf4;border:1px solid #bbf7d0">
      <span style="font-size:13px;font-weight:600;color:#15803d">✓ Signé le ${sigDate}${tel}</span>
    </div>`;
  } else if (needsSig) {
    sigHtml = `<button onclick="signVspDocument('${category}',${idx})"
      style="margin-top:16px;padding:8px 20px;border-radius:8px;border:none;background:#b45309;color:#fff;font-size:13px;font-weight:600;cursor:pointer">
      Signer
    </button>`;
  }

  const fileId = doc.id || doc.idFichier || null;
  const dlFilename = (doc.libelle || 'document') + (doc.libelle?.toLowerCase().endsWith('.pdf') ? '' : '.pdf');
  const dlFilenameEnc = encodeURIComponent(dlFilename).replace(/'/g, '%27');
  const VSP_DOWNLOAD_TYPES = { notes: 'Note', factures: 'Facture', administratifs: 'Doc', inscriptions: 'INSCR_DOC_A_SIGNER' };
  const dlType = VSP_DOWNLOAD_TYPES[category];
  const dlBtn = (dlType && fileId)
    ? `<button onclick="downloadVspFile(${fileId},'${dlFilenameEnc}','${dlType}')"
        style="margin-top:16px;display:flex;align-items:center;gap:7px;padding:8px 16px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:500;cursor:pointer">
        📄 Télécharger le PDF
      </button>`
    : '';

  detailEl.style.alignItems = 'flex-start';
  detailEl.style.justifyContent = 'flex-start';
  document.querySelector('.docs-split')?.classList.add('show-detail');
  detailEl.innerHTML = `
    <div style="font-size:15px;font-weight:600;line-height:1.4;margin-bottom:10px">${doc.libelle}</div>
    <div style="font-size:13px;color:var(--text3)">${[catLabel, typeStr].filter(Boolean).join(' · ')}</div>
    ${dateStr   ? `<div style="font-size:13px;color:var(--text3);margin-top:4px">${dateStr}</div>` : ''}
    ${eleveNom  ? `<div style="font-size:13px;color:var(--text3);margin-top:4px">Élève : ${eleveNom}</div>` : ''}
    ${sigHtml}
    ${dlBtn}`;
}

async function downloadVspFile(fileId, filenameEnc, leTypeDeFichier) {
  const filename = decodeURIComponent(filenameEnc);
  try {
    const dlUrl = `${getProxy()}/v3/telechargement.awp?verbe=get&fichierId=${fileId}&leTypeDeFichier=${leTypeDeFichier}&v=${API_VERSION}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    await triggerDownload(dlUrl, {
      method: 'POST',
      headers,
      body: `data=${encodeURIComponent(JSON.stringify({ forceDownload: 0, archive: false, anneeArchive: '' }))}`
    }, filename);
  } catch(e) {
    alert(`Erreur téléchargement : ${e.message}`);
  }
}

function _generateSignatureCanvas(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 532;
  canvas.height = 150;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Try cursive fonts in order
  const fonts = ['"Brush Script MT"', '"Segoe Script"', '"Comic Sans MS"', 'cursive'];
  ctx.font = `italic 56px ${fonts.join(', ')}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#1a1a1a';
  // Scale text to fit
  let fontSize = 56;
  while (ctx.measureText(name).width > canvas.width - 40 && fontSize > 20) {
    fontSize -= 4;
    ctx.font = `italic ${fontSize}px ${fonts.join(', ')}`;
  }
  ctx.fillText(name, canvas.width / 2, canvas.height / 2);
  return canvas.toDataURL('image/png');
}

async function signVspDocument(category, idx) {
  const doc = (_vspDocsData[category] || [])[idx];
  if (!doc) return;
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  if (!acc) return;

  const dark = document.body.classList.contains('dark');
  const dlgBg   = dark ? '#1e1e1e' : '#fff';
  const dlgText = dark ? '#f0f0ee' : '#1a1a1a';
  const inpBg   = dark ? '#2a2a2a' : '#fff';
  const inpBord = dark ? '#555' : '#ccc';

  const sigNom  = `${acc.prenom || ''} ${acc.nom || ''}`.trim().toUpperCase();
  const sigMail = acc.email || '';
  const sigId   = acc.id || acc.idLogin || 0;

  const signatureCanvas = _generateSignatureCanvas(sigNom);

  // Build OTP inputs (hidden initially)
  const otpInputs = Array.from({length: 6}, (_, i) => {
    const firstStyle = i === 0 ? `border:2px solid #3b82f6` : `border:1px solid ${inpBord}`;
    return `<input type="text" inputmode="numeric" maxlength="1" data-otp-idx="${i}"
      style="width:40px;height:44px;text-align:center;font-size:20px;font-weight:700;border-radius:6px;background:${inpBg};color:${dlgText};outline:none;${firstStyle}">`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1.5rem';

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.5rem;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.35);position:relative;font-family:inherit`;
  dialog.innerHTML = `
    <button id="sig-close-btn" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:${dark?'#666':'#aaa'}">×</button>
    <h3 style="margin:0 0 12px;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">CONFIRMATION DE LECTURE DU DOCUMENT</h3>
    <p style="font-size:13px;margin:0 0 14px;line-height:1.55;color:${dlgText}">Pour certifier que vous avez bien <strong>pris connaissance du document</strong>, nous vous demandons de <strong>confirmer votre identité par SMS.</strong></p>
    <div style="border:1px solid ${inpBord};border-radius:8px;padding:12px;margin-bottom:16px;background:${dark?'#2a2a2a':'#fff'};display:flex;align-items:center;justify-content:center;min-height:90px">
      <img src="${signatureCanvas}" style="max-width:100%;max-height:82px;display:block" alt="Signature">
    </div>

    <!-- Étape 1 : validation du numéro -->
    <div id="sig-step-phone">
      <div id="sig-phone-loading" style="font-size:13px;color:var(--text3);display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <span class="spinner" style="width:13px;height:13px"></span> Récupération du numéro…
      </div>
      <div id="sig-phone-form" style="display:none">
        <label style="font-size:13px;font-weight:600;color:${dlgText};display:block;margin-bottom:6px">Numéro de téléphone pour recevoir le code SMS</label>
        <input id="sig-tel-input" type="tel" autocomplete="tel"
          style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid ${inpBord};border-radius:8px;background:${inpBg};color:${dlgText};font-size:14px;outline:none;margin-bottom:6px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:14px">Vérifiez que ce numéro est correct avant d'envoyer le code.</div>
        <div id="sig-phone-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
        <div style="display:flex;justify-content:space-between;gap:8px">
          <button id="sig-cancel-btn" style="padding:8px 20px;border-radius:8px;border:1px solid ${inpBord};background:${dark?'#2a2a2a':'#f3f4f6'};color:${dlgText};font-size:14px;font-weight:500;cursor:pointer">Annuler</button>
          <button id="sig-send-btn" style="padding:8px 20px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Envoyer le code</button>
        </div>
      </div>
      <div id="sig-phone-fetch-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
    </div>

    <!-- Étape 2 : saisie du code OTP -->
    <div id="sig-step-otp" style="display:none">
      <div id="sig-otp-label" style="font-size:13px;font-weight:600;margin-bottom:10px;color:${dlgText}"></div>
      <div id="sig-otp-inputs" style="display:flex;gap:8px;margin-bottom:10px">${otpInputs}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Saisissez le code reçu par SMS pour vous authentifier</div>
      <div id="sig-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
      <div style="display:flex;justify-content:space-between;gap:8px">
        <button id="sig-cancel-btn2" style="padding:8px 20px;border-radius:8px;border:1px solid ${inpBord};background:${dark?'#2a2a2a':'#f3f4f6'};color:${dlgText};font-size:14px;font-weight:500;cursor:pointer">Annuler</button>
        <button id="sig-confirm-btn" disabled style="padding:8px 20px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;cursor:pointer;opacity:.5">Confirmer</button>
      </div>
    </div>`;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const closeBtn        = document.getElementById('sig-close-btn');
  const cancelBtn       = document.getElementById('sig-cancel-btn');
  const cancelBtn2      = document.getElementById('sig-cancel-btn2');
  const sendBtn         = document.getElementById('sig-send-btn');
  const confirmBtn      = document.getElementById('sig-confirm-btn');
  const stepPhone       = document.getElementById('sig-step-phone');
  const stepOtp         = document.getElementById('sig-step-otp');
  const phoneLoading    = document.getElementById('sig-phone-loading');
  const phoneForm       = document.getElementById('sig-phone-form');
  const phoneFetchError = document.getElementById('sig-phone-fetch-error');
  const phoneError      = document.getElementById('sig-phone-error');
  const telInput        = document.getElementById('sig-tel-input');
  const otpLabel        = document.getElementById('sig-otp-label');
  const errorEl         = document.getElementById('sig-error');
  const otpEls          = Array.from(document.querySelectorAll('#sig-otp-inputs input'));

  closeBtn.onclick   = () => overlay.remove();
  cancelBtn.onclick  = () => overlay.remove();
  cancelBtn2.onclick = () => overlay.remove();

  // OTP input auto-advance
  otpEls.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && i < otpEls.length - 1) otpEls[i + 1].focus();
      confirmBtn.disabled = !otpEls.every(el => el.value);
      confirmBtn.style.opacity = confirmBtn.disabled ? '.5' : '1';
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) { otpEls[i - 1].focus(); otpEls[i - 1].select(); }
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      otpEls.forEach((el, j) => { el.value = digits[j] || ''; });
      const next = otpEls.find(el => !el.value);
      if (next) next.focus(); else otpEls[otpEls.length - 1].focus();
      confirmBtn.disabled = !otpEls.every(el => el.value);
      confirmBtn.style.opacity = confirmBtn.disabled ? '.5' : '1';
    });
  });

  // ── Étape 1 : récupération du numéro via famillecoordonnees.awp ──────────
  let sigTel = '';
  try {
    const cr = await fetch(`${getProxy()}/v3/famillecoordonnees.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={}'
    });
    const cj = await cr.json();
    if (cj.code === 200) sigTel = cj.data?.responsable?.telMobile || cj.data?.responsable?.tel || '';
  } catch(_) {}

  phoneLoading.style.display = 'none';
  telInput.value = sigTel;
  phoneForm.style.display = '';
  telInput.focus();

  // ── Envoi du SMS (étape 1 → 2) ──────────────────────────────────────────
  sendBtn.onclick = async () => {
    const tel = telInput.value.trim();
    if (!tel) {
      phoneError.textContent = 'Veuillez saisir un numéro de téléphone.';
      phoneError.style.display = '';
      return;
    }
    phoneError.style.display = 'none';
    sendBtn.disabled = true;
    sendBtn.textContent = '…';

    try {
      const signataire = { idSignataire: sigId, typeSignataire: '1', telephone: tel, email: sigMail, demandeMail: false, nom: sigNom };
      const headers3ds = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
      if (twoFaToken) headers3ds['2fa-token'] = twoFaToken;
      const resp = await fetch(`${getProxy()}/v3/3DSecure.awp?verbe=get&v=${API_VERSION}`, {
        method: 'POST',
        headers: headers3ds,
        body: `data=${JSON.stringify({ signataire })}`
      });
      const json = await resp.json();
      if (json.code === 200 || json.code === 201) {
        sigTel = tel;
        stepPhone.style.display = 'none';
        otpLabel.textContent = `Code reçu par SMS au ${tel}`;
        stepOtp.style.display = '';
        otpEls[0].focus();
      } else {
        phoneError.textContent = json.message || 'Erreur lors de l\'envoi du SMS.';
        phoneError.style.display = '';
        sendBtn.disabled = false;
        sendBtn.textContent = 'Envoyer le code';
      }
    } catch(e) {
      phoneError.textContent = `Erreur réseau : ${e.message}`;
      phoneError.style.display = '';
      sendBtn.disabled = false;
      sendBtn.textContent = 'Envoyer le code';
    }
  };

  // ── Étape 2 : soumission du code et signature ────────────────────────────
  confirmBtn.onclick = async () => {
    const code = otpEls.map(el => el.value).join('');
    if (code.length < 6) return;
    errorEl.style.display = 'none';
    confirmBtn.disabled = true;
    confirmBtn.textContent = '…';

    const payload = {
      doc: {
        id: doc.id,
        type: doc.type || 'Doc',
        libelle: doc.libelle || '',
        date: doc.date || '',
        displayText: doc.displayText || doc.libelle || '',
        signatureDemandee: true,
        signature: doc.signature || {},
        etatSignatures: doc.etatSignatures || [],
        typeContexte: category,
        idDepot: doc.idDepot || ''
      },
      codeSecure: parseInt(code, 10),
      signatureCanvas
    };

    try {
      const headersPut = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
      if (twoFaToken) headersPut['2fa-token'] = twoFaToken;
      const resp = await fetch(`${getProxy()}/v3/familledocuments/${doc.id}.awp?verbe=put&v=${API_VERSION}`, {
        method: 'POST',
        headers: headersPut,
        body: `data=${JSON.stringify(payload)}`
      });
      const json = await resp.json();
      if (json.code === 200) {
        overlay.remove();
        // Update local cache so detail panel refreshes without re-fetching
        const docInCache = (_vspDocsData[category] || [])[idx];
        if (docInCache) {
          const today = new Date().toISOString().substring(0, 10);
          docInCache.signature = { dateValidation: today, tel: sigTel };
        }
        renderVspDocToolbar(_vspDocsData);
        document.getElementById('vsp-doc-list').innerHTML = renderVspDocList(_vspDocsData);
        openVspDocDetail(category, idx);
      } else {
        errorEl.textContent = json.message || 'Code incorrect ou expiré.';
        errorEl.style.display = '';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirmer';
        confirmBtn.style.opacity = '1';
      }
    } catch(e) {
      errorEl.textContent = `Erreur réseau : ${e.message}`;
      errorEl.style.display = '';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirmer';
      confirmBtn.style.opacity = '1';
    }
  };
}

async function loadDossierInscription() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `dossier-inscription:${eleveId}`;
  const resultEl = document.getElementById('vsp-result');
  const spinEl   = document.getElementById('spin-vsp');
  if (!resultEl) return;

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/inscriptions/familleDossierInscription.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST', headers, body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(d.message || `Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderDossierInscription(data); updateFreshnessLabel('viescolaire-parent', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderDossierInscription(data); updateFreshnessLabel('viescolaire-parent', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderDossierInscription(data) {
  if (!data) return `<p style="color:var(--text3);font-size:14px">Aucune donnée.</p>`;

  const card = (title, content) =>
    `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px;margin-bottom:14px">
      <div style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:12px">${title}</div>
      ${content}
    </div>`;

  const kv = (label, value) => {
    const display = (value === null || value === undefined || value === '') ? `<span style="color:var(--text4)">—</span>`
      : typeof value === 'boolean' ? (value ? 'Oui' : 'Non')
      : String(value);
    return `<div style="display:flex;gap:12px;padding:5px 0;border-bottom:1px solid var(--border2);font-size:13px">
      <span style="color:var(--text3);flex:0 0 180px">${label}</span>
      <span style="color:var(--text)">${display}</span>
    </div>`;
  };

  let html = '';

  // ── Statut ──
  const typeLabel = data.isReinscription ? 'Réinscription' : 'Inscription';
  const etatBadge = data.etat
    ? `<span style="margin-left:8px;font-size:11px;padding:2px 8px;border-radius:10px;background:#fef9c3;color:#854d0e">${data.etat}</span>`
    : '';
  html += card('Statut',
    kv('Type', typeLabel + etatBadge) +
    kv('Commentaire', data.commentaire || '')
  );

  // ── Facturation ──
  const f = data.facturation || {};
  const hasFactu = Object.values(f).some(v => v !== '' && v !== 0 && v !== false && !(typeof v === 'object' && Object.keys(v).length === 0));
  if (hasFactu) {
    html += card('Facturation',
      kv('Mode de règlement', f.modeReglement) +
      kv('Titulaire du compte', f.titulaireCompte) +
      kv('IBAN', f.IBAN) +
      kv('Domiciliation', f.domiciliation) +
      kv("Jour d'échéance", f.jourEcheance || '') +
      kv('Facture papier', f.facturePapier) +
      kv('Nb enfants à charge', f.nbEnfantsACharge || '') +
      kv('Cotisation APEL', f.cotisationAPEL || '')
    );
  }

  // ── Élèves ──
  if (data.eleves?.length) {
    const rows = data.eleves.map(e =>
      `<div style="font-size:13px;padding:6px 0;border-bottom:1px solid var(--border2);color:var(--text)">
        ${[e.prenom, e.nom].filter(Boolean).join(' ')}
        ${e.classe ? `<span style="color:var(--text3);margin-left:8px">${e.classe}</span>` : ''}
      </div>`
    ).join('');
    html += card('Élèves', rows);
  }

  // ── Pièces du dossier ──
  if (data.piecesDossier?.length) {
    const rows = data.piecesDossier.map(p =>
      `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border2);font-size:13px">
        <span style="color:var(--text)">${p.libelle || p.nom || JSON.stringify(p)}</span>
        ${p.statut ? `<span style="color:var(--text3);font-size:12px">${p.statut}</span>` : ''}
      </div>`
    ).join('');
    html += card('Pièces du dossier', rows);
  }

  // ── Documents de l'établissement ──
  if (data.documentsEtablissement?.length) {
    const rows = data.documentsEtablissement.map(d =>
      `<div style="font-size:13px;padding:6px 0;border-bottom:1px solid var(--border2);color:var(--text)">${d.libelle || d.nom || JSON.stringify(d)}</div>`
    ).join('');
    html += card("Documents de l'établissement", rows);
  }

  // ── Historique des paiements ──
  if (data.historiquePaiements?.length) {
    const rows = data.historiquePaiements.map(p =>
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border2);font-size:13px">
        <span style="color:var(--text)">${p.libelle || p.description || ''}</span>
        <span style="color:var(--text2);font-weight:500">${p.montant !== undefined ? p.montant + ' €' : ''}</span>
        <span style="color:var(--text3);font-size:12px">${p.date || ''}</span>
      </div>`
    ).join('');
    html += card('Historique des paiements', rows);
  }

  // Dossier indisponible (hors période d'inscription) — aucun contenu à afficher
  if (!html) return `<div style="border:1px solid var(--border);border-radius:10px;padding:48px 24px;text-align:center">
    <span style="font-size:13px;font-weight:600;color:var(--text2);letter-spacing:.04em">LE DOSSIER N'EST ACTUELLEMENT PAS DISPONIBLE</span>
  </div>`;
  return html;
}

function togglePwd() {
  const input = document.getElementById('password');
  const btn = document.getElementById('pwd-eye');
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁'; }
}

let cachedMessages = {};
let selectedMessageId = null;

let msgActiveTab = 'received';
// Timestamps de dernière mise à jour par onglet
const tabFreshness = {};
// Badges de nouveautés par onglet
const tabBadges = {};

function updateFreshnessLabel(tabId, ts) {
  tabFreshness[tabId] = ts;
  const el = document.getElementById('freshness-label');
  if (!el) return;
  const activeTab = document.querySelector('.tab.active')?.dataset?.tab;
  if (activeTab !== tabId) return;
  renderFreshnessLabel(tabId);
}

function renderFreshnessLabel(tabId) {
  const el = document.getElementById('freshness-label');
  if (!el) return;
  const ts = tabFreshness[tabId];
  if (!ts) { el.textContent = ''; return; }
  const diffMin = Math.round((Date.now() - ts) / 60000);
  if (diffMin < 1) el.textContent = 'à jour';
  else if (diffMin === 1) el.textContent = '1 min';
  else el.textContent = `${diffMin} min`;
}

// Mettre à jour le label toutes les minutes
setInterval(() => {
  const activeTab = document.querySelector('.tab.active')?.dataset?.tab;
  if (activeTab) renderFreshnessLabel(activeTab);
}, 60000);

function setBadge(tabId, count) {
  tabBadges[tabId] = count;
  const dot = document.getElementById('mobile-nav-badge');
  if (dot) dot.classList.toggle('visible', Object.values(tabBadges).some(v => v > 0));
  const tabEl = document.querySelector(`.tab[data-tab="${tabId}"]`);
  if (!tabEl) return;
  const existing = tabEl.querySelector('.tab-badge');
  if (count > 0) {
    if (!existing) {
      const badge = document.createElement('span');
      badge.className = 'tab-badge';
      badge.textContent = count;
      tabEl.appendChild(badge);
    } else {
      existing.textContent = count;
    }
  } else if (existing) {
    existing.remove();
  }
}

function clearBadge(tabId) { setBadge(tabId, 0); }
let msgData = null;
let msgUnreadOnly = false;

function renderMessages(data) {
  msgData = data;
  // Mettre à jour les labels et la classe active avec les vrais counts
  document.querySelectorAll('#panel-messages .sub-tab').forEach(b => {
    if (b.dataset.tab === 'received')      b.textContent = `Reçus (${msgCounts.received})`;
    if (b.dataset.tab === 'sent')          b.textContent = `Envoyés (${msgCounts.sent})`;
    if (b.dataset.tab === 'draft')         b.textContent = `Brouillons (${msgCounts.draft})`;
    if (b.dataset.tab === 'archived')      b.textContent = `Archivés (${msgCounts.archived})`;
    if (b.dataset.tab === 'correspondance' && _correspondancesCount > 0)
      b.textContent = `Correspondances (${_correspondancesCount})`;
    b.classList.toggle('active', b.dataset.tab === msgActiveTab);
  });
  return `<div id="msg-list">${renderMsgList()}</div>`;
}

function devoirBack() {
  document.querySelector('.devoirs-split')?.classList.remove('show-detail');
}

function vspDocBack() {
  document.querySelector('.docs-split')?.classList.remove('show-detail');
}

function espaceBack() {
  document.getElementById('cours-panel-espaces')?.classList.remove('show-detail');
}

function memoBack() {
  document.querySelector('.memos-split')?.classList.remove('show-detail');
}

function msgBack() {
  document.querySelector('.msg-split')?.classList.remove('show-detail');
  selectedMessageId = null;
}

function _initSplitSwipe(el, backFn) {
  if (!el || el._swipeInit) return;
  el._swipeInit = true;
  let startX = 0, startY = 0;
  el.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx > 0 && el.classList.contains('show-detail')) backFn();
  }, { passive: true });
}

function _initEdtSwipe() {
  const el = document.getElementById('panel-edt');
  if (!el || el._edtSwipeInit) return;
  el._edtSwipeInit = true;
  let startX = 0, startY = 0;
  el.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy)) return;
    edtNav(dx > 0 ? -1 : 1);
  }, { passive: true });
}

function _initMsgSwipe() {
  _initSplitSwipe(document.querySelector('.msg-split'), msgBack);
}

function switchMsgTab(tab) {
  msgActiveTab = tab;
  document.querySelector('.msg-split')?.classList.remove('show-detail');
  document.querySelectorAll('#panel-messages .sub-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const _msgBar = document.querySelector('#panel-messages .sub-tabs');
  _initSubTabsOverflow(_msgBar); _scrollSubTabActive(_msgBar);
  if (tab === 'correspondance') {
    const detailEl = document.getElementById('message-detail-panel');
    if (detailEl) {
      detailEl.style.alignItems = 'center';
      detailEl.style.justifyContent = 'center';
      detailEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center">Sélectionne une correspondance<br>pour voir le contenu ici</span>`;
    }
    loadCorrespondance();
    return;
  }
  const detailEl = document.getElementById('message-detail-panel');
  if (detailEl) {
    detailEl.style.alignItems = 'center';
    detailEl.style.justifyContent = 'center';
    detailEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center">Sélectionne un message<br>pour voir le contenu ici</span>`;
  }
  selectedMessageId = null;
  const resultEl = document.getElementById('messages-result');
  if (resultEl) {
    let listEl = document.getElementById('msg-list');
    if (!listEl) {
      resultEl.innerHTML = `<div id="msg-list"></div>`;
      listEl = document.getElementById('msg-list');
    }
    if (listEl) listEl.innerHTML = renderMsgList();
  }
}

let _correspondancesCache = [];
let _correspondancesCount = 0;

// Retourne l'ID de l'élève pour les correspondances :
// - en vue enfant (compte parent) : ID de l'enfant visualisé
// - en mode parent direct : premier enfant du compte
// - en compte élève : ID de l'élève courant
function getCorrespondancesEleveId() {
  if (_childEleveView) return _childEleveView.id;
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  if (acc?.typeCompte !== 'E') {
    const eleves = acc?.profile?.eleves || acc?.eleves || [];
    return eleves[0]?.id || null;
  }
  return getEleveId();
}

async function fetchCorrespondanceCount() {
  try {
    const eleveId = getCorrespondancesEleveId();
    if (!eleveId || !token || sessionExpired) return;
    const cacheKey = `correspondances:${eleveId}`;
    // Charger depuis le cache IndexedDB d'abord pour afficher le badge immédiatement
    const cached = await edCache.get(cacheKey).catch(() => null);
    if (cached?.data) {
      const list = cached.data;
      _correspondancesCache = list;
      _correspondancesCount = list.length;
      const corrTab = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
      if (corrTab && _correspondancesCount > 0) corrTab.textContent = `Correspondances (${_correspondancesCount})`;
      // Si le cache est frais, pas besoin de refetch
      if (!edCache.isStale(cached)) return;
    }
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/eleves/${eleveId}/eleveCarnetCorrespondance.awp?verbe=get&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) return;
    const list = [...(data.data?.correspondances || [])].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
    await edCache.set(cacheKey, list);
    _correspondancesCache = list;
    _correspondancesCount = list.length;
    const corrTab = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
    if (corrTab && _correspondancesCount > 0) corrTab.textContent = `Correspondances (${_correspondancesCount})`;
  } catch(e) { /* silencieux */ }
}

async function loadCorrespondance() {
  const resultEl = document.getElementById('messages-result');
  if (!resultEl) return;
  selectedContactId = null;

  const eleveId = getCorrespondancesEleveId();
  if (!eleveId) return;
  const cacheKey = `correspondances:${eleveId}`;

  const applyList = (list) => {
    _correspondancesCache = list;
    _correspondancesCount = list.length;
    renderCorrespondanceList(resultEl);
  };

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/eleves/${eleveId}/eleveCarnetCorrespondance.awp?verbe=get&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    return [...(data.data?.correspondances || [])].sort((a, b) => b.dateCreation.localeCompare(a.dateCreation));
  }, {
    onSpinner: () => { resultEl.innerHTML = `<div id="msg-list">${centeredSpinner()}</div>`; },
    onCached:  (list) => applyList(list),
    onFresh:   (list) => applyList(list),
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    const listEl = document.getElementById('msg-list');
    if (listEl) listEl.innerHTML = `<p style="color:#b91c1c;font-size:13px;padding:8px">Erreur : ${e.message}</p>`;
  });
}

function renderCorrespondanceList(resultEl) {
  // En mode parent (hors vue enfant), afficher l'en-tête avec le nom de l'enfant
  let childHeaderHtml = '';
  if (!_childEleveView) {
    const _acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    if (_acc?.typeCompte !== 'E') {
      const _eleves = _acc?.profile?.eleves || _acc?.eleves || [];
      if (_eleves.length > 0) {
        const _e = _eleves[0];
        const _nom = [_e.prenom, _e.nom].filter(Boolean).join(' ');
        childHeaderHtml = `<div style="padding:6px 4px 10px;color:var(--text3);font-size:12px;border-bottom:1px solid var(--border2);margin-bottom:4px">Correspondances de <strong style="color:var(--text2)">${_nom}</strong></div>`;
      }
    }
  }

  resultEl.innerHTML = `<div id="msg-list"></div>`;
  const listEl = document.getElementById('msg-list');
  if (!listEl) return;

  if (!_correspondancesCache.length) {
    listEl.innerHTML = childHeaderHtml + `<p style="color:var(--text3);font-size:14px;padding:8px 0">Aucune correspondance.</p>`;
    return;
  }

  _correspondancesCount = _correspondancesCache.length;
  const corrTab = document.querySelector('#panel-messages .sub-tab[data-tab="correspondance"]');
  if (corrTab) corrTab.textContent = `Correspondances (${_correspondancesCount})`;

  listEl.innerHTML = childHeaderHtml + _correspondancesCache.map((c, i) => {
    const auteur = [c.auteur.prenom, c.auteur.nom].filter(Boolean).join(' ');
    const dateStr = c.dateCreation.substring(0, 10);
    const subject = c.type || 'Communication';
    const hasPdf = !!c.urlFichier;
    const pjBadge = hasPdf
      ? `<span class="pj-badge" style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;white-space:nowrap">📎 PDF</span>`
      : '';
    const sigBadge = c.isSignatureDemandee
      ? (c.signature
        ? `<span style="font-size:11px;background:#dcfce7;color:#15803d;padding:1px 6px;border-radius:8px;margin-left:4px;white-space:nowrap">✓ Signé</span>`
        : `<span style="font-size:11px;background:#fef9c3;color:#854d0e;padding:1px 6px;border-radius:8px;margin-left:4px;white-space:nowrap">✍ À signer</span>`)
      : '';
    return `<div data-corr-idx="${i}" onclick="selectCorrespondance(${i})"
      style="display:flex;align-items:flex-start;padding:7px 4px;border-bottom:1px solid var(--border2);font-size:14px;cursor:pointer;border-radius:4px"
      onmouseover="if(${i}!==selectedContactId)this.style.background='var(--bg3)'"
      onmouseout="if(${i}!==selectedContactId)this.style.background='transparent'">
      <span style="display:inline-block;width:6px;margin-right:6px;flex-shrink:0"></span>
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${subject}${pjBadge}${sigBadge}</span>
          <span style="color:var(--text4);flex-shrink:0;font-size:14px">${dateStr}</span>
        </div>
        <div style="color:var(--text3);margin-top:1px">De : ${auteur}</div>
      </div>
    </div>`;
  }).join('');
}

function selectCorrespondance(idx) {
  selectedContactId = idx;
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('[data-corr-idx]').forEach(el => {
    const isSelected = parseInt(el.dataset.corrIdx) === idx;
    el.style.background = isSelected ? (dark ? 'var(--bg4)' : '#e0e7ff') : 'transparent';
    el.style.boxShadow = isSelected ? 'inset 3px 0 0 #1d4ed8' : '';
  });

  const panel = document.getElementById('message-detail-panel');
  if (!panel) return;
  panel.style.alignItems = 'flex-start';
  panel.style.justifyContent = 'flex-start';
  document.querySelector('.msg-split')?.classList.add('show-detail');
  const c = _correspondancesCache[idx];
  if (!c) return;

  const auteur = [c.auteur.prenom, c.auteur.nom].filter(Boolean).join(' ');
  const dateStr = c.dateCreation.substring(0, 16).replace(' ', ' à ');
  const body = c.contenu.replace(/\n/g, '<br>');

  let pjHtml = '';
  if (c.urlFichier) {
    const filename = c.urlFichier.split('\\').pop() || 'document.pdf';
    const urlEnc = encodeURIComponent(c.urlFichier).replace(/'/g, '%27');
    const nameEnc = encodeURIComponent(filename).replace(/'/g, '%27');
    pjHtml = `<div style="margin-top:14px">
      <div style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Pièce jointe</div>
      <button onclick="downloadCorrespondancePj('${urlEnc}','${nameEnc}')"
        style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:7px;border:1px solid #1d4ed8;background:transparent;color:#1d4ed8;font-size:13px;cursor:pointer">
        📄 ${filename}
      </button>
    </div>`;
  }

  let sigHtml = '';
  if (c.isSignatureDemandee) {
    if (c.signature) {
      const sigNom = [c.signature.prenom, c.signature.nom].filter(Boolean).join(' ');
      const sigDate = c.signature.dateValidation.substring(0, 10);
      sigHtml = `<div style="margin-top:14px;padding:10px 12px;border-radius:8px;background:${dark?'#14532d':'#dcfce7'};border:1px solid ${dark?'#166534':'#bbf7d0'}">
        <div style="font-size:12px;font-weight:600;color:${dark?'#86efac':'#15803d'};margin-bottom:4px">✓ Signé électroniquement</div>
        <div style="font-size:13px;color:${dark?'#86efac':'#166534'}">Par : ${sigNom}</div>
        <div style="font-size:12px;color:${dark?'#86efac':'#166534'}">Le : ${sigDate}</div>
      </div>`;
    } else {
      sigHtml = `<div style="margin-top:14px;padding:10px 12px;border-radius:8px;background:${dark?'#422006':'#fef9c3'};border:1px solid ${dark?'#92400e':'#fef08a'}">
        <div style="font-size:12px;font-weight:600;color:${dark?'#fcd34d':'#854d0e'}">✍ Signature électronique requise</div>
      </div>`;
    }
  }

  panel.innerHTML = `<div style="padding:0 12px;width:100%;box-sizing:border-box;overflow-y:auto">
    <div style="padding-bottom:10px;border-bottom:1px solid var(--border);margin-bottom:12px">
      <div style="font-weight:600;font-size:15px">${c.type || 'Communication'}</div>
      <div style="font-size:13px;color:var(--text3);margin-top:3px">De : ${auteur} · ${dateStr}</div>
    </div>
    <div style="font-size:14px;line-height:1.7;color:var(--text)">${body}</div>
    ${pjHtml}
    ${sigHtml}
  </div>`;
}

async function downloadCorrespondancePj(urlEnc, nameEnc) {
  const urlFichier = decodeURIComponent(urlEnc);
  const filename = decodeURIComponent(nameEnc);
  try {
    const dlUrl = `${getProxy()}/v3/telechargement.awp?verbe=get&fichierId=${encodeURIComponent(urlFichier)}&leTypeDeFichier=CORRESPONDANCE&v=${API_VERSION}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    await triggerDownload(dlUrl, { method: 'POST', headers, body: 'data={}' }, filename);
  } catch(e) {
    alert(`Téléchargement impossible : ${e.message}`);
  }
}

function toggleMsgUnread(btn) {
  msgUnreadOnly = !msgUnreadOnly;
  btn.setAttribute('aria-pressed', msgUnreadOnly ? 'true' : 'false');
  const result = document.getElementById('messages-result');
  if (result) result.innerHTML = renderMsgList();
  applyMessageSelection();
}

function renderMsgList() {
  if (!msgData) return '';
  let list = msgData.messages?.[msgActiveTab] || [];

  if (msgUnreadOnly) list = list.filter(m => !m.read);

  // Tri du plus récent au plus ancien
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));

  if (!sorted.length) return `<p style="color:var(--text3);font-size:14px;padding:8px 0">Aucun message.</p>`;

  return sorted.map(m => {
    const direction = (msgActiveTab === 'sent' || msgActiveTab === 'draft') ? 'sent' : 'received';
    const isUnread = !m.read;
    const weight = isUnread ? '700' : '400';
    const dot = isUnread
      ? `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#1d4ed8;margin-right:6px;flex-shrink:0;margin-top:3px"></span>`
      : `<span style="display:inline-block;width:6px;margin-right:6px;flex-shrink:0"></span>`;
    const contact = direction === 'received'
      ? (m.from ? `${m.from.civilite} ${m.from.nom}`.trim() : '?')
      : (m.to?.[0] ? `${m.to[0].civilite} ${m.to[0].nom}`.trim() : '?');
    const contactLabel = direction === 'received' ? `De : ${contact}` : `À : ${contact}`;
    const attach = m.files?.length ? `<span class="pj-badge" style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;white-space:nowrap">📎 ${m.files.length}</span>` : '';
    return `<div data-message-id="${m.id}" onclick="openMessageDialog(${m.id})" style="display:flex;align-items:flex-start;padding:7px 4px;border-bottom:1px solid var(--border2);font-size:14px;cursor:pointer;border-radius:4px" onmouseover="if(${m.id}!==selectedMessageId)this.style.background='var(--bg3)'" onmouseout="if(${m.id}!==selectedMessageId)this.style.background='transparent'">
      ${dot}
      <div style="flex:1;min-width:0">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span style="font-weight:${weight};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.subject}${attach}</span>
          <span style="color:var(--text4);flex-shrink:0;font-size:14px">${m.date.substring(0,10)}</span>
        </div>
        <div style="color:var(--text3);margin-top:1px">${contactLabel}</div>
      </div>
    </div>`;
  }).join('');
}

function applyMessageSelection() {
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('[data-message-id]').forEach(el => {
    const isSelected = parseInt(el.dataset.messageId) === selectedMessageId;
    el.style.background = isSelected ? (dark ? 'var(--bg4)' : '#e0e7ff') : 'transparent';
    el.style.boxShadow = isSelected ? 'inset 3px 0 0 #1d4ed8' : '';
  });
}

async function openMessageDialog(msgId) {
  const eleveId = _childEleveView?.id || getEleveId();
  const cached = cachedMessages[msgId];
  const panel = document.getElementById('message-detail-panel');
  if (!panel) return;

  selectedMessageId = msgId;
  applyMessageSelection();

  // Marquer comme lu si non lu
  if (cached && !cached.read) {
    cached.read = true;
    const annee = document.getElementById('msg-annee')?.value || '';
    const _acc2 = accountData?.accounts ? accountData.accounts[0] : accountData;
    // Pour un compte élève (ou vue enfant depuis compte parent) : requête PUT séparée ;
    // pour un compte parent, le fetch du contenu avec verbe=post marque déjà le message comme lu.
    if (_childEleveView || _acc2?.typeCompte === 'E') {
      fetch(`${getProxy()}/v3/eleves/${eleveId}/messages/${msgId}.awp?verbe=put&v=${API_VERSION}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
        body: `data=${encodeURIComponent(JSON.stringify({ anneeMessages: annee }))}`
      }).catch(() => {});
    }
    const row = document.querySelector(`[onclick="openMessageDialog(${msgId})"]`);
    if (row) {
      const dot  = row.querySelector('span:first-child');
      const subj = row.querySelector('span[style*="font-weight"]');
      if (dot)  { dot.style.background = 'transparent'; dot.style.width = '6px'; }
      if (subj) { subj.style.fontWeight = '400'; }
    }
    edCache.delete(`messages:${eleveId}:${document.getElementById('msg-annee')?.value || ''}`);
  }

  // Afficher dans le panneau latéral
  panel.style.alignItems = 'flex-start';
  panel.style.justifyContent = 'flex-start';
  document.querySelector('.msg-split')?.classList.add('show-detail');

  const from = cached?.from ? `${cached.from.civilite} ${cached.from.prenom || ''} ${cached.from.nom}`.trim() : '';
  const to   = cached?.to?.map(t => `${t.civilite} ${t.nom}`.trim()).join(', ') || '';

  panel.innerHTML = `
    <div style="width:100%">
      <div style="font-weight:600;font-size:14px;margin-bottom:6px;line-height:1.4">${cached?.subject || ''}</div>
      ${from ? `<div style="font-size:14px;color:var(--text3);margin-bottom:2px">De : ${from}</div>` : ''}
      ${to   ? `<div style="font-size:14px;color:var(--text3);margin-bottom:2px">À : ${to}</div>`   : ''}
      <div style="font-size:14px;color:var(--text4);margin-bottom:8px">${cached?.date || ''}</div>
      ${!_childEleveView ? `<div style="display:flex;gap:8px;margin-bottom:10px">
        <button onclick="replyMessage(${msgId})" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 4l4-3v2h2c3 0 5 2 5 5 0-2-2-3-5-3H6v2L2 4z" fill="currentColor"/></svg>Répondre
        </button>
        <button onclick="forwardMessage(${msgId})" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border-radius:7px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 4l-4-3v2H6C3 3 1 5 1 8c0-2 2-3 5-3h2v2l4-3z" fill="currentColor"/></svg>Transférer
        </button>
      </div>` : ''}
      ${cached?.files?.length ? `
      <div style="margin-bottom:10px;padding:8px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
        <div style="font-size:14px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:5px">Pièces jointes (${cached.files.length})</div>
        ${cached.files.map(f => `
          <div onclick="downloadAttachment(${cached.id}, ${f.id}, '${f.libelle.replace(/'/g, "\'")}')"
               style="display:flex;align-items:center;gap:6px;padding:4px;border-radius:4px;cursor:pointer;font-size:14px"
               onmouseover="this.style.background='var(--bg4)'" onmouseout="this.style.background='transparent'">
            <span>${getFileIcon(f.libelle)}</span>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${f.libelle}</span>
          </div>`).join('')}
      </div>` : ''}
      <div style="border-top:1px solid var(--border);padding-top:10px">
        <div id="msg-dialog-content" style="font-size:14px;line-height:1.7;color:var(--text)">
          <span class="spinner"></span>
        </div>
      </div>
    </div>`;

  // Fetch le contenu complet
  try {
    const contentEl = document.getElementById('msg-dialog-content');
    if (!contentEl) return;

    const cached = cachedMessages[msgId];
    const cacheKey = `msg-content:${eleveId}:${msgId}`;

    // 1. Déjà dans le cache mémoire (champ content de la liste)
    if (cached?.content) {
      renderMessageContent(contentEl, cached.content);
      return;
    }

    // 2. Cache IndexedDB
    const direction = cached?.from ? 'received' : 'sent';
    const mode = direction === 'received' ? 'destinataire' : 'expediteur';
    const annee = document.getElementById('msg-annee')?.value || '';

    const _acc3 = accountData?.accounts ? accountData.accounts[0] : accountData;
    const _isEleve3 = !!_childEleveView || _acc3?.typeCompte === 'E';
    const _msgContentBase = _isEleve3
      ? `/v3/eleves/${eleveId}/messages/${msgId}.awp`
      : `/v3/familles/${eleveId}/messages/${msgId}.awp`;
    const _contentVerbe = 'get';
    await edCache.load(cacheKey, async () => {
      const endpoints = [
        { url: `${_msgContentBase}?verbe=${_contentVerbe}&mode=${mode}&v=${API_VERSION}`, body: `data=${encodeURIComponent(JSON.stringify({ anneeMessages: annee }))}` },
        { url: `${_msgContentBase}?verbe=${_contentVerbe}&v=${API_VERSION}`, body: 'data={}' },
      ];
      for (const ep of endpoints) {
        const resp = await fetch(`${getProxy()}${ep.url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
          body: ep.body
        });
        const data = await resp.json();
        if (data.code === 200) {
          const raw = data.data?.content ?? data.data?.messages?.received?.find(m => m.id === msgId)?.content
            ?? data.data?.messages?.sent?.find(m => m.id === msgId)?.content ?? data.content ?? '';
          if (raw) return raw;
        }
      }
      throw new Error('Contenu non disponible');
    }, {
      onCached: raw => renderMessageContent(contentEl, raw),
      onFresh:  raw => renderMessageContent(contentEl, raw),
      diffFn:   (a, b) => a !== b,
    }).catch(() => {
      if (contentEl) contentEl.innerHTML = '<em style="color:var(--text4)">Contenu non disponible pour ce message.</em>';
    });
  } catch(e) {
    const contentEl = document.getElementById('msg-dialog-content');
    if (contentEl) contentEl.innerHTML = `<em style="color:#b91c1c">Erreur : ${e.message}</em>`;
  }
}

function replyMessage(msgId) {
  const cached = cachedMessages[msgId];
  if (!cached) return;
  const sender = cached.from;
  const initialRecipient = sender ? {
    id: sender.id,
    nom: [sender.civilite, sender.prenom, sender.nom].filter(Boolean).join(' ').trim() || String(sender.id),
    type: 'teachers',
    _raw: sender
  } : null;
  const subject = 'Re: ' + (cached.subject || '').replace(/^Re:\s*/i, '');
  const contentEl = document.getElementById('msg-dialog-content');
  const quotedHtml = (contentEl && !contentEl.querySelector('.spinner')) ? contentEl.innerHTML : '';
  openNewMessageDialog({ initialRecipient, mode: 'reply', subject, quotedHtml });
}

function forwardMessage(msgId) {
  const cached = cachedMessages[msgId];
  if (!cached) return;
  const subject = 'Tr: ' + (cached.subject || '').replace(/^(Tr:|Fwd:)\s*/i, '');
  const contentEl = document.getElementById('msg-dialog-content');
  const quotedHtml = (contentEl && !contentEl.querySelector('.spinner')) ? contentEl.innerHTML : '';
  openNewMessageDialog({ mode: 'forward', subject, quotedHtml, forwardId: msgId, forwardFiles: cached.files || [] });
}

function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑', jpg: '🖼', jpeg: '🖼', png: '🖼', gif: '🖼', zip: '🗜', rar: '🗜', mp4: '🎬', mp3: '🎵' };
  return icons[ext] || '📎';
}

async function triggerDownload(url, fetchOptions, filename) {
  const resp = await fetch(url, fetchOptions);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

  const ext = filename.split('.').pop().toLowerCase();
  const MIMES = {
    mp3:'audio/mpeg', mp4:'video/mp4', m4a:'audio/mp4', wav:'audio/wav', ogg:'audio/ogg',
    pdf:'application/pdf', doc:'application/msword',
    docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:'application/vnd.ms-excel',
    xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt:'application/vnd.ms-powerpoint',
    pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    jpg:'image/jpeg', jpeg:'image/jpeg', png:'image/png', gif:'image/gif', webp:'image/webp',
    zip:'application/zip', rar:'application/x-rar-compressed',
    txt:'text/plain',
  };
  const mime = MIMES[ext] || 'application/octet-stream';

  // Lire en ArrayBuffer - fonctionne quel que soit le Content-Type
  const buffer = await resp.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Détecter le type de réponse via le premier octet non-espace :
  //   '{' (0x7B) → JSON avec base64 → à décoder
  //   '<' (0x3C) → HTML (page d'erreur EcoleDirecte "Accès non autorisé") → erreur claire
  //   autre      → binaire brut
  let firstNonSpace = 0;
  while (firstNonSpace < bytes.length && bytes[firstNonSpace] <= 32) firstNonSpace++;
  const firstByte = bytes[firstNonSpace];

  let blob;
  if (firstByte === 0x3C) { // '<' = HTML
    throw new Error('Accès refusé par EcoleDirecte — session expirée ou fichier indisponible');
  } else if (firstByte === 0x7B) { // '{' = JSON
    let json;
    try {
      json = JSON.parse(new TextDecoder().decode(buffer));
    } catch(e) {
      throw new Error('Réponse invalide du serveur');
    }
    if (json.code !== 200) throw new Error(`Erreur API ${json.code} : ${json.message || ''}`);
    const b64 = json.data;
    if (!b64 || typeof b64 !== 'string') throw new Error('Données vides dans la réponse');
    // Décoder le base64 → binaire
    const binaryStr = atob(b64.replace(/\s/g, ''));
    const fileBytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) fileBytes[i] = binaryStr.charCodeAt(i);
    blob = new Blob([fileBytes.buffer], { type: mime });
  } else {
    // Binaire brut transmis directement
    blob = new Blob([buffer], { type: mime });
  }

  if (!blob.size) throw new Error('Fichier vide');
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
}

async function downloadAttachment(msgId, fileId, filename) {
  try {
    const annee = document.getElementById('msg-annee')?.value || '2025-2026';
    const dlUrl = `${getProxy()}/v3/telechargement.awp?verbe=get&fichierId=${fileId}&leTypeDeFichier=PIECE_JOINTE&v=${API_VERSION}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    await triggerDownload(dlUrl, {
      method: 'POST',
      headers,
      body: `data=${encodeURIComponent(JSON.stringify({ forceDownload: 0, anneeMessages: annee }))}`
    }, filename);
  } catch(e) {
    alert(`Erreur téléchargement : ${e.message}`);
  }
}

function decodeHtmlEntities(html) {
  // Laisser le navigateur décoder toutes les entités HTML nativement
  // (nommées : &oelig; &eacute; etc., décimales : &#339; et hexadécimales : &#x153;)
  const ta = document.createElement('textarea');
  ta.innerHTML = html;
  return ta.value;
}

async function downloadDevoirDoc(fileId, filename) {
  try {
    // L'appli officielle ED utilise FICHIER_CDT (pas CLOUD_ELEVE) pour les docs du cahier de texte
    // Le body ne contient PAS le token - l'auth passe uniquement par x-token et 2fa-token headers
    const dlUrl = `${getProxy()}/v3/telechargement.awp?verbe=get&fichierId=${fileId}&leTypeDeFichier=FICHIER_CDT&v=${API_VERSION}`;
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    await triggerDownload(dlUrl, {
      method: 'POST',
      headers,
      body: `data=${encodeURIComponent(JSON.stringify({ forceDownload: 0 }))}`
    }, filename);
  } catch(e) {
    alert(`Erreur téléchargement : ${e.message}`);
  }
}

function renderMessageContent(el, rawContent) {
  const decoded = b64d(rawContent);
  const clean = decoded
    .replace(/<p[^>]*>/gi, '').replace(/<\/p>/gi, '<br>')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/(<br>\s*){3,}/gi, '<br><br>')
    .trim();
  // Décoder les entités HTML résiduelles (&nbsp; &oelig; &#339; &#x153; etc.)
  el.innerHTML = decodeHtmlEntities(clean) || '<em style="color:var(--text4)">Contenu vide</em>';
}

function closeMessageDialog() {}

function renderVieScolaireSection(data, section) {
  if (section === 'sanctions') return renderSanctions(data);
  return renderAbsences(data);
}

function renderAbsences(data) {
  const abs = (data.absencesRetards || []);
  if (!abs.length) return '<p style="color:var(--text3);font-size:14px">Aucune absence enregistrée.</p>';
  const canJustify = !!_childEleveView; // bouton disponible uniquement en vue enfant (compte parent)
  let html = `<div style="font-weight:500;font-size:14px;margin-bottom:8px">${abs.length} absence(s)</div>`;
  abs.forEach((a, idx) => {
    const color = a.justifie ? '#15803d' : '#b91c1c';
    const badge = a.justifie ? 'Justifiée' : 'Non justifiée';
    const date = (a.displayDate || '').split('\n').join(' ').trim();
    const motif = (a.motif || '').split('\n').join(' ').trim();
    const commentaire = (a.commentaire || '').split('\n').join(' ').trim();
    const justifierBtn = (!a.justifie && !a.justifieEd && canJustify)
      ? `<button onclick="openJustifierAbsenceDialog(${idx})" onmouseover="this.style.background='#b91c1c';this.style.color='#fff'" onmouseout="this.style.background='transparent';this.style.color='#b91c1c'" style="padding:5px 10px;border-radius:6px;border:1px solid #b91c1c;background:transparent;color:#b91c1c;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s">Justifier</button>`
      : '';
    const enAttenteHtml = (!a.justifie && a.justifieEd && canJustify)
      ? `<span style="color:#b45309;font-weight:500;font-size:14px">En attente</span>`
      : '';
    const badgeHtml = (a.justifie || !canJustify)
      ? `<span style="color:${color};font-weight:500;font-size:14px">${badge}</span>`
      : '';
    html += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${date}</span>
        <span style="display:flex;align-items:center;gap:4px">
          ${badgeHtml}${enAttenteHtml}${justifierBtn}
        </span>
      </div>
      ${motif ? `<div style="color:var(--text2)">${motif}</div>` : ''}
      ${commentaire ? `<div style="color:var(--text3);font-style:italic;margin-top:2px">"${commentaire}"</div>` : ''}
    </div>`;
  });
  return html;
}

async function loadDemandesAbsences() {
  const eleveId = _childEleveView?.id;
  if (!eleveId) return;
  const cacheKey = `autorisations-sortie:${eleveId}`;
  const resultEl = document.getElementById('absences-result');
  const spinEl   = document.getElementById('spin-absences');

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/eleves/${eleveId}/niveaux/0/autorisationsSortie.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers,
      body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderDemandesAbsences(data); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderDemandesAbsences(data); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderDemandesAbsences(data) {
  const autorisations  = data.autorisations  || [];
  const demandesFam    = data.demandesFamille || [];
  const demandesEtab   = data.demandesEtab   || [];
  const libelles       = (data.parametrage?.libellesAutorisations || []);
  const libMap = {};
  libelles.forEach(l => { libMap[l.code] = l.libelle; });

  const JOURS = ['', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const TYPES = ['arriveeTardive', 'intercours', 'sortieAnticipee'];
  const TYPES_SHORT = { arriveeTardive: 'Arrivée tardive', intercours: 'Intercours', sortieAnticipee: 'Sortie anticipée' };

  function etatBadge(etat) {
    if (etat === 1)  return '<span style="color:#15803d;font-weight:600;font-size:12px">✔ Oui</span>';
    if (etat === 0)  return '<span style="color:#b91c1c;font-weight:600;font-size:12px">✘ Non</span>';
    return '<span style="color:var(--text3);font-size:12px">—</span>';
  }

  // ── Autorisations ──────────────────────────────────────────────
  let html = `<div style="font-weight:600;font-size:14px;margin-bottom:10px">Autorisations de sortie</div>`;
  html += `<div style="overflow-x:auto;margin-bottom:20px">
    <table style="border-collapse:collapse;font-size:12px;min-width:480px;width:100%">
      <thead>
        <tr style="background:var(--bg3)">
          <th style="padding:6px 10px;text-align:left;border:1px solid var(--border);font-weight:600">Jour</th>
          ${TYPES.map(t => `<th colspan="2" style="padding:6px 8px;text-align:center;border:1px solid var(--border);font-weight:600">${TYPES_SHORT[t]}<br><span style="font-weight:400;font-size:11px;color:var(--text3)">${libMap[t] ? '(' + libMap[t] + ')' : ''}</span></th>`).join('')}
        </tr>
        <tr style="background:var(--bg2)">
          <th style="padding:4px 10px;border:1px solid var(--border)"></th>
          ${TYPES.map(() => `<th style="padding:4px 8px;text-align:center;border:1px solid var(--border);color:var(--text3);font-size:11px;font-weight:500">Matin</th><th style="padding:4px 8px;text-align:center;border:1px solid var(--border);color:var(--text3);font-size:11px;font-weight:500">Après-midi</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  autorisations.forEach(jour => {
    if (jour.jour > 5) return; // ignorer week-end (etat -1)
    html += `<tr>
      <td style="padding:5px 10px;border:1px solid var(--border);font-weight:500">${JOURS[jour.jour] || `Jour ${jour.jour}`}</td>
      ${TYPES.map(t => `
        <td style="padding:5px 8px;text-align:center;border:1px solid var(--border)">${etatBadge(jour.autorisationsMatin?.[t]?.etat ?? -1)}</td>
        <td style="padding:5px 8px;text-align:center;border:1px solid var(--border)">${etatBadge(jour.autorisationsApresMidi?.[t]?.etat ?? -1)}</td>
      `).join('')}
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // ── Demandes passées ──────────────────────────────────────────
  const toutesLesDemandes = [
    ...demandesFam.map(d => ({ ...d, source: 'famille' })),
    ...demandesEtab.map(d => ({ ...d, source: 'etablissement' })),
  ];
  html += `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;flex-wrap:wrap">
    <span style="font-weight:600;font-size:14px">Demandes passées</span>
    <button onclick="openNouvelleDemandeAbsenceDialog()"
      style="padding:6px 14px;border-radius:6px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:600;cursor:pointer">
      + Nouvelle demande
    </button>
    <span style="color:var(--text3);font-size:12px;font-style:italic">WIP — coming soon</span>
  </div>`;

  if (!toutesLesDemandes.length) {
    html += `<p style="color:var(--text3);font-size:14px">Aucune demande enregistrée.</p>`;
    return html;
  }

  toutesLesDemandes.forEach(d => {
    const dateDebut = d.dateDebut || d.date || '';
    const dateFin   = d.dateFin   || '';
    const motif     = d.motif     || d.commentaire || '';
    const statut    = d.statut    || d.etat || '';
    const periode   = dateFin ? `${dateDebut} → ${dateFin}` : dateDebut;
    html += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${periode}</span>
        ${statut ? `<span style="font-size:12px;color:var(--text3)">${statut}</span>` : ''}
      </div>
      ${motif ? `<div style="color:var(--text2)">${motif}</div>` : ''}
    </div>`;
  });
  return html;
}

async function loadVieDeClasse() {
  const eleveId = _childEleveView?.id || getEleveId();
  const classeId = getClasseIdForView();
  if (!classeId) {
    document.getElementById('absences-result').innerHTML = '<p style="color:var(--text3);font-size:14px">ID de classe non disponible.</p>';
    return;
  }
  const cacheKey = `viedeclasse:${eleveId}`;
  const resultEl = document.getElementById('absences-result');
  const spinEl   = document.getElementById('spin-absences');

  await edCache.load(cacheKey, async () => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}/v3/Classes/${classeId}/viedelaclasse.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers,
      body: 'data={}'
    });
    const d = await resp.json();
    if (d.code !== 200) throw new Error(`Code ${d.code}`);
    return d.data;
  }, {
    onSpinner: () => { spinEl.style.display = 'inline'; resultEl.innerHTML = centeredSpinner(); },
    onCached:  (data, ts) => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVieDeClasse(data); updateFreshnessLabel('absences', ts || Date.now()); },
    onFresh:   (data)     => { spinEl.style.display = 'none'; resultEl.innerHTML = renderVieDeClasse(data); updateFreshnessLabel('absences', Date.now()); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    resultEl.innerHTML = `<p style="color:#b91c1c;font-size:14px">Erreur : ${e.message}</p>`;
    spinEl.style.display = 'none';
  });
}

function renderVieDeClasse(data) {
  // L'API renvoie typiquement { messages: [...] } ou { actualites: [...] } ou un tableau direct
  const items = Array.isArray(data) ? data
    : (data?.messages || data?.actualites || data?.evenements || data?.posts || data?.items || []);

  if (!items.length) return '<p style="color:var(--text3);font-size:14px">Aucun élément dans la vie de classe.</p>';

  let html = `<div style="font-weight:500;font-size:14px;margin-bottom:10px">${items.length} élément(s)</div>`;
  items.forEach(item => {
    const titre   = (item.titre    || item.title   || item.objet   || item.libelle || item.sujet || '').trim();
    const auteur  = (item.auteur   || item.from    || item.expediteur?.nom || '').trim();
    const date    = (item.date     || item.dateDebut || item.dateCreation || '').trim();
    const contenu = item.contenu ? b64d(item.contenu) : (item.texte || item.description || item.body || '').trim();
    const type    = (item.type     || item.categorie || '').trim();

    const dateStr = date ? date.split('T')[0].split('-').reverse().join('/') : '';

    html += `<div style="padding:10px 12px;border-radius:8px;background:var(--bg3);margin-bottom:8px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:${contenu ? 6 : 0}px">
        <span style="font-weight:600">${titre || '(sans titre)'}</span>
        ${dateStr ? `<span style="color:var(--text3);font-size:12px;white-space:nowrap;margin-left:10px">${dateStr}</span>` : ''}
      </div>
      ${type   ? `<div style="color:var(--text3);font-size:12px;margin-bottom:4px">${type}</div>` : ''}
      ${auteur ? `<div style="color:var(--text2);font-size:12px;margin-bottom:4px">${auteur}</div>` : ''}
      ${contenu ? `<div style="color:var(--text);font-size:13px;line-height:1.5">${contenu}</div>` : ''}
    </div>`;
  });
  return html;
}

function openNouvelleDemandeAbsenceDialog() {
  const dark    = document.body.classList.contains('dark');
  const dlgBg   = dark ? '#1e1e1e' : '#fff';
  const dlgText = dark ? '#f0f0ee' : '#1a1a1a';
  const inpBg   = dark ? '#2a2a2a' : '#fff';
  const inpBord = dark ? '#555'    : '#d1d5db';
  const labelColor = dark ? '#e0e0dc' : '#374151';
  const ACCENT  = '#1d4ed8';

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow-y:auto';

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.5rem;max-width:520px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.35);position:relative;font-family:inherit`;

  dialog.innerHTML = `
    <button id="nvdemande-close" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:22px;color:${dark?'#666':'#aaa'};line-height:1">×</button>
    <h3 style="margin:0 0 20px;font-size:15px;font-weight:700">Nouvelle demande d'absence</h3>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
      <!-- Date de début -->
      <div>
        <div style="font-size:13px;font-weight:600;color:${labelColor};margin-bottom:6px">
          Date de début <span style="color:${ACCENT}">(*)</span>
        </div>
        <div style="display:flex;align-items:center;border:1px solid ${inpBord};border-radius:6px;overflow:hidden;background:${inpBg}">
          <input type="date" id="nvdemande-date-debut"
            style="flex:1;padding:7px 8px;border:none;background:transparent;color:${dlgText};font-size:13px;outline:none;min-width:0">
          <span style="padding:0 10px;color:${ACCENT};font-size:15px;pointer-events:none">📅</span>
        </div>
      </div>
      <!-- Heure de début -->
      <div>
        <div style="font-size:13px;font-weight:600;color:${labelColor};margin-bottom:6px">
          Heure de début <span style="color:${ACCENT}">(*)</span>
        </div>
        <div style="display:flex;align-items:center;gap:4px;border:1px solid ${inpBord};border-radius:6px;padding:5px 10px;background:${inpBg}">
          <input type="number" id="nvdemande-hd-h" min="0" max="23" value="8"
            style="width:36px;text-align:center;border:none;background:transparent;color:${dlgText};font-size:14px;font-weight:500;outline:none;-moz-appearance:textfield">
          <span style="font-weight:600;color:${labelColor}">:</span>
          <input type="number" id="nvdemande-hd-m" min="0" max="59" value="0"
            style="width:36px;text-align:center;border:none;background:transparent;color:${dlgText};font-size:14px;font-weight:500;outline:none;-moz-appearance:textfield">
        </div>
      </div>
    </div>

    <div id="nvdemande-fin-row" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:10px">
      <!-- Date de fin -->
      <div>
        <div style="font-size:13px;font-weight:600;color:${labelColor};margin-bottom:6px">Date de fin</div>
        <div style="display:flex;align-items:center;border:1px solid ${inpBord};border-radius:6px;overflow:hidden;background:${inpBg}">
          <input type="date" id="nvdemande-date-fin"
            style="flex:1;padding:7px 8px;border:none;background:transparent;color:${dlgText};font-size:13px;outline:none;min-width:0">
          <span style="padding:0 10px;color:${ACCENT};font-size:15px;pointer-events:none">📅</span>
        </div>
      </div>
      <!-- Heure de fin -->
      <div>
        <div style="font-size:13px;font-weight:600;color:${labelColor};margin-bottom:6px">Heure de fin</div>
        <div style="display:flex;align-items:center;gap:4px;border:1px solid ${inpBord};border-radius:6px;padding:5px 10px;background:${inpBg}">
          <input type="number" id="nvdemande-hf-h" min="0" max="23" value="8"
            style="width:36px;text-align:center;border:none;background:transparent;color:${dlgText};font-size:14px;font-weight:500;outline:none;-moz-appearance:textfield">
          <span style="font-weight:600;color:${labelColor}">:</span>
          <input type="number" id="nvdemande-hf-m" min="0" max="59" value="0"
            style="width:36px;text-align:center;border:none;background:transparent;color:${dlgText};font-size:14px;font-weight:500;outline:none;-moz-appearance:textfield">
        </div>
      </div>
    </div>

    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px;color:${dlgText}">
      <input type="checkbox" id="nvdemande-no-fin" style="width:14px;height:14px;cursor:pointer">
      Je ne connais pas la date et l'heure de fin
    </label>

    <div id="nvdemande-error" style="display:none;color:${ACCENT};font-size:13px;margin-bottom:10px">
      Vous devez choisir une date de début valide
    </div>

    <div style="margin-bottom:6px">
      <div style="font-size:13px;font-weight:600;color:${labelColor};margin-bottom:6px">
        Motif <span style="color:${ACCENT}">(*)</span>
      </div>
      <textarea id="nvdemande-motif" maxlength="250" rows="4"
        style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid ${inpBord};border-radius:6px;background:${inpBg};color:${dlgText};font-size:13px;font-family:inherit;resize:vertical;outline:none"></textarea>
      <div style="text-align:right;font-size:11px;color:var(--text3);margin-top:2px">
        <span id="nvdemande-motif-count">0</span> / 250
      </div>
    </div>

    <div style="display:flex;justify-content:flex-end;align-items:center;gap:10px;margin-top:18px;flex-wrap:wrap">
      <button id="nvdemande-annuler"
        style="padding:8px 18px;border-radius:6px;border:1px solid ${inpBord};background:transparent;color:${dlgText};font-size:13px;font-weight:600;cursor:pointer">
        Annuler
      </button>
      <button id="nvdemande-enregistrer"
        style="padding:8px 18px;border-radius:6px;border:none;background:${ACCENT};color:#fff;font-size:13px;font-weight:600;cursor:pointer">
        Enregistrer
      </button>
      <span style="color:var(--text3);font-size:12px;font-style:italic">WIP — coming soon</span>
    </div>
  `;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const closeDialog = () => document.body.removeChild(overlay);
  document.getElementById('nvdemande-close').onclick   = closeDialog;
  document.getElementById('nvdemande-annuler').onclick = closeDialog;
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDialog(); });

  // Toggle "Je ne connais pas la date de fin"
  document.getElementById('nvdemande-no-fin').addEventListener('change', function() {
    document.getElementById('nvdemande-fin-row').style.display = this.checked ? 'none' : 'grid';
  });

  // Compteur motif
  document.getElementById('nvdemande-motif').addEventListener('input', function() {
    document.getElementById('nvdemande-motif-count').textContent = this.value.length;
  });

  // Enregistrer — WIP : valider le formulaire et afficher l'erreur si incomplet
  document.getElementById('nvdemande-enregistrer').addEventListener('click', () => {
    const dateDebut = document.getElementById('nvdemande-date-debut').value;
    const errEl = document.getElementById('nvdemande-error');
    if (!dateDebut) {
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';
    // TODO: implémenter la requête de soumission
  });
}

async function openJustifierAbsenceDialog(absIdx) {
  const eleveId = _childEleveView?.id;
  if (!eleveId) return;

  // Récupère l'absence depuis le cache
  const entry = await edCache.get(`absences:${eleveId}`);
  const absence = (entry?.data?.absencesRetards || [])[absIdx];
  if (!absence) return;

  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  if (!acc) return;

  const dark = document.body.classList.contains('dark');
  const dlgBg   = dark ? '#1e1e1e' : '#fff';
  const dlgText = dark ? '#f0f0ee' : '#1a1a1a';
  const inpBg   = dark ? '#2a2a2a' : '#fff';
  const inpBord = dark ? '#555' : '#ccc';

  const sigNom  = `${acc.prenom || ''} ${acc.nom || ''}`.trim().toUpperCase();
  const sigMail = acc.email || '';
  const sigId   = acc.id || acc.idLogin || 0;

  const dateStr = (absence.displayDate || '').split('\n').join(' ').trim();

  // Build OTP inputs (hidden initially)
  const otpInputs = Array.from({length: 6}, (_, i) => {
    const firstStyle = i === 0 ? `border:2px solid #3b82f6` : `border:1px solid ${inpBord}`;
    return `<input type="text" inputmode="numeric" maxlength="1" data-otp-idx="${i}"
      style="width:40px;height:44px;text-align:center;font-size:20px;font-weight:700;border-radius:6px;background:${inpBg};color:${dlgText};outline:none;${firstStyle}">`;
  }).join('');

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1.5rem;overflow-y:auto';

  const dialog = document.createElement('div');
  dialog.style.cssText = `background:${dlgBg};color:${dlgText};border-radius:12px;padding:1.5rem;max-width:480px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,0.35);position:relative;font-family:inherit`;
  dialog.innerHTML = `
    <button id="justif-close-btn" style="position:absolute;top:10px;right:12px;background:none;border:none;cursor:pointer;font-size:20px;color:${dark?'#666':'#aaa'}">×</button>
    <h3 style="margin:0 0 6px;font-size:14px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">Justifier une absence</h3>
    <div style="font-size:13px;color:var(--text3);margin-bottom:16px">${dateStr}</div>

    <!-- Étape 1 : validation du numéro -->
    <div id="justif-step-phone">
      <p style="font-size:13px;margin:0 0 14px;line-height:1.55;color:${dlgText}">Pour justifier cette absence, nous devons <strong>confirmer votre identité par SMS.</strong></p>
      <div id="justif-phone-loading" style="font-size:13px;color:var(--text3);display:flex;align-items:center;gap:6px;margin-bottom:12px">
        <span class="spinner" style="width:13px;height:13px"></span> Récupération du numéro…
      </div>
      <div id="justif-phone-form" style="display:none">
        <label style="font-size:13px;font-weight:600;color:${dlgText};display:block;margin-bottom:6px">Numéro de téléphone pour recevoir le code SMS</label>
        <input id="justif-tel-input" type="tel" autocomplete="tel"
          style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid ${inpBord};border-radius:8px;background:${inpBg};color:${dlgText};font-size:14px;outline:none;margin-bottom:6px">
        <div style="font-size:11px;color:var(--text3);margin-bottom:14px">Vérifiez que ce numéro est correct avant d'envoyer le code.</div>
        <div id="justif-phone-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
        <div style="display:flex;justify-content:space-between;gap:8px">
          <button id="justif-cancel-btn" style="padding:8px 20px;border-radius:8px;border:1px solid ${inpBord};background:${dark?'#2a2a2a':'#f3f4f6'};color:${dlgText};font-size:14px;font-weight:500;cursor:pointer">Annuler</button>
          <button id="justif-send-btn" style="padding:8px 20px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;cursor:pointer">Envoyer le code</button>
        </div>
      </div>
      <div id="justif-phone-fetch-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
    </div>

    <!-- Étape 2 : motif + justificatif + code OTP -->
    <div id="justif-step-otp" style="display:none">
      <div id="justif-otp-label" style="font-size:13px;font-weight:600;margin-bottom:12px;color:${dlgText}"></div>

      <!-- Motif -->
      <label style="font-size:13px;font-weight:600;color:${dlgText};display:block;margin-bottom:5px">Motif de l'absence</label>
      <input id="justif-motif-input" type="text" placeholder="Ex : Maladie, rendez-vous médical…"
        style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid ${inpBord};border-radius:8px;background:${inpBg};color:${dlgText};font-size:14px;outline:none;margin-bottom:14px">

      <!-- Drop zone justificatif -->
      <label style="font-size:13px;font-weight:600;color:${dlgText};display:block;margin-bottom:5px">Justificatif <span style="font-weight:400;color:var(--text3)">(optionnel)</span></label>
      <div id="justif-dropzone" style="border:2px dashed ${inpBord};border-radius:8px;padding:18px 12px;text-align:center;cursor:pointer;background:${dark?'#242424':'#f9fafb'};margin-bottom:14px;transition:border-color .15s">
        <div id="justif-dropzone-label" style="font-size:13px;color:var(--text3)">Glissez un fichier ici ou <span style="color:#1d4ed8;text-decoration:underline">cliquez pour choisir</span></div>
        <div id="justif-file-info" style="display:none;font-size:13px;font-weight:500;color:${dlgText};margin-top:4px"></div>
        <input id="justif-file-input" type="file" accept="image/*,application/pdf" style="display:none">
      </div>

      <!-- OTP -->
      <div id="justif-otp-inputs" style="display:flex;gap:8px;margin-bottom:10px">${otpInputs}</div>
      <div style="font-size:12px;color:var(--text3);margin-bottom:16px">Saisissez le code reçu par SMS pour confirmer</div>
      <div id="justif-error" style="display:none;color:#b91c1c;font-size:13px;margin-bottom:10px"></div>
      <div style="display:flex;justify-content:space-between;gap:8px">
        <button id="justif-cancel-btn2" style="padding:8px 20px;border-radius:8px;border:1px solid ${inpBord};background:${dark?'#2a2a2a':'#f3f4f6'};color:${dlgText};font-size:14px;font-weight:500;cursor:pointer">Annuler</button>
        <button id="justif-confirm-btn" disabled style="padding:8px 20px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:14px;font-weight:600;cursor:pointer;opacity:.5">Envoyer la justification</button>
      </div>
    </div>`;

  overlay.appendChild(dialog);
  document.body.appendChild(overlay);

  const closeBtn        = document.getElementById('justif-close-btn');
  const cancelBtn       = document.getElementById('justif-cancel-btn');
  const cancelBtn2      = document.getElementById('justif-cancel-btn2');
  const sendBtn         = document.getElementById('justif-send-btn');
  const confirmBtn      = document.getElementById('justif-confirm-btn');
  const stepPhone       = document.getElementById('justif-step-phone');
  const stepOtp         = document.getElementById('justif-step-otp');
  const phoneLoading    = document.getElementById('justif-phone-loading');
  const phoneForm       = document.getElementById('justif-phone-form');
  const phoneError      = document.getElementById('justif-phone-error');
  const telInput        = document.getElementById('justif-tel-input');
  const otpLabel        = document.getElementById('justif-otp-label');
  const errorEl         = document.getElementById('justif-error');
  const otpEls          = Array.from(document.querySelectorAll('#justif-otp-inputs input'));
  const motifInput      = document.getElementById('justif-motif-input');
  const dropzone        = document.getElementById('justif-dropzone');
  const dropzoneLabel   = document.getElementById('justif-dropzone-label');
  const fileInfo        = document.getElementById('justif-file-info');
  const fileInput       = document.getElementById('justif-file-input');

  let sigTel = '';
  let justifFile = null; // { name, base64, type }

  closeBtn.onclick   = () => overlay.remove();
  cancelBtn.onclick  = () => overlay.remove();
  cancelBtn2.onclick = () => overlay.remove();

  // ── Drop zone ──────────────────────────────────────────────────────────────
  const setFile = file => {
    if (!file) return;
    justifFile = null;
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target.result.split(',')[1];
      justifFile = { name: file.name, base64: b64, type: file.type };
      fileInfo.textContent = file.name;
      fileInfo.style.display = '';
      dropzoneLabel.style.display = 'none';
      dropzone.style.borderColor = '#1d4ed8';
    };
    reader.readAsDataURL(file);
  };

  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) setFile(fileInput.files[0]); });
  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.style.borderColor = '#1d4ed8'; });
  dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = inpBord; });
  dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.style.borderColor = inpBord;
    if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
  });

  // OTP auto-advance
  const checkOtpDone = () => {
    const otpOk = otpEls.every(el => el.value);
    const motifOk = motifInput.value.trim().length > 0;
    confirmBtn.disabled = !(otpOk && motifOk);
    confirmBtn.style.opacity = confirmBtn.disabled ? '.5' : '1';
  };
  motifInput.addEventListener('input', checkOtpDone);
  otpEls.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
      if (inp.value && i < otpEls.length - 1) otpEls[i + 1].focus();
      checkOtpDone();
    });
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) { otpEls[i - 1].focus(); otpEls[i - 1].select(); }
    });
    inp.addEventListener('paste', e => {
      e.preventDefault();
      const digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
      otpEls.forEach((el, j) => { el.value = digits[j] || ''; });
      const next = otpEls.find(el => !el.value);
      if (next) next.focus(); else otpEls[otpEls.length - 1].focus();
      checkOtpDone();
    });
  });

  // ── Étape 1 : récupération du numéro ──────────────────────────────────────
  try {
    const cr = await fetch(`${getProxy()}/v3/famillecoordonnees.awp?verbe=get&v=${API_VERSION}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION },
      body: 'data={}'
    });
    const cj = await cr.json();
    if (cj.code === 200) sigTel = cj.data?.responsable?.telMobile || cj.data?.responsable?.tel || '';
  } catch(_) {}

  phoneLoading.style.display = 'none';
  telInput.value = sigTel;
  phoneForm.style.display = '';
  telInput.focus();

  // ── Envoi du SMS (étape 1 → 2) ────────────────────────────────────────────
  sendBtn.onclick = async () => {
    const tel = telInput.value.trim();
    if (!tel) {
      phoneError.textContent = 'Veuillez saisir un numéro de téléphone.';
      phoneError.style.display = '';
      return;
    }
    phoneError.style.display = 'none';
    sendBtn.disabled = true;
    sendBtn.textContent = '…';

    try {
      const signataire = { idSignataire: sigId, typeSignataire: '1', telephone: tel, email: sigMail, demandeMail: false, nom: sigNom };
      const headers3ds = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
      if (twoFaToken) headers3ds['2fa-token'] = twoFaToken;
      const resp = await fetch(`${getProxy()}/v3/3DSecure.awp?verbe=get&v=${API_VERSION}`, {
        method: 'POST',
        headers: headers3ds,
        body: `data=${JSON.stringify({ signataire })}`
      });
      const json = await resp.json();
      if (json.code === 200 || json.code === 201) {
        sigTel = tel;
        stepPhone.style.display = 'none';
        otpLabel.textContent = `Code reçu par SMS au ${tel}`;
        stepOtp.style.display = '';
        otpEls[0].focus();
      } else {
        phoneError.textContent = json.message || 'Erreur lors de l\'envoi du SMS.';
        phoneError.style.display = '';
        sendBtn.disabled = false;
        sendBtn.textContent = 'Envoyer le code';
      }
    } catch(e) {
      phoneError.textContent = `Erreur réseau : ${e.message}`;
      phoneError.style.display = '';
      sendBtn.disabled = false;
      sendBtn.textContent = 'Envoyer le code';
    }
  };

  // ── Étape 2 : soumission de la justification ──────────────────────────────
  confirmBtn.onclick = async () => {
    const code = otpEls.map(el => el.value).join('');
    if (code.length < 6) return;
    errorEl.style.display = 'none';
    confirmBtn.disabled = true;
    confirmBtn.textContent = '…';

    const sigCanvas = document.createElement('canvas');
    sigCanvas.width = 600; sigCanvas.height = 150;
    const blankCanvas = sigCanvas.toDataURL('image/png');

    const payload = {
      idAbsence: absence.id,
      typeAbsence: absence.typeElement || 'Absence',
      action: 'justificationAbsence',
      signature: {
        code: parseInt(code, 10),
        signatureCanvas: blankCanvas
      },
      message: motifInput.value.trim(),
      libelleEnAttente: 'En attente',
      idEleve: parseInt(eleveId, 10),
      date: absence.displayDate || '',
      ...(justifFile ? { justificatif: { nom: justifFile.name, type: justifFile.type, contenu: justifFile.base64 } } : {})
    };

    try {
      const headersPut = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
      if (twoFaToken) headersPut['2fa-token'] = twoFaToken;
      const resp = await fetch(`${getProxy()}/v3/eleves/${eleveId}/viescolaire.awp?verbe=post&v=${API_VERSION}`, {
        method: 'POST',
        headers: headersPut,
        body: `data=${JSON.stringify(payload)}`
      });
      const raw = await resp.text();
      if (!raw.trim()) {
        errorEl.textContent = `Erreur serveur (réponse vide, HTTP ${resp.status}).`;
        errorEl.style.display = '';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Envoyer la justification';
        confirmBtn.style.opacity = '1';
        return;
      }
      let json;
      try { json = JSON.parse(raw); }
      catch(_) {
        errorEl.textContent = `Réponse inattendue : ${raw.slice(0, 120)}`;
        errorEl.style.display = '';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Envoyer la justification';
        confirmBtn.style.opacity = '1';
        return;
      }
      if (json.code === 200) {
        overlay.remove();
        // Mettre à jour le cache local pour refléter immédiatement la justification
        const cacheEntry = await edCache.get(`absences:${eleveId}`);
        if (cacheEntry?.data?.absencesRetards?.[absIdx]) {
          cacheEntry.data.absencesRetards[absIdx].justifieEd = true;
          if (motifInput.value.trim()) cacheEntry.data.absencesRetards[absIdx].motif = motifInput.value.trim();
          await edCache.set(`absences:${eleveId}`, cacheEntry.data);
        }
        document.getElementById('absences-result').innerHTML = renderVieScolaireSection(
          cacheEntry?.data || {}, vieScolaireSection
        );
      } else {
        errorEl.textContent = json.message || 'Code incorrect ou expiré.';
        errorEl.style.display = '';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Envoyer la justification';
        confirmBtn.style.opacity = '1';
      }
    } catch(e) {
      errorEl.textContent = `Erreur réseau : ${e.message}`;
      errorEl.style.display = '';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Envoyer la justification';
      confirmBtn.style.opacity = '1';
    }
  };
}

function renderSanctions(data) {
  const items = (data.sanctionsEncouragements || []);
  if (!items.length) return '<p style="color:var(--text3);font-size:14px">Aucune sanction enregistrée.</p>';
  let html = `<div style="font-weight:500;font-size:14px;margin-bottom:8px">${items.length} sanction(s)</div>`;
  items.forEach(s => {
    const date = (s.displayDate || s.date || '').split('\n').join(' ').trim();
    const type = (s.typeElement || s.libelle || '').trim();
    const motif = (s.motif || '').trim();
    const commentaire = (s.commentaire || '').trim();
    const matiere = (s.matiere || '').trim();
    const par = (s.par || '').trim();
    html += `<div style="padding:8px 10px;border-radius:8px;background:var(--bg3);margin-bottom:6px;font-size:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2px">
        <span style="font-weight:500">${date}</span>
        ${type ? `<span style="color:#b91c1c;font-weight:500;font-size:13px">${type}</span>` : ''}
      </div>
      ${matiere ? `<div style="color:var(--text2)">${matiere}</div>` : ''}
      ${motif ? `<div style="color:var(--text2)">${motif}</div>` : ''}
      ${par ? `<div style="color:var(--text3);font-size:13px">Par : ${par}</div>` : ''}
      ${commentaire ? `<div style="color:var(--text3);font-style:italic;margin-top:2px">"${commentaire}"</div>` : ''}
    </div>`;
  });
  return html;
}

function b64d(s) {
  try {
    const binary = atob(s);
    try {
      return decodeURIComponent(binary.split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
    } catch { return binary; }
  } catch { return s; }
}

function renderData(path, data) {
  if (!data) return '<em style="color:var(--text3)">Aucune donnée.</em>';

  // EMPLOI DU TEMPS
  if (path.includes('emploidutemps')) {
    const jours = {};
    (Array.isArray(data) ? data : []).forEach(c => {
      const d = c.start_date.split(' ')[0];
      if (!jours[d]) jours[d] = [];
      jours[d].push(c);
    });
    const jourNoms = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
    let html = '';
    Object.keys(jours).sort().forEach(date => {
      const dt = new Date(date);
      const label = `${jourNoms[dt.getDay()]} ${dt.getDate()}/${dt.getMonth()+1}`;
      html += `<div style="margin-bottom:12px"><div style="font-weight:500;font-size:14px;margin-bottom:6px;color:var(--text2)">${label}</div>`;
      jours[date].sort((a,b)=>a.start_date.localeCompare(b.start_date)).forEach(c => {
        const hDeb = c.start_date.split(' ')[1].substring(0,5);
        const hFin = c.end_date.split(' ')[1].substring(0,5);
        const annule = c.isAnnule ? 'text-decoration:line-through;opacity:0.5;' : '';
        const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.color};margin-right:6px;flex-shrink:0"></span>`;
        html += `<div style="display:flex;align-items:center;padding:5px 8px;border-radius:6px;margin-bottom:3px;background:var(--bg3);${annule}">
          ${dot}<span style="min-width:80px;color:var(--text3);font-size:14px">${hDeb}–${hFin}</span>
          <span style="font-weight:500;flex:1">${c.text}</span>
          <span style="font-size:14px;color:var(--text4)">${c.salle}</span>
          ${c.prof ? `<span style="font-size:14px;color:var(--text4);margin-left:8px">${c.prof}</span>` : ''}
          ${c.isAnnule ? '<span style="font-size:14px;color:#e24b4a;margin-left:6px;font-weight:500">ANNULÉ</span>' : ''}
        </div>`;
      });
      html += '</div>';
    });
    return html || '<em style="color:var(--text3)">Aucun cours.</em>';
  }

  // NOTES — géré par renderNotes() / renderNotesTable() / renderNotesChart()

  // MESSAGES
  if (path.includes('messages') && !path.match(/messages\/\d+/)) {
    return renderMessages(data);
  }

  // MESSAGE INDIVIDUEL
  if (path.match(/messages\/\d+/)) {
    const from = data.from ? `${data.from.civilite} ${data.from.prenom} ${data.from.nom}` : '?';
    const to = data.to?.map(t => `${t.civilite} ${t.nom}`).join(', ') || '?';
    const content = data.content ? b64d(data.content).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g,' ').replace(/&#233;/g,'é').replace(/&#232;/g,'è').replace(/&#224;/g,'à').trim() : '';
    return `<div style="font-size:14px">
      <div style="margin-bottom:8px"><strong>${data.subject}</strong></div>
      <div style="font-size:14px;color:var(--text3);margin-bottom:4px">De : ${from}</div>
      <div style="font-size:14px;color:var(--text3);margin-bottom:4px">À : ${to}</div>
      <div style="font-size:14px;color:var(--text3);margin-bottom:12px">${data.date}</div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;font-size:14px;line-height:1.6">${content || '<em>Contenu vide</em>'}</div>
    </div>`;
  }

  // ABSENCES
  if (path.includes('viescolaire')) {
    return renderVieScolaireSection(data, vieScolaireSection);
  }

  // CAHIER DE TEXTES — liste devoirs à faire (sans date)
  if (path.includes('cahierdetexte') && !path.match(/cahierdetexte\/\d{4}/)) {
    if (!data || Object.keys(data).length === 0) return '<p style="color:var(--text3);font-size:14px">Aucun devoir à faire.</p>';
    const btn = document.getElementById('devoirs-hide-done'); const hideDone = btn?.getAttribute('aria-pressed') === 'true';
    let html = '';
    const dates = Object.keys(data).sort();
    dates.forEach((date, dateIdx) => {
      let devoirs = data[date] || [];
      if (!devoirs.length) return;
      if (hideDone) devoirs = devoirs.filter(d => !d.effectue);
      if (!devoirs.length) return;
      const dt = new Date(date + 'T00:00:00');
      const jours = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
      const moisFr = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
      const label = `${jours[dt.getDay()]} ${dt.getDate()} ${moisFr[dt.getMonth()]} ${dt.getFullYear()}`;
      const bodyId = `devoirs-body-${dateIdx}`;
      const arrowId = `devoirs-arrow-${dateIdx}`;
      html += `<div style="margin-bottom:10px">
        <div onclick="toggleDevoirsDate('${bodyId}','${arrowId}')"
             style="display:flex;align-items:center;gap:6px;font-weight:500;font-size:14px;margin-bottom:6px;color:var(--text2);cursor:pointer;user-select:none">
          <span id="${arrowId}" style="font-size:14px;color:var(--text4);transition:transform .15s;display:inline-block;transform:rotate(90deg)">▶</span>
          ${label}
          <span style="font-size:14px;font-weight:400;color:var(--text4)">(${devoirs.length})</span>
        </div>
        <div id="${bodyId}">`;
      devoirs.forEach(d => {
        const fait = d.effectue;
        const dId  = d.id ?? d.idDevoir ?? '';
        const dKey = `${date}-${dId}`;
        const inter = d.interrogation ? '<span style="font-size:14px;background:#fef2f2;color:#b91c1c;padding:2px 6px;border-radius:10px;margin-left:6px">Interro</span>' : '';
        const docs  = d.documents || [];
        const pjBadge = docs.length ? `<span class="pj-badge" style="font-size:11px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:10px;font-weight:500;margin-left:6px;white-space:nowrap">📎 ${docs.length}</span>` : '';
        const dEncoded = encodeURIComponent(JSON.stringify({ matiere: d.matiere, effectue: d.effectue, interrogation: d.interrogation, donneLe: d.donneLe || '', date: date, documents: docs })).replace(/'/g, '%27');
        const badgeFg  = fait ? '#15803d' : 'var(--text3)';
        const badgeTxt = fait ? '✅' : '○';
        const badgeTip = fait ? 'Marquer comme non fait' : 'Marquer comme fait';
        html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <button
            onclick="event.stopPropagation();toggleDevoirEffectue('${dId}','${date}',${fait})"
            title="${badgeTip}"
            style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:rgba(220,252,231,0);color:${badgeFg};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s"
            onmouseover="this.style.opacity='0.6'" onmouseout="this.style.opacity='1'">
            ${badgeTxt}
          </button>
          <div data-devoir-key="${dKey}" onclick="openDevoirDialog('${dEncoded}',this)"
            style="flex:1;display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;background:var(--bg3);border:1px solid var(--border);font-size:14px;cursor:pointer;transition:background .1s,box-shadow .1s"
            onmouseover="if(!this.classList.contains('devoir-selected'))this.style.background='var(--bg4)'" onmouseout="if(!this.classList.contains('devoir-selected'))this.style.background='var(--bg3)'">
            <div style="flex:1">
              <span style="font-weight:500;color:var(--text)">${d.matiere}</span>${inter}${pjBadge}
              ${d.donneLe ? `<div style="font-size:11px;color:var(--text4)">Donné le ${d.donneLe}</div>` : ''}
            </div>
          </div>
        </div>`;
      });
      html += '</div></div>';
    });
    return html || '<p style="color:var(--text3);font-size:14px">Aucun devoir à faire.</p>';
  }

  // CAHIER DE TEXTES — détail d'un jour spécifique
  if (path.match(/cahierdetexte\/\d{4}/)) {
    const matieres = data.matieres || [];
    if (!matieres.length) return '<p style="color:var(--text3);font-size:14px">Aucun contenu pour ce jour.</p>';
    let html = '';
    matieres.forEach(m => {
      const contenuSeance = m.contenu ? b64d(m.contenu).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&#[0-9]+;/g, c => String.fromCharCode(parseInt(c.slice(2,-1)))).trim() : '';
      html += `<div style="margin-bottom:12px;padding:10px;border-radius:8px;background:var(--bg3);border-left:3px solid var(--border)">
        <div style="font-weight:500;font-size:14px;margin-bottom:6px">${m.matiere || m.libelleMatiere || ''}</div>`;
      if (contenuSeance) {
        html += `<div style="font-size:14px;color:var(--text2);margin-bottom:6px"><span style="font-size:14px;font-weight:500;color:var(--text3);text-transform:uppercase;letter-spacing:.04em">Contenu de séance</span><br>${contenuSeance}</div>`;
      }
      if (m.aFaire && m.aFaire.length) {
        m.aFaire.forEach(af => {
          const contenuAF = af.contenu ? b64d(af.contenu).replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').trim() : '';
          const inter = af.interrogation ? '<span style="font-size:14px;background:#fef2f2;color:#b91c1c;padding:2px 6px;border-radius:10px;margin-left:6px">Interro</span>' : '';
          html += `<div style="margin-top:6px;padding:6px 8px;border-radius:6px;background:var(--bg3);border:1px solid ${af.effectue?'#bbf7d0':'var(--border)'}">
            <div style="font-size:14px;font-weight:500;color:var(--text)">📚 À faire${inter}</div>
            ${contenuAF ? `<div style="font-size:14px;color:var(--text2);margin-top:3px">${contenuAF}</div>` : ''}
          </div>`;
        });
      }
      html += '</div>';
    });
    return html || '<p style="color:var(--text3);font-size:14px">Aucun contenu.</p>';
  }

  // FALLBACK JSON formaté
  return `<pre style="font-family:monospace;font-size:14px;white-space:pre-wrap">${JSON.stringify(data, null, 2)}</pre>`;
}

// ── Gestion des paramètres de sécurité ──────────────────────────
const SEC_KEY = 'ed_security_rules';
const SEC_DEFAULTS = [];

function loadSecuritySettings() {
  try {
    const saved = localStorage.getItem(SEC_KEY);
    return saved ? JSON.parse(saved) : [...SEC_DEFAULTS];
  } catch { return [...SEC_DEFAULTS]; }
}

function renderSecEntries(rules) {
  const container = document.getElementById('sec-entries');
  container.innerHTML = '';
  rules.forEach((r, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 28px;gap:4px;margin-bottom:4px;align-items:center';
    row.innerHTML = `
      <input type="text" value="${r.keyword}" placeholder="mot-clé (ex: jour)" data-i="${i}" data-field="keyword"
        style="height:30px;font-size:14px;border:0.5px solid var(--border);border-radius:6px;padding:0 8px;background:var(--input-bg);color:var(--text)" />
      <input type="text" value="${r.value}" placeholder="valeur (ex: 17)" data-i="${i}" data-field="value"
        style="height:30px;font-size:14px;border:0.5px solid var(--border);border-radius:6px;padding:0 8px;background:var(--input-bg);color:var(--text)" />
      <button onclick="removeSecEntry(${i})" style="height:28px;width:28px;background:none;border:0.5px solid var(--border);border-radius:6px;cursor:pointer;font-size:14px;color:var(--text3);display:flex;align-items:center;justify-content:center">×</button>`;
    container.appendChild(row);
  });
}

function addSecEntry() {
  const rules = getSecEntriesFromDOM();
  rules.push({ keyword: '', value: '' });
  renderSecEntries(rules);
  // Focus sur le nouveau champ keyword
  const inputs = document.querySelectorAll('#sec-entries input[data-field="keyword"]');
  if (inputs.length) inputs[inputs.length - 1].focus();
}

function removeSecEntry(i) {
  const rules = getSecEntriesFromDOM();
  rules.splice(i, 1);
  renderSecEntries(rules);
}

function getSecEntriesFromDOM() {
  const rules = [];
  document.querySelectorAll('#sec-entries > div').forEach(row => {
    const kw  = row.querySelector('[data-field="keyword"]').value.trim();
    const val = row.querySelector('[data-field="value"]').value.trim();
    rules.push({ keyword: kw, value: val });
  });
  return rules;
}

function toggleSecurityPanel() {
  const panel = document.getElementById('security-panel');
  const visible = panel.style.display !== 'none';
  if (!visible) {
    renderSecEntries(loadSecuritySettings());
  }
  panel.style.display = visible ? 'none' : 'block';
  document.getElementById('sec-save-msg').style.display = 'none';
}

function saveSecuritySettings() {
  const rules = getSecEntriesFromDOM().filter(r => r.keyword && r.value);
  localStorage.setItem(SEC_KEY, JSON.stringify(rules));
  const msg = document.getElementById('sec-save-msg');
  msg.textContent = '✓ Sauvegardé';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 2000);
}

function resetSecuritySettings() {
  localStorage.removeItem(SEC_KEY);
  renderSecEntries([...SEC_DEFAULTS]);
  const msg = document.getElementById('sec-save-msg');
  msg.textContent = '✓ Réinitialisé';
  msg.style.display = 'block';
  setTimeout(() => { msg.style.display = 'none'; }, 2000);
}

// ── Nouveau message ────────────────────────────────────────────────────────

let newMsgRecipients = []; // { id, nom, type, _raw? }
let newMsgAttachments = []; // File[]
let _newMsgMode = null;        // null | 'reply' | 'forward'
let _newMsgForwardId = null;   // msgId pour le transfert
let _newMsgForwardFiles = [];  // fichiers à transférer
let contactsCache = { teachers: null, staff: null, tutors: null };
function resetContactsCache() { contactsCache = { teachers: null, staff: null, tutors: null }; }

function getIdClasse() {
  const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
  return acc?.profile?.classe?.id || acc?.classe?.id || '';
}

function getClasseIdForView() {
  if (_childEleveView) return _childEleveView.classeId || '';
  return getIdClasse();
}

function openMsgToContact(id, nomEnc, type) {
  openNewMessageDialog({ initialRecipient: { id, nom: decodeURIComponent(nomEnc), type } });
}

function openNewMessageDialog({ initialRecipient = null, mode = null, subject = '', quotedHtml = '', forwardId = null, forwardFiles = [] } = {}) {
  if (_childEleveView) return;
  newMsgRecipients = initialRecipient ? [initialRecipient] : [];
  newMsgAttachments = [];
  _newMsgMode = mode;
  _newMsgForwardId = forwardId;
  _newMsgForwardFiles = forwardFiles;
  const dark = document.body.classList.contains('dark');
  const dlgTitle = mode === 'reply' ? 'Répondre' : mode === 'forward' ? 'Transférer' : 'Nouveau message';
  const sendLabel = mode === 'reply' ? 'Répondre' : mode === 'forward' ? 'Transférer' : 'Envoyer';
  const overlay = document.createElement('div');
  overlay.id = 'new-msg-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');

  const dlg = document.createElement('div');
  dlg.style.cssText = `background:${dark?'#242424':'#fff'};color:${dark?'#f0f0ee':'#1a1a1a'};border-radius:12px;padding:20px;width:100%;max-width:680px;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.25)`;
  dlg.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0">
      <span style="font-weight:600;font-size:15px">${dlgTitle}</span>
      <button onclick="document.getElementById('new-msg-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);line-height:1">×</button>
    </div>

    <!-- À -->
    <div style="flex-shrink:0">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">À</label>
      <div id="new-msg-to-wrap" onclick="openContactPicker()" style="min-height:36px;border:1px solid var(--border);border-radius:8px;padding:6px 10px;cursor:pointer;display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:4px;background:var(--bg2)">
        <span id="new-msg-to-chips" style="display:contents"></span>
        <span style="color:var(--text4);font-size:13px" id="new-msg-to-hint">Cliquer pour ajouter des destinataires…</span>
      </div>
    </div>

    <!-- Sujet -->
    <div style="flex-shrink:0">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Sujet</label>
      <input id="new-msg-subject" type="text" placeholder="Sujet du message" style="width:100%;margin-top:4px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:14px;box-sizing:border-box;outline:none">
    </div>

    <!-- Message (contenteditable enrichi) -->
    <div style="flex:1;min-height:0;display:flex;flex-direction:column">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;flex-shrink:0">Message</label>
      <div id="new-msg-toolbar" style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px;margin-bottom:4px;flex-shrink:0">
        ${['bold','italic','underline'].map(cmd =>
          `<button data-rte-cmd="${cmd}" onmousedown="event.preventDefault();document.execCommand('${cmd}');setTimeout(()=>_syncRteToolbar('new-msg-toolbar'),0)" title="${cmd}"
            style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:13px">
            ${cmd==='bold'?'<b>G</b>':cmd==='italic'?'<i>I</i>':'<u>S</u>'}
          </button>`).join('')}
        ${[1,2,3].map(n =>
          `<button data-rte-cmd="fontSize" data-rte-size="${n+2}" onmousedown="event.preventDefault();document.execCommand('fontSize',false,'${n+2}');setTimeout(()=>_syncRteToolbar('new-msg-toolbar'),0)" title="Taille ${n}"
            style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:${10+n*2}px">A</button>`).join('')}
        <button data-rte-cmd="insertUnorderedList" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList');setTimeout(()=>_syncRteToolbar('new-msg-toolbar'),0)" title="Liste à puces"
          style="padding:3px 7px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;display:inline-flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2.5" cy="4" r="1.5" fill="currentColor"/><rect x="5.5" y="3" width="9" height="2" rx="1" fill="currentColor"/><circle cx="2.5" cy="8" r="1.5" fill="currentColor"/><rect x="5.5" y="7" width="9" height="2" rx="1" fill="currentColor"/><circle cx="2.5" cy="12" r="1.5" fill="currentColor"/><rect x="5.5" y="11" width="9" height="2" rx="1" fill="currentColor"/></svg></button>
        <button onmousedown="event.preventDefault();document.execCommand('removeFormat');setTimeout(()=>_syncRteToolbar('new-msg-toolbar'),0)"
          style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:13px">Effacer format</button>
      </div>
      <div id="new-msg-body" contenteditable="true"
        onmouseup="_syncRteToolbar('new-msg-toolbar')" onkeyup="_syncRteToolbar('new-msg-toolbar')"
        style="flex:1;min-height:calc(1.6em * 3 + 20px);border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg2);color:var(--text);font-size:14px;line-height:1.6;outline:none;overflow-y:auto"></div>
    </div>

    <!-- Pièces jointes -->
    <div style="flex-shrink:0">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Pièces jointes</label>
      <div id="new-msg-dropzone" onclick="document.getElementById('new-msg-file-input').click()"
        ondragover="event.preventDefault();this.style.borderColor='#1d4ed8'"
        ondragleave="this.style.borderColor=''"
        ondrop="event.preventDefault();this.style.borderColor='';handleMsgFileDrop(event)"
        style="margin-top:4px;border:2px dashed var(--border);border-radius:8px;padding:14px;text-align:center;cursor:pointer;font-size:13px;color:var(--text3);transition:border-color .15s">
        Glissez des fichiers ici ou <u>cliquez pour parcourir</u>
        <div id="new-msg-files-list" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center"></div>
      </div>
      <input type="file" id="new-msg-file-input" multiple style="display:none" onchange="handleMsgFileInput(this)">
    </div>

    <!-- Boutons -->
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px;flex-shrink:0">
      <button onclick="saveMsgDraft()" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Enregistrer dans les brouillons</button>
      <button onclick="sendNewMessage()" style="padding:7px 16px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:500;cursor:pointer">${sendLabel}</button>
    </div>
    <div id="new-msg-status" style="font-size:13px;text-align:right;flex-shrink:0"></div>
  `;

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);
  if (initialRecipient) renderNewMsgChips();

  if (subject) {
    const subjEl = document.getElementById('new-msg-subject');
    if (subjEl) subjEl.value = subject;
  }
  if (quotedHtml) {
    const bodyEl = document.getElementById('new-msg-body');
    if (bodyEl) {
      const sep = `<br><br><div style="border-top:1px solid var(--border);margin:10px 0 6px 0"></div><div style="color:var(--text3);font-size:12px;margin-bottom:4px">— Message original —</div><div style="padding:8px 12px;border-left:3px solid #1d4ed8;background:var(--bg3);border-radius:0 6px 6px 0;color:var(--text2);font-size:13px">${quotedHtml}</div>`;
      bodyEl.innerHTML = sep;
      // Placer le curseur au début
      const range = document.createRange();
      range.setStart(bodyEl, 0);
      range.collapse(true);
      const sel = window.getSelection();
      if (sel) { sel.removeAllRanges(); sel.addRange(range); }
      bodyEl.focus();
    }
  }
}

function renderNewMsgChips() {
  const chips = document.getElementById('new-msg-to-chips');
  const hint  = document.getElementById('new-msg-to-hint');
  if (!chips) return;
  chips.innerHTML = newMsgRecipients.map(r =>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:500">
      ${r.nom}
      <span onclick="removeRecipient(${r.id})" style="cursor:pointer;font-size:14px;line-height:1;color:#1d4ed8">×</span>
    </span>`
  ).join('');
  if (hint) hint.style.display = newMsgRecipients.length ? 'none' : '';
}

function removeRecipient(id) {
  newMsgRecipients = newMsgRecipients.filter(r => r.id !== id);
  renderNewMsgChips();
}

function handleMsgFileDrop(e) {
  const files = Array.from(e.dataTransfer.files);
  files.forEach(f => { if (!newMsgAttachments.find(x => x.name === f.name)) newMsgAttachments.push(f); });
  renderAttachmentList();
}

function handleMsgFileInput(input) {
  Array.from(input.files).forEach(f => { if (!newMsgAttachments.find(x => x.name === f.name)) newMsgAttachments.push(f); });
  renderAttachmentList();
  input.value = '';
}

function renderAttachmentList() {
  const list = document.getElementById('new-msg-files-list');
  if (!list) return;
  list.innerHTML = newMsgAttachments.map((f, i) =>
    `<span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg3);padding:3px 8px;border-radius:10px;font-size:12px">
      ${getFileIcon(f.name)} ${f.name}
      <span onclick="removeAttachment(${i})" style="cursor:pointer;color:var(--text3);font-size:14px;line-height:1">×</span>
    </span>`
  ).join('');
}

function removeAttachment(i) {
  newMsgAttachments.splice(i, 1);
  renderAttachmentList();
}

// ── Dialog sélection destinataires ─────────────────────────────────────────

let contactPickerTab = 'teachers';
let _workspaceMembersCache = [];

async function openContactPicker() {
  const dark = document.body.classList.contains('dark');
  const overlay = document.createElement('div');
  overlay.id = 'contact-picker-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1100;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');

  const dlg = document.createElement('div');
  dlg.style.cssText = `background:${dark?'#242424':'#fff'};color:${dark?'#f0f0ee':'#1a1a1a'};border-radius:12px;padding:20px;width:100%;max-width:480px;max-height:80vh;display:flex;flex-direction:column;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.25)`;
  dlg.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:600;font-size:15px">Choisir des destinataires</span>
      <button onclick="document.getElementById('contact-picker-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);line-height:1">×</button>
    </div>
    <div style="display:flex;gap:4px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:3px">
      <button class="contact-tab active" data-ctab="teachers" onclick="switchContactTab('teachers')" style="flex:1;padding:4px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;background:var(--bg);color:var(--text)">Enseignants</button>
      <button class="contact-tab" data-ctab="staff" onclick="switchContactTab('staff')" style="flex:1;padding:4px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;background:transparent;color:var(--text3)">Personnels</button>
      <button class="contact-tab" data-ctab="workspaces" onclick="switchContactTab('workspaces')" style="flex:1;padding:4px;border:none;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;background:transparent;color:var(--text3)">Espace de travail</button>
    </div>
    <input id="contact-search" type="text" placeholder="Rechercher…" oninput="filterContacts()" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;outline:none">
    <div id="contact-list" style="flex:1;overflow-y:auto;max-height:340px;display:flex;flex-direction:column;gap:2px">
      <span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Chargement…</span>
    </div>
    <button onclick="document.getElementById('contact-picker-overlay').remove()" style="padding:7px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Valider</button>
  `;

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);
  contactPickerTab = 'teachers';
  await loadContactsTab('teachers');
}

async function switchContactTab(tab) {
  contactPickerTab = tab;
  document.querySelectorAll('.contact-tab').forEach(b => {
    const active = b.dataset.ctab === tab;
    b.style.background = active ? 'var(--bg)' : 'transparent';
    b.style.color = active ? 'var(--text)' : 'var(--text3)';
  });
  const searchEl = document.getElementById('contact-search');
  if (searchEl) { searchEl.style.display = tab === 'workspaces' ? 'none' : ''; searchEl.value = ''; }
  await loadContactsTab(tab);
}

async function loadContactsTab(tab) {
  const listEl = document.getElementById('contact-list');
  if (!listEl) return;

  if (tab === 'workspaces') {
    const searchEl = document.getElementById('contact-search');
    if (searchEl) searchEl.style.display = 'none';
    await loadWorkspacesForPicker();
    return;
  }

  const eleveId = getEleveId();
  const cacheKey = `contacts:${tab}:${eleveId}`;

  await edCache.load(cacheKey, async () => {
    const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    const idClasse = acc?.profile?.classe?.id || acc?.classe?.id || acc?.idClasse || '';
    const endpoints = {
      teachers: `/v3/messagerie/contacts/professeurs.awp?nom=&idClasse=${idClasse}&verbe=get&v=${API_VERSION}`,
      staff:    `/v3/messagerie/contacts/personnels.awp?verbe=get&v=${API_VERSION}`,
      tutors:   `/v3/messagerie/contacts/entreprises.awp?verbe=get&v=${API_VERSION}`,
    };
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(`${getProxy()}${endpoints[tab]}`, { method: 'POST', headers, body: 'data={}' });
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    const raw = Array.isArray(data.data) ? data.data
      : Array.isArray(data.data?.professeurs) ? data.data.professeurs
      : Array.isArray(data.data?.personnels)   ? data.data.personnels
      : Array.isArray(data.data?.contacts)     ? data.data.contacts
      : Array.isArray(data.data?.eleves)        ? data.data.eleves
      : Object.values(data.data || {}).find(Array.isArray) || [];
    const strVal = v => typeof v === 'string' ? v : (v?.libelle || v?.nom || '');
    return raw.map(c => ({
      id:  c.id,
      nom: [c.civilite, c.prenom, c.nom].filter(Boolean).join(' ').trim() || c.login || String(c.id),
      info: strVal(c.matiere) || strVal(c.fonction) || strVal(c.role) || '',
    }));
  }, {
    onSpinner: () => { listEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">${centeredSpinner()}</span>`; },
    onCached:  (list) => { contactsCache[tab] = list; renderContactList(list); },
    onFresh:   (list) => { contactsCache[tab] = list; renderContactList(list); },
    diffFn:    edCache.defaultDiff,
  }).catch(e => {
    if (listEl) listEl.innerHTML = `<span style="color:#b91c1c;font-size:13px;padding:8px">Erreur : ${e.message}</span>`;
  });
}

async function loadWorkspacesForPicker() {
  const listEl = document.getElementById('contact-list');
  if (!listEl) return;
  listEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">${centeredSpinner()}</span>`;
  try {
    const acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    const accountId = acc?.id || '';
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/1/${accountId}/espacestravail.awp?verbe=get&typeModule=messagerie&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    const espaces = (data.data || []).filter(e => e.messagerieEleve || e.messagerieFamille);
    if (!espaces.length) {
      listEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Aucun espace de travail disponible.</span>`;
      return;
    }
    renderWorkspacePicker(espaces);
  } catch(e) {
    if (listEl) listEl.innerHTML = `<span style="color:#b91c1c;font-size:13px;padding:8px">Erreur : ${e.message}</span>`;
  }
}

function renderWorkspacePicker(espaces) {
  const listEl = document.getElementById('contact-list');
  if (!listEl) return;
  listEl.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:6px;padding-bottom:8px;border-bottom:1px solid var(--border2)">
      <select id="workspace-picker-select"
        style="width:100%;padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;cursor:pointer;outline:none"
        onchange="loadWorkspaceMembers(this.value)">
        <option value="">Sélectionner un espace…</option>
        ${espaces.map(e => `<option value="${e.id}">${e.titre}</option>`).join('')}
      </select>
      <input id="workspace-member-search" type="text" placeholder="Filtrer les membres…"
        oninput="filterWorkspaceMembers()"
        style="display:none;padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:13px;outline:none">
    </div>
    <div id="workspace-members-list" style="display:flex;flex-direction:column;gap:2px;padding-top:4px">
      <span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Sélectionnez un espace de travail.</span>
    </div>`;
}

function filterWorkspaceMembers() {
  const q = document.getElementById('workspace-member-search')?.value.toLowerCase() || '';
  const list = _workspaceMembersCache.filter(c =>
    c.nom.toLowerCase().includes(q) || c.info.toLowerCase().includes(q)
  );
  renderWorkspaceMemberList(list);
}

async function loadWorkspaceMembers(espaceId) {
  const membersEl = document.getElementById('workspace-members-list');
  if (!membersEl) return;
  if (!espaceId) {
    membersEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Sélectionnez un espace de travail.</span>`;
    return;
  }
  const searchInput = document.getElementById('workspace-member-search');
  if (searchInput) { searchInput.style.display = 'none'; searchInput.value = ''; }
  membersEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">${centeredSpinner()}</span>`;
  try {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const resp = await fetch(
      `${getProxy()}/v3/messagerie/contacts/espacesTravail.awp?idEspace=${espaceId}&verbe=get&v=${API_VERSION}`,
      { method: 'POST', headers, body: 'data={}' }
    );
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    const raw = Array.isArray(data.data?.contacts) ? data.data.contacts
      : Array.isArray(data.data) ? data.data : [];
    const strVal = v => typeof v === 'string' ? v : (v?.libelle || v?.nom || '');
    _workspaceMembersCache = raw.map(c => ({
      id: c.id,
      nom: [c.civilite, c.prenom, c.nom].filter(Boolean).join(' ').trim() || c.login || String(c.id),
      info: strVal(c.matiere) || strVal(c.fonction) || strVal(c.profil) || strVal(c.role) || '',
      _raw: c,
    }));
    const searchInput = document.getElementById('workspace-member-search');
    if (searchInput) { searchInput.style.display = ''; searchInput.value = ''; }
    renderWorkspaceMemberList(_workspaceMembersCache);
  } catch(e) {
    if (membersEl) membersEl.innerHTML = `<span style="color:#b91c1c;font-size:13px;padding:8px">Erreur : ${e.message}</span>`;
  }
}

function renderWorkspaceMemberList(list) {
  const membersEl = document.getElementById('workspace-members-list');
  if (!membersEl) return;
  if (!list.length) {
    membersEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Aucun membre.</span>`;
    return;
  }
  const dark = document.body.classList.contains('dark');
  membersEl.innerHTML = list.map(c => {
    const selected = newMsgRecipients.some(r => r.id === c.id);
    const nomEnc = c.nom.replace(/'/g, '%27');
    return `<div onclick="toggleRecipient(${c.id},'${nomEnc}','workspaces')"
      style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:7px;cursor:pointer;
        background:${selected?(dark?'#1e3a5f':'#eff6ff'):'transparent'};
        border:1px solid ${selected?'#1d4ed8':'transparent'};font-size:13px;transition:background .1s"
      onmouseover="if(!this.style.borderColor.includes('1d4ed8'))this.style.background='var(--bg3)'"
      onmouseout="this.style.background='${selected?(dark?'#1e3a5f':'#eff6ff'):'transparent'}'">
      <span style="flex:1">${c.nom}${c.info?`<span style="color:var(--text4);font-size:12px;margin-left:6px">${c.info}</span>`:''}</span>
      ${selected?'<span style="color:#1d4ed8;font-weight:700;font-size:16px">✓</span>':''}
    </div>`;
  }).join('');
}

function filterContacts() {
  const q = document.getElementById('contact-search')?.value.toLowerCase() || '';
  const list = (contactsCache[contactPickerTab] || []).filter(c =>
    c.nom.toLowerCase().includes(q) || c.info.toLowerCase().includes(q)
  );
  renderContactList(list);
}

function renderContactList(list) {
  const listEl = document.getElementById('contact-list');
  if (!listEl) return;
  if (!list.length) { listEl.innerHTML = `<span style="color:var(--text4);font-size:13px;text-align:center;padding:16px">Aucun résultat.</span>`; return; }
  const dark = document.body.classList.contains('dark');
  listEl.innerHTML = list.map(c => {
    const selected = newMsgRecipients.some(r => r.id === c.id);
    return `<div onclick="toggleRecipient(${c.id},'${c.nom.replace(/'/g,"\\'")}','${contactPickerTab}')"
      style="display:flex;align-items:center;gap:8px;padding:7px 8px;border-radius:7px;cursor:pointer;
        background:${selected?(dark?'#1e3a5f':'#eff6ff'):'transparent'};
        border:1px solid ${selected?'#1d4ed8':'transparent'};font-size:13px;transition:background .1s"
      onmouseover="if(!this.classList.contains('c-sel'))this.style.background='var(--bg3)'"
      onmouseout="this.style.background='${selected?(dark?'#1e3a5f':'#eff6ff'):'transparent'}'">
      <span style="flex:1">${c.nom}${c.info?`<span style="color:var(--text4);font-size:12px;margin-left:6px">${c.info}</span>`:''}</span>
      ${selected?'<span style="color:#1d4ed8;font-weight:700;font-size:16px">✓</span>':''}
    </div>`;
  }).join('');
}

function toggleRecipient(id, nom, type) {
  const idx = newMsgRecipients.findIndex(r => r.id === id);
  if (idx >= 0) newMsgRecipients.splice(idx, 1);
  else {
    const entry = { id, nom, type };
    if (type === 'workspaces') {
      const raw = _workspaceMembersCache.find(c => c.id === id);
      if (raw?._raw) entry._raw = raw._raw;
    }
    newMsgRecipients.push(entry);
  }
  renderNewMsgChips();
  if (contactPickerTab === 'workspaces') renderWorkspaceMemberList(_workspaceMembersCache);
  else renderContactList(contactsCache[contactPickerTab] || []);
}

// ── Envoi / brouillon ──────────────────────────────────────────────────────

function getMsgPayload(isDraft) {
  const subject = document.getElementById('new-msg-subject')?.value.trim() || '';
  const body    = document.getElementById('new-msg-body')?.innerHTML || '';
  const to = newMsgRecipients.map(r => ({ id: r.id, typeDestinataire: r.type === 'teachers' ? 'P' : r.type === 'staff' ? 'A' : r.type === 'workspaces' ? 'P' : 'L' }));
  const payload = { subject, body: btoa(unescape(encodeURIComponent(body))), to, isDraft: isDraft ? 1 : 0 };
  if (_newMsgForwardId) {
    payload.forwardId = _newMsgForwardId;
    payload.transfertFiles = _newMsgForwardFiles;
  }
  return payload;
}

function getMsgPayloadParent(isDraft) {
  const subject = document.getElementById('new-msg-subject')?.value.trim() || '';
  const body    = document.getElementById('new-msg-body')?.innerHTML || '';
  const content = btoa(unescape(encodeURIComponent(body)));
  const eleveId = getEleveId();
  const annee   = document.getElementById('msg-annee')?.value || '';
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const destinataires = newMsgRecipients.map(r => {
    if (r._raw) {
      const raw = r._raw;
      const typeNum = String(raw.type || raw.typeDestinataire || '1');
      return {
        civilite: raw.civilite || '', nom: raw.nom || '', prenom: raw.prenom || '', particule: raw.particule || '',
        type: typeNum, id: raw.id, sexe: raw.sexe || '', matiere: raw.matiere || '',
        classe: raw.classe || { id: 0, libelle: '', code: '' },
        photo: raw.photo || '', badge: raw.badge || '', etablissements: raw.etablissements || [],
        responsable: raw.responsable || { id: 0, typeResp: '', versQui: '', contacts: [] },
        fonction: raw.fonction || { id: 0, libelle: '' },
        isPP: raw.isPP || false, isSelected: true,
        uniqID: raw.uniqID || `${raw.id}_${typeNum}_0_0`, idRegime: raw.idRegime || 0, to_cc_cci: 'to'
      };
    }
    const typeNum = r.type === 'teachers' ? '2' : r.type === 'staff' ? '3' : r.type === 'tutors' ? '4' : '1';
    const parts = r.nom.trim().split(/\s+/);
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : r.nom;
    const prenom = parts.length > 1 ? parts[0] : '';
    return {
      civilite: '', nom, prenom, particule: '', type: typeNum, id: r.id, sexe: '', matiere: '',
      classe: { id: 0, libelle: '', code: '' }, photo: '', badge: '', etablissements: [],
      responsable: { id: 0, typeResp: '', versQui: '', contacts: [] }, fonction: { id: 0, libelle: '' },
      isPP: false, isSelected: true, uniqID: `${r.id}_${typeNum}_0_0`, idRegime: 0, to_cc_cci: 'to'
    };
  });

  const msg = {
    subject, content,
    groupesDestinataires: [{ destinataires, selection: { type: 'W' } }],
    transfertFiles: _newMsgForwardFiles || [],
    files: _newMsgForwardFiles || [],
    date, read: true,
    from: { role: '1', id: eleveId, read: true }, brouillon: isDraft
  };
  if (_newMsgForwardId) msg.forwardId = _newMsgForwardId;
  return { message: msg, anneeMessages: annee };
}

function setMsgStatus(msg, color) {
  const el = document.getElementById('new-msg-status');
  if (el) { el.textContent = msg; el.style.color = color; }
}

async function sendNewMessage() {
  if (!newMsgRecipients.length) { setMsgStatus('Ajoutez au moins un destinataire.', '#b91c1c'); return; }
  const subject = document.getElementById('new-msg-subject')?.value.trim();
  if (!subject) { setMsgStatus('Le sujet est obligatoire.', '#b91c1c'); return; }
  const actionLabel = _newMsgMode === 'reply' ? 'Réponse' : _newMsgMode === 'forward' ? 'Transfert' : 'Envoi';
  setMsgStatus(`${actionLabel} en cours…`, 'var(--text3)');
  try {
    const eleveId = _childEleveView?.id || getEleveId();
    const _acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    const isParent = !_childEleveView && _acc?.typeCompte !== 'E';
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const endpoint = isParent
      ? `${getProxy()}/v3/familles/${eleveId}/messages.awp?verbe=post&v=${API_VERSION}`
      : `${getProxy()}/v3/eleves/${eleveId}/messages.awp?verbe=post&v=${API_VERSION}`;
    const payload = isParent ? getMsgPayloadParent(false) : getMsgPayload(false);
    const resp = await fetch(endpoint, { method: 'POST', headers, body: `data=${encodeURIComponent(JSON.stringify(payload))}` });
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    const successLabel = _newMsgMode === 'reply' ? 'Réponse envoyée !' : _newMsgMode === 'forward' ? 'Message transféré !' : 'Message envoyé !';
    setMsgStatus(successLabel, '#15803d');
    setTimeout(() => { document.getElementById('new-msg-overlay')?.remove(); loadMessages(); }, 1200);
  } catch(e) { setMsgStatus(`Erreur : ${e.message}`, '#b91c1c'); }
}

async function saveMsgDraft() {
  setMsgStatus('Enregistrement…', 'var(--text3)');
  try {
    const eleveId = _childEleveView?.id || getEleveId();
    const _acc = accountData?.accounts ? accountData.accounts[0] : accountData;
    const isParent = !_childEleveView && _acc?.typeCompte !== 'E';
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': token, 'X-ApisVer': API_VERSION };
    if (twoFaToken) headers['2fa-token'] = twoFaToken;
    const endpoint = isParent
      ? `${getProxy()}/v3/familles/${eleveId}/messages.awp?verbe=post&v=${API_VERSION}`
      : `${getProxy()}/v3/eleves/${eleveId}/messages.awp?verbe=post&v=${API_VERSION}`;
    const payload = isParent ? getMsgPayloadParent(true) : getMsgPayload(true);
    const resp = await fetch(endpoint, { method: 'POST', headers, body: `data=${encodeURIComponent(JSON.stringify(payload))}` });
    const data = await resp.json();
    if (data.code !== 200) throw new Error(data.message || `Code ${data.code}`);
    setMsgStatus('Brouillon enregistré !', '#15803d');
    setTimeout(() => { document.getElementById('new-msg-overlay')?.remove(); loadMessages(); }, 1200);
  } catch(e) { setMsgStatus(`Erreur : ${e.message}`, '#b91c1c'); }
}

// Restauration de session — UI seulement, sans appel réseau pour ne pas perturber le GTK
// Différer restoreSession après que tous les scripts (cache.js inclus) soient chargés
window.addEventListener('DOMContentLoaded', function restoreSession() {
  try {
    const saved = localStorage.getItem('ed_session');
    if (!saved) return;
    const s = JSON.parse(saved);
    if (!s.token || !s.accountData) return;
    token = s.token;
    twoFaToken = s.twoFaToken || '';
    accountData = s.accountData;
    onLoggedIn(s.accountData);
    // Vérification silencieuse après 1s — le proxy a eu le temps de démarrer
    // Si le cache approprié est encore frais (< 30 min), le token était valide récemment → on saute la vérification réseau
    setTimeout(async () => {
      const _acc = s.accountData.accounts ? s.accountData.accounts[0] : s.accountData;
      const eleveId = _acc?.id || '';
      if (!eleveId) return;
      const isEleve = _acc?.typeCompte === 'E';
      // Clé de cache à vérifier : absences pour élève, accueil pour parent
      const skipCacheKey = isEleve ? `absences:${eleveId}` : `accueil:${eleveId}`;
      const cached = await edCache.get(skipCacheKey).catch(() => null);
      if (cached && !edCache.isStale(cached)) return;
      // Endpoint de validation : viescolaire pour élève, accueil pour parent
      const validationUrl = isEleve
        ? `${getProxy()}/v3/eleves/${eleveId}/viescolaire.awp?verbe=get&v=${API_VERSION}`
        : `${getProxy()}/v3/1/${eleveId}/timelineAccueilCommun.awp?verbe=get&v=${API_VERSION}`;
      fetch(validationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-Token': s.token, 'X-ApisVer': API_VERSION },
        body: 'data={}'
      }).then(r => r.json()).then(data => {
        if (data.code !== 200) { silentReauth(s); }
      }).catch(() => { /* proxy pas dispo, on garde la session */ });
    }, 1500);
  } catch(e) { localStorage.removeItem('ed_session'); }
});

// ══════════════════════════════════════════════════════════════════
//  MÉMOS — stockage local IndexedDB, lié à l'eleveId
// ══════════════════════════════════════════════════════════════════

let memosCache     = [];      // tableau en mémoire des mémos de l'élève actif
let selectedMemoId = null;   // UUID du mémo sélectionné
let memosFaitsOnly   = false; // filtre "Faits" actif
let memosExpiresOnly = false; // filtre "Expirés" actif
let memosSortBy  = 'dateCreation'; // colonne de tri : 'titre' | 'dateEcheance' | 'dateCreation'
let memosSortDir = 'desc';         // 'asc' | 'desc'

async function loadMemos() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  const cacheKey = `memos:${eleveId}`;
  document.getElementById('spin-memos').style.display = 'inline';
  const entry = await edCache.get(cacheKey).catch(() => null);
  memosCache = entry ? (entry.data || []) : [];
  renderMemosFromCache();
  updateFreshnessLabel('memos', entry?.ts || Date.now());
  document.getElementById('spin-memos').style.display = 'none';
}

async function saveMemos() {
  const eleveId = getEleveId();
  if (!eleveId) return;
  await edCache.set(`memos:${eleveId}`, memosCache);
}

function renderMemosFromCache() {
  const container = document.getElementById('memos-result');
  if (!container) return;

  const today = new Date().toISOString().substring(0, 10);

  let list = [...memosCache];
  if (memosFaitsOnly)   list = list.filter(m => !m.fait);
  if (memosExpiresOnly) list = list.filter(m => m.dateEcheance && m.dateEcheance < today);

  // Tri
  list.sort((a, b) => {
    let va, vb;
    if (memosSortBy === 'titre') {
      va = (a.titre || '').toLowerCase();
      vb = (b.titre || '').toLowerCase();
    } else if (memosSortBy === 'dateEcheance') {
      va = a.dateEcheance || '';
      vb = b.dateEcheance || '';
    } else {
      va = a.dateCreation || '';
      vb = b.dateCreation || '';
    }
    const cmp = va < vb ? -1 : va > vb ? 1 : 0;
    return memosSortDir === 'asc' ? cmp : -cmp;
  });

  if (!list.length) {
    const msg = memosExpiresOnly ? 'Aucun mémo expiré.' : memosFaitsOnly ? 'Aucun mémo non fait.' : 'Aucun mémo. Créez-en un !';
    container.innerHTML = `<p style="color:var(--text3);font-size:14px;padding:8px 0">${msg}</p>`;
    return;
  }

  // En-têtes colonnes
  const arrow = col => memosSortBy === col ? (memosSortDir === 'asc' ? ' ↑' : ' ↓') : '';
  const hSt = 'font-size:11px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;cursor:pointer;user-select:none;white-space:nowrap;padding:2px 0';
  const headers = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;padding-bottom:4px;border-bottom:1px solid var(--border)">
    <div style="width:34px;flex-shrink:0"></div>
    <div style="flex:1;min-width:0">
      <span onclick="sortMemosBy('titre')" style="${hSt}">Titre${arrow('titre')}</span>
    </div>
    <div style="display:flex;align-items:center;gap:20px;flex-shrink:0">
      <span onclick="sortMemosBy('dateEcheance')" style="${hSt};width:80px;display:inline-block;text-align:center">Échéance${arrow('dateEcheance')}</span>
      <span onclick="sortMemosBy('dateCreation')" style="${hSt};width:62px;display:inline-block;text-align:right">Créé le${arrow('dateCreation')}</span>
      <div style="width:28px"></div>
    </div>
  </div>`;

  container.innerHTML = headers + list.map(m => {
    const fait      = m.fait;
    const idEnc     = encodeURIComponent(m.id).replace(/'/g, '%27');
    const titreH    = (m.titre || '(Sans titre)').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const dateCreeLbl  = (m.dateCreation || '').substring(0, 10);
    const dateEchLbl   = m.dateEcheance || '';
    const isExpired = m.dateEcheance && m.dateEcheance < today;
    const expiredSvg = isExpired
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" width="18" height="16" style="flex-shrink:0;vertical-align:middle" title="Mémo expiré"><polygon points="10,1 19,17 1,17" fill="#f59e0b" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><text x="10" y="15.5" text-anchor="middle" font-size="11" font-weight="900" fill="#000">!</text></svg>`
      : '';
    return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
      <button onclick="event.stopPropagation();toggleMemoFait('${idEnc}')"
              title="${fait ? 'Marquer comme non fait' : 'Marquer comme fait'}"
              style="flex-shrink:0;width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:transparent;color:${fait ? '#15803d' : 'var(--text4)'};font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:opacity .15s"
              onmouseover="this.style.opacity='0.6'" onmouseout="this.style.opacity='1'">${fait ? '✅' : '○'}</button>
      <div data-memo-id="${m.id}" onclick="openMemoDetail('${idEnc}')"
           style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:6px;background:var(--bg3);border:1px solid var(--border);font-size:14px;cursor:pointer;transition:background .1s,box-shadow .1s"
           onmouseover="if(this.dataset.memoId!==selectedMemoId)this.style.background='var(--bg4)'"
           onmouseout="if(this.dataset.memoId!==selectedMemoId)this.style.background='var(--bg3)'">
        <div style="flex:1;min-width:0;display:flex;align-items:center;gap:6px;overflow:hidden">
          ${expiredSvg}
          <span style="font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap${fait ? ';text-decoration:line-through;color:var(--text3)' : ''}">${titreH}</span>
          ${fait ? '<span style="flex-shrink:0;font-size:11px;background:#f0fdf4;color:#15803d;padding:2px 7px;border-radius:10px;font-weight:500">Fait</span>' : ''}
        </div>
        <div style="display:flex;align-items:center;gap:20px;flex-shrink:0">
          <span style="color:${isExpired ? '#b45309' : 'var(--text4)'};font-size:13px;width:80px;text-align:center;white-space:nowrap">${dateEchLbl}</span>
          <span style="color:var(--text4);font-size:13px;width:62px;text-align:right;white-space:nowrap">${dateCreeLbl}</span>
          <button onclick="event.stopPropagation();deleteMemo('${idEnc}')"
                  title="Supprimer"
                  style="background:none;border:none;cursor:pointer;color:var(--text4);font-size:16px;line-height:1;padding:2px 4px;border-radius:4px;width:28px"
                  onmouseover="this.style.color='#b91c1c'" onmouseout="this.style.color='var(--text4)'">✕</button>
        </div>
      </div>
    </div>`;
  }).join('');

  applyMemoSelection();
}

function applyMemoSelection() {
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('[data-memo-id]').forEach(el => {
    const sel = el.dataset.memoId === selectedMemoId;
    el.style.background = sel ? (dark ? 'var(--bg4)' : '#e0e7ff') : 'var(--bg3)';
    el.style.boxShadow  = sel ? 'inset 3px 0 0 #1d4ed8' : '';
  });
}

function openMemoDetail(idEnc) {
  const id = decodeURIComponent(idEnc);
  selectedMemoId = id;
  applyMemoSelection();
  const m = memosCache.find(x => x.id === id);
  if (!m) return;
  const panel = document.getElementById('memo-detail-panel');
  if (!panel) return;
  panel.style.alignItems = 'flex-start';
  panel.style.justifyContent = 'flex-start';
  document.querySelector('.memos-split')?.classList.add('show-detail');
  const enc = encodeURIComponent(id).replace(/'/g, '%27');
  const titreH = (m.titre || '(Sans titre)').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const today = new Date().toISOString().substring(0, 10);
  const isExpired = m.dateEcheance && m.dateEcheance < today;
  const expiredSvgDetail = isExpired
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 18" width="16" height="14" style="vertical-align:middle;margin-right:4px" title="Mémo expiré"><polygon points="10,1 19,17 1,17" fill="#f59e0b" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><text x="10" y="15.5" text-anchor="middle" font-size="11" font-weight="900" fill="#000">!</text></svg>`
    : '';
  panel.innerHTML = `<div style="width:100%">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:8px">
      <div style="font-weight:600;font-size:15px;line-height:1.4;flex:1">${titreH}</div>
      <button onclick="openEditMemoDialog('${enc}')"
              style="flex-shrink:0;height:34px;padding:0 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;cursor:pointer;display:flex;align-items:center;gap:5px"><span style="display:inline-block;transform:rotate(45deg)">✏</span> Modifier</button>
    </div>
    <div style="font-size:13px;color:var(--text4);margin-bottom:${m.dateEcheance ? '6px' : '12px'}">
      Créé le ${(m.dateCreation||'').substring(0,10)}${m.fait ? ' · <span style="color:#15803d;font-weight:500">Fait ✅</span>' : ''}
    </div>
    ${m.dateEcheance ? `<div style="font-size:13px;margin-bottom:12px;color:${isExpired ? '#b45309' : 'var(--text3)'}">
      ${expiredSvgDetail}Échéance : ${m.dateEcheance}${isExpired ? ' <span style="font-size:11px;background:#fef3c7;color:#92400e;padding:1px 7px;border-radius:10px;font-weight:500">Expiré</span>' : ''}
    </div>` : ''}
    <div style="font-size:14px;line-height:1.7;color:var(--text)">${m.contenu || '<em style="color:var(--text4)">Contenu vide</em>'}</div>
  </div>`;
}

function _resetMemoDetailPanel() {
  selectedMemoId = null;
  const panel = document.getElementById('memo-detail-panel');
  if (!panel) return;
  panel.style.alignItems = 'center';
  panel.style.justifyContent = 'center';
  panel.innerHTML = '<span style="color:var(--text4);font-size:13px;text-align:center">Sélectionne un mémo<br>pour voir le détail ici</span>';
}

function toggleMemosFaits(btn) {
  memosFaitsOnly = !memosFaitsOnly;
  btn.setAttribute('aria-pressed', memosFaitsOnly ? 'true' : 'false');
  renderMemosFromCache();
}

function toggleMemosExpires(btn) {
  memosExpiresOnly = !memosExpiresOnly;
  btn.setAttribute('aria-pressed', memosExpiresOnly ? 'true' : 'false');
  renderMemosFromCache();
}

function sortMemosBy(col) {
  if (memosSortBy === col) {
    memosSortDir = memosSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    memosSortBy  = col;
    memosSortDir = col === 'titre' ? 'asc' : 'desc';
  }
  renderMemosFromCache();
}

async function toggleMemoFait(idEnc) {
  const id = decodeURIComponent(idEnc);
  const m = memosCache.find(x => x.id === id);
  if (!m) return;
  m.fait = !m.fait;
  renderMemosFromCache();
  if (selectedMemoId === id) openMemoDetail(encodeURIComponent(id).replace(/'/g,'%27'));
  await saveMemos();
}

async function deleteMemo(idEnc) {
  const id = decodeURIComponent(idEnc);
  const m = memosCache.find(x => x.id === id);
  if (!m) return;
  const titre = m.titre || '(Sans titre)';
  if (!window.confirm(`Supprimer le mémo "${titre}" ? Cette action est irréversible.`)) return;
  memosCache = memosCache.filter(x => x.id !== id);
  if (selectedMemoId === id) _resetMemoDetailPanel();
  renderMemosFromCache();
  await saveMemos();
}

function _syncRteToolbar(toolbarId) {
  const toolbar = document.getElementById(toolbarId);
  if (!toolbar) return;
  toolbar.querySelectorAll('[data-rte-cmd]').forEach(btn => {
    const cmd = btn.dataset.rteCmd;
    const size = btn.dataset.rteSize;
    let active = false;
    try {
      if (size) {
        active = document.queryCommandValue('fontSize') === size;
      } else {
        active = document.queryCommandState(cmd);
      }
    } catch(e) {}
    btn.style.background = active ? 'var(--bg4,#d1d5db)' : 'var(--bg2)';
    btn.style.borderColor = active ? '#1d4ed8' : 'var(--border)';
    btn.style.boxShadow = active ? 'inset 0 1px 3px rgba(0,0,0,0.18)' : '';
    btn.style.color = active ? '#1d4ed8' : 'var(--text)';
  });
}

function _memoDialogToolbar() {
  return `<div id="memo-dlg-toolbar" style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:4px">
    ${['bold','italic','underline'].map(cmd =>
      `<button data-rte-cmd="${cmd}" onmousedown="event.preventDefault();document.execCommand('${cmd}');setTimeout(()=>_syncRteToolbar('memo-dlg-toolbar'),0)" title="${cmd}"
        style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:13px">
        ${cmd==='bold'?'<b>G</b>':cmd==='italic'?'<i>I</i>':'<u>S</u>'}
      </button>`).join('')}
    ${[1,2,3].map(n =>
      `<button data-rte-cmd="fontSize" data-rte-size="${n+2}" onmousedown="event.preventDefault();document.execCommand('fontSize',false,'${n+2}');setTimeout(()=>_syncRteToolbar('memo-dlg-toolbar'),0)" title="Taille ${n}"
        style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:${10+n*2}px">A</button>`).join('')}
    <button data-rte-cmd="insertUnorderedList" onmousedown="event.preventDefault();document.execCommand('insertUnorderedList');setTimeout(()=>_syncRteToolbar('memo-dlg-toolbar'),0)" title="Liste à puces"
      style="padding:3px 7px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;display:inline-flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="2.5" cy="4" r="1.5" fill="currentColor"/><rect x="5.5" y="3" width="9" height="2" rx="1" fill="currentColor"/><circle cx="2.5" cy="8" r="1.5" fill="currentColor"/><rect x="5.5" y="7" width="9" height="2" rx="1" fill="currentColor"/><circle cx="2.5" cy="12" r="1.5" fill="currentColor"/><rect x="5.5" y="11" width="9" height="2" rx="1" fill="currentColor"/></svg></button>
    <button onmousedown="event.preventDefault();document.execCommand('removeFormat');setTimeout(()=>_syncRteToolbar('memo-dlg-toolbar'),0)"
      style="padding:3px 8px;border:1px solid var(--border);border-radius:5px;background:var(--bg2);color:var(--text);cursor:pointer;font-size:13px">Effacer format</button>
  </div>`;
}

function openNewMemoDialog() {
  const dark = document.body.classList.contains('dark');
  const overlay = document.createElement('div');
  overlay.id = 'memo-dlg-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');

  const dlg = document.createElement('div');
  dlg.style.cssText = `background:${dark?'#242424':'#fff'};color:${dark?'#f0f0ee':'#1a1a1a'};border-radius:12px;padding:20px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.25)`;
  dlg.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:600;font-size:15px">Nouveau mémo</span>
      <button onclick="document.getElementById('memo-dlg-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);line-height:1">×</button>
    </div>
    <div style="background:#fef3c7;color:#92400e;border-radius:8px;padding:8px 12px;font-size:13px;line-height:1.5">
      ⚠ Les mémos sont enregistrés par utilisateur et dans le navigateur en cours.
    </div>
    <div style="display:flex;gap:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Titre</label>
        <input id="memo-dlg-titre" type="text" placeholder="Titre du mémo" style="width:100%;margin-top:4px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:14px;box-sizing:border-box;outline:none">
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Échéance (facultatif)</label>
        <input id="memo-dlg-date" type="date" onclick="try{this.showPicker()}catch(e){}" style="display:block;width:100%;margin-top:4px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:14px;box-sizing:border-box;outline:none;cursor:pointer">
      </div>
    </div>
    <div style="flex:1">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Contenu</label>
      <div style="margin-top:4px">${_memoDialogToolbar()}</div>
      <div id="memo-dlg-body" contenteditable="true"
        onmouseup="_syncRteToolbar('memo-dlg-toolbar')" onkeyup="_syncRteToolbar('memo-dlg-toolbar')"
        style="min-height:160px;border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg2);color:var(--text);font-size:14px;line-height:1.6;outline:none;overflow-y:auto"></div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px">
      <button onclick="document.getElementById('memo-dlg-overlay').remove()" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Annuler</button>
      <button onclick="saveMemoFromDialog(null)" style="padding:7px 16px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:500;cursor:pointer">Enregistrer</button>
    </div>
    <div id="memo-dlg-status" style="font-size:13px;color:#b91c1c;text-align:right"></div>
  `;

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('memo-dlg-titre')?.focus(), 50);
}

function openEditMemoDialog(idEnc) {
  const id = decodeURIComponent(idEnc);
  const m = memosCache.find(x => x.id === id);
  if (!m) return;

  const dark = document.body.classList.contains('dark');
  const overlay = document.createElement('div');
  overlay.id = 'memo-dlg-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  overlay.classList.add('dlg-overlay');

  const dlg = document.createElement('div');
  dlg.style.cssText = `background:${dark?'#242424':'#fff'};color:${dark?'#f0f0ee':'#1a1a1a'};border-radius:12px;padding:20px;width:100%;max-width:680px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.25)`;
  const titreEsc = (m.titre||'').replace(/"/g,'&quot;');
  const encId = encodeURIComponent(id).replace(/'/g,'%27');
  const dateEchVal = m.dateEcheance || '';
  dlg.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-weight:600;font-size:15px">Modifier le mémo</span>
      <button onclick="document.getElementById('memo-dlg-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text3);line-height:1">×</button>
    </div>
    <div style="display:flex;gap:12px">
      <div style="flex:1">
        <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Titre</label>
        <input id="memo-dlg-titre" type="text" value="${titreEsc}" style="width:100%;margin-top:4px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:14px;box-sizing:border-box;outline:none">
      </div>
      <div>
        <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Échéance (facultatif)</label>
        <input id="memo-dlg-date" type="date" value="${dateEchVal}" onclick="try{this.showPicker()}catch(e){}" style="display:block;width:100%;margin-top:4px;padding:7px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg2);color:var(--text);font-size:14px;box-sizing:border-box;outline:none;cursor:pointer">
      </div>
    </div>
    <div style="flex:1">
      <label style="font-size:12px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Contenu</label>
      <div style="margin-top:4px">${_memoDialogToolbar()}</div>
      <div id="memo-dlg-body" contenteditable="true"
        onmouseup="_syncRteToolbar('memo-dlg-toolbar')" onkeyup="_syncRteToolbar('memo-dlg-toolbar')"
        style="min-height:160px;border:1px solid var(--border);border-radius:8px;padding:10px;background:var(--bg2);color:var(--text);font-size:14px;line-height:1.6;outline:none;overflow-y:auto">${m.contenu||''}</div>
    </div>
    <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:4px">
      <button onclick="document.getElementById('memo-dlg-overlay').remove()" style="padding:7px 16px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Annuler</button>
      <button onclick="saveMemoFromDialog('${encId}')" style="padding:7px 16px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:500;cursor:pointer">Enregistrer</button>
    </div>
    <div id="memo-dlg-status" style="font-size:13px;color:#b91c1c;text-align:right"></div>
  `;

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);
}

async function saveMemoFromDialog(existingIdEnc) {
  const titre        = (document.getElementById('memo-dlg-titre')?.value || '').trim();
  const contenu      = document.getElementById('memo-dlg-body')?.innerHTML || '';
  const dateEcheance = document.getElementById('memo-dlg-date')?.value || '';
  const status       = document.getElementById('memo-dlg-status');
  if (!titre) { if (status) status.textContent = 'Le titre est obligatoire.'; return; }

  if (existingIdEnc) {
    const id = decodeURIComponent(existingIdEnc);
    const m = memosCache.find(x => x.id === id);
    if (m) { m.titre = titre; m.contenu = contenu; m.dateEcheance = dateEcheance || undefined; }
  } else {
    const memo = {
      id: crypto.randomUUID(),
      eleveId: getEleveId(),
      titre,
      contenu,
      dateCreation: new Date().toISOString(),
      fait: false
    };
    if (dateEcheance) memo.dateEcheance = dateEcheance;
    memosCache.unshift(memo);
  }

  await saveMemos();
  renderMemosFromCache();
  // Rafraîchir le détail si le mémo modifié était ouvert
  if (existingIdEnc && selectedMemoId === decodeURIComponent(existingIdEnc)) {
    openMemoDetail(existingIdEnc);
  }
  document.getElementById('memo-dlg-overlay')?.remove();
}

// ── Export CSV ──────────────────────────────────────────────────────────────

function exportMemosCsv() {
  if (!memosCache.length) { alert('Aucun mémo à exporter.'); return; }
  const csvEsc = s => `"${(s||'').replace(/"/g,'""')}"`;
  const rows = [['id','eleveId','titre','contenu_html','dateCreation','fait','dateEcheance']];
  memosCache.forEach(m => {
    rows.push([csvEsc(m.id), csvEsc(String(m.eleveId||'')), csvEsc(m.titre||''), csvEsc(m.contenu||''), csvEsc(m.dateCreation||''), m.fait?'1':'0', csvEsc(m.dateEcheance||'')]);
  });
  const csv  = rows.map(r => r.join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `memos-${new Date().toISOString().substring(0,10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}

// ── Import CSV ──────────────────────────────────────────────────────────────

function _parseCsvLine(line) {
  // Parsing simple : gère les champs entre guillemets avec guillemets doublés
  const result = [];
  let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i+1] === '"') { cur += '"'; i++; }
      else if (c === '"') inQ = false;
      else cur += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { result.push(cur); cur = ''; }
      else cur += c;
    }
  }
  result.push(cur);
  return result;
}

async function importMemosCsv(input) {
  const file = input.files[0];
  if (!file) return;
  input.value = '';
  const text = await file.text();
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) { alert('Fichier CSV vide ou invalide.'); return; }

  const headers = _parseCsvLine(lines[0]);
  const idx = {
    id:           headers.indexOf('id'),
    eleveId:      headers.indexOf('eleveId'),
    titre:        headers.indexOf('titre'),
    contenu_html: headers.indexOf('contenu_html'),
    dateCreation: headers.indexOf('dateCreation'),
    fait:         headers.indexOf('fait'),
    dateEcheance: headers.indexOf('dateEcheance'),
  };
  if (idx.id < 0 || idx.titre < 0) { alert('CSV invalide : colonnes "id" et "titre" requises.'); return; }

  const imported = lines.slice(1).map(line => {
    const cols = _parseCsvLine(line);
    const m = {
      id:           cols[idx.id]           || '',
      eleveId:      idx.eleveId >= 0       ? (cols[idx.eleveId] || getEleveId()) : getEleveId(),
      titre:        cols[idx.titre]        || '',
      contenu:      idx.contenu_html >= 0 ? (cols[idx.contenu_html] || '') : '',
      dateCreation: idx.dateCreation >= 0  ? (cols[idx.dateCreation] || new Date().toISOString()) : new Date().toISOString(),
      fait:         idx.fait >= 0          ? cols[idx.fait] === '1' : false,
    };
    if (idx.dateEcheance >= 0 && cols[idx.dateEcheance]) m.dateEcheance = cols[idx.dateEcheance];
    return m;
  }).filter(m => m.id && m.titre);

  if (!imported.length) { alert('Aucun mémo valide trouvé dans le fichier.'); return; }

  // Traiter les conflits un par un
  await _processMemoImportQueue(imported, 0);
}

async function _processMemoImportQueue(list, i) {
  if (i >= list.length) {
    await saveMemos();
    renderMemosFromCache();
    return;
  }
  const imp = list[i];
  const existing = memosCache.find(m => m.id === imp.id);

  if (!existing) {
    memosCache.unshift(imp);
    await _processMemoImportQueue(list, i + 1);
    return;
  }

  // Conflit : afficher un dialog à 3 boutons
  _showMemoConflictDialog(imp, existing, async choice => {
    if (choice === 'update') {
      Object.assign(existing, imp);
    } else if (choice === 'add') {
      imp.id = crypto.randomUUID(); // nouvel ID unique
      memosCache.unshift(imp);
    }
    // 'skip' : on ne fait rien
    await _processMemoImportQueue(list, i + 1);
  });
}

function _showMemoConflictDialog(imp, existing, callback) {
  const dark = document.body.classList.contains('dark');
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:2000;display:flex;align-items:center;justify-content:center;padding:1rem';
  overlay.classList.add('dlg-overlay');

  const titreH = (imp.titre||'').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const dlg = document.createElement('div');
  dlg.style.cssText = `background:${dark?'#242424':'#fff'};color:${dark?'#f0f0ee':'#1a1a1a'};border-radius:12px;padding:20px;width:100%;max-width:480px;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 32px rgba(0,0,0,0.3)`;
  dlg.innerHTML = `
    <div style="font-weight:600;font-size:15px">Conflit d'import</div>
    <div style="font-size:14px;line-height:1.6">
      Le mémo <strong>${titreH}</strong> existe déjà.<br>
      <span style="color:var(--text3);font-size:13px">Créé le ${(existing.dateCreation||'').substring(0,10)}</span>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
      <button data-choice="skip"   style="padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Ignorer</button>
      <button data-choice="update" style="padding:7px 14px;border-radius:8px;border:1px solid var(--border);background:var(--bg2);color:var(--text);font-size:13px;font-weight:500;cursor:pointer">Mettre à jour</button>
      <button data-choice="add"    style="padding:7px 14px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-size:13px;font-weight:500;cursor:pointer">Ajouter comme nouveau</button>
    </div>
  `;

  dlg.querySelectorAll('button[data-choice]').forEach(btn => {
    btn.onclick = () => { overlay.remove(); callback(btn.dataset.choice); };
  });

  overlay.appendChild(dlg);
  document.body.appendChild(overlay);
}