/* ============================================================
   script.js — Navigation, Page Loader, Scroll Progress,
               Theme Toggle, Back-to-Top, Active Nav
   ============================================================ */

/* ── Page Loader ── */
class PageLoader {
  constructor() {
    this.loader   = document.getElementById('page-loader');
    this.bar      = document.querySelector('.loader-bar');
    this.countEl  = document.querySelector('.loader-count');
    if (!this.loader) return;
    this.run();
  }

  run() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => this.hide(), 300);
      }
      if (this.countEl) this.countEl.textContent = Math.round(progress) + '%';
    }, 80);
  }

  hide() {
    this.loader.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

/* ── Scroll Progress Bar ── */
class ScrollProgress {
  constructor() {
    this.bar = document.getElementById('scroll-progress');
    if (!this.bar) return;
    window.addEventListener('scroll', () => this.update(), { passive: true });
  }

  update() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? (scrolled / total) * 100 : 0;
    this.bar.style.width = pct + '%';
  }
}

/* ── Navigation ── */
class Navigation {
  constructor() {
    this.navbar    = document.getElementById('navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.navLinks  = document.querySelector('.nav-links');
    this.links     = document.querySelectorAll('.nav-link[data-section]');
    this.sections  = [];

    this.init();
  }

  init() {
    // Scroll: add .scrolled class
    window.addEventListener('scroll', () => {
      this.navbar.classList.toggle('scrolled', window.scrollY > 40);
      this.updateActiveLink();
    }, { passive: true });

    // Hamburger toggle
    this.hamburger?.addEventListener('click', () => {
      this.hamburger.classList.toggle('open');
      this.navLinks.classList.toggle('open');
      document.body.style.overflow = this.navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu on link click
    this.links.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger?.classList.remove('open');
        this.navLinks?.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Build section map
    this.links.forEach(link => {
      const id  = link.dataset.section;
      const sec = document.getElementById(id);
      if (sec) this.sections.push({ link, sec });
    });

    // Close on backdrop click (mobile)
    document.addEventListener('click', (e) => {
      if (this.navLinks?.classList.contains('open') && !this.navbar.contains(e.target)) {
        this.hamburger?.classList.remove('open');
        this.navLinks.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let active = null;

    this.sections.forEach(({ link, sec }) => {
      if (sec.offsetTop <= scrollY) active = link;
    });

    this.sections.forEach(({ link }) => link.classList.remove('active'));
    if (active) active.classList.add('active');
  }
}

/* ── Theme Toggle ── */
class ThemeToggle {
  constructor() {
    this.btn   = document.querySelector('.theme-toggle');
    this.icon  = document.querySelector('.theme-icon');
    this.theme = localStorage.getItem('ks-theme') || 'dark';
    this.apply();
    this.btn?.addEventListener('click', () => this.toggle());
  }

  apply() {
    document.documentElement.dataset.theme = this.theme;
    if (this.icon) this.icon.textContent = this.theme === 'dark' ? '☀️' : '🌙';
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ks-theme', this.theme);
    this.apply();
  }
}

/* ── Back To Top ── */
class BackToTop {
  constructor() {
    this.btn = document.getElementById('back-top');
    if (!this.btn) return;
    window.addEventListener('scroll', () => {
      this.btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    this.btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* ── Smooth Scroll for anchor links ── */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 70;
        const top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Prevent flash of unstyled content
  document.body.style.overflow = 'hidden';

  new PageLoader();
  new ScrollProgress();
  new Navigation();
  new ThemeToggle();
  new BackToTop();
  initSmoothScroll();
});