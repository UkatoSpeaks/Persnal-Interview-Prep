/// <reference types="node" />
import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // No VITE_ prefix, so Vite never exposes the key to client code. It only
  // exists here, in the Node process that runs the dev or preview server.
  const apiKey = (loadEnv(mode, process.cwd(), '').GROQ_API_KEY ?? '').trim()

  // The browser calls /api/groq/* on its own origin; the server forwards the
  // request to Groq and adds the key. Without a key the request goes through
  // unauthenticated and Groq answers 401, which Settings reports.
  const proxy: Record<string, ProxyOptions> = {
    '/api/groq': {
      target: 'https://api.groq.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api\/groq/, ''),
      headers: { Authorization: `Bearer ${apiKey}` },
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  }
})
