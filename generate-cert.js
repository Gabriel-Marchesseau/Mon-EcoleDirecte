/**
 * Génère cert.pem + key.pem dans le dossier courant via node-forge
 * Usage : node generate-cert.js
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

console.log('Génération de la clé RSA (quelques secondes)...');
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter  = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{ name: 'commonName', value: 'localhost' }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([
  { name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }] }
]);
cert.sign(keys.privateKey, forge.md.sha256.create());

fs.writeFileSync('cert.pem', forge.pki.certificateToPem(cert));
fs.writeFileSync('key.pem',  forge.pki.privateKeyToPem(keys.privateKey));

console.log('\n✅ cert.pem et key.pem générés avec succès !');
console.log('Prochaine étape : node proxy.js\n');
