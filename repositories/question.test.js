const { writeFile, rm } = require('fs/promises')
const { faker } = require('@faker-js/faker')
const { makeQuestionRepository } = require('./question')
const request = require('supertest')
const app = 'http://localhost:3000'

describe('question repository', () => {
  
  describe("Unit tests.", ()=>{

    const TEST_QUESTIONS_FILE_PATH = 'test-questions.json'
  let questionRepo
  const testQuestions = [
    {
      id: faker.datatype.uuid(),
      summary: 'Whats in my mind?',
      author:  'JSON Wadecki',
      answers: [
        {
          id: faker.datatype.uuid(),
          summary: "Nothing!",
          author: "Nowak Nowakus"
        }]  
    },
    {
      id: faker.datatype.uuid(),
      summary: 'Who are you?',
      author: 'Tim Doods',
      answers: []
    },
    {
      id: faker.datatype.uuid(),
      summary: 'What is 2 + 2',
      author:  'Albert OneStain',
      answers: [
        {
          id: faker.datatype.uuid(),
          summary: "3",
          author: "Bigos"
        },
        {
          id: faker.datatype.uuid(),
          summary: "5",
          author: "Luis Biton"
        }
      ]
    }
  ]

    beforeAll(async () => {
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify([]))
  
      questionRepo = makeQuestionRepository(TEST_QUESTIONS_FILE_PATH)
    })
  
    afterAll(async () => {
      await rm(TEST_QUESTIONS_FILE_PATH)
    })
  
    test('should return a list of 0 questions', async () => {
      expect(await questionRepo.getQuestions()).toHaveLength(0)
    })
  
    test('should return a list of 3 questions', async () => {
  
      await writeFile(TEST_QUESTIONS_FILE_PATH, JSON.stringify(testQuestions))
      expect(await questionRepo.getQuestions()).toHaveLength(3)
    })
  
    test('Element should return correct values for question filtered by id.', async () => {
  
      let questionById = await questionRepo.getQuestionById(testQuestions[1].id)
  
      expect(questionById[0]).toHaveProperty('summary', testQuestions[1].summary)
      expect(questionById[0]).toHaveProperty('author', testQuestions[1].author)
      expect(questionById[0]).toHaveProperty('answers', testQuestions[1].answers)
  
      expect(questionById).toHaveLength(1)
  
    })
  
    test('Element should return an empty array.', async () => {
  
      let questionById = await questionRepo.getQuestionById(faker.datatype.uuid())
  
      expect(questionById).toEqual([])
      expect(questionById).toHaveLength(0)
    })
  
    test('Should return one answer.', async () => {
  
      let answers = await questionRepo.getAnswers(testQuestions[0].id)
  
      expect(answers).toHaveLength(1)
    })
  
    test('Should have answer = 5.', async () => {
      let answer = await questionRepo.getAnswer(testQuestions[2].id, testQuestions[2].answers[1].id)
  
      expect(answer[0].summary).toEqual("5")
    })
  
    test('Should have no more questions, wrong json sent', async () => {
      let questions = await questionRepo.getQuestions()
      let questionsLengthBefore = questions.length
  
      await questionRepo.addQuestion({sumamry: "What is live?", author: "Julius Cesar"})
      await questionRepo.addQuestion({summary: "What is live?", authorised: "Julius Cesar"})
  
      questions =  await questionRepo.getQuestions()
      let questionsLengthAfter = questions.length
  
      expect(questionsLengthBefore + 2).not.toEqual(questionsLengthAfter)
    })
  
    test('Should have 2 more questions', async () => {
  
      let questions = await questionRepo.getQuestions()
      let questionsLengthBefore = questions.length
  
      await questionRepo.addQuestion({summary: "What is live?", author: "Julius Cesar"})
      await questionRepo.addQuestion({summary: "What is live?", author: "Julius Cesar"})
  
      questions =  await questionRepo.getQuestions()
      let questionsLengthAfter = questions.length
  
      expect(questionsLengthBefore + 2).toEqual(questionsLengthAfter)
  
    })
    test('Should have one more answer', async () => {
  
      let questions = await questionRepo.getQuestions()
      let questionsLengthBefore = questions[0].answers.length
  
      await questionRepo.addAnswer(testQuestions[0].id, {summary: "Bols", author: "Jul"})
  
      questions =  await questionRepo.getQuestions()
      let questionsLengthAfter = questions[0].answers.length
  
      expect(questionsLengthBefore + 1).toEqual(questionsLengthAfter)
  
    })
  
    test('Should have no additional answer, because of new id of question', async () => {
  
      let questions = await questionRepo.getQuestions()
      let questionsLengthBefore = questions[0].answers.length
  
      await questionRepo.addAnswer(faker.datatype.uuid(), {summary: "Bols", author: "Jul"})
  
      questions =  await questionRepo.getQuestions()
      let questionsLengthAfter = questions[0].answers.length
  
      expect(questionsLengthBefore + 1).not.toEqual(questionsLengthAfter)
  
    })

  })

  //////API TESTS
  
  describe('API TESTS', ()=>{
    test('GET / should return message', async () => {
      const response = await request(app).get("/")
      expect(response.statusCode).toBe(200)
      expect(response.body.message).toEqual("Welcome to responder!")
    })

    test('GET /questions should return array of questions', async () => {
      const response = await request(app).get("/questions")
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBeGreaterThan(1);
    })

    test('GET /questions/:questionId should return one question', async () => {
      const response = await request(app).get("/questions/00f3dd43-ae53-4430-8da1-b722e034c73d")
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(1);
    })

    test('GET /questions/:questionId/answers should return answers', async () => {
      const response = await request(app).get("/questions/50f9e662-fa0e-4ec7-b53b-7845e8f821c3/answers")
      expect(response.statusCode).toBe(200)
      expect(response.type).toEqual('application/json')
      expect(response.body.length).toBeGreaterThan(1);
      expect(response.body[0]).toHaveProperty("summary", 'The Earth is flat.')
    })
    
    test('GET /questions/:questionId/answers/:answersId should return answer', async () => {
      const response = await request(app).get("/questions/50f9e662-fa0e-4ec7-b53b-7845e8f821c3/answers/d498c0a3-5be2-4354-a3bc-78673aca0f31")
      expect(response.statusCode).toBe(200)
      expect(response.body.length).toBe(1);
      expect(response.type).toEqual('application/json')
      expect(response.body[0]).toHaveProperty("summary", 'It is egg-shaped.')
    })

    test('GET /questions/:questionId/answers/:answersId should not return answer', async () => {
      const response = await request(app).get("/questions/x/answers/818f2118-55cc-4f8a-81ca-0815e87ad3c4")
      expect(response.statusCode).toBe(200)
      expect(response.type).toEqual('application/json')
      expect(response.body).not.toHaveProperty("summary", 'line!')
    })

    test('Post /questions should add question', async () => {
      const response = await request(app).post("/questions").send({summary: "Which color is apple?", author: "Alehando"}).set('Accept', 'application/json')
      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty("author", 'Alehando')
    })
  
    test('Post /questions should not add question', async () => {
      const response = await request(app).post("/questions").send({sumamary: "Which color is apple?", author: "Alehando"}).set('Accept', 'application/json')
      expect(response.statusCode).toBe(400)
      expect(response.body).not.toHaveProperty("author", 'Alehando')
    })
  
    test('POST /questions/:questionId/answers should add new answer', async () => {
      const response = await request(app).post("/questions/50f9e662-fa0e-4ec7-b53b-7845e8f821c3/answers").send({summary: "Square", author: "Darius V"}).set('Accept', 'application/json')
      expect(response.statusCode).toBe(201)
      expect(response.body).toHaveProperty("summary", 'Square')
      expect(response.body).toHaveProperty("author", 'Darius V')
    })

    test('POST /questions/:questionId/answers should not add new answer', async () => {
      const response = await request(app).post("/questions/50f9e662-fa0e-4ec7-b53b-7845e8f821c3/answers").send({author: "Darius V"}).set('Accept', 'application/json')
      expect(response.statusCode).toBe(400)
      expect(response.body).not.toHaveProperty("author", 'Darius V')

      // Wrong uuid test case
      const secondResponse = await request(app).post("/questions/50f9e662-x-4ec7-b53b-7845e8f821c3/answers").send({summary: "Square", author: "Darius V"}).set('Accept', 'application/json')
      expect(secondResponse.statusCode).toBe(400)
      expect(secondResponse.body).not.toHaveProperty("summary", 'Square')
      expect(secondResponse.body).toEqual({})
    })

    test("Should create new question with 2 new answers", async()=>{
      let addQuestionResponse = await request(app).post("/questions").send({summary: "What is your car?", author: "Gustavo Mariano"}).set('Accept', 'application/json')
      expect(addQuestionResponse.statusCode).toBe(201)
      let addAsnwerOneResponse = await request(app).post(`/questions/${addQuestionResponse.body.id}/answers`).send({summary: "Reno", author: "Marcos Mariano"}).set('Accept', 'application/json')
      expect(addAsnwerOneResponse.statusCode).toBe(201)
      let addAnswerTwoResponse = await request(app).post(`/questions/${addQuestionResponse.body.id}/answers`).send({summary: "Audi", author: "Diego Beriani"}).set('Accept', 'application/json')
      expect(addAnswerTwoResponse.statusCode).toBe(201)
    })
  })
})
