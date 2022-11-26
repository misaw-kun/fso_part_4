const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/Blog')

const starterBlogs = [
  {
    title: '7 Best Courses to learn Data Structure and Algorithms',
    author: 'javinpaul',
    url: 'https://medium.com/javarevisited/7-best-courses-to-learn-data-structure-and-algorithms-d5379ae2588',
    likes: 797
  },
  {
    title: 'No Leetcode: The Stripe Interview Experience',
    author: 'Canonical',
    url: 'https://medium.com/@SantalTech/no-leetcode-the-stripe-interview-experience-cf1b29e6f55d',
    likes: 423
  }
]

beforeEach(async () => {
  await Blog.deleteMany({});

  let blogObject = new Blog(starterBlogs[0])
  await blogObject.save()

  blogObject = new Blog(starterBlogs[1])
  await blogObject.save()
})

test('correct amount of blog posts are returned', async () => {
  const resp = await api.get('/api/blogs')
  expect(resp.statusCode).toBe(200)
  expect(resp.headers['content-type']).toMatch(/application\/json/)
  expect(resp.body).toHaveLength(starterBlogs.length)
})

test('check for unique identifier named as id', async () => {
  const resp = await api.get('/api/blogs')
  for (let blog of resp.body) {
    expect(blog.id).toBeDefined()
  }
})

afterAll(() => {
  mongoose.connection.close()
})