import Link from 'next/link';
import { researchProjects } from '@/lib/research-data';
import { notFound } from 'next/navigation';
import { ProjectDetailClient } from './project-detail-client';

function normalizeProjectId(id: string): string {
  try {
    return decodeURIComponent(id).trim().toLowerCase();
  } catch {
    return id.trim().toLowerCase();
  }
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const normalizedId = normalizeProjectId(id);
  const project = researchProjects.find(
    (p) => normalizeProjectId(p.id) === normalizedId
  );

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
