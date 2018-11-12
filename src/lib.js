'use strict'
import fs from 'fs'

const writeFile = (path, object) => new Promise((resolve, reject) => {
  try {
    const json = JSON.stringify(object)
    fs.writeFile(path, json, err => {
      if (err) {
        return reject(err)
      }
      resolve(object)
    })
  } catch (err) {
    reject(err)
  }
})

const readFile = path => new Promise((resolve, reject) =>
  fs.readFile(path, (err, data) => {
    if (err) {
      return reject(err)
    }
    try {
      resolve(JSON.parse(data))
    } catch (err) {
      reject(err)
    }
  })
)

const chooseRandom = (array = [], numItems) => {
  const n = array.length
  const rand = () => Math.floor(Math.random() * n)
  if (n < 2) {
    return array
  } else if (isNaN(numItems) || numItems > n) {
    numItems = rand() + 1
  }
  let results = []
  let randomIndices = []
  while (numItems > 0) {
    let i = rand()
    while (randomIndices.includes(i)) {
      i = rand()
    }
    randomIndices.push(i)
    numItems--
  }
  for (let i of randomIndices) {
    results.push(array[i])
  }
  return results
}

const base = (name, message) => ({ name, message })
const questionPrompt = number =>
  ({ type: 'input', ...base(`question-${number}`, `Enter question ${number}`) })
const questionChoicePrompt = (number, choiceNumber) =>
  ({ type: 'input', ...base(`question-${number}-choice-${choiceNumber}`, `Enter answer choice ${choiceNumber} for question ${number}`) })

const createPrompt = (args = {}) => {
  let { numQuestions = 1, numChoices = 2 } = args
  const prompt = []
  for (let i = 1; i <= numQuestions; i++) {
    prompt.push(questionPrompt(i))
    for (let j = 1; j <= numChoices; j++) {
      prompt.push(questionChoicePrompt(i, j))
    }
  }
  return prompt
}

const createQuestions = input => {
  if (!input) {
    return []
  }
  const results = {}
  Object.entries(input).map(([k, v], i) => {
    const parts = k.split('-choice-')
    if (parts.length === 1) {
      results[parts[0]] = { type: 'list', ...base(parts[0], v), choices: [] }
    } else {
      results[parts[0]].choices.push(v)
    }
  })
  return Object.entries(results).map(([k, v], i) => v)
}

const changeNamesToIds = (quiz, title) =>
  quiz.map((q, id) => ({...q, name: `${title}#${id + 1}`}))

export { chooseRandom, createPrompt, createQuestions, readFile, writeFile, changeNamesToIds }
