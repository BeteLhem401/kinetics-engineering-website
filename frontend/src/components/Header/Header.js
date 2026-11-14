'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { homeData } from '@/data/home';
import { navigateTo } from '@/lib/navigation';
import LogoMark from '@/components/common/LogoMark/LogoMark';
import styles from './Header.module.css';

export default function Header() {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState(pathname || '/');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    if (pathname) {
      setActivePath(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    const handleCustomChange = (e) => {
      if (e.detail) {
        setActivePath(e.detail);
      }
    };

    const handlePopState = () => {
      if (typeof window !== 'undefined') {
        setActivePath(window.location.pathname);
      }
    };

    window.addEventListener('kinetics:pathchange', handleCustomChange);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('kinetics:pathchange', handleCustomChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 900) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isContactActive = activePath === '/contact' || activePath.startsWith('/contact');
  const isProjectsActive = !isContactActive && (activePath === '/projects' || activePath.startsWith('/projects'));
  const isServicesActive = !isContactActive && !isProjectsActive && (activePath === '/services' || activePath.startsWith('/services'));
  const isAboutActive = !isContactActive && !isProjectsActive && !isServicesActive && (activePath === '/about' || activePath.startsWith('/about'));
  const isHomeActive = !isContactActive && !isProjectsActive && !isServicesActive && !isAboutActive;

  const handleNavClick = (e, label) => {
    navigateTo(label, e, () => setIsMenuOpen(false));
  };

  return (
    <header className={styles.headerContainer} ref={headerRef}>
      <div className={styles.headerPill} role="banner">
        <div className={styles.leftCluster}>
          <div className={styles.logoWrap}>
            <a
              href="#"
              aria-label="KINETICS Engineering, home"
              onClick={(e) => handleNavClick(e, 'Home')}
              className={styles.logoLink}
            >
              <span className={styles.navMarkImg} data-nav-mark>
                <LogoMark size={35} animate={false} lightOff={true} decorative={true} />
              </span>
              <img
                src="/images/logo/logo-wordmark-black.svg"
                alt=""
                width={77}
                height={13}
                className={styles.wordmarkImg}
                data-nav-wordmark
              />
            </a>
          </div>
        </div>

        <nav className={styles.navMenu} aria-label="Main Navigation">
          {homeData.navLinks.map((item) => {
            const isActive =
              (item.label === 'Home' && isHomeActive) ||
              (item.label === 'About' && isAboutActive) ||
              (item.label === 'Services' && isServicesActive) ||
              (item.label === 'Projects' && isProjectsActive) ||
              (item.label === 'Contact' && isContactActive);

            return (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                onClick={(e) => handleNavClick(e, item.label)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className={styles.rightCluster}>
          <div className={styles.ctaWrap}>
            <a
              href="#"
              className={styles.ctaButton}
              onClick={(e) => handleNavClick(e, 'Start Project')}
            >
              <span>{homeData.navCta || 'Get in touch'}</span>
              <span className={styles.arrowCircle} aria-hidden="true">
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
          </div>

          <button
            type="button"
            className={styles.menuButton}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
            <span className={styles.hamburgerLine} />
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className={styles.dropdownPanel}
          role="dialog"
          aria-modal="false"
          aria-label="Mobile Navigation"
        >
          <nav className={styles.dropdownNav}>
            {homeData.navLinks.map((item) => {
              const isActive =
                (item.label === 'Home' && isHomeActive) ||
                (item.label === 'About' && isAboutActive) ||
                (item.label === 'Services' && isServicesActive) ||
                (item.label === 'Projects' && isProjectsActive) ||
                (item.label === 'Contact' && isContactActive);

              return (
                <a
                  key={item.label}
                  href={item.href}
                  className={`${styles.dropdownLink} ${isActive ? styles.dropdownLinkActive : ''}`}
                  onClick={(e) => handleNavClick(e, item.label)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && <span className={styles.activeDot} />}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
