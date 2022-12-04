const User = require('../models/User')

const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const starterBlogs = [
  {
    title: '7 Best Courses to learn Data Structure and Algorithms',
    author: 'javinpaul',
    url: 'https://medium.com/javarevisited/7-best-courses-to-learn-data-structure-and-algorithms-d5379ae2588',
    likes: 797,
    user: '638cb8bcce0a258104109c5e'
  },
  {
    title: 'No Leetcode: The Stripe Interview Experience',
    author: 'Canonical',
    url: 'https://medium.com/@SantalTech/no-leetcode-the-stripe-interview-experience-cf1b29e6f55d',
    likes: 423,
    user: '638cb8bcce0a258104109c5e'
  }
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

// seperating request logic for tests
const hook = (method = 'post') =>
  async (path, data = null, middleware = null, TOKEN = null) =>
    await api[method](path, middleware)
      .send(data)
      .set('Authorization', `Bearer ${TOKEN}`)

const request = {
  post: hook('post'),
  get: hook('get'),
  put: hook('put'),
  delete: hook('delete')
}

module.exports = {
  starterBlogs,
  usersInDb,
  request
}