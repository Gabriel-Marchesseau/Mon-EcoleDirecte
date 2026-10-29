// Service worker minimal : requis par Chrome pour proposer l'installation de
// l'appli (PWA). Aucun cache de données ici — le cache de données est géré par
// IndexedDB (edCache) et les fichiers statiques sont servis en no-cache par le
// proxy.
//
// Seule fonction : si le proxy ne répond pas (ex. juste après le redémarrage du
// téléphone, le temps que Termux le lance), afficher une page d'attente qui
// réessaie toute seule au lieu de la page d'erreur de Chrome.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

const WAITING_PAGE = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#1d4ed8">
<title>Mon EcoleDirecte</title>
<style>
  body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fff;color:#1f2937;text-align:center;padding:24px;box-sizing:border-box}
  @media (prefers-color-scheme:dark){body{background:#111827;color:#e5e7eb}}
  .spin{width:36px;height:36px;border:4px solid #93c5fd;border-top-color:#1d4ed8;border-radius:50%;animation:s 1s linear infinite;margin-bottom:20px}
  @keyframes s{to{transform:rotate(360deg)}}
  p{margin:6px 0;opacity:.75;font-size:14px}
  #help{display:none;margin-top:18px}
  .btn{display:block;margin:10px auto;padding:12px 20px;border-radius:8px;background:#1d4ed8;color:#fff;text-decoration:none;font-size:15px;font-weight:600}
</style></head><body>
<div class="spin"></div>
<h2>Démarrage de Mon EcoleDirecte…</h2>
<p>Le serveur local se lance, cela prend quelques secondes.</p>
<p>La page s'ouvrira automatiquement.</p>
<div id="help">
  <p>Le serveur ne répond pas. Appuyez sur le bouton pour ouvrir Termux (si le Play Store s'affiche, appuyez sur « Ouvrir »), puis revenez ici : la page se rechargera toute seule.</p>
  <a class="btn" href="intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=com.termux;end">Démarrer le serveur (ouvre Termux)</a>
</div>
<script>
  function check() {
    fetch('/favicon.ico', { cache: 'no-store' })
      .then(function (r) { if (r.ok) location.reload(); })
      .catch(function () {});
  }
  setInterval(check, 2000);
  // Retour depuis Termux : vérifier tout de suite sans attendre le prochain cycle
  document.addEventListener('visibilitychange', function () { if (!document.hidden) check(); });
  // Après 6 s sans réponse, proposer d'ouvrir Termux (le proxy y démarre via ~/.bashrc).
  // Un lien intent: ne peut pas être suivi automatiquement (Chrome le bloque sans geste
  // de l'utilisateur) et Termux n'accepte pas les liens de navigateur : Chrome passe par
  // la fiche Play Store de Termux, d'où la consigne « Ouvrir ».
  setTimeout(function () { document.getElementById('help').style.display = 'block'; }, 6000);
</script>
</body></html>`;

self.addEventListener('fetch', event => {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).catch(() =>
      new Response(WAITING_PAGE, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
    )
  );
});
