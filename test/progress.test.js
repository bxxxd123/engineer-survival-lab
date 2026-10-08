import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

var store = {};
globalThis.window = {
  localStorage: {
    getItem: function (k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem: function (k, v) { store[k] = String(v); },
    removeItem: function (k) { delete store[k]; }
  }
};

var { saveProgress, loadProgress, clearProgress, PROGRESS_TTL_MS } = await import('../js/progress.js');

beforeEach(function () { store = {}; });

function midQuiz() {
  return { screen: 'level', levelIndex: 4, nickname: '阿噗', email: 'a@b.test', consent: {}, answers: { role: 'frontend' }, hasSubmitted: false };
}

test('存下來的進度可以讀回來', function () {
  saveProgress(midQuiz(), 1000);
  var saved = loadProgress(2000);
  assert.equal(saved.levelIndex, 4);
  assert.deepEqual(saved.answers, { role: 'frontend' });
});

test('超過 30 分鐘就過期，而且會被清掉', function () {
  saveProgress(midQuiz(), 1000);
  assert.equal(loadProgress(1000 + PROGRESS_TTL_MS + 1), null);
  assert.equal(loadProgress(1000), null);
});

test('只接續闖關中或報告頁，首頁和完成頁不算', function () {
  var s = midQuiz();
  s.screen = 'done';
  saveProgress(s, 1000);
  assert.equal(loadProgress(2000), null);
});

test('清掉之後就沒有進度', function () {
  saveProgress(midQuiz(), 1000);
  clearProgress();
  assert.equal(loadProgress(2000), null);
});
