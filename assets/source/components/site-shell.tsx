"use client";
import {Button} from '@/components/ui/button';
import {usePathname,siteUrl} from '../paths';
import {useEffect,useState,createContext,useContext} from 'react';
import {Moon,Sun} from 'lucide-react';
const MotionContext=createContext(false);
export const useQuietMotion=()=>useContext(MotionContext);
export default function SiteShell({children}:{children:React.ReactNode}){
 const path=usePathname();const [dark,setDark]=useState(true);const [quiet,setQuiet]=useState(false);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)');setQuiet(q.matches);const on=()=>setQuiet(q.matches);q.addEventListener('change',on);let saved;try{saved=localStorage.getItem('jessie-theme')}catch{}const isDark=saved==='light'?false:true;setDark(isDark);document.documentElement.dataset.theme=isDark?'dark':'light';return()=>q.removeEventListener('change',on)},[]);
 function toggle(){const next=!dark;setDark(next);document.documentElement.dataset.theme=next?'dark':'light';try{localStorage.setItem('jessie-theme',next?'dark':'light')}catch{}}
 return <MotionContext.Provider value={quiet}><a className="skip" href={siteUrl(path)+"#main"}>Skip to content</a><div className="shell"><header className="header"><>{path==='/'?<span aria-hidden="true"/>:<a className="logo" href={siteUrl("/")} aria-label="Jessie Lu home">jessie lu<span>.</span></a>}</><div className="header-right"><nav aria-label="Main navigation">{[['/','Home'],['/about','About'],['/experience','Experience'],['/projects','Projects'],['/contact','Contact']].map(([href,label])=><a key={href} href={siteUrl(href)} aria-current={path===href?'page':undefined}>{label}</a>)}</nav><Button variant="ghost" size="icon" className="theme-button" onClick={toggle} aria-label={dark?'Switch to light mode':'Switch to dark mode'}>{dark?<Sun size={19}/>:<Moon size={19}/>}</Button></div></header></div><main id="main" key={path}>{children}</main><footer className="footer shell"><span>© {new Date().getFullYear()} Jessie Lu</span><span>Pittsburgh, PA · Carnegie Mellon University</span><a href={siteUrl("/contact")}>Let’s connect ↗</a></footer></MotionContext.Provider>
}
