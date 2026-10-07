import { QUESTIONS } from './questions.js';
import { PERSONAS } from './results.js';
import { computeDimensions, computeSurvivalIndex, computePersona } from './scoring.js';
import { createInitialState, recordSingleAnswer, toggleMultiAnswer, isLastLevel, advanceLevel, goBackLevel, recordRegistration, validateRegistration } from './state.js';
import { renderIntro, renderLevel, renderCalculating, renderResult, renderShareSheet, renderDone } from './render.js';
import { exportResultCardImage, canvasToBlob, shareCard, downloadCard, copyGameLink, GAME_URL } from './share.js';
import { submitResponse, submitLead, submitFeedback } from './submit.js';
import { recommendCourse } from './courses.js';

var SINGLE_SELECT_FIELDS = [
  'role', 'experience', 'satisfaction', 'salary', 'headhunterReaction',
  'jumpThreshold', 'aiFrequency', 'aiImpact', 'aiFear', 'goal2027'
];

var root = document.getElementById('app');
var state = createInitialState();

function rerender() {
  if (state.screen === 'intro') {
    renderIntro(root, { onStart: handleRegister });
  } else if (state.screen === 'level') {
    renderLevel(root, QUESTIONS[state.levelIndex], state, {
      onSingleSelect: handleSingleSelect,
      onMultiToggle: handleMultiToggle,
      onMultiNext: handleMultiNext,
      onBack: handleBack
    });
  } else if (state.screen === 'calculating') {
    renderCalculating(root);
  } else if (state.screen === 'result') {
    renderResult(root, buildResultData(), { onShare: handleOpenShare, onRestart: handleRestart });
  } else if (state.screen === 'done') {
    renderDone(root, buildResultData(), {
      hasError: state.hasSubmitError,
      onFeedback: handleFeedback,
      onRestart: handleRestart
    });
  }
}

function buildResultData() {
  if (!state.persona) {
    state.dimensions = computeDimensions(state.answers);
    state.survivalIndex = computeSurvivalIndex(state.answers);
    state.persona = computePersona(state.answers);
  }
  return {
    persona: PERSONAS[state.persona],
    dimensions: state.dimensions,
    survivalIndex: state.survivalIndex,
    careerBugLabel: findLabels('careerBug', state.answers.careerBug).join('、'),
    careerBugImage: findImage('careerBug', (state.answers.careerBug || [])[0]),
    aiBuffLabel: findBuffLabel('aiFrequency', state.answers.aiFrequency),
    goalLabel: findLabel('goal2027', state.answers.goal2027),
    goalImage: findImage('goal2027', state.answers.goal2027),
    course: recommendCourse(state.answers),
    nickname: state.nickname
  };
}

function findQuestion(questionId) {
  return QUESTIONS.filter(function (q) { return q.id === questionId; })[0] || null;
}

function findOption(questionId, value) {
  var question = findQuestion(questionId);
  if (!question) return null;
  return question.options.filter(function (o) { return o.value === value; })[0] || null;
}

function findLabel(questionId, value) {
  var option = findOption(questionId, value);
  return option ? option.label : '';
}

function findImage(questionId, value) {
  var option = findOption(questionId, value);
  return option && option.image ? option.image : '';
}

function findLabels(questionId, values) {
  return (values || []).map(function (value) { return findLabel(questionId, value); })
    .filter(function (label) { return label; });
}

function findBuffLabel(questionId, value) {
  var option = findOption(questionId, value);
  return option && option.buffLabel ? option.buffLabel : '';
}

function buildLabeledAnswers() {
  var labeled = {};
  SINGLE_SELECT_FIELDS.forEach(function (fieldId) {
    labeled[fieldId] = findLabel(fieldId, state.answers[fieldId]);
  });
  labeled.aiTools = findLabels('aiTools', state.answers.aiTools);
  labeled.careerBug = findLabels('careerBug', state.answers.careerBug);
  return labeled;
}

// Returns the offending field name so the form can mark it, or nothing on success.
function handleRegister(profile) {
  var problem = validateRegistration(profile);
  if (problem) return problem;
  recordRegistration(state, profile);
  state.screen = 'level';
  state.levelIndex = 0;
  rerender();
}

function handleSingleSelect(value) {
  if (state.isAdvancing) return;
  var question = QUESTIONS[state.levelIndex];
  recordSingleAnswer(state, question.id, value);
  state.isAdvancing = true;
  rerender();
  setTimeout(goToNextLevelOrCalculate, 450);
}

function handleMultiToggle(value) {
  var question = QUESTIONS[state.levelIndex];
  toggleMultiAnswer(state, question, value);
  rerender();
}

function handleMultiNext() {
  goToNextLevelOrCalculate();
}

function handleBack() {
  if (state.isAdvancing) return;
  goBackLevel(state);
  rerender();
}

function goToNextLevelOrCalculate() {
  state.isAdvancing = false;
  if (isLastLevel(state, QUESTIONS)) {
    state.screen = 'calculating';
    setTimeout(handleCalculatingDone, 1700);
  } else {
    advanceLevel(state);
  }
  rerender();
}

function handleCalculatingDone() {
  state.screen = 'result';
  rerender();
  submitAnswers();
}

// Sent as soon as the report shows, not after sharing: a player who reads the
// result and walks off still counts, and their check-in email is kept.
function submitAnswers() {
  if (state.hasSubmitted) return;
  state.hasSubmitted = true;
  var personaName = PERSONAS[state.persona].name;
  Promise.all([
    submitResponse(buildLabeledAnswers(), personaName, state.survivalIndex, ''),
    submitLead({
      nickname: state.nickname,
      email: state.email,
      consent: state.consent
    }, personaName, state.survivalIndex)
  ]).then(function (results) {
    state.hasSubmitError = results.some(function (r) { return r.status === 'error'; });
    if (state.hasSubmitError && state.screen === 'done') rerender();
  });
}

function handleOpenShare() {
  var data = buildResultData();
  var sheet = renderShareSheet(document.body, {
    canShare: Boolean(navigator.share),
    onClose: function () { sheet.close(); }
  });
  var shareText = '我在「工程師生存實驗室」測出是「' + data.persona.name + '」！你是哪一種工程師生存者？';
  exportResultCardImage(data)
    .then(canvasToBlob)
    .then(function (blob) {
      sheet.showCard(blob, {
        onShare: function () {
          return shareCard(blob, shareText, GAME_URL).then(function (shared) {
            if (shared) completeMission(sheet);
          });
        },
        onDownload: function () {
          downloadCard(blob);
          completeMission(sheet, 700);
        },
        onCopy: function () {
          return copyGameLink(shareText).then(function () {
            sheet.flash('已複製遊戲連結');
            completeMission(sheet, 900);
          });
        }
      });
    });
}

// Any one of share / download / copy counts as finishing the booth mission.
function completeMission(sheet, delay) {
  setTimeout(function () {
    sheet.close();
    state.screen = 'done';
    rerender();
    window.scrollTo(0, 0);
  }, delay || 0);
}

function handleFeedback(message) {
  return submitFeedback({
    nickname: state.nickname,
    email: state.email,
    message: message
  }, PERSONAS[state.persona].name);
}

function handleRestart() {
  Object.assign(state, createInitialState());
  rerender();
  window.scrollTo(0, 0);
}

rerender();
