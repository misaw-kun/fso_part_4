const testingRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')

const seedBlogs = [
  {
    title: 'blog with likes',
    author: 'redpanda',
    url: 'blabla',
    likes: ['63908aaf4935c4ebf199716b', '63908aaf4935c4ebf199716c'],
  },
  {
    title: 'blog with more likes',
    author: 'redpanda',
    url: 'blabla',
    likes: ['63908aaf4935c4ebf199716b', '63908aaf4935c4ebf199716d', '63908aaf4935c4ebf199716e'],
  }
]

testingRouter.post('/reset', async (request, response) => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

testingRouter.post('/seed', async (request, response) => {
  await Blog.insertMany(seedBlogs)
  response.status(204).end()
})

module.exports = testingRouter