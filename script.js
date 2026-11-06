(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const progressBar = document.querySelector('.scroll-progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.site-nav');
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateChrome = () => {
    const scrollTop = window.scrollY || root.scrollTop;
    const scrollable = root.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(scrollTop / scrollable, 1) : 0;
    header?.classList.toggle('is-scrolled', scrollTop > 18);
    if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  };

  let scrollFrame;
  const requestChromeUpdate = () => {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(() => {
      updateChrome();
      scrollFrame = null;
    });
  };

  window.addEventListener('scroll', requestChromeUpdate, { passive: true });
  window.addEventListener('resize', requestChromeUpdate, { passive: true });
  updateChrome();

  const closeMenu = () => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(willOpen));
    navigation?.classList.toggle('is-open', willOpen);
    body.classList.toggle('menu-open', willOpen);
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  }, { passive: true });

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`));
    }, { rootMargin: '-28% 0px -60% 0px', threshold: [0, 0.25, 0.6] });
    document.querySelectorAll('main section[id]').forEach((section) => sectionObserver.observe(section));
  }

  if (!reducedMotion.matches && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-spotlight]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
      });
    });
  }

  const copyButton = document.querySelector('[data-copy-email]');
  const copyStatus = document.querySelector('.copy-status');

  const copyFallback = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    body.appendChild(textArea);
    textArea.select();
    const copied = document.execCommand('copy');
    textArea.remove();
    return copied;
  };

  copyButton?.addEventListener('click', async () => {
    const email = copyButton.dataset.copyEmail;
    if (!email) return;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(email);
      else if (!copyFallback(email)) throw new Error('Copy unavailable');
      copyButton.querySelector('span').textContent = 'Copied to clipboard';
      if (copyStatus) copyStatus.textContent = email;
      window.setTimeout(() => {
        copyButton.querySelector('span').textContent = 'Copy email';
        if (copyStatus) copyStatus.textContent = '';
      }, 2600);
    } catch {
      if (copyStatus) copyStatus.textContent = `Copy this address: ${email}`;
    }
  });

  document.querySelectorAll('[data-year]').forEach((year) => {
    year.textContent = String(new Date().getFullYear());
  });
})();
