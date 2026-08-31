// Servidor local para probar la página y la API antes de desplegar.
//   node dev-server.js   ->   http://localhost:4000
// En Vercel esto no se usa: allí index.html se sirve como estático y
// api/revision.js se convierte en una función serverless.
const http = require('http');
const fs = require('fs');
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (e) {
  console.warn('Aviso: no se pudo cargar .env (' + e.message + '). La API fallará sin MONGODB_URI.');
}

const revision = require('./api/revision');
const PORT = process.env.PORT || 4000;

const TIPOS = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/revision') {
    let raw = '';
    req.on('data', (c) => { raw += c; });
    req.on('end', () => {
      let body = {};
      if (raw) { try { body = JSON.parse(raw); } catch (e) {} }
      req.query = Object.fromEntries(url.searchParams.entries());
      req.body = body;
      res.status = (c) => { res.statusCode = c; return res; };
      res.json = (o) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(o));
      };
      revision(req, res);
    });
    return;
  }

  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const fp = path.join(__dirname, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''));
  fs.readFile(fp, (err, data) => {
    if (err) { res.statusCode = 404; res.end('No encontrado'); return; }
    res.setHeader('Content-Type', (TIPOS[path.extname(fp)] || 'text/plain') + '; charset=utf-8');
    res.end(data);
  });
});

server.listen(PORT, () => console.log('Local en http://localhost:' + PORT));
