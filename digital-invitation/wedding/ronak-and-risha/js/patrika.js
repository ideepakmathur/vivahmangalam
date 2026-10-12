/**
 * VivahPatrika — Patrika (event dates) reveal animation
 * Writing effect for event lines, golden shimmer on border after reveal.
 */
(function () {
  'use strict';

  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = () => {
    const section = document.getElementById('patrika');
    if (!section) return;

    // Reduced motion: show everything immediately
    if (prefersReducedMotion()) {
      showAll(section);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          revealPatrika(section);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
  };

  const revealPatrika = (section) => {
    const card = section.querySelector('.patrika-card');
    const heading = section.querySelector('.patrika-card__heading');
    const events = section.querySelectorAll('.timeline__event');

    // Step 1: Card fades in and scales
    if (card) {
      card.classList.add('patrika-reveal');
    }

    // Step 2: Heading appears first
    if (heading) {
      heading.classList.add('visible');
    }

    // Step 3: Each event line reveals with writing effect, staggered 400ms
    events.forEach((event, i) => {
      setTimeout(() => {
        event.classList.add('writing-reveal');
      }, 600 + i * 400); // 600ms initial delay for heading to settle
    });

    // Step 4: Golden shimmer on border after all lines revealed
    const totalDelay = 600 + events.length * 400 + 600; // extra 600ms for last animation
    setTimeout(() => {
      if (card) {
        card.classList.add('patrika-shimmer');
      }
    }, totalDelay);
  };

  const showAll = (section) => {
    const card = section.querySelector('.patrika-card');
    const heading = section.querySelector('.patrika-card__heading');
    const events = section.querySelectorAll('.timeline__event');

    if (card) {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
    }
    if (heading) heading.classList.add('visible');
    events.forEach((event) => {
      event.classList.add('writing-reveal');
      event.style.maxWidth = '100%';
      event.style.opacity = '1';
    });
  };

  window.VivahPatrika = { init };
})();
