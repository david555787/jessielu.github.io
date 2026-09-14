import React,{useEffect} from 'react';
import SiteShell from './components/site-shell';
import Home from './app/page';
import About from './app/about/page';
import Experience from './app/experience/page';
import Projects from './app/projects/page';
import Contact from './app/contact/page';
import {useLocation} from './paths';
const pages:Record<string,React.ComponentType>={'/':Home,'/about':About,'/experience':Experience,'/projects':Projects,'/contact':Contact};
export default function App(){
 const location=useLocation();const [route,anchor]=location.split('#');const path=route.replace(/\/$/,'')||'/';const Page=pages[path]||Home;
 useEffect(()=>{document.title=path==='/'?'Jessie Lu — Personal Portfolio':path.slice(1)[0].toUpperCase()+path.slice(2)+' | Jessie Lu';const frame=requestAnimationFrame(()=>{if(anchor){document.getElementById(anchor)?.scrollIntoView()}else{window.scrollTo(0,0)}});return()=>cancelAnimationFrame(frame)},[location]);
 return <SiteShell>{Object.entries(pages).map(([pagePath,View])=><div key={pagePath+String(pagePath===path)} data-page={pagePath} hidden={pagePath!==path}><View/></div>)}</SiteShell>;
}
