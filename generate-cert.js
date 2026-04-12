/**
 * Génère une CA locale + cert.pem / key.pem signés par cette CA.
 * Usage : node generate-cert.js
 *
 * Fichiers produits :
 *   ca.pem   — certificat CA à installer dans le magasin de confiance Windows
 *   ca-key.pem — clé privée de la CA (ne pas distribuer)
 *   cert.pem — certificat serveur (signé par la CA)
 *   key.pem  — clé privée serveur
 */

const { execSync, spawnSync } = require('child_process');
const fs   = require('fs');
const path = require('path');

const forgeDir = path.join(__dirname, 'node_modules', 'node-forge');
if (!fs.existsSync(forgeDir)) {
  console.log('Installation de node-forge...');
  execSync('npm install node-forge', { stdio: 'inherit', cwd: __dirname });
  console.log('Relance du script...\n');
  const result = spawnSync(process.execPath, [__filename], { stdio: 'inherit', cwd: __dirname });
  process.exit(result.status ?? 0);
}

const forge = require('node-forge');

// ── 1. Générer la clé de la CA ────────────────────────────────────────────
console.log('Génération de la CA locale (quelques secondes)...');
const caKeys = forge.pki.rsa.generateKeyPair(2048);
const caCert = forge.pki.createCertificate();

caCert.publicKey = caKeys.publicKey;
caCert.serialNumber = '01';
caCert.validity.notBefore = new Date();
caCert.validity.notAfter  = new Date();
caCert.validity.notAfter.setFullYear(caCert.validity.notBefore.getFullYear() + 10);

const caAttrs = [
  { name: 'commonName',         value: 'Mon EcoleDirecte Local CA' },
  { name: 'organizationName',   value: 'Mon EcoleDirecte'          },
  { name: 'countryName',        value: 'FR'                        },
];
caCert.setSubject(caAttrs);
caCert.setIssuer(caAttrs);
caCert.setExtensions([
  { name: 'basicConstraints', cA: true },
  { name: 'keyUsage', keyCertSign: true, cRLSign: true },
  { name: 'subjectKeyIdentifier' },
]);
caCert.sign(caKeys.privateKey, forge.md.sha256.create());

// ── 2. Générer la clé du serveur ──────────────────────────────────────────
console.log('Génération du certificat serveur...');
const serverKeys = forge.pki.rsa.generateKeyPair(2048);
const serverCert = forge.pki.createCertificate();

serverCert.publicKey = serverKeys.publicKey;
serverCert.serialNumber = '02';
serverCert.validity.notBefore = new Date();
serverCert.validity.notAfter  = new Date();
serverCert.validity.notAfter.setFullYear(serverCert.validity.notBefore.getFullYear() + 2);

const serverAttrs = [
  { name: 'commonName',       value: 'monecoledirecte.local' },
  { name: 'organizationName', value: 'Mon EcoleDirecte'      },
  { name: 'countryName',      value: 'FR'                    },
];
serverCert.setSubject(serverAttrs);
serverCert.setIssuer(caAttrs);   // signé par la CA
serverCert.setExtensions([
  { name: 'basicConstraints', cA: false },
  { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
  { name: 'extKeyUsage', serverAuth: true },
  { name: 'subjectAltName', altNames: [
    { type: 2, value: 'localhost'              },
    { type: 2, value: 'monecoledirecte.local'  },
    { type: 7, ip: '127.0.0.1'                },
  ]},
  { name: 'subjectKeyIdentifier' },
]);
serverCert.sign(caKeys.privateKey, forge.md.sha256.create());

// ── 3. Écrire les fichiers ────────────────────────────────────────────────
fs.writeFileSync('ca.pem',      forge.pki.certificateToPem(caCert));
fs.writeFileSync('ca-key.pem',  forge.pki.privateKeyToPem(caKeys.privateKey));
fs.writeFileSync('cert.pem',    forge.pki.certificateToPem(serverCert));
fs.writeFileSync('key.pem',     forge.pki.privateKeyToPem(serverKeys.privateKey));

console.log('\n✅ Fichiers générés :');
console.log('   ca.pem      — certificat CA à installer dans Windows');
console.log('   ca-key.pem  — clé privée CA (garder confidentiel)');
console.log('   cert.pem    — certificat serveur');
console.log('   key.pem     — clé privée serveur');
console.log('\nPour supprimer l\'avertissement navigateur :');
console.log('   Exécutez install.ps1 en Administrateur (installe ca.pem dans Windows)\n');
