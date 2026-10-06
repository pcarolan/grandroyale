import { normalizePhone } from './phone.js';

window.GR = Object.assign(window.GR || {}, { normalizePhone });

const MSG = {
  phone: "That's not ten digits. Try again, we'll wait.",
  offline: "Our phone isn't plugged in yet. Come back in a day.",
  network: "Didn't go through. Bad signal or bad luck; try once more.",
};

function pretty(e164) {
  const d = e164.slice(2);
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const form = document.getElementById('signup');
const input = document.getElementById('phone');
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

    const endpoint = (window.GR_CONFIG && window.GR_CONFIG.FORM_ENDPOINT) || '';
    if (!endpoint) return showError(MSG.offline, input);

    const body = new URLSearchParams({
      phone,
      consent: 'yes', // submitting a number to get the text is the opt-in
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
