const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/Blog')
const helper = require('./blog_api_helper')

beforeEach(async () => {
  await Blog.deleteMany({});

  for (const blog of helper.starterBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('correct amount of blog posts are returned', async () => {
  const resp = await api.get('/api/blogs')
  expect(resp.statusCode).toBe(200)
  expect(resp.headers['content-type']).toMatch(/application\/json/)
  expect(resp.body).toHaveLength(helper.starterBlogs.length)
})

test('check for unique identifier named as id', async () => {
  const resp = await api.get('/api/blogs')
  for (let blog of resp.body) {
    expect(blog.id).toBeDefined()
  }
})

test('a blog post is created and saved successfully', async () => {
  const newBlog = {
    title: 'The difference between min-width vs max-width in CSS media queries',
    author: 'Nikita Hlopov',
    url: 'https://nikitahl.com/difference-between-min-width-vs-max-width',
    likes: 550
  }

  await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const resp = await api.get('/api/blogs')
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

  const resp = await api.post('/api/blogs').send(newBlog)

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

  const resp1 = await api.post('/api/blogs').send(newBlogMissingTitle)

  const resp2 = await api.post('/api/blogs').send(newBlogMissingUrl)

  expect(resp1.statusCode).toBe(400)
  expect(resp2.statusCode).toBe(400)
})

test('a blog post is deleted by id, throw notfound if id does not exist', async () => {
  const { id } = await Blog.findOne({ title: "7 Best Courses to learn Data Structure and Algorithms" });

  const nonExistentId = '6383320fe5fddaacbe6c0d19'

  const resp1 = await api.delete(`/api/blogs/${id}`)
  const resp2 = await api.delete(`/api/blogs/${nonExistentId}`)

  expect(resp1.statusCode).toBe(204)
  expect(resp2.statusCode).toBe(404)

})

test('likes for blog post is updated by id, throw notfound if id does not exist', async () => {

  const { id } = await Blog.findOne({ title: "7 Best Courses to learn Data Structure and Algorithms" });

  const nonExistentId = '6383320fe5fddaacbe6c0d19'

  const resp1 = await api.put(`/api/blogs/${id}`).send({ likes: 500 })
  const resp2 = await api.put(`/api/blogs/${nonExistentId}`).send({ likes: 500 })

  expect(resp1.status).toBe(204)
  expect(resp2.status).toBe(404)
})

afterAll(() => {
  mongoose.connection.close()
})