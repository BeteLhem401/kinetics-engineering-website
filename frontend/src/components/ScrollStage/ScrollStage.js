'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import useScrollProgress from '@/hooks/useScrollProgress';
import { homeData } from '@/data/home';
import { navigateTo } from '@/lib/navigation';
import styles from './ScrollStage.module.css';

const BUILDING_START_X = 227;
const BUILDING_START_Y = 197;
const BUILDING_END_X = 430;
const BUILDING_END_Y = 189;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function ScrollStage({ initialAtEnd = false, initialPath = '/' }) {
  const wrapperRef = useRef(null);
  const { progress, displayed } = useScrollProgress(wrapperRef, initialAtEnd);

  const [stageScale, setStageScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const currentPathRef = useRef(initialPath);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/services') {
      currentPathRef.current = '/services';
      return;
    }

    const targetPath = displayed >= 0.6 ? '/about' : '/';
    if (currentPathRef.current !== targetPath) {
      currentPathRef.current = targetPath;
      if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
        const search = window.location.search || '';
        window.history.replaceState(null, '', targetPath + search);
        window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: targetPath }));
        window.dispatchEvent(new Event('popstate'));
      }
    }
  }, [displayed]);

  const [isDebug, setIsDebug] = useState(false);
  const [debugData, setDebugData] = useState({
    wrapperHeight: 0,
    windowHeight: 0,
    scrollY: 0,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
    }
  }, []);

  useEffect(() => {
    if (!isDebug) return;

    const updateDebugMetrics = () => {
      setDebugData({
        wrapperHeight: wrapperRef.current ? wrapperRef.current.offsetHeight : 0,
        windowHeight: window.innerHeight,
        scrollY: Math.round(window.scrollY || window.pageYOffset || 0),
      });
    };

    updateDebugMetrics();
    window.addEventListener('scroll', updateDebugMetrics, { passive: true });
    window.addEventListener('resize', updateDebugMetrics, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateDebugMetrics);
      window.removeEventListener('resize', updateDebugMetrics);
    };
  }, [isDebug]);

  useEffect(() => {
    const updateScale = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const mobile = vw < 900;
      setIsMobile(mobile);

      if (!mobile) {
        const scale = Math.min(vw / 1280, vh / 760);
        setStageScale(scale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const { buildingX, buildingY } = useMemo(() => {
    if (displayed <= 0.4) {
      return { buildingX: BUILDING_START_X, buildingY: BUILDING_START_Y };
    }
    if (displayed >= 0.8) {
      return { buildingX: BUILDING_END_X, buildingY: BUILDING_END_Y };
    }
    const t = (displayed - 0.4) / (0.8 - 0.4);
    const easedT = easeInOutCubic(t);
    return {
      buildingX: BUILDING_START_X + (BUILDING_END_X - BUILDING_START_X) * easedT,
      buildingY: BUILDING_START_Y + (BUILDING_END_Y - BUILDING_START_Y) * easedT,
    };
  }, [displayed]);

  const revealProgress = useMemo(() => {
    if (displayed <= 0.15) return 0;
    if (displayed >= 0.6) return 1;
    return (displayed - 0.15) / (0.6 - 0.15);
  }, [displayed]);

  const maskStyle = useMemo(() => {
    if (revealProgress <= 0) {
      return {
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 100%, transparent 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 100%, transparent 100%)',
        opacity: 0,
      };
    }
    if (revealProgress >= 1) {
      return {
        WebkitMaskImage: 'none',
        maskImage: 'none',
        opacity: 1,
      };
    }

    const cutoffBottom = (1 - revealProgress) * 100;
    const cutoffTop = Math.max(0, cutoffBottom - 10);

    const gradient = `linear-gradient(to bottom, transparent 0%, transparent ${cutoffTop}%, black ${cutoffBottom}%, black 100%)`;
    return {
      WebkitMaskImage: gradient,
      maskImage: gradient,
      opacity: 1,
    };
  }, [revealProgress]);

  const cardsOpacity = useMemo(() => {
    if (displayed <= 0.6) return 1;
    if (displayed >= 0.8) return 0;
    return 1 - (displayed - 0.6) / (0.8 - 0.6);
  }, [displayed]);

  const { aboutOpacity, aboutTranslateX } = useMemo(() => {
    if (displayed <= 0.6) {
      return { aboutOpacity: 0, aboutTranslateX: -24 };
    }
    if (displayed >= 0.95) {
      return { aboutOpacity: 1, aboutTranslateX: 0 };
    }
    const t = (displayed - 0.6) / (0.95 - 0.6);
    return {
      aboutOpacity: t,
      aboutTranslateX: -24 * (1 - t),
    };
  }, [displayed]);

  const mobileLitOpacity = useMemo(() => {
    if (displayed <= 0.15) return 0;
    if (displayed >= 0.6) return 1;
    return (displayed - 0.15) / (0.6 - 0.15);
  }, [displayed]);

  const mobileDarkOpacity = useMemo(() => {
    if (displayed <= 0.6) return 1;
    if (displayed >= 1.0) return 0;
    return 1 - (displayed - 0.6) / (1.0 - 0.6);
  }, [displayed]);

  const mobileCardsOpacity = useMemo(() => {
    if (displayed <= 0.6) return 1;
    if (displayed >= 0.8) return 0;
    return 1 - (displayed - 0.6) / (0.8 - 0.6);
  }, [displayed]);

  const mobileAboutOpacity = useMemo(() => {
    if (displayed <= 0.6) return 0;
    if (displayed >= 0.95) return 1;
    return (displayed - 0.6) / (0.95 - 0.6);
  }, [displayed]);

  const powerLoadValue = useMemo(() => {
    const percent = Math.min(100, Math.max(0, Math.round(displayed * 100)));
    return String(percent).padStart(2, '0');
  }, [displayed]);

  return (
    <div ref={wrapperRef} className={styles.scrollWrapper}>
      <div className={styles.stickyStage}>
        <div
          className={styles.stageCanvas}
          style={!isMobile ? { transform: `scale(${stageScale})` } : undefined}
        >
          <h1 className={styles.ghostWord} aria-hidden="true">
            {homeData.ghostWord}
          </h1>

          <div
            className={styles.shadowEllipse}
            style={
              !isMobile
                ? {
                    transform: `translate(${buildingX + 40}px, ${buildingY + 360}px)`,
                  }
                : undefined
            }
          />

          <div
            className={styles.buildingWrapper}
            style={
              !isMobile
                ? {
                    transform: `translate3d(${buildingX}px, ${buildingY}px, 0)`,
                  }
                : undefined
            }
          >
            <img
              src="/images/hero/building-dark.png"
              alt="KINETICS headquarters building at dusk prior to system energization"
              className={styles.buildingImage}
              width={830}
              height={463}
            />

            <div className={styles.litRevealOverlay} style={maskStyle}>
              <img
                src="/images/hero/building-lit.png"
                alt="KINETICS headquarters building fully energized with active MEP systems"
                className={styles.buildingImage}
                width={830}
                height={463}
              />
            </div>
          </div>

          <div
            className={styles.leftCardOuter}
            style={
              !isMobile
                ? {
                    opacity: cardsOpacity,
                    pointerEvents: cardsOpacity < 0.1 ? 'none' : 'auto',
                  }
                : undefined
            }
          >
            <div className={`${styles.glassCard} ${styles.leftCardInner}`}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitleSerif}>
                  <span>{homeData.leftCard.line1}</span>
                  <br />
                  <span>{homeData.leftCard.line2}</span>
                </h3>
                <div className={styles.establishedRow}>
                  <span className={styles.establishedYear}>{homeData.leftCard.year}</span>
                  <span className={styles.establishedLabel}>{homeData.leftCard.yearLabel}</span>
                </div>
                <p className={styles.cardScopeText}>{homeData.leftCard.scope}</p>
              </div>
            </div>
          </div>

          <div
            className={styles.rightCardOuter}
            style={
              !isMobile
                ? {
                    opacity: cardsOpacity,
                    pointerEvents: cardsOpacity < 0.1 ? 'none' : 'auto',
                  }
                : undefined
            }
          >
            <div className={`${styles.glassCard} ${styles.rightCardInner}`}>
              <div className={styles.rightCardContent}>
                <div className={styles.cardCode}>{homeData.rightCard.code}</div>
                <div className={styles.cardScopeTitle}>{homeData.rightCard.title}</div>
              </div>
            </div>
          </div>

          <div className={styles.statusPillOuter}>
            <div className={`${styles.glassCard} ${styles.statusPillInner}`}>
              <span className={`${styles.statusDot} ${styles.pillDot}`} />
              <span className={styles.statusText}>{homeData.pill.label}</span>
            </div>
          </div>

          <div
            className={styles.aboutBlock}
            style={
              !isMobile
                ? {
                    opacity: aboutOpacity,
                    transform: `translate3d(${aboutTranslateX}px, 0, 0)`,
                    pointerEvents: aboutOpacity < 0.1 ? 'none' : 'auto',
                  }
                : undefined
            }
          >
            <div className={styles.aboutEyebrow}>{homeData.about.eyebrow}</div>
            <h2 className={styles.aboutHeading}>
              <span className={styles.headingLineNavy}>{homeData.about.h1Line1}</span>
              <br />
              <span className={styles.headingLineBlue}>{homeData.about.h1Line2}</span>
            </h2>
            <p className={styles.aboutParagraph}>{homeData.about.paragraph}</p>

            <div className={styles.aboutButtonsWrap}>
              <a
                href="#"
                className={styles.primaryAboutButton}
                onClick={(e) => navigateTo('Projects', e)}
              >
                <span>{homeData.about.buttons.primary}</span>
                <span className={styles.aboutArrowCircle} aria-hidden="true">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6H9.5M9.5 6L6 2.5M9.5 6L6 9.5"
                      stroke="#091737"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>

              <a
                href="#"
                className={styles.secondaryAboutButton}
                onClick={(e) => navigateTo('Services', e)}
              >
                <span>{homeData.about.buttons.secondary}</span>
                <span className={styles.textArrowCircle} aria-hidden="true">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 5H8M8 5L5 2M8 5L5 8"
                      stroke="#091737"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          <div className={styles.powerLoadContainer}>
            <div className={styles.powerLoadLine}>
              <div
                className={styles.powerLoadFill}
                style={{ width: `${Math.min(100, Math.max(0, displayed * 100))}%` }}
              />
            </div>
            <div className={styles.powerLoadMeta}>
              <span className={styles.powerLoadLabel}>{homeData.powerLoad.label}</span>
              <span className={styles.powerLoadValue}>{powerLoadValue}%</span>
            </div>
          </div>
        </div>

        <div className={styles.mobileCanvas}>
          <div className={styles.mobileBuildingWrapper}>
            <img
              src="/images/hero/building-dark.png"
              alt="KINETICS headquarters building at dusk prior to system energization"
              className={styles.mobileBuildingImage}
              style={{ opacity: mobileDarkOpacity }}
              width={830}
              height={463}
            />
            <img
              src="/images/hero/building-lit.png"
              alt="KINETICS headquarters building fully energized with active MEP systems"
              className={styles.mobileBuildingImageLit}
              style={{ opacity: mobileLitOpacity }}
              width={830}
              height={463}
            />
          </div>

          <div className={styles.mobileStoryArea}>
            <div
              className={styles.mobileCardsWrap}
              style={{
                opacity: mobileCardsOpacity,
                pointerEvents: mobileCardsOpacity < 0.1 ? 'none' : 'auto',
              }}
            >
              <div className={`${styles.glassCard} ${styles.mobileCard} ${styles.leftCardInner}`}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitleSerif}>
                    <span>{homeData.leftCard.line1}</span>
                    <br />
                    <span>{homeData.leftCard.line2}</span>
                  </h3>
                  <div className={styles.establishedRow}>
                    <span className={styles.establishedYear}>{homeData.leftCard.year}</span>
                    <span className={styles.establishedLabel}>{homeData.leftCard.yearLabel}</span>
                  </div>
                  <p className={styles.cardScopeText}>{homeData.leftCard.scope}</p>
                </div>
              </div>

              <div className={`${styles.glassCard} ${styles.mobileCard} ${styles.rightCardInner}`}>
                <div className={styles.rightCardContent}>
                  <div className={styles.cardCode}>{homeData.rightCard.code}</div>
                  <div className={styles.cardScopeTitle}>{homeData.rightCard.title}</div>
                </div>
              </div>
            </div>

            <div
              className={styles.mobileAboutWrap}
              style={{
                opacity: mobileAboutOpacity,
                pointerEvents: mobileAboutOpacity < 0.1 ? 'none' : 'auto',
              }}
            >
              <div className={styles.aboutEyebrow}>{homeData.about.eyebrow}</div>
              <h2 className={styles.mobileAboutHeading}>
                <span className={styles.headingLineNavy}>{homeData.about.h1Line1}</span>
                <br />
                <span className={styles.headingLineBlue}>{homeData.about.h1Line2}</span>
              </h2>
              <p className={styles.mobileAboutParagraph}>{homeData.about.paragraph}</p>
              <div className={styles.aboutButtonsWrap}>
                <a
                  href="#"
                  className={styles.primaryAboutButton}
                  onClick={(e) => navigateTo('Projects', e)}
                >
                  <span>{homeData.about.buttons.primary}</span>
                  <span className={styles.aboutArrowCircle} aria-hidden="true">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6H9.5M9.5 6L6 2.5M9.5 6L6 9.5"
                        stroke="#091737"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
                <a
                  href="#"
                  className={styles.secondaryAboutButton}
                  onClick={(e) => navigateTo('Services', e)}
                >
                  <span>{homeData.about.buttons.secondary}</span>
                  <span className={styles.textArrowCircle} aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5H8M8 5L5 2M8 5L5 8"
                        stroke="#091737"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>

          <div className={styles.mobileBottomMeta}>
            <div className={`${styles.glassCard} ${styles.mobileStatusPill}`}>
              <span className={`${styles.statusDot} ${styles.pillDot}`} />
              <span className={styles.statusText}>{homeData.pill.label}</span>
            </div>

            <div className={styles.mobilePowerLoad}>
              <div className={styles.powerLoadLine}>
                <div
                  className={styles.powerLoadFill}
                  style={{ width: `${Math.min(100, Math.max(0, displayed * 100))}%` }}
                />
              </div>
              <div className={styles.powerLoadMeta}>
                <span className={styles.powerLoadLabel}>{homeData.powerLoad.label}</span>
                <span className={styles.powerLoadValue}>{powerLoadValue}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDebug && (
        <aside
          id="debug-readout"
          style={{
            position: 'fixed',
            bottom: '12px',
            left: '12px',
            zIndex: 99999,
            backgroundColor: 'rgba(9, 23, 55, 0.92)',
            color: '#FFFFFF',
            fontFamily: 'monospace',
            fontSize: '11px',
            lineHeight: 1.5,
            padding: '8px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
          }}
        >
          <div>progress: {progress.toFixed(2)}</div>
          <div>displayed: {displayed.toFixed(2)}</div>
          <div>wrapper height: {debugData.wrapperHeight}px</div>
          <div>window height: {debugData.windowHeight}px</div>
          <div>scrollY: {debugData.scrollY}px</div>
        </aside>
      )}
    </div>
  );
}
