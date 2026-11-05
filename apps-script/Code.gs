var SHARED_SECRET = 'REPLACE_WITH_YOUR_OWN_SECRET';
var RESPONSES_SHEET_NAME = '問卷回答';
var LEADS_SHEET_NAME = '名單';
var REDEEM_SHEET_NAME = '抽獎兌換';

// 欄位依玩家填答的順序排列。分頁不存在會自動建立，第一列標題也會自動寫好。
var RESPONSES_HEADERS = [
  '時間', '暱稱', 'Email',
  '職業角色', '年資', '工作生存狀態', '薪資', '獵頭反應', '跳槽門檻',
  '職涯卡點', 'AI使用頻率', 'AI夥伴', 'AI課金', 'AI最怕', '2027目標',
  '人設', '生存指數', '意見回饋', '紀錄編號'
];
var LEADS_HEADERS = [
  '時間', '暱稱', 'Email', '個資告知同意', '告知版本', '同意時間',
  '行銷同意', '行銷同意時間', '建檔時間', '人設', '生存指數'
];
// 抽獎券兌換：一個 Email 一列，用來防止同一個 Email 重複兌換
var REDEEM_HEADERS = ['兌換時間', '暱稱', 'Email', '紀錄編號'];
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
    } else if (body.sheet === 'redeemCheck') {
      return respond(checkRedeem(ss, body.payload || {}));
    } else if (body.sheet === 'redeem') {
      return respond(redeemTicket(ss, body.payload || {}));
    } else {
      return respond({ status: 'error', message: 'unknown sheet' });
    }

    return respond({ status: 'ok' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

// 手動執行一次可以先把三個分頁和標題建好（不執行也沒關係，第一筆資料進來時會自動建立）。
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  getSheetWithHeaders(ss, RESPONSES_SHEET_NAME, RESPONSES_HEADERS);
  getSheetWithHeaders(ss, LEADS_SHEET_NAME, LEADS_HEADERS);
  getSheetWithHeaders(ss, REDEEM_SHEET_NAME, REDEEM_HEADERS);
}

// Returns the tab, creating it and/or writing the header row when needed.
// If the first row already holds something else (old data), the headers are
// inserted above it instead of overwriting it.
function getSheetWithHeaders(ss, name, headers) {
  var sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  var firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  var matches = headers.every(function (h, i) { return firstRow[i] === h; });
  if (!matches) {
    // 第一列是舊版標題（例如欄名改過）就直接覆蓋；是資料才往上插一列標題
    var isOldHeader = firstRow[0] === headers[0];
    if (!isOldHeader && sheet.getLastRow() > 0 && firstRow.some(function (v) { return v !== ''; })) {
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
    safeCell(payload.aiSpend),
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

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function formatRedeemTime(date) {
  return Utilities.formatDate(date, 'Asia/Taipei', 'MM/dd HH:mm');
}

// 回傳這個 Email 的兌換時間；沒兌換過回傳空字串
function findRedeemTime(sheet, email) {
  if (!email || sheet.getLastRow() < 2) return '';
  var cell = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1)
    .createTextFinder(email)
    .matchEntireCell(true)
    .matchCase(false)
    .findNext();
  if (!cell) return '';
  var when = sheet.getRange(cell.getRow(), 1).getValue();
  return when instanceof Date ? formatRedeemTime(when) : String(when);
}

// 任務完成頁一打開就查：這個 Email 兌換過了嗎？
function checkRedeem(ss, payload) {
  var sheet = getSheetWithHeaders(ss, REDEEM_SHEET_NAME, REDEEM_HEADERS);
  var at = findRedeemTime(sheet, normalizeEmail(payload.email));
  return { status: 'ok', redeemed: Boolean(at), at: at };
}

// 工作人員長按確認後兌換；同一個 Email 已兌換過就不再記錄
function redeemTicket(ss, payload) {
  var email = normalizeEmail(payload.email);
  if (!email) return { status: 'error', message: 'missing email' };
  var sheet = getSheetWithHeaders(ss, REDEEM_SHEET_NAME, REDEEM_HEADERS);
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var already = findRedeemTime(sheet, email);
    if (already) return { status: 'ok', result: 'already', at: already };
    var now = new Date();
    sheet.appendRow([now, safeCell(payload.nickname), safeCell(email), safeCell(payload.playId)]);
    return { status: 'ok', result: 'redeemed', at: formatRedeemTime(now) };
  } finally {
    lock.releaseLock();
  }
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
