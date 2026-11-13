'use client';

import React, { useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react';
import useScrollProgress from '@/hooks/useScrollProgress';
import { servicesData } from '@/data/services';
import styles from './Services.module.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function ServiceIcon({ id }) {
  switch (id) {
    case 'power':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      );
    case 'cabling':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" />
          <rect x="2" y="14" width="20" height="8" rx="2" />
          <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
          <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
          <path d="M10 6H18" />
          <path d="M10 18H18" />
        </svg>
      );
    case 'fire':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'security':
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="3" />
          <path d="M12 8v1" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Services({ initialAtStart = false }) {
  const wrapperRef = useRef(null);
  const { progress, displayed } = useScrollProgress(wrapperRef, false);

  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const handleMq = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', handleMq);

    return () => {
      window.removeEventListener('resize', handleResize);
      mq.removeEventListener('change', handleMq);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (initialAtStart) {
      if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const scrollToServices = () => {
        if (wrapperRef.current) {
          const top = wrapperRef.current.offsetTop;
          window.scrollTo({ top, behavior: 'instant' });
        }
      };
      scrollToServices();
      requestAnimationFrame(scrollToServices);
      setTimeout(scrollToServices, 50);
    }
  }, [initialAtStart]);

  const isServicesActiveRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const isInSection = rect.top <= vh * 0.4 && rect.bottom >= vh * 0.4;

      if (isInSection && !isServicesActiveRef.current) {
        isServicesActiveRef.current = true;
        if (typeof window !== 'undefined' && window.location.pathname !== '/services') {
          const search = window.location.search || '';
          window.history.replaceState(null, '', '/services' + search);
          window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/services' }));
          window.dispatchEvent(new Event('popstate'));
        }
      } else if (!isInSection && isServicesActiveRef.current) {
        isServicesActiveRef.current = false;
        if (rect.top > vh * 0.4) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/about') {
            const search = window.location.search || '';
            window.history.replaceState(null, '', '/about' + search);
            window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/about' }));
            window.dispatchEvent(new Event('popstate'));
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const t = displayed * 3;
  const floorT = Math.floor(t);
  const f = t - floorT;
  const f2 = smoothstep(0.35, 0.65, f);
  const te = Math.min(3, Math.max(0, t >= 3 ? 3 : floorT + f2));

  const rowHeight = isMobile ? 48 : 64;

  const handleRowClick = (index) => {
    if (!wrapperRef.current) return;
    const wrapperTop = wrapperRef.current.offsetTop;
    const wrapperHeight = wrapperRef.current.offsetHeight;
    const scrollableDistance = wrapperHeight - window.innerHeight;
    const targetProgress = index / 3;
    window.scrollTo({
      top: wrapperTop + targetProgress * scrollableDistance,
      behavior: 'smooth',
    });
  };

  return (
    <section id="services" ref={wrapperRef} className={styles.servicesWrapper}>
      <div className={styles.stickyStage}>
        <div className={styles.servicesContainer}>
          <div className={styles.leftColumn}>
            <div className={styles.headerBlock}>
              <div className={styles.eyebrow}>{servicesData.eyebrow}</div>
              <h2 className={styles.heading}>{servicesData.heading}</h2>
            </div>

            <div
              className={styles.lensListContainer}
              style={{ height: `${4 * rowHeight}px` }}
              role="tablist"
              aria-label="Services list"
            >
              <div
                className={styles.lensFrame}
                style={{
                  transform: `translate3d(0, ${te * rowHeight}px, 0)`,
                  height: `${rowHeight}px`,
                }}
                aria-hidden="true"
              />

              {servicesData.items.map((item, i) => {
                const w = Math.max(0, 1 - Math.abs(i - te));
                const opacity = 0.35 + 0.65 * w;
                const translateX = prefersReducedMotion ? 0 : 12 * w;
                const isMax = Math.round(te) === i;

                return (
                  <div
                    key={item.id}
                    className={styles.serviceRow}
                    style={{
                      height: `${rowHeight}px`,
                      opacity,
                      transform: `translate3d(${translateX}px, 0, 0)`,
                    }}
                    onClick={() => handleRowClick(i)}
                    role="tab"
                    aria-selected={isMax}
                    tabIndex={0}
                  >
                    <span
                      className={`${styles.rowMarker} ${isMax ? styles.rowMarkerFilled : ''}`}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={styles.rowLabel}
                      style={{
                        color: isMax ? '#091737' : (w > 0.4 ? '#1E293B' : '#6F809A'),
                        fontWeight: isMax ? 700 : 600,
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.photoCard}>
              <div className={styles.photosStack}>
                {servicesData.items.map((item, k) => {
                  const p = Math.min(1, Math.max(0, 1 - Math.abs(te - k)));
                  const sign = k >= te ? 1 : -1;
                  const translateY = prefersReducedMotion ? 0 : sign * (1 - p) * 18;
                  const scale = prefersReducedMotion ? 1 : 1.04 - 0.04 * p;

                  return (
                    <div
                      key={item.id}
                      className={styles.photoLayer}
                      style={{
                        opacity: p,
                        transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
                        pointerEvents: p > 0.1 ? 'auto' : 'none',
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        className={styles.photoImg}
                        width={1122}
                        height={1402}
                      />
                    </div>
                  );
                })}
              </div>

              <div className={styles.photoGlassPanel}>
                {servicesData.items.map((item, k) => {
                  const p = Math.min(1, Math.max(0, 1 - Math.abs(te - k)));
                  const sign = k >= te ? 1 : -1;

                  const pTitle = p;
                  const pDesc = Math.min(1, Math.max(0, (p - 0.1) / 0.9));

                  const titleTranslateY = prefersReducedMotion ? 0 : sign * (1 - pTitle) * 10;
                  const descTranslateY = prefersReducedMotion ? 0 : sign * (1 - pDesc) * 10;

                  return (
                    <div
                      key={item.id}
                      className={styles.glassContentItem}
                      style={{
                        opacity: p,
                        pointerEvents: p > 0.1 ? 'auto' : 'none',
                      }}
                    >
                      <div
                        className={styles.glassHeaderRow}
                        style={{
                          opacity: pTitle,
                          transform: `translate3d(0, ${titleTranslateY}px, 0)`,
                        }}
                      >
                        <div className={styles.glassIconWrap}>
                          <ServiceIcon id={item.id} />
                        </div>
                        <h3 className={styles.glassTitle}>{item.title}</h3>
                      </div>
                      <p
                        className={styles.glassDesc}
                        style={{
                          opacity: pDesc,
                          transform: `translate3d(0, ${descTranslateY}px, 0)`,
                        }}
                      >
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

