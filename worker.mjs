import { env as bindings } from 'cloudflare:workers';
import { httpServerHandler } from 'cloudflare:node';

globalThis.__KCH_RUNTIME__ = bindings;

const { createApp } = await import('./server/app.js');
const app = createApp();
app.listen(8787);
const apiHandler = httpServerHandler({ port: 8787 });

export default {
  async fetch(request, runtime, ctx) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api' || pathname.startsWith('/api/')) {
      return apiHandler.fetch(request, runtime, ctx);
    }

    return runtime.ASSETS.fetch(request);
  }
};
