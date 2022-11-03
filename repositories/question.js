const { readFile, writeFile } = require('fs/promises')
const { v4: uuidv4 } = require('uuid');

const makeQuestionRepository = fileName => {

  const checkBodyProperties = properties =>{
      return properties.hasOwnProperty('author') && properties.hasOwnProperty('summary')
  }

  const addDataToFile = async data =>{
    var JSONData = JSON.stringify(data);
    await writeFile(fileName, JSONData, {encoding: 'utf-8' }, (err) => {
      if (err) throw err
    })
  }

  const getQuestions = async () => {
    const fileContent = await readFile(fileName, { encoding: 'utf-8' })
    const questions = JSON.parse(fileContent)
    return questions
  }

  const getQuestionById = async questionId => {
    const questions = await getQuestions()
    const questionById = questions.filter(p=>p.id==questionId)
    return questionById
  }

  const addQuestion = async question => {
    if(!checkBodyProperties(question)) return {}
    var newQuestion = {
      id: uuidv4(),
      summary: question.summary,
      author: question.author,
      answers: []
    }
    var questions = await getQuestions()
    questions.push(newQuestion)
    await addDataToFile(questions)
    return newQuestion
  }

  const getAnswers = async questionId => {
    const questionById = await getQuestionById(questionId)
    let answers = {}
    if(questionById.length > 0) answers = questionById[0].answers
    return answers
  }

  const getAnswer = async (questionId, answerId) => {
    const questionById = await getQuestionById(questionId)
    let answer = {}
    if(questionById.length > 0) answer = questionById[0].answers.filter(p=>p.id==answerId)
    return answer
  }

  const addAnswer = async (questionId, answer) => {
    if(!checkBodyProperties(answer)) return {}
      var newAnswer = {
        id: uuidv4(),
        summary: answer.summary,
        author: answer.author,
      }
      var questions = await getQuestions()
      let question = questions.find(question => question.id==questionId)
      if(question === undefined) return {}
      question.answers.push(newAnswer)
      await addDataToFile(questions)
      return newAnswer
  }

  return {
    getQuestions,
    getQuestionById,
    addQuestion,
    getAnswers,
    getAnswer,
    addAnswer
  }
}

module.exports = { makeQuestionRepository }
