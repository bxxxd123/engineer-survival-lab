import { PRIVACY_CONFIG } from '../privacy-config.js';

export function createInitialState() {
  return {
    screen: 'intro',
    levelIndex: 0,
    nickname: '',
    email: '',
    consent: null,
    answers: {},
    persona: null,
    survivalIndex: null,
    dimensions: null,
    isAdvancing: false,
    playId: '',
    hasSubmitted: false,
    hasSubmitError: false
  };
}

export function recordSingleAnswer(state, questionId, value) {
  state.answers[questionId] = value;
  return state;
}

export function toggleMultiAnswer(state, question, value) {
  var current = state.answers[question.id] || [];
  var index = current.indexOf(value);
  var next;

  if (index !== -1) {
    next = current.slice(0, index).concat(current.slice(index + 1));
  } else if (question.exclusiveOption && value === question.exclusiveOption) {
    next = [value];
  } else if (question.exclusiveOption && current.indexOf(question.exclusiveOption) !== -1) {
    next = [value];
  } else if (question.maxSelections && current.length >= question.maxSelections) {
    next = current;
  } else {
    next = current.concat([value]);
  }

  state.answers[question.id] = next;
  return state;
}

export function isLastLevel(state, questions) {
  return state.levelIndex >= questions.length - 1;
}

export function advanceLevel(state) {
  state.levelIndex += 1;
  return state;
}

export function goBackLevel(state) {
  if (state.levelIndex > 0) {
    state.levelIndex -= 1;
  }
  return state;
}

// Nickname is optional; anyone who skips it gets a code so the survival card
// still has something to show and we never push people into giving a name.
export function generateExperimentCode() {
  return 'ENGINEER_' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');
}

// 每一次闖關一個紀錄編號：作答先寫進「問卷回答」，之後在任務完成頁留言時，
// 試算表用這個編號找到同一列，把留言填進「意見回饋」欄。
export function generatePlayId(now) {
  var stamp = (now || Date.now()).toString(36).toUpperCase();
  var rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return 'ESL-' + stamp + '-' + rand;
}

export function recordRegistration(state, profile) {
  var now = new Date().toISOString();
  state.playId = generatePlayId();
  state.nickname = (profile.nickname || '').trim() || generateExperimentCode();
  state.email = (profile.email || '').trim();
  // Stored as a record rather than a bare boolean: which version of the
  // notice was agreed to, and when, is the part that matters later.
  state.consent = {
    privacyNoticeAccepted: Boolean(profile.privacyAccepted),
    privacyNoticeVersion: PRIVACY_CONFIG.noticeVersion,
    privacyNoticeAcceptedAt: profile.privacyAccepted ? now : '',
    marketingOptIn: Boolean(profile.marketingOptIn),
    marketingOptInAt: profile.marketingOptIn ? now : '',
    createdAt: now
  };
  return state;
}

// Returns the field that is not acceptable yet, or null when good to go.
export function validateRegistration(profile) {
  if (!profile.privacyAccepted) return 'privacy';
  var mail = (profile.email || '').trim();
  if (!mail) return 'email';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? null : 'email';
}
