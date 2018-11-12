import vorpal from 'vorpal'
import { prompt } from 'inquirer'

import {
  readFile,
  writeFile,
  chooseRandom,
  createPrompt,
  createQuestions,
  changeNamesToIds
} from './lib'

const cli = vorpal()

const askForQuestions = [
  {
    type: 'input',
    name: 'numQuestions',
    message: 'How many questions do you want in your quiz?',
    validate: input => {
      const pass = input.match(/^[1-9]{1}$|^[1-9]{1}[0-9]{1}$|^100$/)
      return pass ? true : 'Please enter a valid number!'
    }
  },
  {
    type: 'input',
    name: 'numChoices',
    message: 'How many choices should each question have?',
    validate: input => {
      const pass = input.match(/^(?:[2-4]|0[2-4]|4)$/)
      return pass ? true : 'Please enter a valid number!'
    }
  }
]

const getAnswers = quiz =>
  new Promise((resolve, reject) =>
    prompt(quiz.map(q => ({...q, message: `Please choose the answer for [${q.message}]`})))
      .then(answers => resolve({quiz, answers}))
      .catch(reject)
  )

const gradeQuiz = (quizTitles, answers) =>
  /*
    answers is a single set of answers from either one or multiple quizzes
    quizTitles is an array of all quizes used to get these answers
    it is used to construct the answerKey that answers is checked against
  */
  new Promise((resolve, reject) =>
    new Promise((resolve, reject) =>
      Promise.all(quizTitles.map(title => readFile(`${title}Answers`))).then(answerKeys => {
        resolve(answerKeys.reduce((acc, a) => ({...acc, ...a}), {}))
      })
    ).then(answerKey => {
      const results = {
        correct: Object.entries(answers).reduce((acc, [question, answer]) =>
            acc + (answerKey[question] === answer ? 1 : 0), 0),
        total: Object.keys(answers).length
      }
      console.log(`You got ${results.correct}/${results.total} correct on [${quizTitles.join(' / ')}]`)
      resolve(results)
    }).catch(reject)
  )

const createQuiz = title =>
  prompt(askForQuestions)
    .then(createPrompt)
    .then(prompt)
    .then(createQuestions)
    .then(questions => changeNamesToIds(questions, title))
    .then(getAnswers)
    .then(({quiz, answers}) => {
      writeFile(title, quiz)
      writeFile(`${title}Answers`, answers)
    })
    .catch(err => console.log('Error creating the quiz.', err))

const takeQuiz = (title, output) =>
    readFile(title)
      .then(quiz => prompt(quiz))
      .then(answers => writeFile(output, answers))
      .then(answers => gradeQuiz([title], answers))
      .catch(err => console.log('Error taking the quiz.', err))

const takeRandomQuiz = (quizes, output) =>
  new Promise((resolve, reject) => {
    Promise.all(quizes.map(readFile)).then(quizes => {
      resolve(quizes.map(q => chooseRandom(q)).reduce((acc, a) => [...acc, ...a], []))
    })
  }).then(prompt)
    .then(answers => writeFile(output, answers))
    .then(answers => gradeQuiz(quizes, answers))
    .catch(console.log)

cli
    .command(
      'grade <answersFileName> <quizNames...>',
      'Grades a quiz from the given input and names of quizes (possibly more than one in the case of random) used to create the input'
    )
    .action(function ({ answersFileName, quizNames }, callback) {
      return readFile(answersFileName).then(answers => gradeQuiz(quizNames, answers))
    })

cli
  .command(
    'create <fileName>',
    'Creates a new quiz and saves it to the given fileName'
  )
  .action(function (input, callback) {
    return createQuiz(input.fileName)
  })

cli
  .command(
    'take <fileName> <outputFile>',
    'Loads a quiz and saves the users answers to the given outputFile'
  )
  .action(function ({ fileName, outputFile }, callback) {
    return takeQuiz(fileName, outputFile)
  })

cli
  .command(
    'random <outputFile> <fileNames...>',
    'Loads a quiz or' +
      ' multiple quizes and selects a random number of questions from each quiz.' +
      ' Then, saves the users answers to the given outputFile'
  )
  .action(function ({ outputFile, fileNames }, callback) {
    return takeRandomQuiz(fileNames, outputFile)
  })

cli.delimiter(cli.chalk['yellow']('quizler>')).show()
