import type { Metadata } from 'next';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const normalizedId = normalizeProjectId(id);
  const project = researchProjects.find(
    (item) => normalizeProjectId(item.id) === normalizedId
  );

  if (!project) {
    return {
      title: 'Project Not Found',
      description: 'The requested project page does not exist.',
    };
  }

  return {
    title: project.title,
    description: project.shortDescription,
    openGraph: {
      title: `${project.title} | Dr. Yung-Ting Hsieh`,
      description: project.shortDescription,
      url: `/research/${project.id}`,
      type: 'article',
      images: project.image ? [{ url: project.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Dr. Yung-Ting Hsieh`,
      description: project.shortDescription,
      images: project.image ? [project.image] : undefined,
    },
  };
}

// Generate static params for all projects
export function generateStaticParams() {
  return researchProjects.map((project) => ({
    id: project.id,
  }));
}
