const bcrypt = require('bcrypt')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const User = require('../models/User')
const { usersInDb } = require('./blog_api_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('secret', 10)
    const user = new User({
      username: 'root',
      passwordHash
    })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'misaw_kun',
      name: 'wasim',
      password: 'p@55w0rd'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await usersInDb()
    const usernames = usersAtEnd.map(u => u.username)

    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and msg if username already taken', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'root',
      name: 'wasim',
      password: 'p@55w0rd'
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await usersInDb()

    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('creation fails if username or passwd isn\'t atleast 3 chars long', async () => {
    const usersAtStart = await usersInDb()

    const newUser1 = {
      username: 'ab',
      name: 'xyz',
      password: 'p@'
    }

    const newUser2 = {
      username: 'abc',
      name: 'xyz',
      password: 'p@'
    }

    const result1 = await api
      .post('/api/users')
      .send(newUser1)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const result2 = await api
      .post('/api/users')
      .send(newUser2)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result1.body.error).toContain('username must be atleast 3 chars long')
    expect(result2.body.error).toContain('username must be atleast 3 chars long')
  })
})