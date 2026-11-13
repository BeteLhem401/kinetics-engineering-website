'use client';

import React, { useRef, useState, useEffect } from 'react';
import { testimonialsData } from '@/data/testimonials';
import styles from './Testimonials.module.css';

function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TestimonialsClient({ items }) {
  const cardsRef = useRef([]);
  const [revealedSet, setRevealedSet] = useState(() => new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealedSet(new Set(items.map((_, i) => i)));
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setRevealedSet(new Set(items.map((_, i) => i)));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'));
            setRevealedSet((prev) => {
              const next = new Set(prev);
              next.add(index);
              return next;
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    cardsRef.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className={styles.testimonialsSection} aria-label="Client Feedback">
      <div className={styles.container}>
        <h2 className={styles.heading}>
          <span className={styles.headingLine1}>{testimonialsData.headingLine1}</span>
          <span className={styles.headingLine2}>{testimonialsData.headingLine2}</span>
        </h2>

        <div className={styles.grid}>
          {items.map((item, index) => {
            const isRevealed = revealedSet.has(index);
            const colIndex = index % 3;
            const isFeatured = !!item.featured;

            return (
              <div
                key={item.id}
                ref={(el) => (cardsRef.current[index] = el)}
                data-index={index}
                className={`${styles.cardOuter} ${isRevealed ? styles.revealed : ''}`}
                style={{ '--col-index': colIndex }}
              >
                <div
                  className={`${styles.cardInner} ${isFeatured ? styles.cardFeatured : ''}`}
                  tabIndex={0}
                >
                  <div className={styles.cardHeader}>
                    <div
                      className={`${styles.quoteMark} ${isFeatured ? styles.quoteMarkFeatured : ''}`}
                      aria-hidden="true"
                    >
                      <svg width="40" height="28" viewBox="0 0 38 28" fill="currentColor">
                        <path d="M0 16.8C0 7.2 5.6 1.2 16.4 0l1.8 3.8c-5.6 1.4-8.4 4.6-8.8 9.2H16.4V28H0V16.8zm21.6 0C21.6 7.2 27.2 1.2 38 0l1.8 3.8c-5.6 1.4-8.4 4.6-8.8 9.2H38V28H21.6V16.8z" />
                      </svg>
                    </div>
                    <div
                      className={`${styles.cardDots} ${isFeatured ? styles.cardDotsFeatured : ''}`}
                      aria-hidden="true"
                    >
                      <span /><span /><span />
                    </div>
                  </div>

                  <blockquote className={styles.quoteBlock}>
                    <p
                      className={`${styles.quoteText} ${isFeatured ? styles.quoteTextFeatured : ''}`}
                    >
                      {item.quote}
                    </p>
                  </blockquote>

                  <div
                    className={`${styles.divider} ${isFeatured ? styles.dividerFeatured : ''}`}
                    aria-hidden="true"
                  >
                    <span className={styles.dividerDot} />
                    <span className={styles.dividerLine} />
                  </div>

                  <div className={styles.authorRow}>
                    <div
                      className={`${styles.avatarCircle} ${isFeatured ? styles.avatarCircleFeatured : ''}`}
                      aria-hidden="true"
                    >
                      {getInitials(item.name)}
                    </div>
                    <div className={styles.authorDetails}>
                      <span
                        className={`${styles.authorName} ${isFeatured ? styles.authorNameFeatured : ''}`}
                      >
                        {item.name}
                      </span>
                      <span
                        className={`${styles.authorMeta} ${isFeatured ? styles.authorMetaFeatured : ''}`}
                      >
                        {item.role} · {item.company}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
