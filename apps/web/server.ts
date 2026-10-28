import { join } from 'node:path';

const DIST_DIR = join(import.meta.dir, 'dist');
const INDEX_FILE = Bun.file(join(DIST_DIR, 'index.html'));

Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const file = Bun.file(join(DIST_DIR, pathname));
    if (pathname !== '/' && (await file.exists())) return new Response(file);
    return new Response(INDEX_FILE);
  },
});
