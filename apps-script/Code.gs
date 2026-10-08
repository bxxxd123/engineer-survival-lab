var SHARED_SECRET = 'REPLACE_WITH_YOUR_OWN_SECRET';
var RESPONSES_SHEET_NAME = '問卷回答';
var LEADS_SHEET_NAME = '名單';

// 欄位依玩家填答的順序排列。分頁不存在會自動建立，第一列標題也會自動寫好。
var RESPONSES_HEADERS = [
  '時間', '暱稱', 'Email',
  '職業角色', '年資', '工作生存狀態', '薪資', '獵頭反應', '跳槽門檻',
  '職涯卡點', 'AI使用頻率', 'AI夥伴', 'AI最有感', 'AI最怕', '2027目標',
  '人設', '生存指數', '意見回饋', '紀錄編號'
];
var LEADS_HEADERS = [
  '時間', '暱稱', 'Email', '個資告知同意', '告知版本', '同意時間',
  '行銷同意', '行銷同意時間', '建檔時間', '人設', '生存指數'
];
var FEEDBACK_COLUMN = RESPONSES_HEADERS.indexOf('意見回饋') + 1;
var PLAY_ID_COLUMN = RESPONSES_HEADERS.indexOf('紀錄編號') + 1;

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
      writeFeedback(ss, body.payload || {});
    } else {
      return respond({ status: 'error', message: 'unknown sheet' });
    }

    return respond({ status: 'ok' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

// 手動執行一次可以先把兩個分頁和標題建好（不執行也沒關係，第一筆資料進來時會自動建立）。
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  getSheetWithHeaders(ss, RESPONSES_SHEET_NAME, RESPONSES_HEADERS);
  getSheetWithHeaders(ss, LEADS_SHEET_NAME, LEADS_HEADERS);
}

// Returns the tab, creating it and/or writing the header row when needed.
// If the first row already holds something else (old data), the headers are
// inserted above it instead of overwriting it.
function getSheetWithHeaders(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var matches = headers.every(function (h, i) { return firstRow[i] === h; });
  if (!matches) {
    if (sheet.getLastRow() > 0 && firstRow.some(function (v) { return v !== ''; })) {
      sheet.insertRowBefore(1);
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function appendResponse(ss, payload) {
  var sheet = getSheetWithHeaders(ss, RESPONSES_SHEET_NAME, RESPONSES_HEADERS);
  sheet.appendRow([
    new Date(),
    safeCell(payload.nickname),
    safeCell(payload.email),
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
    '',
    safeCell(payload.playId)
  ]);
}

// 留言填回同一次闖關的那一列；找不到（例如作答當時沒送成功）就另起一列，留言不會遺失。
function writeFeedback(ss, payload) {
  var sheet = getSheetWithHeaders(ss, RESPONSES_SHEET_NAME, RESPONSES_HEADERS);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var row = findRowByPlayId(sheet, payload.playId);
    if (row) {
      sheet.getRange(row, FEEDBACK_COLUMN).setValue(safeCell(payload.message));
      return;
    }
    var newRow = RESPONSES_HEADERS.map(function () { return ''; });
    newRow[0] = new Date();
    newRow[1] = safeCell(payload.nickname);
    newRow[2] = safeCell(payload.email);
    newRow[RESPONSES_HEADERS.indexOf('人設')] = safeCell(payload.persona);
    newRow[FEEDBACK_COLUMN - 1] = safeCell(payload.message);
    newRow[PLAY_ID_COLUMN - 1] = safeCell(payload.playId);
    sheet.appendRow(newRow);
  } finally {
    lock.releaseLock();
  }
}

function findRowByPlayId(sheet, playId) {
  if (!playId || sheet.getLastRow() < 2) return 0;
  var cell = sheet.getRange(2, PLAY_ID_COLUMN, sheet.getLastRow() - 1, 1)
    .createTextFinder(String(playId))
    .matchEntireCell(true)
    .findNext();
  return cell ? cell.getRow() : 0;
}

function appendLead(ss, payload) {
  var sheet = getSheetWithHeaders(ss, LEADS_SHEET_NAME, LEADS_HEADERS);
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

// Google Sheets treats a cell starting with =, +, -, or @ as a formula.
// Anyone can POST directly to this endpoint (bypassing the quiz UI), so a
// leading apostrophe forces every text field to be stored as plain text and
// blocks formula-injection payloads (e.g. a fake comment like
// =HYPERLINK("http://evil","click") turning into a clickable link later).
function safeCell(value) {
  var str = String(value || '');
  return /^[=+\-@]/.test(str) ? "'" + str : str;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
