import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { readFile, readFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const require = createRequire(import.meta.url);
const ws = require('ws');
const httpServer = createServer((req, res) => {
  let path = join(process.cwd(), req.url === '/' ? 'index.html' : req.url);
  readFile(path, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const mime = { '.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml' }[extname(path)] || 'text/plain';
    res.setHeader('Content-Type', mime);
    if (mime === 'text/html') {
      data = data.toString().replace('</body>', `<script>new WebSocket('ws://'+location.host).onmessage=()=>location.reload()</script></body>`);
    }
    res.end(data);
  });
});

const wss = new ws.Server({ server: httpServer });
httpServer.listen(0, () => {
  const addr = httpServer.address();
  const url = `http://localhost:${addr.port}`;
  console.log('\n✅ 实时预览已启动：', url);
  console.log('✅ 修改代码后会自动刷新！\n');
  require('child_process').start(url, { shell: true });
});