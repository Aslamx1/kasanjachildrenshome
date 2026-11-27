import { createServer } from 'node:http';
import { env as bindings } from 'cloudflare:workers';
import { handleAsNodeRequest } from 'cloudflare:node';

globalThis.__KCH_RUNTIME__ = bindings;

const { createApp } = await import('./server/app.js');
const app = createApp();
const apiServer = createServer(app);
apiServer.listen(8787);

export default {
  async fetch(request, runtime, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return handleAsNodeRequest(8787, request);
    }

    return runtime.ASSETS.fetch(request);
  }
};
