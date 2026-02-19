import Link from 'next/link';
import { researchProjects } from '@/lib/research-data';
import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './project-detail-client';

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = researchProjects.find((p) => p.id === id);

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
