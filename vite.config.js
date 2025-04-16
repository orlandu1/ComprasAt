import {
  defineConfig
} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/db': {
        target: 'http://localhost/db/',
        // target: 'https://srvsave320.br-atacadao.corp/recanto/Brsacolas/db/',
        changeOrigin: true,
        secure: false,
        ws: true,
        rewrite: (path) => path.replace(/^\/db/, ''),
      },
    },
  },
})

