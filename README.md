# Mon EcoleDirecte — Local Client

> A local web client for [EcoleDirecte](https://www.ecoledirecte.com/), the French school management platform. Runs entirely on your machine through a local HTTPS proxy — no data ever leaves your computer.

---

## Features

- 📅 **Timetable** — Weekly view with day-by-day layout, color-coded courses, course details on click
- 📊 **Grades** — Per-trimester breakdown with sortable table, grade curves and color-coded zones
- 📚 **Homework** — Upcoming assignments fetched from the *cahier de textes*
- ✉️ **Messages** — Inbox and sent tabs with full content view
- 🏫 **Attendance** — Absences and justifications
- ⚡ **Instant navigation** — IndexedDB cache with stale-while-revalidate (30 min TTL)
- 🔴 **New content badges** — Tab badges when new notes or messages are detected
- 📶 **Offline mode** — Displays cached data with a banner when the proxy is unreachable
- 🌙 **Dark mode** — Toggleable, preference saved locally
- 🔒 **Secure** — All requests go through a local HTTPS proxy; credentials never leave your machine
- 🔄 **Auto-reload (debug)** — `nodemon` watches for file changes and restarts automatically

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher

---

## Installation

> Run this **once** on first setup.

**1. Clone or download the repository**

```bash
git clone https://github.com/Gabriel-Marchesseau/Mon-EcoleDirecte.git
cd Mon-EcoleDirecte
```

**2. Run the installer**

Double-click **`Installer Mon EcoleDirecte.bat`**, or from a terminal:

```powershell
PowerShell -ExecutionPolicy Bypass -File install.ps1
```

The installer will:
- ✅ Check that all required files are present
- ✅ Verify Node.js is installed (and offer to install it if not)
- ✅ Run `npm install` to install dependencies (`node-forge`, `nodemon`)
- ✅ Generate a self-signed SSL certificate (`cert.pem` / `key.pem`)
- ✅ Display a summary of each step

**3. Trust the certificate (one-time)**

Open **`https://localhost:3131`** in your browser and click *"Advanced → Proceed to localhost"* to accept the self-signed certificate.

---

## Usage

### Normal mode

Double-click **`Lancer Mon EcoleDirecte.bat`**, or:

```powershell
PowerShell -ExecutionPolicy Bypass -File run.ps1
```

This will:
1. Verify that the installation is complete (cert, node_modules)
2. Start the local HTTPS proxy silently in the background (`node proxy.js`)
3. Open `https://localhost:3131` in your default browser

### Debug mode

```powershell
"Lancer Mon EcoleDirecte.bat" --debug
```

Or directly:

```powershell
PowerShell -ExecutionPolicy Bypass -File run.ps1 -debug
```

In debug mode:
- The proxy runs with **nodemon** (auto-restarts on file changes) in a visible terminal
- Colored logs: HTTP method, URL, request body, API response code and body, GTK session status, request duration in ms

### Stopping the proxy

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 3131).OwningProcess -Force
```

Or use the **⏻** button in the app header to stop the proxy and close the tab.

---

## Caching & Offline Mode

The app uses **IndexedDB** (via `cache.js`) to cache API responses locally with a **stale-while-revalidate** strategy:

| Situation | Behavior |
|-----------|----------|
| No cache | Centered spinner → fetch → display |
| Cache < 30 min | Instant display from cache, no network request |
| Cache > 30 min | Instant display from cache + background fetch → silent update if data changed |

**Tab badges** appear when background revalidation detects new content (new notes, new messages, changed attendance).

**A freshness label** ("updated X min ago") is shown next to the tab bar, along with a **↻ refresh button** to force an immediate update and bypass the cache.

**Offline mode**: if the proxy is unreachable during a background revalidation, the cached data remains displayed and a warning banner appears at the top of the page.

**Cache is cleared on logout** to prevent data from persisting between user sessions.

---

## Project Structure

```
mon-ecoledirecte/
├── proxy.js                      # Local HTTPS proxy server (Node.js)
├── ecoledirecte.html             # App HTML structure (includes cache.js inline)
├── app.js                        # All application logic (JS)
├── cache.js                      # IndexedDB cache module (source — inlined in HTML)
├── style.css                     # Styles (light + dark mode)
├── generate-cert.js              # SSL certificate generator
├── package.json                  # Dependencies (node-forge, nodemon)
├── install.ps1                   # Installation script (PowerShell)
├── run.ps1                       # Launch script (PowerShell)
├── Installer Mon EcoleDirecte.bat  # One-click installer
└── Lancer Mon EcoleDirecte.bat     # One-click launcher
```

---

## How It Works

EcoleDirecte's API does not allow direct browser requests from external origins (CORS restrictions). This project works around that by running a local Node.js HTTPS proxy that:

1. Manages the session (GTK token, cookies) on the server side
2. Handles double authentication (security question with base64-encoded answers)
3. Forwards API requests from the browser to `api.ecoledirecte.com`
4. Serves the static files (`ecoledirecte.html`, `app.js`, `style.css`)

---

## Security & Privacy

- Your credentials are sent **directly from your browser to your local proxy**, then forwarded to EcoleDirecte — they never pass through any third-party server.
- The SSL certificate is **self-signed** and generated locally. It is never shared.
- Session data (token, account info) is stored in your browser's `localStorage` only.
- Cached API responses are stored in **IndexedDB** and cleared on logout.

---

## Known Limitations

- Windows only (the launcher scripts are `.bat` / `.ps1`)
- The self-signed certificate requires a one-time browser exception
- The *cahier de textes* and account info endpoints may return 403 on student accounts — this is an EcoleDirecte API restriction

---

## License

MIT — free to use, modify and distribute.

---

## Repository

[https://github.com/Gabriel-Marchesseau/Mon-EcoleDirecte](https://github.com/Gabriel-Marchesseau/Mon-EcoleDirecte)
