import { GAS_WEB_APP_URL, GAS_SHARED_SECRET } from '../config.js';

// 「問卷回答」一列 = 一次闖關：暱稱、Email、作答、結果，留言之後再補進同一列。
export function submitResponse(player, answers, persona, survivalIndex) {
  return postToSheet('responses', {
    playId: player.playId || '',
    nickname: player.nickname || '',
    email: player.email || '',
    role: answers.role || '',
    experience: answers.experience || '',
    satisfaction: answers.satisfaction || '',
    salary: answers.salary || '',
    headhunterReaction: answers.headhunterReaction || '',
    jumpThreshold: answers.jumpThreshold || '',
    careerBug: (answers.careerBug || []).join('、'),
    aiFrequency: answers.aiFrequency || '',
    aiTools: (answers.aiTools || []).join('、'),
    aiImpact: answers.aiImpact || '',
    aiFear: answers.aiFear || '',
    goal2027: answers.goal2027 || '',
    persona: persona || '',
    survivalIndex: survivalIndex
  });
}

export function submitLead(leadData, persona, survivalIndex) {
  var consent = leadData.consent || {};
  return postToSheet('leads', {
    nickname: leadData.nickname || '',
    email: leadData.email || '',
    privacyNoticeAccepted: consent.privacyNoticeAccepted ? 'TRUE' : 'FALSE',
    privacyNoticeVersion: consent.privacyNoticeVersion || '',
    privacyNoticeAcceptedAt: consent.privacyNoticeAcceptedAt || '',
    // Only TRUE here may be added to the course/event mailing list.
    marketingOptIn: consent.marketingOptIn ? 'TRUE' : 'FALSE',
    marketingOptInAt: consent.marketingOptInAt || '',
    createdAt: consent.createdAt || '',
    persona: persona || '',
    survivalIndex: survivalIndex
  });
}

// 任務完成頁的留言：試算表用紀錄編號找到這個人在「問卷回答」的那一列，
// 填進「意見回饋」欄（找不到時另起一列，留言不會遺失）。
export function submitFeedback(player, message, persona) {
  return postToSheet('feedback', {
    playId: player.playId || '',
    nickname: player.nickname || '',
    email: player.email || '',
    persona: persona || '',
    message: message || ''
  });
}

function sendOnce(sheetName, payload) {
  return fetch(GAS_WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ secret: GAS_SHARED_SECRET, sheet: sheetName, payload: payload }),
    // 留言送出後玩家可能馬上關掉頁面；keepalive 讓請求在頁面關閉後仍會送完。
    // 只用在留言：留言是填回同一格，就算重送也不會多出一列。
    keepalive: sheetName === 'feedback'
  }).then(function (res) {
    return res.json();
  });
}

// 活動現場網路不穩、或很多人同時送出讓 Google 忙不過來時，
// 會分三次、間隔越拉越長重送；三次都失敗就先存在玩家的手機裡，
// 下次打開網站時自動補送（flushOutbox）。
var RETRY_DELAYS_MS = [1500, 4000];
var OUTBOX_KEY = 'esl-outbox';

// Refusals that will never succeed on a retry (configuration problems).
function isPermanentError(body) {
  var message = (body && body.message) || '';
  return /invalid secret|unknown sheet|找不到分頁/.test(message);
}

function wait(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function sendWithRetry(sheetName, payload, attempt) {
  attempt = attempt || 0;
  return sendOnce(sheetName, payload)
    .catch(function (err) {
      // Network drop, or Apps Script answering with an HTML error page when
      // it is overloaded -- both are worth another go.
      return { status: 'error', message: String(err), retryable: true };
    })
    .then(function (body) {
      var failed = !body || body.status === 'error';
      if (!failed || isPermanentError(body) || attempt >= RETRY_DELAYS_MS.length) return body;
      console.warn('送出失敗，稍後重試（' + sheetName + '，第 ' + (attempt + 1) + ' 次）：', body.message);
      return wait(RETRY_DELAYS_MS[attempt]).then(function () {
        return sendWithRetry(sheetName, payload, attempt + 1);
      });
    });
}

function readOutbox() {
  try {
    return JSON.parse(window.localStorage.getItem(OUTBOX_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function writeOutbox(items) {
  try {
    if (items.length) {
      window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
    } else {
      window.localStorage.removeItem(OUTBOX_KEY);
    }
    return true;
  } catch (e) {
    return false;
  }
}

function postToSheet(sheetName, payload) {
  if (!GAS_WEB_APP_URL) {
    console.warn('GAS_WEB_APP_URL 未設定，略過送出');
    return Promise.resolve({ status: 'skipped' });
  }

  return sendWithRetry(sheetName, payload).then(function (body) {
    if (body && body.status === 'error') {
      // Apps Script answers 200 even when it refuses the write (wrong secret,
      // missing tab), so the reason only shows up in the body.
      console.error('送出失敗（' + sheetName + '）：' + (body.message || JSON.stringify(body)));
      if (!isPermanentError(body)) {
        var saved = writeOutbox(readOutbox().concat([{ sheet: sheetName, payload: payload }]));
        return { status: 'error', queued: saved, message: body.message };
      }
    }
    return body;
  });
}

// Sends whatever an earlier visit could not deliver. Safe to call any time;
// items that still fail stay in the outbox for next time.
export function flushOutbox() {
  if (!GAS_WEB_APP_URL) return Promise.resolve();
  var items = readOutbox();
  if (!items.length) return Promise.resolve();
  var remaining = [];
  return items.reduce(function (chain, item) {
    return chain.then(function () {
      return sendOnce(item.sheet, item.payload)
        .then(function (body) {
          if (!body || (body.status === 'error' && !isPermanentError(body))) remaining.push(item);
        })
        .catch(function () { remaining.push(item); });
    });
  }, Promise.resolve()).then(function () {
    // Keep anything queued while this flush was running (the outbox only grows
    // at the end), so a new failure is not overwritten.
    var addedMeanwhile = readOutbox().slice(items.length);
    writeOutbox(remaining.concat(addedMeanwhile));
  });
}
