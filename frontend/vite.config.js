import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: "/", // Ensure correct base path for Vercel
  build: {
    outDir: "dist", // Ensure Vercel picks the right folder
    target: "esnext",
  },
  server: mode === "development" ? {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    },
    host: '0.0.0.0', // Allow access from any network
    port: 5173,
  } : undefined, // Remove server config in production
}))
