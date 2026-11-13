export function navigateTo(destination, e, onComplete) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }

  if (typeof onComplete === 'function') {
    onComplete();
  }

  if (typeof window === 'undefined') return;

  const dest = (destination || '').trim();

  if (dest === 'Home' || dest === 'Back to top' || dest === 'top') {
    const heroEl = document.querySelector('[class*="scrollWrapper"]');
    if (heroEl || window.location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = '/';
    }
    return;
  }

  if (dest === 'About') {
    const heroEl = document.querySelector('[class*="scrollWrapper"]');
    if (heroEl) {
      const heroMax = heroEl.offsetHeight - window.innerHeight;
      window.scrollTo({ top: heroMax, behavior: 'smooth' });
    } else {
      window.location.href = '/about';
    }
    return;
  }

  if (dest === 'Services') {
    const servicesEl = document.getElementById('services');
    if (servicesEl) {
      const target = servicesEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      window.location.href = '/services';
    }
    return;
  }

  if (dest === 'Projects') {
    const projectsEl = document.getElementById('projects');
    if (projectsEl) {
      const target = projectsEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      window.location.href = '/projects';
    }
    return;
  }

  if (dest === 'Contact' || dest === 'Request a quote' || dest.toLowerCase() === 'start project') {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      const target = contactEl.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      window.location.href = '/contact';
    }
    return;
  }
}

