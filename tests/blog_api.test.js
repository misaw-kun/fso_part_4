const mongoose = require('mongoose')
const Blog = require('../models/Blog')
const User = require('../models/User')
const helper = require('./blog_api_helper')
const { userExtractor } = require('../utils/middleware')

// jest.mock('../utils/middleware', () => jest.fn((req, res, next) => next()))
let TOKEN = ''

beforeAll(async () => {
  const mockUser = {
    username: "root",
    password: "secret"
  }

  const resp = await helper.request['post']('/api/login', mockUser, userExtractor)
  expect(resp.body.token).toBeDefined()
  TOKEN = resp.body.token
})

beforeEach(async () => {
  await Blog.deleteMany({});

  for (const blog of helper.starterBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

})

test('correct amount of blog posts are returned', async () => {
  const resp = await helper.request['get']('/api/blogs')
  expect(resp.statusCode).toBe(200)
  expect(resp.headers['content-type']).toMatch(/application\/json/)
  expect(resp.body).toHaveLength(helper.starterBlogs.length)
})

test('check for unique identifier named as id', async () => {
  const resp = await helper.request['get']('/api/blogs')
  for (let blog of resp.body) {
    expect(blog.id).toBeDefined()
  }
})

// tests that need auth
test('a blog post is created and saved successfully', async () => {
  const newBlog = {
    title: 'The difference between min-width vs max-width in CSS media queries',
    author: 'Nikita Hlopov',
    url: 'https://nikitahl.com/difference-between-min-width-vs-max-width',
    likes: 550
  }

  const result = await helper.request['post']('/api/blogs', newBlog, userExtractor, TOKEN)
  expect(result.statusCode).toBe(201)

  const resp = await helper.request['get']('/api/blogs')
  const titles = resp.body.map(blog => blog.title)

  expect(resp.body).toHaveLength(helper.starterBlogs.length + 1)
  expect(titles).toContain(
    'The difference between min-width vs max-width in CSS media queries'
  )
}, 100000)

test('if likes property is missing from a req, default to zero', async () => {

  const newBlog = {
    title: 'The difference between min-width vs max-width in CSS media queries',
    author: 'Nikita Hlopov',
    url: 'https://nikitahl.com/difference-between-min-width-vs-max-width',
  }

  const resp = await helper.request['post']('/api/blogs', newBlog, userExtractor, TOKEN)

  expect(resp.body.likes).toBe(0)
})

test('if title or url is missing recieve a bad req error', async () => {
  const newBlogMissingTitle = {
    author: 'Nikita Hlopov',
    url: 'https://nikitahl.com/difference-between-min-width-vs-max-width',
    likes: 550
  }

  const newBlogMissingUrl = {
    title: 'The difference between min-width vs max-width in CSS media queries',
    author: 'Nikita Hlopov',
    likes: 550
  }

  const resp1 = await helper.request['post']('/api/blogs', newBlogMissingTitle, userExtractor, TOKEN)

  const resp2 = await helper.request['post']('/api/blogs', newBlogMissingUrl, userExtractor, TOKEN)

  expect(resp1.statusCode).toBe(400)
  expect(resp2.statusCode).toBe(400)
})

test('a blog post is deleted by id, throw notfound if id does not exist', async () => {
  const { id } = await Blog.findOne({ title: "7 Best Courses to learn Data Structure and Algorithms" });

  const nonExistentId = '6383320fe5fddaacbe6c0d19'

  const resp1 = await helper.request['delete'](`/api/blogs/${id}`, null, userExtractor, TOKEN)
  const resp2 = await helper.request['delete'](`/api/blogs/${nonExistentId}`, null, userExtractor, TOKEN)

  expect(resp1.statusCode).toBe(204)
  expect(resp2.statusCode).toBe(404)

}, 100000)

test('likes for blog post is updated by id, throw notfound if id does not exist', async () => {

  const { id } = await Blog.findOne({ title: "7 Best Courses to learn Data Structure and Algorithms" });

  const nonExistentId = '6383320fe5fddaacbe6c0d19'

  const resp1 = await helper.request['put'](`/api/blogs/${id}`, { likes: 500 }, userExtractor, TOKEN)
  const resp2 = await helper.request['put'](`/api/blogs/${nonExistentId}`, { likes: 500 }, userExtractor, TOKEN)

  expect(resp1.status).toBe(204)
  expect(resp2.status).toBe(404)
})

afterAll(() => {
  mongoose.connection.close()
})