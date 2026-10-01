/**
 * Grand Royale Pizza SMS sign-up endpoint (Google Apps Script web app).
 * The bound Google Sheet is the SMS list. See backend/README.md to deploy.
 *
 * POST (application/x-www-form-urlencoded): phone=<+1XXXXXXXXXX>&consent=yes&source=landing&ts=<ISO>
 * Appends [timestamp, phone, consent, source] once per phone; repeats return ok without a new row.
 */

var HEADER = ['timestamp', 'phone', 'consent', 'source'];
var SERVICE = 'grand-royale-signup';

function doGet() {
  return json_({ ok: true, service: SERVICE });
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  var phone = String(p.phone || '').trim();
  var consent = String(p.consent || '').trim();
  var source = String(p.source || 'landing').trim().slice(0, 64);

  if (!/^\+1\d{10}$/.test(phone)) return json_({ ok: false, error: 'invalid_phone' });
  if (consent !== 'yes') return json_({ ok: false, error: 'consent_required' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
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
