import {copyFileSync,rmSync,readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root=new URL('./',import.meta.url);
copyFileSync(new URL('index.template',root),new URL('index.html',root));
const run=(args)=>{const result=spawnSync(process.execPath,[new URL('node_modules/vite/bin/vite.js',root).pathname,...args],{stdio:'inherit',env:process.env});if(result.status!==0)throw new Error('Build failed')};
try{
 run(process.argv.slice(2));
 if(process.argv[2]==='build'){
  run(['build','--config','render.config.ts']);
  const {render}=await import(new URL('.render/render.js',root));
  const file=new URL('dist/index.html',root);
  const full=readFileSync(file,'utf8').replace('<div id="root"></div>','<div id="root">'+render()+'</div>');
  // Whitespace before the closing angle bracket is inside the tag: no text or layout changes.
  let depth=0;let readable='';
  const blocks=/^<\/?(?:html|head|body|div|header|nav|main|footer|section|article|aside|h[1-6]|p|ul|li|dl|dt|dd|details|summary)(?:\s|>)/i;
  for(const token of full.match(/<[^>]*>|[^<]+/g)||[]){
   if(blocks.test(token)){
    const closing=token.startsWith('</');if(closing)depth=Math.max(0,depth-1);
    readable+='\n'+'  '.repeat(depth)+token;
    if(!closing)depth++;
   }else{readable+=token;}
  }
  writeFileSync(file,'<!-- Complete page content. Edit source files in assets/source/ and rebuild. -->\n'+readable+'\n');
 }
}finally{rmSync(new URL('index.html',root),{force:true});rmSync(new URL('.render',root),{recursive:true,force:true})}
