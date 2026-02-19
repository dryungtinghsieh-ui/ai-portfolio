import Link from 'next/link';
import { researchProjects } from '@/lib/research-data';
import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './project-detail-client';

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const project = researchProjects.find((p) => p.id === params.id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailClient project={project} />;
}

// Generate static params for all projects
export function generateStaticParams() {
  return researchProjects.map((project) => ({
    id: project.id,
  }));
}
