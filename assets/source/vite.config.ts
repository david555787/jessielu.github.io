import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
export default defineConfig({base:process.env.BASE_PATH||'/jessielu.github.io/',plugins:[react()],resolve:{alias:{'@':resolve(__dirname,'.')}},build:{cssCodeSplit:false,rollupOptions:{output:{entryFileNames:'script.js',chunkFileNames:'assets/[name]-[hash].js',assetFileNames:asset=>asset.names?.some(n=>n.endsWith('.css'))?'style.css':'assets/[name]-[hash][extname]'}}}});
