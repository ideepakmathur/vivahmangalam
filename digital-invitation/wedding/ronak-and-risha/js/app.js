/**
 * VivahApp — Main controller for the wedding invitation site
 * Initializes all modules, handles language gate, view toggle, and scroll reveals.
 */
(function () {
  'use strict';

  const LANG_KEY = 'vivah-lang';
  let currentView = 'story';
  let gateDismissed = false;

  const init = () => {
    if (window.VivahRibbon?.init) window.VivahRibbon.init();
    if (window.VivahTimeline?.init) window.VivahTimeline.init();
    if (window.VivahPatrika?.init) window.VivahPatrika.init();
    if (window.VivahForms?.init) window.VivahForms.init();

    setupRevealObserver();
    setupLanguageGate();
    setupSmoothScroll();
  };

  // ─── Intersection Observer for .reveal elements ────────────────────

  const setupRevealObserver = () => {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.2 }
    );

    revealEls.forEach((el) => observer.observe(el));
  };

  // ─── Language Gate ─────────────────────────────────────────────────

  const setupLanguageGate = () => {
    const gate = document.getElementById('language-gate');
    const mainContent = document.getElementById('main-content');
    const viewToggle = document.getElementById('view-toggle');

    if (!gate || !mainContent) return;

    if (localStorage.getItem(LANG_KEY)) {
      showMainContent(gate, mainContent, viewToggle);
      return;
    }

    const dismissGate = () => {
      if (gateDismissed) return;
      gateDismissed = true;
      gate.classList.add('language-gate--exiting');
      setTimeout(() => {
        showMainContent(gate, mainContent, viewToggle);
      }, 500);
    };

    gate.addEventListener('click', (e) => {
      const btn = e.target.closest('#btn-hindi, #btn-english');
      if (!btn) return;
      const lang = btn.id === 'btn-hindi' ? 'hi' : 'en';
      if (window.VivahLanguage) window.VivahLanguage.setLanguage(lang);
      dismissGate();
    });

    window.addEventListener('vivah:languagechange', () => {
      dismissGate();
    });
  };

  const showMainContent = (gate, mainContent, viewToggle) => {
    gate.style.display = 'none';
    gate.setAttribute('aria-hidden', 'true');
    mainContent.classList.add('main-content--visible');
    mainContent.setAttribute('aria-hidden', 'false');

    // Show view toggle
    if (viewToggle) {
      viewToggle.style.display = '';
      setupViewToggle(viewToggle);
    }
  };

  // ─── View Toggle (Story vs Card) ──────────────────────────────────

  const setupViewToggle = (toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      if (currentView === 'story') {
        switchToCardView(toggleBtn);
      } else {
        switchToStoryView(toggleBtn);
      }
    });
  };

  const switchToCardView = (toggleBtn) => {
    currentView = 'card';
    toggleBtn.textContent = window.VivahLanguage ? window.VivahLanguage.t('viewToggle.story') : 'कहानी दृश्य';

    // Hide past event sections
    const pastSections = ['roka', 'engagement', 'brahman'];
    pastSections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        section.classList.add('section--hidden');
        section.setAttribute('aria-hidden', 'true');
      }
    });

    // Add card layout class to body
    document.body.classList.add('view--card');
    document.body.classList.remove('view--story');
  };

  const switchToStoryView = (toggleBtn) => {
    currentView = 'story';
    toggleBtn.textContent = window.VivahLanguage ? window.VivahLanguage.t('viewToggle.card') : 'कार्ड दृश्य';

    // Show all sections
    const pastSections = ['roka', 'engagement', 'brahman'];
    pastSections.forEach((id) => {
      const section = document.getElementById(id);
      if (section) {
        section.classList.remove('section--hidden');
        section.removeAttribute('aria-hidden');
      }
    });

    // Remove card layout class from body
    document.body.classList.remove('view--card');
    document.body.classList.add('view--story');
  };

  // ─── Smooth Scroll for Internal Links ─────────────────────────────

  const setupSmoothScroll = () => {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // ─── Bootstrap ────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', init);

  window.VivahApp = {
    switchToCardView: () => {
      const btn = document.getElementById('view-toggle');
      if (btn && currentView === 'story') switchToCardView(btn);
    },
    switchToStoryView: () => {
      const btn = document.getElementById('view-toggle');
      if (btn && currentView === 'card') switchToStoryView(btn);
    },
    get currentView() {
      return currentView;
    },
  };
})();
