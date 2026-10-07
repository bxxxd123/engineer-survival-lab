import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recommendCourse, COURSES } from '../js/courses.js';

test('轉AI 目標推 AI 開發進化營', function () {
  var r = recommendCourse({ goal2027: 'switchToAI', role: 'frontend' });
  assert.equal(r.name, COURSES.aiUpgrade.name);
});

test('AI 技術焦慮也推 AI 開發進化營', function () {
  var r = recommendCourse({ aiFear: 'skillGap', role: 'backend' });
  assert.equal(r.name, COURSES.aiUpgrade.name);
});

test('進外商推職場英文班', function () {
  var r = recommendCourse({ goal2027: 'foreign', role: 'backend' });
  assert.equal(r.name, COURSES.english.name);
});

test('第一年新手推體驗營，不管什麼角色', function () {
  var r = recommendCourse({ experience: 'lt1', role: 'backend', goal2027: 'raise' });
  assert.equal(r.name, COURSES.starterCamp.name);
});

test('後端想技術升級推雲端架構班', function () {
  var r = recommendCourse({ role: 'backend', goal2027: 'techLevelUp' });
  assert.equal(r.name, COURSES.cloudTraining.name);
});

test('後端其他情況推後端就業班', function () {
  var r = recommendCourse({ role: 'backend', goal2027: 'wlb' });
  assert.equal(r.name, COURSES.backendTraining.name);
});

test('前端卡在技術焦慮推 JavaScript 核心篇', function () {
  var r = recommendCourse({ role: 'frontend', careerBug: ['skill'] });
  assert.equal(r.name, COURSES.jsCore.name);
});

test('前端想升 Senior 推 TypeScript', function () {
  var r = recommendCourse({ role: 'frontend', goal2027: 'senior' });
  assert.equal(r.name, COURSES.typescript.name);
});

test('前端想技術大升級推 React 作品實戰班', function () {
  var r = recommendCourse({ role: 'frontend', goal2027: 'techLevelUp' });
  assert.equal(r.name, COURSES.react.name);
});

test('沒有任何規則命中時帶到精選課程頁，不會壞掉', function () {
  var r = recommendCourse({});
  assert.equal(r.name, COURSES.allCourses.name);
  assert.ok(r.url);
  assert.ok(r.reason);
});

test('每一門推薦都帶得出名稱、網址跟理由', function () {
  var samples = [
    { goal2027: 'switchToAI' },
    { goal2027: 'foreign' },
    { experience: 'lt1' },
    { role: 'devops' },
    { role: 'qa' },
    { role: 'fullstack' },
    { goal2027: 'switchJob' },
    {}
  ];
  samples.forEach(function (answers) {
    var r = recommendCourse(answers);
    assert.ok(r.name && r.name.length > 0);
    assert.match(r.url, /^https:\/\/www\.hexschool\.com\//);
    assert.ok(r.reason && r.reason.length > 0);
  });
});
