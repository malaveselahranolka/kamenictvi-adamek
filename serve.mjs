import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { Readable } from 'node:stream';
import { GET, POST } from './api/contact.mjs';

const root = resolve(import.meta.dirname);
const port = Number(process.env.PORT || 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.glb': 'model/gltf-binary', '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml' };

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname === '/api/contact') {
      const request = new Request(url, { method: req.method, headers: req.headers,
        ...(req.method === 'POST' ? { body: Readable.toWeb(req), duplex: 'half' } : {}) });
      const response = req.method === 'GET' ? GET(request) : req.method === 'POST' ? await POST(request) : new Response('', { status: 405 });
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.split('/').some((part) => part.startsWith('.')) || /^\/(api|tests|memory|docs)\//.test(pathname)) {
      res.writeHead(404).end(); return;
    }
    let file = resolve(root, '.' + pathname);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { res.writeHead(301, { Location: pathname + '/' + url.search }).end(); return; }
      file = resolve(file, 'index.html');
    }
    if (!mime[extname(file).toLowerCase()]) { res.writeHead(404).end(); return; }
    const content = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file).toLowerCase()], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch (error) {
    res.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  }
}).listen(port, '127.0.0.1', () => console.log(`Náhled: http://127.0.0.1:${port}/konfigurator/`));
