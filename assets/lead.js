// The bar owner sign-up on /cook (GR-697). Posts to the same Apps Script as the SMS card, with form=lead;
// Code.gs writes one row per sign-up to the Sheet's "leads" tab, Lead Status "New".
import { normalizePhone } from './phone.js';

const MSG = {
  last: "We need a last name. Just the last one's fine.",
  email: "That email doesn't look right. One more try.",
  phone: "That's not ten digits. Leave it empty if you'd rather.",
  offline: "Our phone isn't plugged in yet. Come back in a day.",
  network: "Didn't go through. Bad signal or bad luck; try once more.",
};
const FIELDS = ['first_name', 'last_name', 'title', 'phone', 'email', 'company', 'address', 'suite', 'city', 'zip', 'country', 'state',
  'pizzas_per_day', 'business_type', 'distributor', 'tasted', 'heard', 'lead_source', 'website'];

export const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

const form = document.getElementById('lead');
const error = document.getElementById('lead-error');
const success = document.getElementById('lead-success');

// lead source: "cook-page", or whatever ?src= / utm_source the link carried (a flyer QR code, an email)
const src = new URLSearchParams(location.search);
const tag = (src.get('src') || src.get('utm_source') || '').replace(/[^\w.-]/g, '').slice(0, 40);
if (form && tag) form.elements.lead_source.value = `cook-page:${tag}`;

function showError(text, field) {
  error.textContent = text;
  error.hidden = false;
  for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
  if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
}

if (form) {
  form.addEventListener('input', () => { if (!error.hidden) { error.hidden = true; error.textContent = ''; } });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const el = form.elements;
    const val = (k) => String(el[k].value || '').trim();

    if (!val('last_name')) return showError(MSG.last, el.last_name);
    if (!validEmail(val('email'))) return showError(MSG.email, el.email);
    let phone = '';
    if (val('phone')) {
      phone = normalizePhone(val('phone'));
      if (!phone) return showError(MSG.phone, el.phone);
    }

    const endpoint = (window.GR_CONFIG && window.GR_CONFIG.FORM_ENDPOINT) || '';
    if (!endpoint) return showError(MSG.offline);

    const body = new URLSearchParams({ form: 'lead', ts: new Date().toISOString() });
    for (const k of FIELDS) body.set(k, k === 'phone' ? phone : val(k));

    const button = form.querySelector('button[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    try {
      // Apps Script web apps send no CORS headers: an opaque, resolved response counts as success.
      await fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: body.toString() });
    } catch (err) {
      button.disabled = false;
      button.textContent = label;
      return showError(MSG.network);
    }

    document.getElementById('lead-email').textContent = val('email');
    form.hidden = true;
    success.hidden = false;
    success.querySelector('h2').focus();
  });
}
