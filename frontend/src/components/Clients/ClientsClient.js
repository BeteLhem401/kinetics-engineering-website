'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './Clients.module.css';

export default function ClientsClient({ clients }) {
  const trackRef = useRef(null);
  const rafRef = useRef(null);
  const currentRateRef = useRef(1.0);
  const targetRateRef = useRef(1.0);
  const startTimeRef = useRef(0);
  const initialRateRef = useRef(1.0);
  const isTouchRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const matchTouch = window.matchMedia('(hover: none) and (pointer: coarse)');
      isTouchRef.current = matchTouch.matches;

      const handleTouchChange = (e) => {
        isTouchRef.current = e.matches;
      };

      matchTouch.addEventListener('change', handleTouchChange);
      return () => matchTouch.removeEventListener('change', handleTouchChange);
    }
  }, []);

  const startEasing = useCallback((targetRate) => {
    if (isTouchRef.current) return;

    targetRateRef.current = targetRate;
    const animations = trackRef.current?.getAnimations?.() || [];
    const anim = animations[0];
    if (!anim) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    initialRateRef.current = anim.playbackRate;
    startTimeRef.current = performance.now();
    const duration = 400; 

    const tick = (now) => {
      const elapsed = Math.min((now - startTimeRef.current) / duration, 1);
      const easedT = elapsed * (2 - elapsed);
      const newRate = initialRateRef.current + (targetRateRef.current - initialRateRef.current) * easedT;

      anim.playbackRate = newRate;
      currentRateRef.current = newRate;

      if (elapsed < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        anim.playbackRate = targetRateRef.current;
        currentRateRef.current = targetRateRef.current;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  const handlePointerEnter = useCallback(() => {
    startEasing(0.25);
  }, [startEasing]);

  const handlePointerLeave = useCallback(() => {
    startEasing(1.0);
  }, [startEasing]);

  const handleFocus = useCallback(() => {
    startEasing(0.25);
  }, [startEasing]);

  const handleBlur = useCallback(() => {
    startEasing(1.0);
  }, [startEasing]);

  const groupItems = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    const minWidthNeeded = 2400; 
    const estimatedItemWidth = 200; 
    const repeatCount = Math.max(2, Math.ceil(minWidthNeeded / (clients.length * estimatedItemWidth)));

    const repeated = [];
    for (let r = 0; r < repeatCount; r++) {
      clients.forEach((c, idx) => {
        repeated.push({
          ...c,
          instanceKey: `${c.slug}-r${r}-i${idx}`,
        });
      });
    }
    return repeated;
  }, [clients]);

  const marqueeDuration = useMemo(() => {
    return `${Math.max(clients.length * 10, 50)}s`;
  }, [clients.length]);

  if (!clients || clients.length === 0) {
    return null;
  }

  return (
    <section className={styles.clientsSection} aria-label="Clients">
      <div className={styles.headerWrap}>
        <div className={styles.eyebrow}>SELECTED CLIENTS</div>
        <h2 className={styles.heading}>Who we build for</h2>
      </div>

      <div className={styles.marqueeViewport}>
        <div
          ref={trackRef}
          className={styles.marqueeTrack}
          style={{ '--marquee-duration': marqueeDuration }}
        >
          <div className={styles.group}>
            {groupItems.map((item) => (
              <div
                key={item.instanceKey}
                className={styles.clientItem}
                tabIndex={0}
                role="group"
                aria-label={item.name}
                onPointerEnter={handlePointerEnter}
                onPointerLeave={handlePointerLeave}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <img
                  src={item.logoSrc}
                  alt={`${item.name} logo`}
                  className={styles.clientLogo}
                  loading="lazy"
                />
                <span className={styles.clientName}>{item.name}</span>
              </div>
            ))}
          </div>

          <div className={`${styles.group} ${styles.groupDuplicate}`} aria-hidden="true">
            {groupItems.map((item) => (
              <div
                key={`dup-${item.instanceKey}`}
                className={styles.clientItem}
                tabIndex={-1}
              >
                <img
                  src={item.logoSrc}
                  alt=""
                  className={styles.clientLogo}
                  loading="lazy"
                />
                <span className={styles.clientName}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

