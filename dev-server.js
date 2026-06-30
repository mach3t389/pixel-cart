// Serveur de dev statique — zéro dépendance. Sert le jeu sur http://localhost:8080
// Usage : npm run dev   (ou : node dev-server.js)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8080;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Endpoint de dev : écrit un PNG envoyé par le navigateur dans icons/<name>.png
  // (sert à générer les icônes emoji pré-rasterisées sans corruption).
  if (req.method === 'POST' && req.url.split('?')[0] === '/save-icon') {
    var qs = require('url').parse(req.url, true).query;
    var name = String(qs.name || '').replace(/[^a-z0-9_-]/gi, '');
    if (!name) { res.writeHead(400); res.end('bad name'); return; }
    var chunks = [];
    req.on('data', function (c) { chunks.push(c); });
    req.on('end', function () {
      try {
        fs.mkdirSync(path.join(ROOT, 'icons'), { recursive: true });
        fs.writeFileSync(path.join(ROOT, 'icons', name + '.png'), Buffer.concat(chunks));
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('saved ' + name + ' (' + Buffer.concat(chunks).length + ' bytes)');
      } catch (e) {
        res.writeHead(500); res.end(String(e));
      }
    });
    return;
  }

  // Retire la query string et décode (les SFX ont des espaces/parenthèses)
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  // Empêche de remonter au-dessus de ROOT
  const filePath = path.normalize(path.join(ROOT, urlPath));
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 — introuvable : ' + urlPath);
      return;
    }
    const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  PUNJABI SPEED — serveur de dev');
  console.log('  ▶  http://localhost:' + PORT + '/');
  console.log('  (Ctrl+C pour arreter)');
  console.log('');
});
