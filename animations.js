/* ============================================================
   animations.js — Scroll reveals, typing effect, counters,
                   skill bars, parallax, tilt cards
   ============================================================ */

/* ── Intersection Observer — Reveal ── */
class RevealObserver {
  constructor() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Trigger skill bars when skills section reveals
            if (entry.target.classList.contains('skill-bar')) {
              entry.target.style.width = entry.target.dataset.level + '%';
            }
            this.observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    // Observe all reveal elements
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
      this.observer.observe(el);
    });

    // Observe skill bars
    document.querySelectorAll('.skill-bar').forEach(bar => {
      this.observer.observe(bar);
    });
  }
}

/* ── Typing Effect ── */
class TypeWriter {
  constructor(el, words, opts = {}) {
    this.el     = el;
    this.words  = words;
    this.delay  = opts.typeDelay  || 90;
    this.erase  = opts.eraseDelay || 50;
    this.pause  = opts.pauseDelay || 1800;
    this.wIdx   = 0;
    this.cIdx   = 0;
    this.typing = true;
    this.tick();
  }

  tick() {
    const word = this.words[this.wIdx];

    if (this.typing) {
      this.el.textContent = word.substring(0, this.cIdx + 1);
      this.cIdx++;
      if (this.cIdx === word.length) {
        this.typing = false;
        setTimeout(() => this.tick(), this.pause);
        return;
      }
      setTimeout(() => this.tick(), this.delay);
    } else {
      this.el.textContent = word.substring(0, this.cIdx - 1);
      this.cIdx--;
      if (this.cIdx === 0) {
        this.typing = true;
        this.wIdx = (this.wIdx + 1) % this.words.length;
      }
      setTimeout(() => this.tick(), this.erase);
    }
  }
}

/* ── Animated Counter ── */
class AnimatedCounter {
  constructor(el) {
    this.el     = el;
    this.target = parseInt(el.dataset.target, 10);
    this.suffix = el.dataset.suffix || '';
    this.started = false;
    this.observe();
  }

  observe() {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.started) {
        this.started = true;
        this.run();
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(this.el);
  }

  run() {
    const duration = 1600;
    const start    = performance.now();
    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value    = Math.round(eased * this.target);
      this.el.textContent = value + this.suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}

/* ── Tilt Card 3D Effect ── */
class TiltCard {
  constructor(el, opts = {}) {
    this.el      = el;
    this.maxTilt = opts.maxTilt || 12;
    this.glare   = opts.glare   !== false;
    this.init();
  }

  init() {
    if (this.glare) {
      const glare = document.createElement('div');
      glare.className = 'tilt-glare';
      glare.style.cssText = `
        position: absolute; inset: 0; border-radius: inherit;
        background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.12), transparent 60%);
        opacity: 0; pointer-events: none; transition: opacity 0.3s;
      `;
      this.el.style.position = 'relative';
      this.el.style.overflow = 'hidden';
      this.el.appendChild(glare);
      this.glareEl = glare;
    }

    this.el.addEventListener('mousemove', (e) => this.onMove(e));
    this.el.addEventListener('mouseleave', ()  => this.onLeave());
    this.el.style.transition = 'transform 0.15s ease';
    this.el.style.willChange = 'transform';
  }

  onMove(e) {
    const rect = this.el.getBoundingClientRect();
    const cx   = rect.left + rect.width / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * this.maxTilt;
    const rotY =  dx * this.maxTilt;

    this.el.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;

    if (this.glareEl) {
      const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      this.glareEl.style.opacity = '1';
      this.glareEl.style.background = `linear-gradient(${angle}deg, rgba(255,255,255,0.12), transparent 60%)`;
    }
  }

  onLeave() {
    this.el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    if (this.glareEl) this.glareEl.style.opacity = '0';
  }
}

/* ── Testimonial Slider ── */
class TestimonialSlider {
  constructor() {
    this.track  = document.querySelector('.testimonials-track');
    this.cards  = document.querySelectorAll('.testimonial-card');
    this.dots   = document.querySelectorAll('.slider-dot');
    this.prev   = document.querySelector('.slider-prev');
    this.next   = document.querySelector('.slider-next');
    this.current = 0;
    this.timer  = null;
    if (!this.track || this.cards.length === 0) return;
    this.init();
  }

  init() {
    this.prev?.addEventListener('click', () => this.go(this.current - 1));
    this.next?.addEventListener('click', () => this.go(this.current + 1));
    this.dots.forEach((dot, i) => dot.addEventListener('click', () => this.go(i)));
    this.autoplay();

    // Touch/swipe support
    let startX = 0;
    this.track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    this.track.addEventListener('touchend',   e => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) this.go(this.current + (dx < 0 ? 1 : -1));
    });
  }

  go(index) {
    this.current = (index + this.cards.length) % this.cards.length;
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    this.dots.forEach((d, i) => d.classList.toggle('active', i === this.current));
    this.resetAutoplay();
  }

  autoplay() {
    this.timer = setInterval(() => this.go(this.current + 1), 5000);
  }

  resetAutoplay() {
    clearInterval(this.timer);
    this.autoplay();
  }
}

/* ── Parallax Orbs ── */
class ParallaxOrbs {
  constructor() {
    this.orbs = document.querySelectorAll('.aurora-orb');
    if (!this.orbs.length) return;
    window.addEventListener('mousemove', (e) => this.onMove(e), { passive: true });
  }

  onMove(e) {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    this.orbs.forEach((orb, i) => {
      const factor = (i + 1) * 12;
      orb.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  }
}

/* ── Contact Form ── */
class ContactForm {
  constructor() {
    this.form    = document.getElementById('contact-form');
    this.success = document.querySelector('.form-success');
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.onSubmit(e));
  }

  onSubmit(e) {
    e.preventDefault();
    const btn = this.form.querySelector('.form-submit');
    btn.textContent = 'Sending…';
    btn.disabled = true;

    // Simulate async send
    setTimeout(() => {
      this.form.reset();
      btn.textContent = 'Send Message';
      btn.disabled = false;
      if (this.success) {
        this.success.classList.add('visible');
        setTimeout(() => this.success.classList.remove('visible'), 4000);
      }
    }, 1600);
  }
}

/* ── Init all animations ── */
document.addEventListener('DOMContentLoaded', () => {
  new RevealObserver();

  // Typing effect
  const typingEl = document.getElementById('hero-typing');
  if (typingEl) {
    new TypeWriter(typingEl, [
      'Software Engineering Student',
      'Full Stack Developer',
      'Web Developer',
    ]);
  }

  // Animated counters
  document.querySelectorAll('[data-counter]').forEach(el => new AnimatedCounter(el));

  // Tilt cards
  document.querySelectorAll('.project-card').forEach(el => new TiltCard(el, { maxTilt: 8 }));
  document.querySelectorAll('.stat-card').forEach(el => new TiltCard(el, { maxTilt: 6, glare: false }));

  // Testimonial slider
  new TestimonialSlider();

  // Parallax orbs
  new ParallaxOrbs();

  // Contact form
  new ContactForm();
});