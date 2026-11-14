'use client';

import React from 'react';
import { contactData } from '@/data/contact';
import { servicesData } from '@/data/services';
import { navigateTo } from '@/lib/navigation';
import { useReveal } from '@/hooks/useReveal';
import styles from './Footer.module.css';

export default function FooterClient({ pdfStats }) {
  const [revealRef, isRevealed] = useReveal({ threshold: 0.08 });
  const currentYear = new Date().getFullYear();

  const telHref = contactData.phone
    ? 'tel:' + contactData.phone.replace(/[\s-]/g, '')
    : '';

  const pages = ['Home', 'About', 'Services', 'Projects', 'Contact'];

  return (
    <footer
      ref={revealRef}
      className={`${styles.footer} ${isRevealed ? styles.revealed : ''}`}
      role="contentinfo"
    >
      <div className={styles.innerContainer}>
        <div className={styles.topRow}>
          <div className={styles.brandBlock}>
            <a
              href="#"
              className={styles.logoLink}
              onClick={(e) => navigateTo('Home', e)}
              aria-label="KINETICS Home"
            >
              <img
                src="/images/logo/logo-white.svg"
                alt="KINETICS"
                width={138}
                height={42}
                className={styles.whiteLogo}
              />
            </a>
            <p className={styles.tagline}>
              Electrical, low-current, fire and security systems for buildings. Established 2024, Addis Ababa.
            </p>
          </div>

          {pdfStats && pdfStats.exists && (
            <div className={styles.profileCard}>
              <div className={styles.profileIconWrap} aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className={styles.profileInfo}>
                <span className={styles.profileTitle}>Company Profile</span>
                <span className={styles.profileMeta}>PDF · {pdfStats.size}</span>
              </div>
              <div className={styles.profileActions}>
                <a
                  href={pdfStats.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.profileButton}
                  aria-label="View Company Profile PDF in new tab"
                >
                  View
                </a>
                <a
                  href={pdfStats.href}
                  download="KINETICS-Company-Profile.pdf"
                  className={styles.profileButtonDownload}
                  aria-label="Download Company Profile PDF"
                >
                  Download
                </a>
              </div>
            </div>
          )}
        </div>

        <div className={styles.navGrid}>
          <div className={styles.navCol}>
            <h4 className={styles.colHeading}>Pages</h4>
            <ul className={styles.navList}>
              {pages.map((page) => (
                <li key={page} className={styles.navItem}>
                  <a
                    href="#"
                    className={styles.navLink}
                    onClick={(e) => navigateTo(page, e)}
                  >
                    {page}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.navCol}>
            <h4 className={styles.colHeading}>Services</h4>
            <ul className={styles.navList}>
              {servicesData.items.map((svc) => (
                <li key={svc.id} className={styles.navItem}>
                  <a
                    href="#"
                    className={styles.navLink}
                    onClick={(e) => navigateTo('Services', e)}
                  >
                    {svc.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.navCol} ${styles.contactCol}`}>
            <h4 className={styles.colHeading}>Contact</h4>
            <ul className={styles.navList}>
              {contactData.phone && (
                <li className={styles.navItem}>
                  <span className={styles.infoLabel}>Phone</span>
                  <a href={telHref} className={styles.navLinkHighlight}>
                    {contactData.phone}
                  </a>
                </li>
              )}
              {contactData.address && (
                <li className={styles.navItem}>
                  <span className={styles.infoLabel}>Head Office</span>
                  <span className={styles.addressText}>{contactData.address}</span>
                  {contactData.mapsUrl && (
                    <a
                      href={contactData.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapsFooterLink}
                    >
                      Open in Maps ↗
                    </a>
                  )}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className={styles.wordmarkWrap} aria-hidden="true">
          <div className={styles.wordmark}>KINETICS</div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {currentYear} KINETICS Engineering PLC
          </div>
          <button
            type="button"
            className={styles.backToTopButton}
            onClick={(e) => navigateTo('Back to top', e)}
            aria-label="Back to top"
          >
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}

