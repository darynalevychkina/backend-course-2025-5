import http from 'http';
import { program } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';

program
  .requiredOption('-h, --host <host>', 'server address')
  .requiredOption('-p, --port <port>', 'server port (e.g., 3000)', v => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0 || n > 65535) throw new Error('Invalid port');
    return n;
  })
  .requiredOption('-c, --cache <dir>', 'path to cache directory')
  .parse(process.argv);

const { host, port, cache } = program.opts();
await fs.mkdir(cache, { recursive: true });

const isHttpStatusCode = (s) => /^\d{3}$/.test(s);
const fileForCode = (code) => path.resolve(cache, `${code}.jpg`);

const sendText = (res, code, msg) => {
  res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(msg);
};
const sendImage = (res, buf) => {
  res.writeHead(200, { 'Content-Type': 'image/jpeg' });
  res.end(buf);
};
const readBody = async (req) => {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  return Buffer.concat(chunks);
};

const server = http.createServer(async (req, res) => {
  try {
    const code = req.url.replace(/^\/+/, '');
    if (!isHttpStatusCode(code)) return sendText(res, 404, 'Not Found');

    if (req.method === 'GET') {
      try {
        const img = await fs.readFile(fileForCode(code));
        return sendImage(res, img);
      } catch {
        return sendText(res, 404, 'Not Found');
      }
    }

    if (req.method === 'PUT') {
      const body = await readBody(req);
      if (!body || body.length === 0) return sendText(res, 400, 'Empty body');
      await fs.writeFile(fileForCode(code), body);
      return sendText(res, 201, 'Created');
    }

    res.setHeader('Allow', 'GET, PUT, DELETE');
    return sendText(res, 405, 'Method Not Allowed');
  } catch {
    return sendText(res, 500, 'Internal Server Error');
  }
});

server.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
  console.log(`Cache dir: ${path.resolve(cache)}`);
});
