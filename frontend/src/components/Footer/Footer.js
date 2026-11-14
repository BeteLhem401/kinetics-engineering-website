import React from 'react';
import fs from 'fs';
import path from 'path';
import FooterClient from './FooterClient';

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.round(bytes / 1024)} KB`;
}

function getProfilePdfStats() {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'frontend', 'public', 'docs', 'kinetics-company-profile.pdf'),
      path.join(process.cwd(), 'public', 'docs', 'kinetics-company-profile.pdf'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const stats = fs.statSync(p);
        return {
          exists: true,
          size: formatBytes(stats.size),
          href: '/docs/kinetics-company-profile.pdf',
        };
      }
    }
  } catch (err) {
  }

  return { exists: false, size: null, href: null };
}

export default function Footer() {
  const pdfStats = getProfilePdfStats();
  return <FooterClient pdfStats={pdfStats} />;
}

