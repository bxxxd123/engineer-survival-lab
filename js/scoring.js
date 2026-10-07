import { QUESTIONS } from './questions.js';
import { PERSONA_PRIORITY } from './results.js';

export function computeDimensions(answers) {
  var dims = { stability: [], radar: [], aiAdapt: [], careerBugIndex: [] };

  QUESTIONS.forEach(function (question) {
    if (question.type === 'single') {
      addDimensionValues(dims, findOption(question, answers[question.id]));
    } else {
      var selected = answers[question.id] || [];
      if (question.blendMultiScores) {
        addBlendedDimensionValues(dims, question, selected);
      } else {
        selected.forEach(function (value) {
          addDimensionValues(dims, findOption(question, value));
        });
      }
      if (question.id === 'aiTools') {
        var toolCount = selected.filter(function (value) { return value !== 'none'; }).length;
        dims.aiAdapt.push(toolCountToValue(toolCount));
      }
    }
  });

  var result = {};
  Object.keys(dims).forEach(function (dim) {
    result[dim] = roundToRange(average(dims[dim]), 1, 5);
  });
  return result;
}

export function computeSurvivalIndex(answers) {
  var dims = computeDimensions(answers);
  var goodness = (dims.stability + dims.radar + dims.aiAdapt + (6 - dims.careerBugIndex)) / 4;
  return Math.round((goodness / 5) * 100);
}

export function computePersona(answers) {
  var totals = { stableGrowth: 0, radarWatcher: 0, jobHopper: 0, careerDebugger: 0, aiEvolved: 0 };

  QUESTIONS.forEach(function (question) {
    if (question.type === 'single') {
      addPersonaPoints(totals, findOption(question, answers[question.id]));
    } else {
      var chosen = answers[question.id] || [];
      if (question.blendMultiScores) {
        addBlendedPersonaPoints(totals, question, chosen);
      } else {
        chosen.forEach(function (value) {
          addPersonaPoints(totals, findOption(question, value));
        });
      }
    }
  });

  return pickHighestByPriority(totals, PERSONA_PRIORITY);
}

export function pickHighestByPriority(totals, priorityOrder) {
  var best = priorityOrder[0];
  var bestScore = totals[best];
  priorityOrder.forEach(function (id) {
    if (totals[id] > bestScore) {
      best = id;
      bestScore = totals[id];
    }
  });
  return best;
}

function findOption(question, value) {
  if (!question) return null;
  var matches = question.options.filter(function (option) { return option.value === value; });
  return matches[0] || null;
}

function addDimensionValues(dims, option) {
  if (!option || !option.dimensionValues) return;
  Object.keys(option.dimensionValues).forEach(function (dim) {
    dims[dim].push(option.dimensionValues[dim]);
  });
}

// A blended multi question contributes once, as the average of what was
// picked, so it carries the same weight as a single-answer question. Summing
// instead would let one question with three picks outvote every other.
function addBlendedDimensionValues(dims, question, selected) {
  if (selected.length === 0) return;
  var buckets = {};
  selected.forEach(function (value) {
    var option = findOption(question, value);
    if (!option || !option.dimensionValues) return;
    Object.keys(option.dimensionValues).forEach(function (dim) {
      (buckets[dim] = buckets[dim] || []).push(option.dimensionValues[dim]);
    });
  });
  Object.keys(buckets).forEach(function (dim) {
    dims[dim].push(average(buckets[dim]));
  });
}

function addBlendedPersonaPoints(totals, question, selected) {
  if (selected.length === 0) return;
  var buckets = {};
  selected.forEach(function (value) {
    var option = findOption(question, value);
    if (!option || !option.personaPoints) return;
    Object.keys(option.personaPoints).forEach(function (id) {
      (buckets[id] = buckets[id] || []).push(option.personaPoints[id]);
    });
  });
  Object.keys(buckets).forEach(function (id) {
    // Divide by how many were picked, not by how many mention this persona,
    // so a trait shared by one of three picks counts for a third.
    totals[id] += buckets[id].reduce(function (a, b) { return a + b; }, 0) / selected.length;
  });
}

function addPersonaPoints(totals, option) {
  if (!option || !option.personaPoints) return;
  Object.keys(option.personaPoints).forEach(function (id) {
    totals[id] += option.personaPoints[id];
  });
}

function toolCountToValue(count) {
  if (count <= 0) return 1;
  if (count === 1) return 3;
  if (count === 2) return 4;
  return 5;
}

function average(values) {
  if (values.length === 0) return 3;
  return values.reduce(function (a, b) { return a + b; }, 0) / values.length;
}

function roundToRange(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}
