/**
 * Grand Royale Pizza sign-up endpoint (Google Apps Script web app), bound to the "Grand Royale SMS list" Sheet.
 * Two forms post here, and each writes to its own tab by name. See backend/README.md to deploy.
 *
 * SMS card on the homepage (no `form`, or form=sms), into the first tab (or a tab named "sms" if there is one):
 *   phone=<+1XXXXXXXXXX>&consent=yes&source=landing&ts=<ISO>
 *   Appends [timestamp, phone, consent, source] once per phone; repeats return ok without a new row.
 *
 * Bar owner sign-up on /cook (form=lead), into the "leads" tab (made on the first sign-up if it isn't there):
 *   form=lead&last_name=...&email=...&first_name=...&title=...&phone=...&company=...&address=...&suite=...&city=...
 *   &zip=...&country=...&state=...&pizzas_per_day=...&business_type=...&distributor=...&tasted=...&heard=...
 *   &lead_source=...&website=<honeypot, must be empty>
 *   Appends one row per sign-up, Lead Status "New". Only last_name and email are required.
 */

var HEADER = ['timestamp', 'phone', 'consent', 'source'];
var SERVICE = 'grand-royale-signup';
var SMS_TAB = 'sms';      // optional: if no tab has this name, the SMS list stays in the first tab, as before
var LEADS_TAB = 'leads';

// [sheet column header, form field]; timestamp and status are filled in here
var LEAD_FIELDS = [
  ['first_name', 'first_name'], ['last_name', 'last_name'], ['title', 'title'], ['phone', 'phone'], ['email', 'email'],
  ['company', 'company'], ['address', 'address'], ['suite', 'suite'], ['city', 'city'], ['zip', 'zip'],
  ['country', 'country'], ['state', 'state'], ['pizzas_per_day', 'pizzas_per_day'], ['business_type', 'business_type'],
  ['current_distributor', 'distributor'], ['tasted_our_pizza', 'tasted'], ['heard_about_us', 'heard'], ['lead_source', 'lead_source']
];
var LEAD_HEADER = ['timestamp', 'lead_status'].concat(LEAD_FIELDS.map(function (f) { return f[0]; }));

function doGet() {
  return json_({ ok: true, service: SERVICE });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  if (String(p.form || '').trim() === 'lead') return lead_(p);
  return sms_(p);
}

function sms_(p) {
  var phone = String(p.phone || '').trim();
  var consent = String(p.consent || '').trim();
  var source = String(p.source || 'landing').trim().slice(0, 64);

  if (!/^\+1\d{10}$/.test(phone)) return json_({ ok: false, error: 'invalid_phone' });
  if (consent !== 'yes') return json_({ ok: false, error: 'consent_required' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SMS_TAB) || ss.getSheets()[0];
    ensureHeader_(sheet);

    var last = sheet.getLastRow();
    if (last > 1) {
      var phones = sheet.getRange(2, 2, last - 1, 1).getDisplayValues();
      for (var i = 0; i < phones.length; i++) {
        if (String(phones[i][0]).trim() === phone) return json_({ ok: true, duplicate: true });
      }
    }

    var row = last + 1;
    sheet.getRange(row, 2).setNumberFormat('@'); // keep "+1..." as text, not a number or formula
    sheet.getRange(row, 1, 1, 4).setValues([[new Date(), phone, consent, source]]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function lead_(p) {
  if (String(p.website || '').trim()) return json_({ ok: true }); // the honeypot: a bot filled the hidden field

  var v = {};
  for (var i = 0; i < LEAD_FIELDS.length; i++) {
    var k = LEAD_FIELDS[i][1];
    v[k] = String(p[k] || '').replace(/\s+/g, ' ').trim().slice(0, 200);
    if (k !== 'phone' && /^[=+\-@]/.test(v[k])) v[k] = "'" + v[k]; // never a formula
  }
  if (!v.lead_source) v.lead_source = 'cook-page';
  if (!v.last_name) return json_({ ok: false, error: 'last_name_required' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email)) return json_({ ok: false, error: 'invalid_email' });
  if (v.phone && !/^\+1\d{10}$/.test(v.phone)) return json_({ ok: false, error: 'invalid_phone' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LEADS_TAB) || ss.insertSheet(LEADS_TAB, ss.getSheets().length);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(LEAD_HEADER);
      sheet.setFrozenRows(1);
    }
    var row = sheet.getLastRow() + 1;
    var values = [new Date(), 'New'].concat(LEAD_FIELDS.map(function (f) { return v[f[1]]; }));
    sheet.getRange(row, 2, 1, values.length - 1).setNumberFormat('@'); // stored as typed text: no numbers, dates or formulas
    sheet.getRange(row, 1, 1, values.length).setValues([values]);
    return json_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
    sheet.getRange('B:B').setNumberFormat('@');
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
