/**
 * VivahLanguage — i18n module for the wedding invitation
 * Loads JSON translation files, applies them to DOM elements with data-i18n attributes,
 * and provides a t() helper for programmatic lookups.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'vivah-lang';
  let currentLang = null;
  let translations = null;

  /**
   * Resolve a dot-path key against an object.
   * e.g. resolve(obj, 'splash.pullRibbon') => obj.splash.pullRibbon
   */
  const resolve = (obj, path) => {
    if (!obj || !path) return undefined;
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') return undefined;
      current = current[part];
    }
    return current;
  };

  /**
   * Fetch and cache a language JSON file.
   */
  const fetchTranslations = async (lang) => {
    const resp = await fetch(`i18n/${lang}.json`);
    if (!resp.ok) throw new Error(`Failed to load i18n/${lang}.json (${resp.status})`);
    return resp.json();
  };

  /**
   * Walk the DOM and apply translations to elements with data-i18n attributes.
   * Supports:
   *   data-i18n="key.path"           → sets textContent
   *   data-i18n-placeholder="key"     → sets placeholder attribute
   *   data-i18n-aria="key"            → sets aria-label attribute
   *   data-i18n-title="key"           → sets title attribute
   */
  const applyTranslations = (data) => {
    // textContent
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');

      // Special handling for timeline event dates: compose date + time
      const dateMatch = key.match(/^patrika\.events\.(\d+)\.date$/);
      if (dateMatch) {
        const idx = dateMatch[1];
        const dateVal = resolve(data, `patrika.events.${idx}.date`);
        const timeVal = resolve(data, `patrika.events.${idx}.time`);
        if (dateVal) {
          el.textContent = timeVal ? `${dateVal}, ${timeVal}` : dateVal;
        }
        return;
      }

      const value = resolve(data, key);
      if (value !== undefined && typeof value === 'string') {
        el.textContent = value;
      }
    });

    // placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      const value = resolve(data, key);
      if (value !== undefined && typeof value === 'string') {
        el.setAttribute('placeholder', value);
      }
    });

    // aria-label
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      const value = resolve(data, key);
      if (value !== undefined && typeof value === 'string') {
        el.setAttribute('aria-label', value);
      }
    });

    // title attribute
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      const value = resolve(data, key);
      if (value !== undefined && typeof value === 'string') {
        el.setAttribute('title', value);
      }
    });

    // Update <html lang> and dir
    const lang = data.lang || 'hi';
    const dir = data.dir || 'ltr';
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', dir);

    // Update document title
    if (data.meta && data.meta.title) {
      document.title = data.meta.title;
    }

    // Update meta description
    if (data.meta && data.meta.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', data.meta.description);
    }

    // Toggle lang-* body class for font switching
    document.body.classList.remove('lang-hi', 'lang-en', 'lang-gu');
    document.body.classList.add(`lang-${lang}`);
  };

  /**
   * Update the language gate to reflect available languages.
   * Hindi and English are active; Gujarati shows "coming soon".
   */
  const updateLanguageGate = (data) => {
    const gate = document.getElementById('language-gate');
    if (!gate) return;

    const cardsContainer = gate.querySelector('.language-gate__cards');
    if (!cardsContainer) return;

    // Rebuild language cards
    cardsContainer.innerHTML = '';

    // Hindi card — always active
    const hiCard = document.createElement('button');
    hiCard.className = 'language-card' + (currentLang === 'hi' ? ' language-card--active' : '');
    hiCard.id = 'btn-hindi';
    hiCard.setAttribute('aria-label', 'हिंदी में देखें');
    hiCard.innerHTML = '<span class="language-card__label">हिंदी</span>';
    hiCard.addEventListener('click', () => VivahLanguage.setLanguage('hi'));
    cardsContainer.appendChild(hiCard);

    // English card — active
    const enCard = document.createElement('button');
    enCard.className = 'language-card' + (currentLang === 'en' ? ' language-card--active' : '');
    enCard.id = 'btn-english';
    enCard.setAttribute('aria-label', 'View in English');
    enCard.innerHTML = '<span class="language-card__label">English</span>';
    enCard.addEventListener('click', () => VivahLanguage.setLanguage('en'));
    cardsContainer.appendChild(enCard);

    // Gujarati card — coming soon
    const guCard = document.createElement('div');
    guCard.className = 'language-card language-card--disabled';
    guCard.setAttribute('aria-disabled', 'true');
    guCard.innerHTML =
      '<span class="language-card__label">ગુજરાતી</span>' +
      '<span class="language-card__badge">' +
      (currentLang === 'en' ? 'Coming Soon' : 'जल्द आ रहा है') +
      '</span>';
    cardsContainer.appendChild(guCard);
  };

  /**
   * Set the active language, fetch translations, and apply them.
   * @param {string} lang - Language code ('hi', 'en', etc.)
   */
  const setLanguage = async (lang) => {
    try {
      const data = await fetchTranslations(lang);
      translations = data;
      currentLang = lang;
      localStorage.setItem(STORAGE_KEY, lang);
      applyTranslations(data);
      updateLanguageGate(data);

      // Dispatch event so other modules can react
      window.dispatchEvent(
        new CustomEvent('vivah:languagechange', { detail: { lang, translations: data } })
      );
    } catch (err) {
      console.error('[VivahLanguage] Failed to set language:', err);
    }
  };

  /**
   * Get a translation value by dot-path key.
   * @param {string} key - Dot-separated path (e.g. 'splash.pullRibbon')
   * @returns {*} The resolved value, or the key itself as fallback.
   */
  const t = (key) => {
    if (!translations) return key;
    const value = resolve(translations, key);
    return value !== undefined ? value : key;
  };

  /**
   * Get the current language code.
   * @returns {string|null}
   */
  const getLang = () => currentLang;

  /**
   * Initialize: read saved language from localStorage, default to 'hi'.
   */
  const init = () => {
    const savedLang = localStorage.getItem(STORAGE_KEY) || 'hi';
    setLanguage(savedLang);
  };

  // Auto-init on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', init);

  // Expose public API
  window.VivahLanguage = {
    setLanguage,
    t,
    getLang,
    init,
  };
})();
