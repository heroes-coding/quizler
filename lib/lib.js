'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.writeFile = exports.readFile = exports.createQuestions = exports.createPrompt = exports.chooseRandom = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const writeFile = (path, object) => new Promise((resolve, reject) => {
  try {
    const json = JSON.stringify(object);
    _fs2.default.writeFile(path, json, err => {
      if (err) {
        return reject(err);
      }
      resolve(object);
    });
  } catch (err) {
    reject(err);
  }
});

const readFile = path => new Promise((resolve, reject) => _fs2.default.readFile(path, (err, data) => {
  if (err) {
    return reject(err);
  }
  try {
    resolve(JSON.parse(data));
  } catch (err) {
    reject(err);
  }
}));

const chooseRandom = (array = [], numItems) => {
  const n = array.length;
  const rand = () => Math.floor(Math.random() * n);
  if (n < 2) {
    return array;
  } else if (isNaN(numItems) || numItems > n) {
    numItems = rand() + 1;
  }
  let results = [];
  let randomIndices = [];
  while (numItems > 0) {
    let i = rand();
    while (randomIndices.includes(i)) {
      i = rand();
    }
    randomIndices.push(i);
    numItems--;
  }
  for (let i of randomIndices) {
    results.push(array[i]);
  }
  return results;
};

const base = (name, message) => ({ name, message });
const questionPrompt = number => _extends({ type: 'input' }, base(`question-${number}`, `Enter question ${number}`));
const questionChoicePrompt = (number, choiceNumber) => _extends({ type: 'input' }, base(`question-${number}-choice-${choiceNumber}`, `Enter answer choice ${choiceNumber} for question ${number}`));

const createPrompt = (args = {}) => {
  let { numQuestions = 1, numChoices = 2 } = args;
  const prompt = [];
  for (let i = 1; i <= numQuestions; i++) {
    prompt.push(questionPrompt(i));
    for (let j = 1; j <= numChoices; j++) {
      prompt.push(questionChoicePrompt(i, j));
    }
  }
  return prompt;
};

const createQuestions = input => {
  if (!input) {
    return [];
  }
  const results = {};
  Object.entries(input).map(([k, v], i) => {
    const parts = k.split('-choice-');
    if (parts.length === 1) {
      results[parts[0]] = _extends({ type: 'list' }, base(parts[0], v), { choices: [] });
    } else {
      results[parts[0]].choices.push(v);
    }
  });
  return Object.entries(results).map(([k, v], i) => v);
};

exports.chooseRandom = chooseRandom;
exports.createPrompt = createPrompt;
exports.createQuestions = createQuestions;
exports.readFile = readFile;
exports.writeFile = writeFile;