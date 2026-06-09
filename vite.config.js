import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'
import path from 'node:path'

function faviconIcoFallback() {
  return {
    name: 'favicon-ico-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url !== '/favicon.ico') return next()
        const svgPath = path.resolve('public/favicon.svg')
        if (!fs.existsSync(svgPath)) return next()
        res.setHeader('Content-Type', 'image/svg+xml')
        fs.createReadStream(svgPath).pipe(res)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), faviconIcoFallback()],
})


