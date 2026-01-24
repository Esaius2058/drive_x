import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // This generates a manifest file which helps some deployment 
    // platforms track asset versions better
    manifest: true, 
  },
  // No need for historyApiFallback here; Vite does this by default!
})