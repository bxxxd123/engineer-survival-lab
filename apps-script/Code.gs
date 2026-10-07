var SHARED_SECRET = 'REPLACE_WITH_YOUR_OWN_SECRET';
var RESPONSES_SHEET_NAME = '問卷回答';
var LEADS_SHEET_NAME = '名單';
var FEEDBACK_SHEET_NAME = '意見回饋';

function doGet(e) {
  return ContentService.createTextOutput('工程師生存實驗室後端運作中 ✅').setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    if (body.secret !== SHARED_SECRET) {
      return respond({ status: 'error', message: 'invalid secret' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (body.sheet === 'responses') {
      appendResponse(ss, body.payload || {});
    } else if (body.sheet === 'leads') {
      appendLead(ss, body.payload || {});
    } else if (body.sheet === 'feedback') {
      appendFeedback(ss, body.payload || {});
    } else {
      return respond({ status: 'error', message: 'unknown sheet' });
    }

    return respond({ status: 'ok' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

function appendResponse(ss, payload) {
  var sheet = ss.getSheetByName(RESPONSES_SHEET_NAME);
  if (!sheet) {
    throw new Error('找不到分頁：' + RESPONSES_SHEET_NAME);
  }
  sheet.appendRow([
    new Date(),
    safeCell(payload.role),
    safeCell(payload.experience),
    safeCell(payload.satisfaction),
    safeCell(payload.salary),
    safeCell(payload.headhunterReaction),
    safeCell(payload.jumpThreshold),
    safeCell(payload.careerBug),
    safeCell(payload.aiFrequency),
    safeCell(payload.aiTools),
    safeCell(payload.aiImpact),
    safeCell(payload.aiFear),
    safeCell(payload.goal2027),
    safeCell(payload.persona),
    payload.survivalIndex || '',
    safeCell(payload.openFeedback)
  ]);
}

function appendLead(ss, payload) {
  var sheet = ss.getSheetByName(LEADS_SHEET_NAME);
  if (!sheet) {
    throw new Error('找不到分頁：' + LEADS_SHEET_NAME);
  }
  sheet.appendRow([
    new Date(),
    safeCell(payload.nickname),
    safeCell(payload.email),
    safeCell(payload.privacyNoticeAccepted),
    safeCell(payload.privacyNoticeVersion),
    safeCell(payload.privacyNoticeAcceptedAt),
    safeCell(payload.marketingOptIn),
    safeCell(payload.marketingOptInAt),
    safeCell(payload.createdAt),
    safeCell(payload.persona),
    payload.survivalIndex || ''
  ]);
}

function appendFeedback(ss, payload) {
  var sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);
  if (!sheet) {
    throw new Error('找不到分頁：' + FEEDBACK_SHEET_NAME);
  }
  sheet.appendRow([
    new Date(),
    safeCell(payload.nickname),
    safeCell(payload.email),
    safeCell(payload.persona),
    safeCell(payload.message)
  ]);
}

// Google Sheets treats a cell starting with =, +, -, or @ as a formula.
// Anyone can POST directly to this endpoint (bypassing the quiz UI), so a
// leading apostrophe forces every text field to be stored as plain text and
// blocks formula-injection payloads (e.g. a fake "openFeedback" answer like
// =HYPERLINK("http://evil","click") turning into a clickable link later).
function safeCell(value) {
  var str = String(value || '');
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
