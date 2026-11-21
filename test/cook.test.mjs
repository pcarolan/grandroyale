// GR-697: the bar owner page at /cook, and the Apps Script writing its sign-ups to the "leads" tab.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');
const pages = await import('../tools/pages.mjs');

test('cook/index.html is current (node build.mjs) and on the same wall', () => {
  assert.ok(existsSync(new URL('cook/index.html', root)));
  const p = read('cook/index.html');
  assert.equal(p, pages.cookHTML());
  assert.ok(p.includes(pages.WALL_CSS));
  assert.doesNotMatch(p, /<header\b|<nav\b/i);
  assert.doesNotMatch(p, /\bhot\b|wood|\byr\b/i, 'house words');
  assert.doesNotMatch(p, /display:\s*grid|flex-wrap|fonts\.googleapis|@font-face/);
  assert.doesNotMatch(p, /donna/i, 'our words, not theirs');
});

test('the offer is a free pop up, never a tasting', () => {
  const p = read('cook/index.html');
  assert.match(p, /free <em>pop up/);
  assert.match(p, /one sheet of paper/);
  assert.doesNotMatch(p, /tasting/i);
});

test('the form has the 13 fields from GR-697, and only last name and email are required', () => {
  const p = read('cook/index.html');
  const names = ['first_name', 'last_name', 'title', 'phone', 'email', 'company', 'address', 'suite', 'city', 'zip', 'country', 'state',
    'pizzas_per_day', 'business_type', 'distributor', 'tasted', 'heard'];
  for (const n of names) assert.match(p, new RegExp(`name="${n}"`), n);
  assert.doesNotMatch(p, /oven_type|oven_color|pizza_style|lead_status/i, 'removed by Patrick');
  const required = [...p.matchAll(/<(?:input|select)[^>]*\brequired\b[^>]*>/g)].map((m) => m[0].match(/name="([^"]+)"/)[1]);
  assert.deepEqual(required.sort(), ['email', 'last_name']);
  assert.match(p, /<input type="hidden" id="lead_source" name="lead_source" value="cook-page">/);
  for (const s of ['Michigan', 'Wyoming']) assert.ok(pages.LEAD.states.includes(s));
  assert.equal(pages.LEAD.states.length, 51);
  assert.match(p, /src="\.\.\/assets\/config\.js"/);
  assert.match(p, /src="\.\.\/assets\/lead\.js"/);
});

test('lead.js posts form=lead to the same endpoint, with every field', () => {
  const js = read('assets/lead.js');
  assert.match(js, /form: 'lead'/);
  assert.match(js, /GR_CONFIG\.FORM_ENDPOINT/);
  assert.match(js, /mode: 'no-cors'/);
  for (const n of ['first_name', 'last_name', 'company', 'distributor', 'heard', 'lead_source', 'website']) assert.match(js, new RegExp(`'${n}'`));
});

// ---- Code.gs, run against a fake Spreadsheet ----
function fakeSheet(name) {
  const rows = [];
  return { name, rows, frozen: 0,
    getLastRow: () => rows.length,
    appendRow(r) { rows.push([...r]); },
    setFrozenRows(n) { this.frozen = n; },
    getRange(r, c, nr = 1, nc = 1) {
      return {
        setNumberFormat() { return this; },
        getDisplayValues: () => rows.slice(r - 1, r - 1 + nr).map((row) => row.slice(c - 1, c - 1 + nc).map(String)),
        setValues(vals) { vals.forEach((v, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; [...v].forEach((x, j) => { rows[r - 1 + i][c - 1 + j] = x; }); }); },
      };
    },
  };
}
function gs(sheets) {
  const ss = { getSheetByName: (n) => sheets.find((s) => s.name === n) || null, getSheets: () => sheets,
    insertSheet(n, i) { const s = fakeSheet(n); sheets.splice(i, 0, s); return s; } };
  const ctx = {
    SpreadsheetApp: { getActiveSpreadsheet: () => ss },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (t) => ({ setMimeType: () => JSON.parse(t) }) },
  };
  vm.createContext(ctx);
  vm.runInContext(read('backend/Code.gs'), ctx);
  return (parameter) => ctx.doPost({ parameter });
}

test('Code.gs: a lead goes to a new "leads" tab with status New; the SMS list stays in the first tab', () => {
  const sms = fakeSheet('Sheet1'), sheets = [sms];
  const post = gs(sheets);
  assert.deepEqual(post({ phone: '+12315550199', consent: 'yes' }), { ok: true });
  assert.deepEqual(post({ form: 'lead', last_name: 'Webb', email: 'todd@example.com', company: '=HYPERLINK("x")', phone: '+12315550100', heard: 'Peer Referral' }), { ok: true });
  assert.deepEqual(post({ form: 'lead', last_name: 'Carolan', email: 'pat@example.com' }), { ok: true });
  assert.deepEqual(post({ phone: '+12315550123', consent: 'yes' }), { ok: true });

  assert.equal(sheets.length, 2);
  const leads = sheets[1];
  assert.equal(leads.name, 'leads');
  assert.deepEqual(leads.rows[0].slice(0, 4), ['timestamp', 'lead_status', 'first_name', 'last_name']);
  assert.equal(leads.rows.length, 3);
  const h = leads.rows[0], row = (i, k) => leads.rows[i][h.indexOf(k)];
  assert.equal(row(1, 'lead_status'), 'New');
  assert.equal(row(1, 'last_name'), 'Webb');
  assert.equal(row(1, 'phone'), '+12315550100');
  assert.equal(row(1, 'company'), `'=HYPERLINK("x")`, 'never a formula');
  assert.equal(row(1, 'heard_about_us'), 'Peer Referral');
  assert.equal(row(1, 'lead_source'), 'cook-page');
  assert.equal(row(2, 'last_name'), 'Carolan');
  assert.equal(Object.prototype.toString.call(row(1, 'timestamp')), '[object Date]');

  assert.deepEqual(sms.rows.map((r) => r[1]), ['phone', '+12315550199', '+12315550123']);
});

test('Code.gs: leads need a last name and an email; the honeypot writes nothing', () => {
  const sheets = [fakeSheet('Sheet1')];
  const post = gs(sheets);
  assert.deepEqual(post({ form: 'lead', email: 'a@b.co' }), { ok: false, error: 'last_name_required' });
  assert.deepEqual(post({ form: 'lead', last_name: 'X', email: 'nope' }), { ok: false, error: 'invalid_email' });
  assert.deepEqual(post({ form: 'lead', last_name: 'X', email: 'a@b.co', phone: '555' }), { ok: false, error: 'invalid_phone' });
  assert.deepEqual(post({ form: 'lead', last_name: 'X', email: 'a@b.co', website: 'spam.biz' }), { ok: true });
  assert.equal(sheets.length, 1, 'no leads tab, no row');
  assert.doesNotMatch(read('backend/Code.gs'), /getActiveSheet/, 'each form names its own tab');
});
