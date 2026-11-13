import React from 'react';
import fs from 'fs';
import path from 'path';
import { projectsData } from '@/data/projects';
import ProjectsClient from './ProjectsClient';

export default function Projects({ initialAtStart = false }) {
  const featuredItems = projectsData.items.filter((item) => item.featured);

  const processedProjects = featuredItems.map((item, index) => {
    const primaryPath = path.join(process.cwd(), 'public', 'images', 'projects', `${item.slug}.webp`);
    const fallbackPath = path.join(process.cwd(), 'frontend', 'public', 'images', 'projects', `${item.slug}.webp`);

    const fileExists = fs.existsSync(primaryPath) || fs.existsSync(fallbackPath);

    return {
      ...item,
      projectIndex: String(index + 1).padStart(2, '0'),
      photoSrc: fileExists ? `/images/projects/${item.slug}.webp` : null,
      isPlaceholder: !fileExists,
    };
  });

  return (
    <ProjectsClient
      projects={processedProjects}
      eyebrow={projectsData.eyebrow}
      heading={projectsData.heading}
      initialAtStart={initialAtStart}
    />
  );
}
