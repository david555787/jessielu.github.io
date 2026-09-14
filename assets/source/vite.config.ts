import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
const base = process.env.BASE_PATH || './';
export default defineConfig({
  base,
  plugins:[react()],
  server:{host:'0.0.0.0', port:5173},
  preview:{host:'0.0.0.0', port:4173},
  resolve:{alias:{'@':resolve(__dirname,'.')}},
  build:{
    cssCodeSplit:false,
    rollupOptions:{
      output:{
        entryFileNames:'script.js',
        chunkFileNames:'assets/[name]-[hash].js',
        assetFileNames:asset=>asset.names?.some(n=>n.endsWith('.css'))?'style.css':'assets/[name]-[hash][extname]'
      }
    }
  }
});
