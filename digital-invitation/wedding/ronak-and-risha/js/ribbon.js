/**
 * VivahRibbon — Splash screen ribbon pull interaction
 * Supports mouse and touch. One-time animation.
 */
(function () {
  'use strict';

  const PULL_THRESHOLD = 100; // px needed to trigger reveal
  let completed = false;
  let dragging = false;
  let startY = 0;
  let currentPull = 0;

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    const ribbon = document.getElementById('ribbon');
    const splash = document.getElementById('splash');
    if (!ribbon || !splash) return;

    const brideEl = splash.querySelector('.splash__silhouette--bride');
    const groomEl = splash.querySelector('.splash__silhouette--groom');
    const revealEl = document.getElementById('splash-reveal');

    // Reduced motion: skip to reveal immediately
    if (prefersReducedMotion()) {
      skipToReveal(brideEl, groomEl, revealEl, ribbon);
      return;
    }

    // Mouse events
    ribbon.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onGrabStart(e.clientY, ribbon);
    });
    document.addEventListener('mousemove', (e) => {
      if (dragging) onDragMove(e.clientY, ribbon);
    });
    document.addEventListener('mouseup', () => {
      if (dragging) onRelease(ribbon, brideEl, groomEl, revealEl);
    });

    // Touch events
    ribbon.addEventListener('touchstart', (e) => {
      e.preventDefault();
      onGrabStart(e.touches[0].clientY, ribbon);
    }, { passive: false });
    document.addEventListener('touchmove', (e) => {
      if (dragging) onDragMove(e.touches[0].clientY, ribbon);
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if (dragging) onRelease(ribbon, brideEl, groomEl, revealEl);
    });

    // Keyboard accessibility
    ribbon.addEventListener('keydown', (e) => {
      if (completed) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        triggerReveal(ribbon, brideEl, groomEl, revealEl);
      }
    });
  };

  const onGrabStart = (clientY, ribbon) => {
    if (completed) return;
    dragging = true;
    startY = clientY;
    currentPull = 0;
    ribbon.style.transition = 'none';
    ribbon.style.transform = 'scale(1.08)';
    ribbon.classList.add('ribbon--grabbed');
  };

  const onDragMove = (clientY, ribbon) => {
    if (!dragging || completed) return;
    currentPull = Math.max(0, clientY - startY);
    ribbon.style.transform = `scale(1.08) translateY(${currentPull}px)`;
  };

  const onRelease = (ribbon, brideEl, groomEl, revealEl) => {
    dragging = false;

    if (currentPull >= PULL_THRESHOLD && !completed) {
      triggerReveal(ribbon, brideEl, groomEl, revealEl);
    } else {
      // Spring back
      ribbon.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      ribbon.style.transform = 'scale(1) translateY(0)';
      ribbon.classList.remove('ribbon--grabbed');
    }
    currentPull = 0;
  };

  const triggerReveal = (ribbon, brideEl, groomEl, revealEl) => {
    completed = true;
    dragging = false;

    // Ribbon animates down and fades
    ribbon.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
    ribbon.style.transform = 'translateY(200px) scale(0.8)';
    ribbon.style.opacity = '0';
    ribbon.classList.remove('ribbon--grabbed');

    // Bride slides right, groom slides left
    if (brideEl) brideEl.classList.add('brideSlide');
    if (groomEl) groomEl.classList.add('groomSlide');

    // Confetti burst after 800ms
    setTimeout(() => {
      if (window.VivahParticles?.burst) {
        window.VivahParticles.burst();
      }
    }, 800);

    // Reveal text after 1200ms
    setTimeout(() => {
      if (revealEl) {
        revealEl.setAttribute('aria-hidden', 'false');
        revealEl.classList.add('fadeIn');
      }
    }, 1200);

    // Auto-scroll to #roka after 3000ms
    setTimeout(() => {
      const roka = document.getElementById('roka');
      if (roka) {
        roka.scrollIntoView({ behavior: 'smooth' });
      }
    }, 3000);

    // Disable further interaction
    ribbon.setAttribute('aria-disabled', 'true');
    ribbon.removeAttribute('tabindex');
    ribbon.style.pointerEvents = 'none';
  };

  const skipToReveal = (brideEl, groomEl, revealEl, ribbon) => {
    completed = true;

    if (brideEl) brideEl.classList.add('brideSlide');
    if (groomEl) groomEl.classList.add('groomSlide');
    if (revealEl) {
      revealEl.setAttribute('aria-hidden', 'false');
      revealEl.classList.add('fadeIn');
    }
    if (ribbon) {
      ribbon.style.display = 'none';
    }
  };

  window.VivahRibbon = { init };
})();
