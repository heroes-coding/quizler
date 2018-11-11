'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _vorpal = require('vorpal');

var _vorpal2 = _interopRequireDefault(_vorpal);

var _inquirer = require('inquirer');

var _lib = require('./lib');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const cli = (0, _vorpal2.default)();

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

const changeNamesToIds = (quiz, title) => quiz.map((q, id) => _extends({}, q, { name: `${title}#${id + 1}` }));

const getAnswers = quiz => new Promise((resolve, reject) => (0, _inquirer.prompt)(quiz.map(q => _extends({}, q, { message: `Please choose the answer for [${q.message}]` }))).then(answers => resolve({ quiz, answers })).catch(reject));

const gradeQuiz = (quizTitles, answers) => new Promise((resolve, reject) => new Promise((resolve, reject) => Promise.all(quizTitles.map(title => (0, _lib.readFile)(`${title}Answers`))).then(answerKeys => {
  resolve(answerKeys.reduce((acc, a) => _extends({}, acc, a), {}));
})).then(answerKey => {
  const results = {
    correct: Object.entries(answers).reduce((acc, [question, answer]) => acc + (answerKey[question] === answer ? 1 : 0), 0),
    total: Object.keys(answers).length
  };
  console.log(`You got ${results.correct}/${results.total} correct on [${quizTitles.join(' / ')}]`);
  resolve(results);
}).catch(reject));

const createQuiz = title => (0, _inquirer.prompt)(askForQuestions).then(_lib.createPrompt).then(_inquirer.prompt).then(_lib.createQuestions).then(questions => changeNamesToIds(questions, title)).then(getAnswers).then(({ quiz, answers }) => {
  (0, _lib.writeFile)(title, quiz);
  (0, _lib.writeFile)(`${title}Answers`, answers);
}).catch(err => console.log('Error creating the quiz.', err));

const takeQuiz = (title, output) => (0, _lib.readFile)(title).then(quiz => (0, _inquirer.prompt)(quiz)).then(answers => (0, _lib.writeFile)(output, answers)).then(answers => gradeQuiz([title], answers)).catch(err => console.log('Error taking the quiz.', err));

const takeRandomQuiz = (quizes, output) => new Promise((resolve, reject) => {
  Promise.all(quizes.map(_lib.readFile)).then(quizes => {
    resolve(quizes.map(q => (0, _lib.chooseRandom)(q)).reduce((acc, a) => [...acc, ...a], []));
  });
}).then(_inquirer.prompt).then(answers => (0, _lib.writeFile)(output, answers)).then(answers => gradeQuiz(quizes, answers)).catch(console.log);

cli.command('grade <answersFileName> <quizNames...>', 'Grades a quiz from the given input and names of quizes (possibly more than one in the case of random) used to create the input').action(function ({ answersFileName, quizNames }, callback) {
  return (0, _lib.readFile)(answersFileName).then(answers => gradeQuiz(quizNames, answers));
});

cli.command('create <fileName>', 'Creates a new quiz and saves it to the given fileName').action(function (input, callback) {
  return createQuiz(input.fileName);
});

cli.command('take <fileName> <outputFile>', 'Loads a quiz and saves the users answers to the given outputFile').action(function ({ fileName, outputFile }, callback) {
  return takeQuiz(fileName, outputFile);
});

cli.command('random <outputFile> <fileNames...>', 'Loads a quiz or' + ' multiple quizes and selects a random number of questions from each quiz.' + ' Then, saves the users answers to the given outputFile').action(function ({ outputFile, fileNames }, callback) {
  return takeRandomQuiz(fileNames, outputFile);
});

cli.delimiter(cli.chalk['yellow']('quizler>')).show();