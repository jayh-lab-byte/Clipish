import { defineConfig, loadEnv } from 'vite';
import { handleApi } from './server/http.js';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'YOUTUBE_');
  const api = development => (req, res, next) => {
    if (!req.url?.startsWith('/api/')) return next();
    return handleApi(req, res, { apiKey: env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY, development });
  };
  return { plugins: [{ name: 'cliplish-server-api', configureServer(server) { server.middlewares.use(api(mode === 'development')); }, configurePreviewServer(server) { server.middlewares.use(api(false)); } }] };
});
