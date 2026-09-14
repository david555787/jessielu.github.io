import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {resolve} from 'node:path';
export default defineConfig({base:process.env.BASE_PATH||'/',plugins:[react()],resolve:{alias:{'@':resolve(__dirname,'.')}},build:{rollupOptions:{input:{home:resolve(__dirname,'index.html'),about:resolve(__dirname,'about/index.html'),experience:resolve(__dirname,'experience/index.html'),projects:resolve(__dirname,'projects/index.html'),contact:resolve(__dirname,'contact/index.html')}}}});
