/**
 * VivahForms — Form handling for photo requests and contact form
 * Includes modal management, validation, and submission.
 */
(function () {
  'use strict';

  const GOOGLE_SHEET_URL = '__PLACEHOLDER_GSHEET_URL__';
  let isSubmitting = false;

  const init = () => {
    initPhotoModal();
    initPhotoForm();
    initContactForm();
  };

  // ─── Photo Request Modal ───────────────────────────────────────────

  const initPhotoModal = () => {
    const modal = document.getElementById('photo-request-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.modal__overlay');
    const closeBtn = document.getElementById('modal-close');
    const openBtns = document.querySelectorAll('.photo-request-btn');

    // Open modal buttons
    openBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const eventType = btn.dataset.event || '';
        const hiddenField = document.getElementById('photo-event');
        if (hiddenField) hiddenField.value = eventType;

        openModal(modal);
      });
    });

    // Close: X button
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }

    // Close: backdrop click
    if (overlay) {
      overlay.addEventListener('click', () => closeModal(modal));
    }

    // Close: Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hasAttribute('aria-hidden')) {
        closeModal(modal);
      }
      // Also check if aria-hidden is 'false'
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal(modal);
      }
    });
  };

  const openModal = (modal) => {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('modal--open');
    document.body.style.overflow = 'hidden';

    // Focus the first input
    const firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  };

  const closeModal = (modal) => {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('modal--open');
    document.body.style.overflow = '';

    // Reset success message
    const successDiv = document.getElementById('photo-request-success');
    if (successDiv) successDiv.hidden = true;
  };

  // ─── Photo Request Form ────────────────────────────────────────────

  const initPhotoForm = () => {
    const form = document.getElementById('photo-request-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const name = form.querySelector('#photo-name')?.value?.trim();
      const email = form.querySelector('#photo-email')?.value?.trim();
      const phone = form.querySelector('#photo-phone')?.value?.trim();

      // Validate: name required, email or phone required
      if (!name) {
        showError(form, 'कृपया अपना नाम दर्ज करें');
        return;
      }
      if (!email && !phone) {
        showError(form, 'कृपया ईमेल या फ़ोन नंबर दर्ज करें');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      await submitForm(form, submitBtn, () => {
        // On success
        const successDiv = document.getElementById('photo-request-success');
        if (successDiv) successDiv.hidden = false;

        const modal = document.getElementById('photo-request-modal');
        setTimeout(() => {
          if (modal) closeModal(modal);
          form.reset();
        }, 2000);
      });
    });
  };

  // ─── Contact Form ─────────────────────────────────────────────────

  const initContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      const name = form.querySelector('#contact-name')?.value?.trim();
      const email = form.querySelector('#contact-email')?.value?.trim();
      const phone = form.querySelector('#contact-phone')?.value?.trim();

      // Validate: name required, email or phone required
      if (!name) {
        showError(form, 'कृपया अपना नाम दर्ज करें');
        return;
      }
      if (!email && !phone) {
        showError(form, 'कृपया ईमेल या फ़ोन नंबर दर्ज करें');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      await submitForm(form, submitBtn, () => {
        // On success: show message, trigger petal fall, reset form
        const successDiv = document.getElementById('contact-success');
        if (successDiv) successDiv.hidden = false;

        if (window.VivahParticles?.petalFall) {
          window.VivahParticles.petalFall();
        }

        form.reset();

        // Hide success message after 5s
        setTimeout(() => {
          if (successDiv) successDiv.hidden = true;
        }, 5000);
      });
    });
  };

  // ─── Shared Helpers ───────────────────────────────────────────────

  const submitForm = async (form, submitBtn, onSuccess) => {
    isSubmitting = true;
    const originalText = submitBtn?.textContent;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'भेज रहे हैं...';
    }

    // Clear previous errors
    clearError(form);

    const formData = new FormData(form);

    try {
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Network error');

      if (onSuccess) onSuccess();
    } catch (err) {
      showError(form, 'भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  };

  const showError = (form, message) => {
    clearError(form);
    const errorEl = document.createElement('p');
    errorEl.className = 'form-error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'color:#C41E3A;text-align:center;margin-top:0.5rem;font-size:0.9rem;';

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.parentNode.insertBefore(errorEl, submitBtn);
    } else {
      form.appendChild(errorEl);
    }
  };

  const clearError = (form) => {
    const existing = form.querySelector('.form-error');
    if (existing) existing.remove();
  };

  window.VivahForms = { init };
})();
