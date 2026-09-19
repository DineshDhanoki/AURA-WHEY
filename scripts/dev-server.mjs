import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const root = path.resolve(process.cwd());
const port = Number(process.argv[2] || 4173);
const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

function sendFile(response, file, method) {
  response.writeHead(200, { 'Content-Type': mimeTypes[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  if (method === 'HEAD') return response.end();
  createReadStream(file).pipe(response);
}

function sendError(response, status) {
  response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(status === 404 ? 'Not found' : 'Method not allowed');
}

createServer(async (request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) return sendError(response, 405);

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    return sendError(response, 404);
  }

  const requestedFile = path.resolve(root, `.${pathname}`);
  if (requestedFile !== root && !requestedFile.startsWith(`${root}${path.sep}`)) return sendError(response, 404);

  try {
    const info = await stat(requestedFile);
    if (info.isFile()) return sendFile(response, requestedFile, request.method);
  } catch { /* Extensionless paths may be client-side routes. */ }

  if (!path.extname(pathname)) return sendFile(response, path.join(root, 'index.html'), request.method);
  return sendError(response, 404);
}).listen(port, () => console.log(`Aura Whey preview running at http://localhost:${port}`));
