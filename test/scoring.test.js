import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeDimensions, computeSurvivalIndex, computePersona, pickHighestByPriority } from '../js/scoring.js';

function baseAnswers(overrides) {
  var answers = {
    role: 'frontend',
    experience: 'gt10',
    satisfaction: 'great',
    salary: 'over100',
    headhunterReaction: 'ignore',
    jumpThreshold: 'jobFit',
    careerBug: ['skill'],
    aiFrequency: 'sometimes',
    aiTools: ['chatgpt'],
    aiImpact: 'noDiff',
    aiFear: 'notScared',
    goal2027: 'remote'
  };
  return Object.assign(answers, overrides);
}

test('computeDimensions averages the relevant question values per dimension', function () {
  var dims = computeDimensions(baseAnswers());
  assert.equal(dims.stability, 5);
  assert.equal(dims.radar, 1);
  assert.equal(dims.aiAdapt, 3);
  assert.equal(dims.careerBugIndex, 2);
});

test('computeSurvivalIndex is the four-dimension average scaled to a percentage, with careerBugIndex inverted', function () {
  assert.equal(computeSurvivalIndex(baseAnswers()), 65);
});

test('a high career-bug profile produces a high careerBugIndex that pulls survivalIndex down', function () {
  var answers = baseAnswers({
    satisfaction: 'terrible',
    careerBug: ['boss'],
    aiFear: 'workloadSurge'
  });
  var dims = computeDimensions(answers);
  assert.equal(dims.careerBugIndex, 5);
  assert.equal(computeSurvivalIndex(answers), 30);
});

test('computePersona picks stableGrowth for a content, low-radar profile', function () {
  assert.equal(computePersona(baseAnswers()), 'stableGrowth');
});

test('computePersona picks jobHopper for a dissatisfied, highly-mobile profile', function () {
  var persona = computePersona(baseAnswers({
    satisfaction: 'terrible',
    headhunterReaction: 'please',
    jumpThreshold: 'noRaise',
    goal2027: 'switchJob'
  }));
  assert.equal(persona, 'jobHopper');
});

test('computePersona picks aiEvolved for a heavy multi-tool AI user', function () {
  var persona = computePersona(baseAnswers({
    aiFrequency: 'daily',
    aiTools: ['chatgpt', 'claude', 'cursor'],
    aiImpact: 'faster',
    goal2027: 'switchToAI',
    careerBug: ['promotion']
  }));
  assert.equal(persona, 'aiEvolved');
});

test('pickHighestByPriority returns the strictly-higher score', function () {
  var result = pickHighestByPriority({ a: 1, b: 5, c: 3 }, ['a', 'b', 'c']);
  assert.equal(result, 'b');
});

test('pickHighestByPriority breaks ties using priority order', function () {
  var result = pickHighestByPriority(
    { aiEvolved: 4, jobHopper: 4, careerDebugger: 1, radarWatcher: 1, stableGrowth: 1 },
    ['aiEvolved', 'jobHopper', 'careerDebugger', 'radarWatcher', 'stableGrowth']
  );
  assert.equal(result, 'aiEvolved');
});

test('職涯卡點選 3 個時，分數是平均而不是相加', function () {
  var base = {
    role: 'frontend', experience: '3to5', satisfaction: 'ok', salary: '60to80',
    headhunterReaction: 'peek', jumpThreshold: 'plus20', aiFrequency: 'sometimes',
    aiTools: ['chatgpt'], aiImpact: 'faster', aiFear: 'notScared', goal2027: 'senior'
  };
  // salary 跟 boss 的 careerBugIndex 是 4 跟 5，平均 4.5，不是相加的 9
  var one = computeDimensions(Object.assign({}, base, { careerBug: ['boss'] }));
  var three = computeDimensions(Object.assign({}, base, { careerBug: ['salary', 'boss', 'hours'] }));
  assert.ok(three.careerBugIndex <= one.careerBugIndex,
    '多選不應該讓卡點指數被灌高');
  assert.ok(three.careerBugIndex >= 1 && three.careerBugIndex <= 5);
});

test('選 3 個卡點不會讓職涯Debug型輾壓其他類型', function () {
  var base = {
    role: 'frontend', experience: 'gt10', satisfaction: 'great', salary: 'over100',
    headhunterReaction: 'ignore', jumpThreshold: 'jobFit', aiFrequency: 'daily',
    aiTools: ['chatgpt'], aiImpact: 'faster', aiFear: 'notScared', goal2027: 'remote'
  };
  // 這份作答每一題都指向穩定發育型，就算卡點選了三個偏 Debug 的也不該翻盤
  var persona = computePersona(Object.assign({}, base, {
    careerBug: ['salary', 'boss', 'aiAnxiety']
  }));
  assert.equal(persona, 'stableGrowth');
});

test('職涯卡點沒選也算得出結果', function () {
  var dims = computeDimensions({ careerBug: [] });
  assert.ok(dims.careerBugIndex >= 1 && dims.careerBugIndex <= 5);
});
