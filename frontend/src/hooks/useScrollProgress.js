'use client';

import { useState, useEffect, useLayoutEffect, useRef } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useScrollProgress(wrapperRef, initialAtEnd = false) {
  const initialValue = initialAtEnd ? 1 : 0;
  const [progress, setProgress] = useState(initialValue);
  const [displayed, setDisplayed] = useState(initialValue);

  const targetProgressRef = useRef(initialValue);
  const displayedProgressRef = useRef(initialValue);
  const animationFrameIdRef = useRef(null);
  const isLoopRunningRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (initialAtEnd && wrapperRef.current) {
      const wrapperHeight = wrapperRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollableDistance = wrapperHeight - windowHeight;

      if (scrollableDistance > 0) {
        window.scrollTo({ top: scrollableDistance, behavior: 'instant' });
        targetProgressRef.current = 1;
        displayedProgressRef.current = 1;
        setProgress(1);
        setDisplayed(1);
      }
    }
  }, [initialAtEnd, wrapperRef]);

  useEffect(() => {
    const tick = () => {
      const target = targetProgressRef.current;
      const current = displayedProgressRef.current;
      const delta = target - current;

      if (Math.abs(delta) < 0.001) {
        displayedProgressRef.current = target;
        setDisplayed(target);
        isLoopRunningRef.current = false;
        animationFrameIdRef.current = null;
        return;
      }

      const next = current + delta * 0.12;
      displayedProgressRef.current = next;
      setDisplayed(next);

      animationFrameIdRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (!isLoopRunningRef.current) {
        isLoopRunningRef.current = true;
        animationFrameIdRef.current = requestAnimationFrame(tick);
      }
    };

    const handleScroll = () => {
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      const wrapperHeight = wrapperRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      const scrollableDistance = wrapperHeight - windowHeight;

      if (scrollableDistance <= 0) {
        targetProgressRef.current = 0;
        setProgress(0);
        return;
      }

      const scrolled = -rect.top;
      const clampedProgress = Math.min(Math.max(scrolled / scrollableDistance, 0), 1);

      targetProgressRef.current = clampedProgress;
      setProgress(clampedProgress);

      startLoop();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    if (!initialAtEnd) {
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      isLoopRunningRef.current = false;
    };
  }, [wrapperRef, initialAtEnd]);

  return { progress, displayed };
}

export default useScrollProgress;
