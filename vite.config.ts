import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

const devApi = (): Plugin => ({
  name: 'dev-api',
  configureServer(server) {
    process.env = { ...loadEnv('development', process.cwd(), ''), ...process.env }
    server.middlewares.use(async (req, res, next) => {
      const m = req.url?.match(/^\/api\/(submit|admin)(\?|$)/)
      if (!m) return next()
      const mod = await server.ssrLoadModule(`/api/${m[1]}.ts`)
      mod.default(req, res)
    })
  },
})

export default defineConfig({
  plugins: [react(), devApi()],
})
