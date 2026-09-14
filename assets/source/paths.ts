export const siteUrl=(path:string)=>import.meta.env.BASE_URL.replace(/\/$/,'')+path;
export const usePathname=()=>{const base=import.meta.env.BASE_URL.replace(/\/$/,'');return (window.location.pathname.slice(base.length).replace(/\/$/,'')||'/')};
