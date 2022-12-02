const blogRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogRouter.post('/', async (request, response) => {
  const body = request.body

  const user = await User.findById(body.user)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  const blog = await Blog.findByIdAndRemove(id)

  if (!blog) {
    const error = new Error('blog with supplied id does not exist')
    error.name = 'NotFoundError'
    throw error
  }

  response.status(204).end()
})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const updatedBlog = {
    likes: body.likes
  }

  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })
  console.log(result);

  if (!result) {
    const error = new Error('blog with supplied id does not exist')
    error.name = 'NotFoundError'
    throw error
  }

  response.status(204).send(result)
})

module.exports = blogRouter