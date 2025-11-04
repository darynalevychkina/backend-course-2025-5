import http from 'http';
import { program } from 'commander';
import { promises as fs } from 'fs';
import path from 'path';

program
  .requiredOption('-h, --host <host>', 'server address')
  .requiredOption('-p, --port <port>', 'server port', v => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0 || n > 65535) throw new Error('Invalid port');
    return n;
  })
  .requiredOption('-c, --cache <dir>', 'path to cache directory')
  .parse(process.argv);

const { host, port, cache } = program.opts();

await fs.mkdir(cache, { recursive: true });

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(`Server is running\nMethod: ${req.method}\nURL: ${req.url}\nCache: ${path.resolve(cache)}\n`);
});

server.listen(port, host, () => {
  console.log(`Listening on http://${host}:${port}`);
  console.log(`Cache dir: ${path.resolve(cache)}`);
});
