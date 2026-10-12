/**
 * VivahParticles — Confetti burst and petal fall effects
 * No canvas dependency — uses DOM elements with requestAnimationFrame
 */
(function () {
  'use strict';

  const COLORS_CONFETTI = ['#C41E3A', '#D4A017', '#FF6600', '#2E7D32', '#FFF8F0'];
  const COLORS_PETAL = ['#C41E3A', '#FF6600', '#D4A017'];

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Confetti burst — 80-100 particles from screen center
   */
  const burst = () => {
    if (prefersReducedMotion()) return;

    const count = 80 + Math.floor(Math.random() * 21); // 80-100
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    const particles = [];

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const size = 6 + Math.random() * 6; // 6-12px
      const color = COLORS_CONFETTI[Math.floor(Math.random() * COLORS_CONFETTI.length)];
      const isCircle = Math.random() > 0.5;
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 300; // 100-400px
      const duration = 2000 + Math.random() * 1000; // 2-3s
      const rotation = Math.random() * 720 - 360;

      el.style.cssText = `
        position:absolute;
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:${isCircle ? '50%' : '2px'};
        left:${cx}px;top:${cy}px;
        pointer-events:none;
        will-change:transform,opacity;
      `;
      container.appendChild(el);

      particles.push({
        el,
        startX: cx,
        startY: cy,
        vx: Math.cos(angle) * distance,
        vy: Math.sin(angle) * distance,
        rotation,
        duration,
        startTime: performance.now() + Math.random() * 200,
      });
    }

    const animate = (now) => {
      let active = false;

      for (const p of particles) {
        const elapsed = now - p.startTime;
        if (elapsed < 0) {
          active = true;
          continue;
        }

        const progress = Math.min(elapsed / p.duration, 1);
        // easeOut: 1 - (1 - t)^3
        const ease = 1 - Math.pow(1 - progress, 3);

        const x = p.vx * ease;
        const y = p.vy * ease + 400 * progress * progress; // gravity
        const rot = p.rotation * ease;
        const opacity = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;

        p.el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
        p.el.style.opacity = opacity;

        if (progress < 1) active = true;
      }

      if (active) {
        requestAnimationFrame(animate);
      } else {
        container.remove();
      }
    };

    requestAnimationFrame(animate);
  };

  /**
   * Petal fall — 30-40 petals drifting down with sine-wave sway
   */
  const petalFall = () => {
    if (prefersReducedMotion()) return;

    const count = 30 + Math.floor(Math.random() * 11); // 30-40
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;overflow:hidden;';
    document.body.appendChild(container);

    const petals = [];
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      const color = COLORS_PETAL[Math.floor(Math.random() * COLORS_PETAL.length)];
      const startX = Math.random() * screenW;
      const duration = 3000 + Math.random() * 2000; // 3-5s
      const delay = Math.random() * 2000; // staggered start
      const swayAmplitude = 30 + Math.random() * 40;
      const swayFrequency = 1 + Math.random() * 2;

      el.style.cssText = `
        position:absolute;
        width:8px;height:12px;
        background:${color};
        border-radius:50% 0 50% 50%;
        left:${startX}px;top:-20px;
        opacity:0.85;
        pointer-events:none;
        will-change:transform,opacity;
      `;
      container.appendChild(el);

      petals.push({
        el,
        startX,
        duration,
        startTime: performance.now() + delay,
        swayAmplitude,
        swayFrequency,
      });
    }

    const animate = (now) => {
      let active = false;

      for (const p of petals) {
        const elapsed = now - p.startTime;
        if (elapsed < 0) {
          active = true;
          continue;
        }

        const progress = Math.min(elapsed / p.duration, 1);
        const y = -20 + (screenH + 40) * progress;
        const swayX = Math.sin(progress * Math.PI * 2 * p.swayFrequency) * p.swayAmplitude;
        const rot = swayX * 2;
        const opacity = progress > 0.85 ? 1 - (progress - 0.85) / 0.15 : 0.85;

        p.el.style.transform = `translate(${swayX}px, ${y}px) rotate(${rot}deg)`;
        p.el.style.opacity = opacity;

        if (progress < 1) active = true;
      }

      if (active) {
        requestAnimationFrame(animate);
      } else {
        container.remove();
      }
    };

    requestAnimationFrame(animate);
  };

  window.VivahParticles = { burst, petalFall };
})();
