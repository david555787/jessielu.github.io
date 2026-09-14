import {copyFileSync,rmSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
copyFileSync(new URL('./index.template',import.meta.url),new URL('./index.html',import.meta.url));
try{const cli=new URL('./node_modules/vite/bin/vite.js',import.meta.url);const result=spawnSync(process.execPath,[cli.pathname,...process.argv.slice(2)],{stdio:'inherit',env:process.env});process.exitCode=result.status??1}finally{rmSync(new URL('./index.html',import.meta.url),{force:true})}
