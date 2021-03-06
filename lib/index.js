'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vorpal = require('vorpal');

var _vorpal2 = _interopRequireDefault(_vorpal);

var _inquirer = require('inquirer');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cli = (0, _vorpal2.default)();
const QUIZ_FOLDER = 'quizes';
const ANSWERS_FOLDER = 'answers';
const ANSWER_KEY_FOLDER = 'answerKeys';

for (const folder of [QUIZ_FOLDER, ANSWERS_FOLDER, ANSWER_KEY_FOLDER]) {
  if (!_fs2.default.existsSync(folder)) {
    _fs2.default.mkdirSync(folder);
  }
}

const getQuizes = () => _fs2.default.readdirSync(QUIZ_FOLDER);

const askForQuestions = [{
  type: 'input',
  name: 'numQuestions',
  message: 'How many questions do you want in your quiz?',
  validate: input => {
    const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/);
    return pass ? true : 'Please enter a valid number!';
  }
}, {
  type: 'input',
  name: 'numChoices',
  message: 'How many choices should each question have?',
  validate: input => {
    const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/);
    return pass ? true : 'Please enter a valid number!';
  }
}];

const getAnswers = quiz => new Promise((resolve, reject) => (0, _inquirer.prompt)(quiz.map(q => _extends({}, q, { message: `Please choose the answer for [${q.message}]` }))).then(answers => resolve({ quiz, answers })).catch(reject));

const gradeQuiz = (quizTitles, answers) =>
/*
  answers is a single set of answers from either one or multiple quizzes
  quizTitles is an array of all quizes used to get these answers
  it is used to construct the answerKey that answers is checked against
*/
new Promise((resolve, reject) => new Promise((resolve, reject) => Promise.all(quizTitles.map(title => (0, _lib.readFile)(_path2.default.join(ANSWER_KEY_FOLDER, title)))).then(answerKeys => {
  resolve(answerKeys.reduce((acc, a) => _extends({}, acc, a), {}));
})).then(answerKey => {
  const results = {
    correct: Object.entries(answers).reduce((acc, [question, answer]) => acc + (answerKey[question] === answer ? 1 : 0), 0),
    total: Object.keys(answers).length
  };
  console.log(`You got ${results.correct}/${results.total} correct on [${quizTitles.join(' / ')}]`);
  resolve(results);
}).catch(reject));

const createQuiz = title => (0, _inquirer.prompt)(askForQuestions).then(_lib.createPrompt).then(_inquirer.prompt).then(_lib.createQuestions).then(questions => (0, _lib.changeNamesToIds)(questions, title)).then(getAnswers).then(({ quiz, answers }) => {
  (0, _lib.writeFile)(_path2.default.join(QUIZ_FOLDER, title), quiz);
  (0, _lib.writeFile)(_path2.default.join(ANSWER_KEY_FOLDER, title), answers);
}).catch(err => console.log('Error creating the quiz.', err));

const takeQuiz = (title, output) => (0, _lib.readFile)(_path2.default.join(QUIZ_FOLDER, title)).then(quiz => (0, _inquirer.prompt)(quiz)).then(answers => (0, _lib.writeFile)(_path2.default.join(ANSWERS_FOLDER, output), answers)).then(answers => gradeQuiz([title], answers)).catch(err => console.log('Error taking the quiz.', err));

const takeRandomQuiz = (quizes, output) => new Promise((resolve, reject) => {
  Promise.all(quizes.map(f => (0, _lib.readFile)(_path2.default.join(QUIZ_FOLDER, f)))).then(quizes => {
    resolve(quizes.map(q => (0, _lib.chooseRandom)(q)).reduce((acc, a) => [...acc, ...a], []));
  });
}).then(_inquirer.prompt).then(answers => (0, _lib.writeFile)(_path2.default.join(ANSWERS_FOLDER, output), answers)).then(answers => gradeQuiz(quizes, answers)).catch(console.log);

cli.command('grade <answersFileName> <quizNames...>', 'Grades a quiz from the given input and names of quizes (possibly more than one in the case of random) used to create the input').action(function ({ answersFileName, quizNames }, callback) {
  return (0, _lib.readFile)(_path2.default.join(ANSWERS_FOLDER, answersFileName)).then(answers => gradeQuiz(quizNames, answers));
});

cli.command('create <fileName>', 'Creates a new quiz and saves it to the given fileName').action(function (input, callback) {
  return createQuiz(input.fileName);
});

cli.command('take <fileName> <outputFile>', 'Loads a quiz and saves the users answers to the given outputFile').autocomplete({ data: () => getQuizes() }).action(function ({ fileName, outputFile }, callback) {
  return takeQuiz(fileName, outputFile);
});

cli.command('random <outputFile> <fileNames...>', 'Loads a quiz or' + ' multiple quizes and selects a random number of questions from each quiz.' + ' Then, saves the users answers to the given outputFile').autocomplete({ data: () => getQuizes() }).action(function ({ outputFile, fileNames }, callback) {
  return takeRandomQuiz(fileNames, outputFile);
});

cli.delimiter(cli.chalk['yellow']('quizler>')).show();