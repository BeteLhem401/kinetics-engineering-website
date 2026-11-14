import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { projectsData } from '@/data/projects';
import Footer from '@/components/Footer/Footer';
import styles from './ProjectDetail.module.css';

export function generateStaticParams() {
  return projectsData.items.map((item) => ({
    slug: item.slug,
  }));
}

export function generateMetadata({ params }) {
  const project = projectsData.items.find((item) => item.slug === params.slug);
  if (!project) {
    return { title: 'Project Not Found | KINETICS Engineering PLC' };
  }
  return {
    title: `${project.title} | KINETICS Engineering PLC`,
  };
}

export default function ProjectDetailPage({ params }) {
  const index = projectsData.items.findIndex((item) => item.slug === params.slug);
  if (index === -1) {
    notFound();
  }

  const project = projectsData.items[index];
  const prevProject = index > 0 ? projectsData.items[index - 1] : null;
  const nextProject = index < projectsData.items.length - 1 ? projectsData.items[index + 1] : null;
  const projectNum = String(index + 1).padStart(2, '0');

  return (
    <>
      <main className={styles.pageContainer}>
        <div className={styles.innerContent}>
        <div className={styles.backLinkWrap}>
          <Link href="/projects" className={styles.backLink}>
            ← All projects
          </Link>
        </div>

        <h1 className={styles.title}>{project.title}</h1>

        {project.detail && <p className={styles.detailLine}>{project.detail}</p>}

        <div className={styles.factsGrid}>
          <div className={styles.factCard}>
            <span className={styles.factLabel}>Client</span>
            <span className={styles.factValue}>{project.client}</span>
          </div>
          <div className={styles.factCard}>
            <span className={styles.factLabel}>Location</span>
            <span className={styles.factValue}>{project.location}</span>
          </div>
          <div className={styles.factCard}>
            <span className={styles.factLabel}>Scope of work</span>
            <span className={styles.factValue}>{project.scope}</span>
          </div>
          <div className={styles.factCard}>
            <span className={styles.factLabel}>Status</span>
            <span className={styles.factValue}>{project.status}</span>
          </div>
        </div>

        <div className={styles.mediaContainer}>
          {project.image ? (
            <img
              src={project.image}
              alt={project.title}
              className={styles.projectImage}
            />
          ) : (
            <div className={styles.placeholder}>
              <div className={styles.gridPattern} aria-hidden="true" />
              <span className={styles.bgNumber} aria-hidden="true">
                {projectNum}
              </span>
              <div className={styles.placeholderLabel}>
                <span>Project {projectNum}</span>
                <span className={styles.placeholderSub}>Photo documentation in progress</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.ctaRow}>
          <Link href="/contact" className={styles.ctaButton}>
            Start your project
          </Link>
        </div>

        <div className={styles.paginationNav}>
          <div className={styles.paginationPrev}>
            {prevProject && (
              <Link href={`/projects/${prevProject.slug}`} className={styles.paginationLink}>
                <span className={styles.paginationArrow}>←</span>
                <div className={styles.paginationText}>
                  <span className={styles.paginationSub}>Previous Project</span>
                  <span className={styles.paginationTitle}>{prevProject.title}</span>
                </div>
              </Link>
            )}
          </div>
          <div className={styles.paginationNext}>
            {nextProject && (
              <Link href={`/projects/${nextProject.slug}`} className={styles.paginationLink}>
                <div className={styles.paginationText}>
                  <span className={styles.paginationSub}>Next Project</span>
                  <span className={styles.paginationTitle}>{nextProject.title}</span>
                </div>
                <span className={styles.paginationArrow}>→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </>
  );
}

