import React from 'react';
import fs from 'fs';
import path from 'path';
import { projectsData } from '@/data/projects';
import ClientsClient from './ClientsClient';

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[&()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getClientsWithLogos() {
  const uniqueNames = Array.from(
    new Set(projectsData.items.map((item) => item.client).filter(Boolean))
  );

  const candidateDirs = [
    path.join(process.cwd(), 'frontend', 'public', 'images', 'clients'),
    path.join(process.cwd(), 'public', 'images', 'clients'),
  ];

  const extensions = ['.svg', '.png'];
  const clientsWithLogos = [];

  for (const name of uniqueNames) {
    const slug = slugify(name);
    let foundLogoSrc = null;

    for (const dir of candidateDirs) {
      if (!fs.existsSync(dir)) continue;

      for (const ext of extensions) {
        const filePath = path.join(dir, `${slug}${ext}`);
        if (fs.existsSync(filePath)) {
          foundLogoSrc = `/images/clients/${slug}${ext}`;
          break;
        }
      }
      if (foundLogoSrc) break;
    }

    if (foundLogoSrc) {
      clientsWithLogos.push({
        name,
        slug,
        logoSrc: foundLogoSrc,
      });
    }
  }

  return clientsWithLogos;
}

export default function Clients() {
  const clients = getClientsWithLogos();

  if (clients.length === 0) {
    return null;
  }

  return <ClientsClient clients={clients} />;
}

