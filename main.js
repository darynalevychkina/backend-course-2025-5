import { program } from 'commander';

program
  .requiredOption('-h, --host <host>', 'server address')
  .requiredOption('-p, --port <port>', 'server port (e.g., 3000)', v => {
    const n = Number(v);
    if (!Number.isInteger(n) || n <= 0 || n > 65535) throw new Error('Invalid port');
    return n;
  })
  .requiredOption('-c, --cache <dir>', 'path to cache directory')
  .parse(process.argv);

const opts = program.opts();
console.log('CLI options:', opts);
