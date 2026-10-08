// 闖關進度保存：玩到一半不小心關掉頁面，回來可以接續。
// 存在玩家自己的手機（localStorage），30 分鐘沒動作就過期；
// 完成任務或按「重新開始」就清掉，避免下一個人（例如攤位的公用平板）看到。

var KEY = 'esl-progress';
export var PROGRESS_TTL_MS = 30 * 60 * 1000;

var FIELDS = ['screen', 'levelIndex', 'nickname', 'email', 'consent', 'answers', 'playId', 'hasSubmitted'];

export function saveProgress(state, now) {
  var snapshot = { savedAt: now || Date.now() };
  FIELDS.forEach(function (field) { snapshot[field] = state[field]; });
  try {
    window.localStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch (e) { /* private mode or storage full: just skip saving */ }
}

// Returns the saved snapshot, or null when there is none or it has expired.
export function loadProgress(now) {
  var snapshot;
  try {
    snapshot = JSON.parse(window.localStorage.getItem(KEY) || 'null');
  } catch (e) {
    return null;
  }
  if (!snapshot || !snapshot.savedAt) return null;
  if ((now || Date.now()) - snapshot.savedAt > PROGRESS_TTL_MS) {
    clearProgress();
    return null;
  }
  if (snapshot.screen !== 'level' && snapshot.screen !== 'result') return null;
  return snapshot;
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(KEY);
  } catch (e) { /* nothing to clear */ }
}

// 震動回饋：只有支援的手機（Android）有效，iPhone 和桌機會直接略過
export function vibrate(pattern) {
  if (navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch (e) { /* ignore */ }
  }
}
