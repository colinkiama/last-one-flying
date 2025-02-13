/* MIT License

Copyright (c) 2023 Lumynous 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. 

Source: https://github.com/lumynou5/live

*/

import { watch } from 'node:fs';

const options = {};
for (let i = 2; i < Bun.argv.length; i++) {
  switch (Bun.argv[i]) {
    // biome-ignore lint/suspicious/noFallthroughSwitchClause: process.exit() call will terminate the program before a case-fullthrough can occur
    case '--help':
      console.write(`
Usage: bun run . [--port PORT] [--help]

Options:
  -p, --port PORT  Specify the port to use. (Default: 8000)
  --help           Print help text and exit.
`);
      process.exit();
    case '-p':
    case '--port':
      if (options.port) {
        console.error('Repeated port options.');
        process.exit(1);
      }
      options.port = Number.parseInt(Bun.argv[++i], 10);
      if (Number.isNaN(options.port)) {
        console.error('Bad port option.');
        process.exit(1);
      }
      break;
    default:
      console.error('Unrecognized argument(s).');
      process.exit(1);
  }
}
options.port ??= 8000;

const injection = await Bun.file(`${import.meta.dir}/injection.html`).text();

let clients = [];
const watcher = watch('.', { recursive: true });

watcher.on('change', (event, filename) => {
  const file = Bun.file(filename.toString());
  if (file.type.includes('text/css')) {
    for (const client of clients) {
      client.send('refreshCss');
    }
  } else {
    for (const client of clients) {
      client.send('reload');
    }
  }
});

const server = Bun.serve({
  port: options.port,
  async fetch(req, server) {
    if (req.url.endsWith('ws')) {
      if (server.upgrade(req)) return;
      return new Response('Failed to upgrade.', { status: 500 });
    }

    let pathname = new URL(req.url).pathname;
    // URLs with no set pathname will serve /index.html by default
    if (pathname === '/') {
      pathname = '/index.html';
    }

    const filePath = `.${pathname}`;
    const file = Bun.file(filePath);
    if (await file.exists()) {
      let content = await file.bytes();
      if (file.type.includes('text/html')) {
        const textDecoder = new TextDecoder();
        content = textDecoder.decode(content);
        const idx = content.search(/<\/body>/i);
        content = ''.concat(
          content.slice(0, idx),
          injection,
          content.slice(idx),
        );
      }
      return new Response(content, { headers: { 'Content-Type': file.type } });
    }

    return new Response('No such file or directory.', { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.push(ws);
      console.log(`Connected with ${ws.remoteAddress}`);
    },
    close(ws, code, reason) {
      clients = clients.filter((x) => x !== ws);
      console.log(`Disconnected with ${ws.remoteAddress}`);
    },
    message(ws, message) {},
  },
});

console.log(
  `Your directory is now living on http://localhost:${options.port}. Press Q to stop the server.`,
);

process.stdin.setRawMode(true);
process.stdin.on('data', (ch) => {
  if (ch.toString() === 'q') {
    server.stop();
    process.exit();
  }
});
