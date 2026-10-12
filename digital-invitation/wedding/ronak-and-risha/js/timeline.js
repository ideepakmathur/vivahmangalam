/**
 * VivahTimeline — Scroll-triggered animations for timeline sections
 * Uses IntersectionObserver, one-time animations, disconnects after triggering.
 */
(function () {
  'use strict';

  const observers = [];

  const init = () => {
    observeRoka();
    observeEngagement();
    observeBrahman();
  };

  /**
   * #roka — stagger-reveal photo grid items
   */
  const observeRoka = () => {
    const section = document.getElementById('roka');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const items = section.querySelectorAll('.photo-grid__item');
          items.forEach((item, i) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, i * 150);
          });

          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    observers.push(observer);
  };

  /**
   * #engagement — stagger-reveal photo grid items
   */
  const observeEngagement = () => {
    const section = document.getElementById('engagement');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const items = section.querySelectorAll('.photo-grid__item');
          items.forEach((item, i) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, i * 150);
          });

          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    observers.push(observer);
  };

  /**
   * #brahman — staged animation sequence:
   * 1. Family groups slide in from left/right
   * 2. After 1s: brahman/pandit figure appears
   * 3. After 2s: caption text appears
   * 4. After 3s: scroll hint bounce
   */
  const observeBrahman = () => {
    const section = document.getElementById('brahman');
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const groupLeft = section.querySelector('.brahman__group--left');
          const groupRight = section.querySelector('.brahman__group--right');
          const pandit = section.querySelector('.brahman__pandit');
          const caption = section.querySelector('.brahman__caption');

          // Step 1: Family groups slide in
          if (groupLeft) groupLeft.classList.add('visible');
          if (groupRight) groupRight.classList.add('visible');

          // Step 2: Pandit appears after 1s
          setTimeout(() => {
            if (pandit) pandit.classList.add('visible');
          }, 1000);

          // Step 3: Caption text after 2s
          setTimeout(() => {
            if (caption) caption.classList.add('visible');
          }, 2000);

          // Step 4: Scroll hint after 3s — subtle bounce on section bottom
          setTimeout(() => {
            section.classList.add('scroll-hint');
          }, 3000);

          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    observers.push(observer);
  };

  window.VivahTimeline = { init };
})();
