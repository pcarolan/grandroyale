import { normalizePhone } from './phone.js';

window.GR = Object.assign(window.GR || {}, { normalizePhone });

const MSG = {
  phone: 'Enter a 10-digit US number, like (231) 555-0199.',
  consent: 'Check the box to agree to texts, then try again.',
  offline: "Sign-up isn't connected yet. Try again soon.",
  network: "That didn't go through. Check your connection and try again.",
};

function pretty(e164) {
  const d = e164.slice(2);
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const form = document.getElementById('signup');
const input = document.getElementById('phone');
const consent = document.getElementById('consent');
const error = document.getElementById('signup-error');
const button = form && form.querySelector('button[type="submit"]');
const success = document.getElementById('signup-success');

function showError(text, field) {
  error.textContent = text;
  error.hidden = false;
  input.setAttribute('aria-invalid', field === input ? 'true' : 'false');
  if (field) field.focus();
}

function clearError() {
  error.textContent = '';
  error.hidden = true;
  input.removeAttribute('aria-invalid');
}

if (form) {
  input.addEventListener('input', () => { if (!error.hidden) clearError(); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearError();

    const phone = normalizePhone(input.value);
    if (!phone) return showError(MSG.phone, input);
    if (!consent.checked) return showError(MSG.consent, consent);

    const endpoint = (window.GR_CONFIG && window.GR_CONFIG.FORM_ENDPOINT) || '';
    if (!endpoint) return showError(MSG.offline, input);

    const body = new URLSearchParams({
      phone,
      consent: 'yes',
      source: 'landing',
      ts: new Date().toISOString(),
    });

    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      // Apps Script web apps send no CORS headers: an opaque, resolved response counts as success.
      await fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
    } catch (err) {
      button.disabled = false;
      button.textContent = label;
      return showError(MSG.network, input);
    }

    document.getElementById('signup-number').textContent = pretty(phone);
    form.hidden = true;
    success.hidden = false;
    success.querySelector('h3').focus();
  });
}
