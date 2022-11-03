const express = require('express')
const { urlencoded, json } = require('body-parser')
const makeRepositories = require('./middleware/repositories')

const STORAGE_FILE_PATH = 'questions.json'
const PORT = 3000

const app = express()

app.use(urlencoded({ extended: true }))
app.use(json())
app.use(makeRepositories(STORAGE_FILE_PATH))

app.get('/', (_, res) => {
  res.json({ message: 'Welcome to responder!' })
})

app.get('/questions', async (req, res) => {
  const questions = await req.repositories.questionRepo.getQuestions()
  res.json(questions)
})

app.get('/questions/:questionId', (req, res) => {
  req.repositories.questionRepo.getQuestionById(req.params.questionId)
    .then(questionById=>res.json(questionById))
})

app.post('/questions', (req, res) => {
  req.repositories.questionRepo.addQuestion(req.body)
    .then(question=>(question.hasOwnProperty('author'))?res.status(201).json(question):res.status(400).json(question))
})

app.get('/questions/:questionId/answers', (req, res) => {
  req.repositories.questionRepo.getAnswers(req.params.questionId)
    .then(answers=>res.json(answers))
})

app.post('/questions/:questionId/answers', (req, res) => {
  req.repositories.questionRepo.addAnswer(req.params.questionId, req.body)
    .then(answer=>(answer.hasOwnProperty('author'))?res.status(201).json(answer):res.status(400).json(answer))
})

app.get('/questions/:questionId/answers/:answerId', (req, res) => {
  req.repositories.questionRepo.getAnswer(req.params.questionId, req.params.answerId)
    .then(answer=>res.json(answer))
})

app.listen(PORT, () => {
  console.log(`Responder app listening on port ${PORT}`)
})
