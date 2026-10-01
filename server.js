// Class Connect — local server. Serves the pages + a PeerJS signaling server over HTTPS (needed for screen sharing).
const fs = require('fs'), path = require('path'), os = require('os'), https = require('https');
const express = require('express'), { ExpressPeerServer } = require('peer'), selfsigned = require('selfsigned');
const PORT = +process.env.PORT || 8443;
const ips = Object.values(os.networkInterfaces()).flat().filter(i => i && i.family === 'IPv4' && !i.internal).map(i => i.address);
const dir = path.join(__dirname, 'cert'), kf = path.join(dir, 'key.pem'), cf = path.join(dir, 'cert.pem'), mf = path.join(dir, 'ips.json');
let key, cert;
const same = () => { try { return JSON.stringify(JSON.parse(fs.readFileSync(mf, 'utf8'))) === JSON.stringify(ips) } catch (e) { return false } };
if (fs.existsSync(kf) && fs.existsSync(cf) && same()) { key = fs.readFileSync(kf); cert = fs.readFileSync(cf) }
else {
  const p = selfsigned.generate([{ name: 'commonName', value: 'class-connect.local' }], {
    days: 825, keySize: 2048, algorithm: 'sha256',
    extensions: [{ name: 'subjectAltName', altNames: [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, ...ips.map(ip => ({ type: 7, ip }))] }]
  });
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(kf, p.private); fs.writeFileSync(cf, p.cert); fs.writeFileSync(mf, JSON.stringify(ips));
  key = p.private; cert = p.cert;
}
const app = express();
app.get('/peerjs.min.js', (q, r) => r.sendFile(path.join(__dirname, 'node_modules', 'peerjs', 'dist', 'peerjs.min.js')));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));
const server = https.createServer({ key, cert }, app);
app.use('/peerjs', ExpressPeerServer(server, { allow_discovery: false }));
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n  Class Connect is running (local network only)\n');
  (ips.length ? ips : ['localhost']).forEach(ip => {
    console.log(`  Students : https://${ip}:${PORT}/`);
    console.log(`  Teachers : https://${ip}:${PORT}/teacher.html`);
    console.log(`  Admin    : https://${ip}:${PORT}/admin.html\n`);
  });
  console.log('  Each device must accept the one-time certificate warning (Advanced → Proceed).\n');
});
