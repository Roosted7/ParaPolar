import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

/**
 * Serves the pre-rendered /learn pages on the dev server (in production
 * they are written into dist/ by scripts/build-learn.mjs).
 */
function learnPagesDev() {
  return {
    name: 'learn-pages-dev',
    async configureServer(server) {
      const { renderLearnRoutes } = await import('./scripts/learnTemplates.mjs')
      const routes = renderLearnRoutes()
      server.middlewares.use((req, res, next) => {
        let p = (req.url || '').split('?')[0].replace(/index\.html$/, '')
        if (!p.endsWith('/')) p += '/'
        const html = routes.get(p)
        if (html) {
          res.setHeader('content-type', 'text/html; charset=utf-8')
          res.end(html)
          return
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), learnPagesDev()],
  server: {
    port: 5173,
  },
})
