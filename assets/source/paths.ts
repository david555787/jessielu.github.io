import {useSyncExternalStore} from 'react';
const base=import.meta.env.BASE_URL;
const routes=new Set(['/','/about','/experience','/projects','/contact']);
export const siteUrl=(path:string)=>routes.has(path.split('#')[0])?base+'#'+path:base.replace(/\/$/,'')+path;
const subscribe=(notify:()=>void)=>{window.addEventListener('hashchange',notify);return()=>window.removeEventListener('hashchange',notify)};
const snapshot=()=>window.location.hash.slice(1)||'/';
export const useLocation=()=>useSyncExternalStore(subscribe,snapshot,()=>'/');
export const usePathname=()=>useLocation().split('#')[0].replace(/\/$/,'')||'/';
