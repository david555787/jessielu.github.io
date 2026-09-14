import {Heading,ProjectCard} from '@/components/portfolio';
export const metadata={title:'Projects & Research'};
export default function Projects(){return <div className="shell reveal"><Heading index="03" title="Ideas into practice." description="A selection of research and programming explorations, from temporal patterns to probabilistic systems."/><div className="project-list"><ProjectCard kind="research"/><ProjectCard kind="code"/></div></div>}
