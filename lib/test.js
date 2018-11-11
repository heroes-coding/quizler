'use strict';

var _jsverify = require('jsverify');

var _jsverify2 = _interopRequireDefault(_jsverify);

var _underscore = require('underscore');

var _underscore2 = _interopRequireDefault(_underscore);

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
  The tests below check the chooseRandom function. There is no test to check
  whether or not a random function is returned as that behavior, in theory,
  would be impossible to predict. A randomized array could be the same as the
  given array. This is especially the case if an array containing only one
  value, but multiple copies of that one value is given. ChooseRandom may
  shuffle the values around to different indices, but because they are the same
  value the returned array still deeply equals the passed in array.
*/
describe('chooseRandom', () => {
  it('Should return an array', () => {
    _jsverify2.default.assertForall('array nat', arr => {
      return Array.isArray((0, _lib.chooseRandom)(arr));
    });
  });
  it('Should not mutate the array', () => {
    _jsverify2.default.assertForall('array nat', arr => {
      const arrBefore = arr;
      (0, _lib.chooseRandom)(arr);
      return arrBefore === arr;
    });
  });
  it('Should return an array of the given numItems length (if provided)', () => {
    _jsverify2.default.assertForall('array nat', arr => {
      if (arr.length === 0 || arr.length === 1) {
        // Here the numItems value given to chooseRandom is irrelevent as
        // an array of length 0 or 1 should just return the given array
        // with no possibility of randomization.
        return arr === (0, _lib.chooseRandom)(arr, 948672894968) && arr === (0, _lib.chooseRandom)(arr, 0) && arr === (0, _lib.chooseRandom)(arr);
      }
      const random = (0, _lib.chooseRandom)(arr, 2);
      return random.length === 2;
    });
  });
});

describe('createPrompt', () => {
  const options = { tests: 1 };
  it('Should return an array even if passed in undefined or no object', () => {
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createPrompt)()), options);
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createPrompt)({})), options);
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createPrompt)(undefined)), options);
  });
  it('Should always have at least one question and two choices with it', () => {
    _jsverify2.default.assert(() => (0, _lib.createPrompt)().length === 3, options);
    _jsverify2.default.assert(() => (0, _lib.createPrompt)({}).length === 3, options);
    _jsverify2.default.assert(() => (0, _lib.createPrompt)(undefined).length === 3, options);
  });
  it('Should default to 1 question and 2 choices', () => {
    const prompts = [{
      type: 'input',
      name: 'question-1',
      message: 'Enter question 1'
    }, {
      type: 'input',
      name: 'question-1-choice-1',
      message: 'Enter answer choice 1 for question 1'
    }, {
      type: 'input',
      name: 'question-1-choice-2',
      message: 'Enter answer choice 2 for question 1'
    }];
    _jsverify2.default.assert(() => {
      return _underscore2.default.isEqual((0, _lib.createPrompt)(), prompts) && _underscore2.default.isEqual((0, _lib.createPrompt)({}), prompts) && _underscore2.default.isEqual((0, _lib.createPrompt)(undefined), prompts);
    }, options);
  });
  it('Should always return an array of length numQuestions + (numQuestions * numChoices)', () => _jsverify2.default.assertForall('{ numQuestions: nat; numChoices: nat }', r => (0, _lib.createPrompt)(r).length === r.numQuestions + r.numQuestions * r.numChoices));
});

describe('createQuestions', () => {
  const options = { tests: 1 };
  it('Should return an array even if passed in undefined or no object', () => {
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createQuestions)()), options);
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createQuestions)({})), options);
    _jsverify2.default.assert(() => Array.isArray((0, _lib.createQuestions)(undefined)), options);
  });
  it('Should return an empty array if no object is provided', () => {
    _jsverify2.default.assert(() => (0, _lib.createQuestions)().length === 0, options);
    _jsverify2.default.assert(() => (0, _lib.createQuestions)({}).length === 0, options);
    _jsverify2.default.assert(() => (0, _lib.createQuestions)(undefined).length === 0, options);
  });
  it('Should return question objects with their corresponding question and choices', () => _jsverify2.default.assertForall(_jsverify2.default.record({
    'question-1': _jsverify2.default.string,
    'question-1-choice-1': _jsverify2.default.string,
    'question-1-choice-2': _jsverify2.default.string,
    'question-2': _jsverify2.default.string,
    'question-2-choice-1': _jsverify2.default.string,
    'question-2-choice-2': _jsverify2.default.string
  }), r => _underscore2.default.isEqual((0, _lib.createQuestions)(r), [{
    type: 'list',
    name: 'question-1',
    message: r['question-1'],
    choices: [r['question-1-choice-1'], r['question-1-choice-2']]
  }, {
    type: 'list',
    name: 'question-2',
    message: r['question-2'],
    choices: [r['question-2-choice-1'], r['question-2-choice-2']]
  }])));
});