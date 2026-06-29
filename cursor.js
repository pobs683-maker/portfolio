/* ============================================================
   cursor.js — Custom cursor, magnetic buttons, mouse glow
   ============================================================ */

class CustomCursor {
  constructor() {
    this.outer = document.getElementById('cursor-outer');
    this.inner = document.getElementById('cursor-inner');
    this.glow  = document.getElementById('cursor-glow');
    if (!this.outer) return;

    this.mx = 0; this.my = 0;
    this.ox = 0; this.oy = 0;
    this.rafId = null;

    this.init();
  }

  init() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mx = e.clientX;
      this.my = e.clientY;

      // Inner cursor: snap immediately
      this.inner.style.left = this.mx + 'px';
      this.inner.style.top  = this.my + 'px';

      // Glow follows directly
      if (this.glow) {
        this.glow.style.left = this.mx + 'px';
        this.glow.style.top  = this.my + 'px';
      }
    });

    // Outer cursor: smooth lag
    this.animateOuter();

    // Hoverable elements
    const hoverTargets = 'a, button, .btn, .social-link, .skill-card, .project-card, .service-card, .cert-card, .nav-link, .theme-toggle, .hamburger';
    document.querySelectorAll(hoverTargets).forEach(el => {
      el.addEventListener('mouseenter', () => this.setHovering(true));
      el.addEventListener('mouseleave', () => this.setHovering(false));
    });

    // Click flash
    document.addEventListener('mousedown', () => {
      this.inner.style.transform = 'translate(-50%, -50%) scale(0.7)';
    });
    document.addEventListener('mouseup', () => {
      this.inner.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  }

  animateOuter() {
    const ease = 0.12;
    this.ox += (this.mx - this.ox) * ease;
    this.oy += (this.my - this.oy) * ease;
    this.outer.style.left = this.ox + 'px';
    this.outer.style.top  = this.oy + 'px';
    this.rafId = requestAnimationFrame(() => this.animateOuter());
  }

  setHovering(state) {
    this.outer.classList.toggle('hovering', state);
    this.inner.classList.toggle('hovering', state);
  }
}

/* ── Magnetic Button Effect ── */
class MagneticButton {
  constructor(el, strength = 0.3) {
    this.el = el;
    this.strength = strength;
    this.rect = null;
    this.init();
  }

  init() {
    this.el.addEventListener('mouseenter', () => {
      this.rect = this.el.getBoundingClientRect();
    });

    this.el.addEventListener('mousemove', (e) => {
      if (!this.rect) return;
      const cx = this.rect.left + this.rect.width / 2;
      const cy = this.rect.top  + this.rect.height / 2;
      const dx = (e.clientX - cx) * this.strength;
      const dy = (e.clientY - cy) * this.strength;
      this.el.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    this.el.addEventListener('mouseleave', () => {
      this.el.style.transform = '';
      this.rect = null;
    });
  }
}

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  new CustomCursor();

  // Apply magnetic effect to primary buttons
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(btn => {
    new MagneticButton(btn, 0.25);
  });
});