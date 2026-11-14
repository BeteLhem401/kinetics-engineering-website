'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { contactData } from '@/data/contact';
import { servicesData } from '@/data/services';
import { submitInquiry } from '@/lib/submitInquiry';
import { useReveal } from '@/hooks/useReveal';
import styles from './Contact.module.css';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function Contact({ initialAtStart = false }) {
  const wrapperRef = useRef(null);
  const [revealRef, isRevealed] = useReveal({ threshold: 0.1 });

  useIsomorphicLayoutEffect(() => {
    if (initialAtStart) {
      if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      const scrollToContact = () => {
        if (wrapperRef.current) {
          const target = wrapperRef.current.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({ top: target, behavior: 'instant' });
        }
      };
      scrollToContact();
      requestAnimationFrame(scrollToContact);
      setTimeout(scrollToContact, 50);
      setTimeout(scrollToContact, 150);
    }
  }, [initialAtStart]);

  const isContactActiveRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const vh = window.innerHeight;

      const isInSection = rect.top <= vh * 0.4 && rect.bottom >= vh * 0.4;

      if (isInSection && !isContactActiveRef.current) {
        isContactActiveRef.current = true;
        if (typeof window !== 'undefined' && window.location.pathname !== '/contact') {
          const search = window.location.search || '';
          window.history.replaceState(null, '', '/contact' + search);
          window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/contact' }));
          window.dispatchEvent(new Event('popstate'));
        }
      } else if (!isInSection && isContactActiveRef.current) {
        isContactActiveRef.current = false;
        if (rect.top > vh * 0.4) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/projects') {
            const search = window.location.search || '';
            window.history.replaceState(null, '', '/projects' + search);
            window.dispatchEvent(new CustomEvent('kinetics:pathchange', { detail: '/projects' }));
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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    service: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); 

  const fieldRefs = {
    name: useRef(null),
    phone: useRef(null),
    email: useRef(null),
    message: useRef(null),
  };

  const telHref = contactData.phone
    ? 'tel:' + contactData.phone.replace(/[\s-]/g, '')
    : '';

  const validateField = (fieldName, value, currentData = formData) => {
    let error = null;

    if (fieldName === 'name') {
      if (!value || value.trim().length < 2) {
        error = 'Please enter your full name.';
      }
    } else if (fieldName === 'phone' || fieldName === 'email') {
      const p = fieldName === 'phone' ? value : currentData.phone;
      const e = fieldName === 'email' ? value : currentData.email;

      const hasPhone = p && p.trim().length > 0;
      const hasEmail = e && e.trim().length > 0;

      if (!hasPhone && !hasEmail) {
        error = 'Please provide either a phone number or email address.';
      } else {
        if (fieldName === 'phone' && hasPhone) {
          const digits = p.replace(/\D/g, '');
          if (digits.length < 9 || digits.length > 15) {
            error = 'Please enter a valid phone number (9–15 digits).';
          }
        }
        if (fieldName === 'email' && hasEmail) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())) {
            error = 'Please enter a valid email address.';
          }
        }
      }
    } else if (fieldName === 'message') {
      if (!value || value.trim().length < 10) {
        error = 'Please describe your project (at least 10 characters).';
      }
    }

    return error;
  };

  const handleBlur = (fieldName) => {
    const error = validateField(fieldName, formData[fieldName]);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) {
        next[fieldName] = error;
      } else {
        delete next[fieldName];
        if ((fieldName === 'phone' || fieldName === 'email') && (formData.phone || formData.email)) {
          if (next.phone === 'Please provide either a phone number or email address.') delete next.phone;
          if (next.email === 'Please provide either a phone number or email address.') delete next.email;
        }
      }
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    const nameErr = validateField('name', formData.name);
    if (nameErr) newErrors.name = nameErr;

    const phoneErr = validateField('phone', formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const emailErr = validateField('email', formData.email);
    if (emailErr) newErrors.email = emailErr;

    const msgErr = validateField('message', formData.message);
    if (msgErr) newErrors.message = msgErr;

    setErrors(newErrors);

    const errorKeys = Object.keys(newErrors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      if (fieldRefs[firstKey] && fieldRefs[firstKey].current) {
        fieldRefs[firstKey].current.focus();
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await submitInquiry(formData);
      if (result.ok) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('offline');
      }
    } catch (err) {
      setSubmitStatus('offline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDev = process.env.NODE_ENV !== 'production';
  const socialItems = (contactData.social || [])
    .map((item) => {
      const isNull = !item.url;
      if (isNull && !isDev) return null;
      return {
        ...item,
        href: item.url || '#',
        isPlaceholder: isNull,
      };
    })
    .filter(Boolean);

  return (
    <section id="contact" ref={wrapperRef} className={styles.contactSection}>
      <div className={styles.bgGraphicWrap} aria-hidden="true">
        <img
          src="/images/hero/building-lit.png"
          alt=""
          className={styles.bgGraphic}
          width={830}
          height={463}
        />
      </div>

      <div
        ref={revealRef}
        className={`${styles.container} ${isRevealed ? styles.revealed : ''}`}
      >
        <div className={styles.leftColumn}>
          <div className={styles.eyebrow}>{contactData.eyebrow}</div>
          <h2 className={styles.heading}>
            {contactData.heading.prefix}
            <span className={styles.accentText}>{contactData.heading.accent}</span>
            {contactData.heading.suffix}
          </h2>
          <p className={styles.subheading}>{contactData.subheading}</p>

          <div className={styles.cardsList}>
            {contactData.phone && (
              <a href={telHref} className={styles.detailCard}>
                <div className={styles.iconCircle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className={styles.cardTextGroup}>
                  <span className={styles.cardLabel}>Direct Phone</span>
                  <span className={styles.cardValue}>{contactData.phone}</span>
                </div>
              </a>
            )}

            {contactData.email && (
              <a href={`mailto:${contactData.email}`} className={styles.detailCard}>
                <div className={styles.iconCircle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className={styles.cardTextGroup}>
                  <span className={styles.cardLabel}>Email</span>
                  <span className={styles.cardValue}>{contactData.email}</span>
                </div>
              </a>
            )}

            {contactData.address && (
              <div className={styles.detailCardStatic}>
                <div className={styles.iconCircle}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2463FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className={styles.cardTextGroup}>
                  <span className={styles.cardLabel}>Head Office</span>
                  <span className={styles.cardValue}>{contactData.address}</span>
                  {contactData.mapsUrl && (
                    <a
                      href={contactData.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.mapsLink}
                    >
                      Open in Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            )}

            {socialItems.length > 0 && (
              <div className={styles.socialRow}>
                {socialItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    aria-label={item.label}
                    {...(!item.isPlaceholder ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`${styles.socialButton} ${styles[item.id]}`}
                  >
                    <span className={`${styles.socialBrandBg} ${styles[`${item.id}Bg`]}`} aria-hidden="true" />
                    <span className={styles.socialIcon} aria-hidden="true">
                      {item.id === 'linkedin' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37h2.78z" />
                        </svg>
                      )}
                      {item.id === 'whatsapp' && (
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84a8.188 8.188 0 0 1-5.83 2.41c-1.43 0-2.84-.37-4.08-1.07l-.29-.17-3.03.8 1.29-3.03-.19-.31a8.184 8.184 0 0 1-1.22-4.47c0-4.54 3.7-8.24 8.25-8.24m-3.53 3.65c-.19 0-.41.07-.63.32-.22.25-.85.83-.85 2.03s.87 2.36.99 2.52c.12.16 1.7 2.6 4.12 3.65.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.45-.59 1.65-1.16.21-.58.21-1.07.15-1.17-.06-.1-.23-.16-.49-.29s-1.45-.72-1.68-.8-.39-.12-.56.12c-.17.25-.66.8-.81.97-.15.17-.3.19-.56.06-.26-.13-1.09-.4-2.08-1.28-.77-.69-1.29-1.54-1.44-1.8-.15-.26-.02-.4.11-.53.12-.11.26-.29.39-.43.13-.15.17-.25.26-.42.08-.17.04-.32-.02-.45s-.56-1.35-.77-1.85c-.2-.49-.41-.42-.56-.43h-.48z" />
                        </svg>
                      )}
                      {item.id === 'facebook' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      )}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.formCard}>
            {submitStatus === 'success' ? (
              <div className={styles.successPanel} role="status">
                <div className={styles.successIcon} aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className={styles.successTitle}>Inquiry Received</h3>
                <p className={styles.successText}>
                  Thank you! Your message has been received. Our engineering team will review your specifications and contact you shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitStatus(null);
                    setFormData({ name: '', phone: '', email: '', company: '', service: '', message: '' });
                  }}
                  className={styles.resetButton}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className={styles.form}>
                <h3 className={styles.formTitle}>Request a Quote</h3>

                {submitStatus === 'offline' && (
                  <div className={styles.offlineNotice} role="alert">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#03329C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>
                      Online sending is not connected yet. Please call us:{' '}
                      <a href={telHref} className={styles.offlinePhoneLink}>
                        {contactData.phone}
                      </a>
                    </span>
                  </div>
                )}

                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-name" className={styles.fieldLabel}>
                    Full name <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    ref={fieldRefs.name}
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur('name')}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    className={`${styles.inputField} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Abebe Bikila"
                  />
                  {errors.name && (
                    <span id="contact-name-error" className={styles.errorText} role="alert">
                      {errors.name}
                    </span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-phone" className={styles.fieldLabel}>
                      Phone
                    </label>
                    <input
                      ref={fieldRefs.phone}
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => handleBlur('phone')}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                      className={`${styles.inputField} ${errors.phone ? styles.inputError : ''}`}
                      placeholder="+251 911 000 000"
                    />
                    {errors.phone && (
                      <span id="contact-phone-error" className={styles.errorText} role="alert">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-email" className={styles.fieldLabel}>
                      Email
                    </label>
                    <input
                      ref={fieldRefs.email}
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={() => handleBlur('email')}
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? 'contact-email-error' : undefined}
                      className={`${styles.inputField} ${errors.email ? styles.inputError : ''}`}
                      placeholder="client@company.com"
                    />
                    {errors.email && (
                      <span id="contact-email-error" className={styles.errorText} role="alert">
                        {errors.email}
                      </span>
                    )}
                  </div>
                </div>

                <p className={styles.fieldHelper}>
                  At least one of phone or email is required so our team can reach you.
                </p>

                <div className={styles.formRow}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-company" className={styles.fieldLabel}>
                      Company <span className={styles.optionalTag}>(optional)</span>
                    </label>
                    <input
                      id="contact-company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleChange}
                      className={styles.inputField}
                      placeholder="Real Estate / Enterprise"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="contact-service" className={styles.fieldLabel}>
                      Service
                    </label>
                    <div className={styles.selectWrapper}>
                      <select
                        id="contact-service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className={styles.selectField}
                      >
                        <option value="">Select a service...</option>
                        {servicesData.items.map((svc) => (
                          <option key={svc.id} value={svc.title}>
                            {svc.title}
                          </option>
                        ))}
                        <option value="Not sure yet">Not sure yet</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="contact-message" className={styles.fieldLabel}>
                    Message <span className={styles.requiredAsterisk}>*</span>
                  </label>
                  <textarea
                    ref={fieldRefs.message}
                    id="contact-message"
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={() => handleBlur('message')}
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? 'contact-message-error' : undefined}
                    className={`${styles.textareaField} ${errors.message ? styles.inputError : ''}`}
                    placeholder="Tell us about the project scope, location, and requirements..."
                  />
                  {errors.message && (
                    <span id="contact-message-error" className={styles.errorText} role="alert">
                      {errors.message}
                    </span>
                  )}
                </div>

                <div className={styles.submitRow}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={styles.ctaButton}
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Request a quote'}</span>
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
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

