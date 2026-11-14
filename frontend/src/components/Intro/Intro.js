'use client';

import React, { useState, useEffect, useRef } from 'react';
import LogoMark from '@/components/common/LogoMark/LogoMark';
import styles from './Intro.module.css';

export default function Intro() {
  const [mounted, setMounted] = useState(false);
  const [isLightOff, setIsLightOff] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [introSize, setIntroSize] = useState(200);

  const backdropRef = useRef(null);
  const logoLayerRef = useRef(null);
  const markWrapRef = useRef(null);
  const isSkippingRef = useRef(false);
  const isDoneRef = useRef(false);
  const timersRef = useRef([]);
  const runningAnimationsRef = useRef([]);

  useEffect(() => {
    if (!document.documentElement.classList.contains('intro-pending')) {
      setIsDone(true);
      return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (!isDoneRef.current) {
        isDoneRef.current = true;
        try {
          sessionStorage.setItem('kinetics_intro_seen', '1');
        } catch (e) {}
        const navMarkEl = document.querySelector('[data-nav-mark]');
        if (navMarkEl) {
          navMarkEl.style.visibility = 'visible';
        }
        document.documentElement.classList.remove('intro-pending');
        document.documentElement.style.overflow = '';
        setIsDone(true);
      }
      return;
    }

    document.documentElement.style.overflow = 'hidden';

    const computeSize = () => {
      const vwSize = window.innerWidth * 0.28;
      return Math.round(Math.max(100, Math.min(vwSize, 220)));
    };
    setIntroSize(computeSize());

    setMounted(true);

    const finish = () => {
      if (isDoneRef.current) return;
      isDoneRef.current = true;
      try {
        sessionStorage.setItem('kinetics_intro_seen', '1');
      } catch (e) {}
      const navMarkEl = document.querySelector('[data-nav-mark]');
      if (navMarkEl) {
        navMarkEl.style.visibility = 'visible';
      }
      document.documentElement.classList.remove('intro-pending');
      document.documentElement.style.overflow = '';
      setIsDone(true);
    };

    const clearTimers = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };

    const skip = () => {
      if (isSkippingRef.current || isDoneRef.current) return;
      isSkippingRef.current = true;
      clearTimers();

      if (backdropRef.current) {
        const anim = backdropRef.current.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 200, easing: 'ease-out', fill: 'forwards' }
        );
        runningAnimationsRef.current.push(anim);
      }

      if (logoLayerRef.current) {
        const anim = logoLayerRef.current.animate(
          [{ opacity: 1 }, { opacity: 0 }],
          { duration: 200, easing: 'ease-out', fill: 'forwards' }
        );
        runningAnimationsRef.current.push(anim);
      }

      const navMarkEl = document.querySelector('[data-nav-mark]');
      if (navMarkEl) {
        navMarkEl.style.visibility = 'visible';
      }

      const wordmarkEl = document.querySelector('[data-nav-wordmark]');
      if (wordmarkEl) {
        const wAnim = wordmarkEl.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration: 200, easing: 'ease-out', fill: 'forwards' }
        );
        runningAnimationsRef.current.push(wAnim);
      }

      const tSkipDone = setTimeout(finish, 200);
      timersRef.current.push(tSkipDone);
    };

    const handleSkipEvent = () => {
      skip();
    };

    const skipEvents = ['click', 'keydown', 'wheel', 'touchstart'];
    skipEvents.forEach((evt) => {
      window.addEventListener(evt, handleSkipEvent, { passive: true, once: true });
    });

    const tLightOff = setTimeout(() => {
      if (isSkippingRef.current || isDoneRef.current) return;
      setIsLightOff(true);
    }, 1700);
    timersRef.current.push(tLightOff);

    const tFlight = setTimeout(() => {
      if (isSkippingRef.current || isDoneRef.current) return;

      const navMarkEl = document.querySelector('[data-nav-mark]');
      const markWrapEl = markWrapRef.current;
      const backdropEl = backdropRef.current;

      if (!navMarkEl || !markWrapEl || !backdropEl) {
        finish();
        return;
      }

      const navRect = navMarkEl.getBoundingClientRect();
      const markRect = markWrapEl.getBoundingClientRect();

      const navCenterX = navRect.left + navRect.width / 2;
      const navCenterY = navRect.top + navRect.height / 2;
      const markCenterX = markRect.left + markRect.width / 2;
      const markCenterY = markRect.top + markRect.height / 2;

      const deltaX = navCenterX - markCenterX;
      const deltaY = navCenterY - markCenterY;
      const scale = navRect.width / markRect.width;

      const flightAnim = markWrapEl.animate(
        [
          { transform: 'translate(0px, 0px) scale(1)' },
          { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scale})` }
        ],
        {
          duration: 900,
          easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
          fill: 'forwards'
        }
      );
      runningAnimationsRef.current.push(flightAnim);

      const backdropAnim = backdropEl.animate(
        [
          { opacity: 1 },
          { opacity: 0 }
        ],
        {
          duration: 900,
          easing: 'ease-out',
          fill: 'forwards'
        }
      );
      runningAnimationsRef.current.push(backdropAnim);

      flightAnim.onfinish = () => {
        if (isSkippingRef.current || isDoneRef.current) return;
        navMarkEl.style.visibility = 'visible';
        finish();

        const wordmarkEl = document.querySelector('[data-nav-wordmark]');
        if (wordmarkEl) {
          const wmAnim = wordmarkEl.animate(
            [
              { transform: 'translateX(-8px)', opacity: 0 },
              { transform: 'translateX(0px)', opacity: 1 }
            ],
            {
              duration: 300,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'forwards'
            }
          );
          runningAnimationsRef.current.push(wmAnim);
        }
      };
    }, 2050);
    timersRef.current.push(tFlight);

    const tFailsafe = setTimeout(() => {
      finish();
    }, 4000);
    timersRef.current.push(tFailsafe);

    return () => {
      clearTimers();
      skipEvents.forEach((evt) => {
        window.removeEventListener(evt, handleSkipEvent);
      });
      runningAnimationsRef.current.forEach((anim) => {
        try {
          anim.cancel();
        } catch (e) {}
      });
      runningAnimationsRef.current = [];
    };
  }, []);

  if (isDone) {
    return null;
  }

  return (
    <>
      <div
        data-intro-overlay
        className={styles.introBackdrop}
        ref={backdropRef}
        aria-hidden="true"
      />
      <div
        data-intro-overlay
        className={styles.logoLayer}
        ref={logoLayerRef}
        aria-hidden="true"
      >
        {mounted && (
          <div className={styles.markWrap} ref={markWrapRef}>
            <LogoMark
              size={introSize}
              animate={true}
              replayOnHover={false}
              decorative={true}
              lightOff={isLightOff}
            />
          </div>
        )}
      </div>
    </>
  );
}
