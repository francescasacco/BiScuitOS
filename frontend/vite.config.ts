import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function versionPlugin() {
  return {
    name: 'version-json',
    buildStart() {
      const version = Date.now().toString()
      fs.writeFileSync(
        path.resolve(__dirname, 'public/version.json'),
        JSON.stringify({ version })
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), versionPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
