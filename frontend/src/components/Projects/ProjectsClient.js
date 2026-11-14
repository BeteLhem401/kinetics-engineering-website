'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from './Projects.module.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function getSlotGeometry(diff, isMobile) {
  if (isMobile) {
    if (diff === 0) {
      return {
        x: 0,
        width: 'min(82vw, 340px)',
        height: 'clamp(260px, 52vh, 480px)',
        borderRadius: '24px',
        opacity: 1,
        zIndex: 10,
        pointerEvents: 'auto',
        isCenter: true,
        isHidden: false,
      };
    }
    if (diff === -1) {
      return {
        x: -176,
        width: '42px',
        height: '210px',
        borderRadius: '16px',
        opacity: 0.5,
        zIndex: 5,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    }
    if (diff === 1) {
      return {
        x: 176,
        width: '42px',
        height: '210px',
        borderRadius: '16px',
        opacity: 0.5,
        zIndex: 5,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    }
    return {
      x: diff < 0 ? -260 : 260,
      width: '32px',
      height: '140px',
      borderRadius: '12px',
      opacity: 0,
      zIndex: 1,
      pointerEvents: 'none',
      isCenter: false,
      isHidden: true,
    };
  }

  switch (diff) {
    case 0:
      return {
        x: 0,
        width: '440px',
        height: 'clamp(260px, 52vh, 480px)',
        borderRadius: '28px',
        opacity: 1,
        zIndex: 10,
        pointerEvents: 'auto',
        isCenter: true,
        isHidden: false,
      };
    case -1:
      return {
        x: -286,
        width: '84px',
        height: '220px',
        borderRadius: '24px',
        opacity: 0.9,
        zIndex: 6,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    case 1:
      return {
        x: 286,
        width: '84px',
        height: '220px',
        borderRadius: '24px',
        opacity: 0.9,
        zIndex: 6,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    case -2:
      return {
        x: -382,
        width: '60px',
        height: '150px',
        borderRadius: '18px',
        opacity: 0.65,
        zIndex: 3,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    case 2:
      return {
        x: 382,
        width: '60px',
        height: '150px',
        borderRadius: '18px',
        opacity: 0.65,
        zIndex: 3,
        pointerEvents: 'auto',
        isCenter: false,
        isHidden: false,
      };
    default:
      return {
        x: diff < 0 ? -460 : 460,
        width: '40px',
        height: '100px',
        borderRadius: '14px',
        opacity: 0,
        zIndex: 1,
        pointerEvents: 'none',
        isCenter: false,
        isHidden: true,
      };
  }
}

export default function ProjectsClient({
  projects = [],
  eyebrow = 'SELECTED PROJECTS',
  heading = 'Projects across Ethiopia',
  initialAtStart = false,
}) {
  const sectionRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const dragStartXRef = useRef(null);
  const dragStartYRef = useRef(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handleMotionChange = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      mq.removeEventListener('change', handleMotionChange);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (initialAtStart) {
      if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const scrollToProjects = () => {
        if (sectionRef.current) {
          const top = sectionRef.current.offsetTop;
          window.scrollTo({ top, behavior: 'instant' });
        }
      };
      scrollToProjects();
      requestAnimationFrame(scrollToProjects);
      setTimeout(scrollToProjects, 50);
      setTimeout(scrollToProjects, 150);
    }
  }, [initialAtStart]);

  const isProjectsActiveRef = useRef(false);
  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const vh = window.innerHeight;
      const isInSection = rect.top <= vh * 0.4 && rect.bottom >= vh * 0.4;

      if (isInSection && !isProjectsActiveRef.current) {
        isProjectsActiveRef.current = true;
        if (typeof window !== 'undefined' && window.location.pathname !== '/projects') {
          const search = window.location.search || '';
          window.history.replaceState(null, '', '/projects' + search);
          window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/projects' }));
          window.dispatchEvent(new Event('popstate'));
        }
      } else if (!isInSection && isProjectsActiveRef.current) {
        isProjectsActiveRef.current = false;
        if (rect.top > vh * 0.4) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/services') {
            const search = window.location.search || '';
            window.history.replaceState(null, '', '/services' + search);
            window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/services' }));
            window.dispatchEvent(new Event('popstate'));
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const total = projects.length;

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToIndex = useCallback((idx) => {
    setCurrentIndex(idx);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      goToPrev();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  };

  const handlePointerDown = (e) => {
    dragStartXRef.current = e.clientX;
    dragStartYRef.current = e.clientY;
    isDraggingRef.current = true;
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current || dragStartXRef.current === null) return;
    const deltaX = e.clientX - dragStartXRef.current;
    const deltaY = e.clientY - (dragStartYRef.current || 0);

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    isDraggingRef.current = false;
    dragStartXRef.current = null;
    dragStartYRef.current = null;
  };

  const handlePointerCancel = () => {
    isDraggingRef.current = false;
    dragStartXRef.current = null;
    dragStartYRef.current = null;
  };

  const activeProject = projects[currentIndex] || {};
  const counterText = `${String(currentIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;

  return (
    <section
      id="projects"
      ref={sectionRef}
      className={styles.projectsSection}
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected Projects"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className={styles.srOnly} aria-live="polite" aria-atomic="true">
        {`Project ${currentIndex + 1} of ${total}: ${activeProject.title || ''}`}
      </div>

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.eyebrow}>{eyebrow}</span>
          <h2 className={styles.heading}>{heading}</h2>
        </div>

        <div
          className={styles.carouselStage}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {projects.map((project, i) => {
            let diff = (i - currentIndex) % total;
            if (diff > total / 2) diff -= total;
            if (diff < -total / 2) diff += total;

            const slot = getSlotGeometry(diff, isMobile);
            const isCenter = slot.isCenter;
            const projectNum = project.projectIndex || String(i + 1).padStart(2, '0');

            const outerRadiusNum = parseInt(slot.borderRadius, 10) || 24;
            const innerRadius = Math.max(0, outerRadiusNum - 8);

            const hasRightNeighbor = !isMobile && diff >= -2 && diff <= 1;

            return (
              <div
                key={project.slug}
                className={`${styles.card} ${isCenter ? styles.cardCenter : styles.cardCapsule} ${
                  prefersReducedMotion ? styles.reducedMotion : ''
                }`}
                style={{
                  transform: `translate(calc(-50% + ${slot.x}px), -50%)`,
                  width: slot.width,
                  height: slot.height,
                  borderRadius: slot.borderRadius,
                  opacity: slot.opacity,
                  zIndex: slot.zIndex,
                  pointerEvents: slot.pointerEvents,
                  '--inner-radius': `${innerRadius}px`,
                }}
                data-center={isCenter ? 'true' : 'false'}
              >
                <div className={styles.cardBody}>
                  <button
                    type="button"
                    className={styles.capsuleContent}
                    style={{
                      opacity: isCenter ? 0 : 1,
                      pointerEvents: isCenter ? 'none' : 'auto',
                    }}
                    onClick={() => goToIndex(i)}
                    tabIndex={-1}
                    aria-label={`View ${project.title}`}
                  >
                    {project.photoSrc ? (
                      <img
                        src={project.photoSrc}
                        alt={project.title}
                        className={styles.capsuleImg}
                        loading="lazy"
                      />
                    ) : (
                      <div className={styles.placeholderCapsule}>
                        <div className={styles.gridPattern} aria-hidden="true" />
                        <span className={styles.capsuleNum} aria-hidden="true">
                          {projectNum}
                        </span>
                      </div>
                    )}
                  </button>

                  <div
                    className={styles.bigCardContent}
                    style={{
                      opacity: isCenter ? 1 : 0,
                      pointerEvents: isCenter ? 'auto' : 'none',
                    }}
                  >
                    <Link
                      href={`/projects/${project.slug}`}
                      className={styles.bigCardLink}
                      tabIndex={isCenter ? 0 : -1}
                      aria-label={`View details for ${project.title}`}
                    >
                      <div className={styles.topRow}>
                        <span className={styles.statusPill}>
                          {project.status}
                        </span>
                        <div className={styles.cityBadge}>
                          <span className={styles.cityLabel}>CITY</span>
                          <span className={styles.cityName}>{project.location}</span>
                        </div>
                      </div>

                      <h3 className={styles.cardTitle}>{project.title}</h3>
                      <p className={styles.cardScope}>{project.scope}</p>

                      <div className={styles.photoContainer}>
                        {project.photoSrc ? (
                          <img
                            src={project.photoSrc}
                            alt={project.title}
                            className={styles.bigPhoto}
                          />
                        ) : (
                          <div className={styles.placeholderBig}>
                            <div className={styles.gridPattern} aria-hidden="true" />
                            <span className={styles.bgNumber} aria-hidden="true">
                              {projectNum}
                            </span>
                          </div>
                        )}

                        {project.photoSrc && project.illustrative && (
                          <span className={styles.illustrativeBadge}>Illustrative image</span>
                        )}

                        <div className={styles.photoOverlay} aria-hidden="true" />

                        <div className={styles.photoBottomLeft}>
                          <div className={styles.clientRow}>
                            <svg
                              className={styles.pinIcon}
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span className={styles.clientName}>{project.client}</span>
                          </div>
                          <span className={styles.clientLocation}>{project.location}</span>
                        </div>

                        <div className={styles.arrowButton} aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M2.5 7H11.5M11.5 7L7 2.5M11.5 7L7 11.5"
                              stroke="var(--color-navy, #091737)"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                <div
                  className={styles.bridgeJoint}
                  style={{
                    opacity: hasRightNeighbor ? 1 : 0,
                  }}
                  aria-hidden="true"
                >
                  <svg
                    width="28"
                    height="32"
                    viewBox="0 0 28 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={styles.bridgeSvg}
                  >
                    <path
                      d="M 0,0 A 10 10 0 0 0 10,10 L 18,10 A 10 10 0 0 0 28,0 L 28,32 A 10 10 0 0 0 18,22 L 10,22 A 10 10 0 0 0 0,32 Z"
                      fill="#FFFFFF"
                    />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.bottomControls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={goToPrev}
            aria-label="Previous project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className={styles.dotsWrap}>
            {projects.map((p, idx) => (
              <button
                key={p.slug}
                type="button"
                className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
                onClick={() => goToIndex(idx)}
                aria-label={`Go to project ${idx + 1}: ${p.title}`}
              />
            ))}
          </div>

          <div className={styles.counter} aria-hidden="true">
            {counterText}
          </div>

          <button
            type="button"
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Next project"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M6 4L10 8L6 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
