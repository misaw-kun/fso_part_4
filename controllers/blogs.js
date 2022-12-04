const blogRouter = require('express').Router()
const Blog = require('../models/Blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
  return response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  try {
    const { body, user } = request

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

  } catch (e) {
    next(e)
  }
})

blogRouter.delete('/:id', middleware.userExtractor, async (request, response, next) => {

  try {
    const { id } = request.params
    const user = request.user
    const blogtoBeDeleted = await Blog.findById(id)

    if (!blogtoBeDeleted) {
      const error = new Error('blog with supplied id does not exist')
      error.name = 'NotFoundError'
      throw error
    }

    if (blogtoBeDeleted.user.toString() === user.id) {
      await Blog.findByIdAndRemove(id)
      response.status(204).end()
    } else {
      response.status(401).send({
        error: 'unauthorized to delete this post'
      })
    }
  } catch (e) {
    next(e)
  }

})

blogRouter.put('/:id', async (request, response) => {
  const body = request.body

  const updatedBlog = {
    likes: body.likes
  }

  const result = await Blog.findByIdAndUpdate(request.params.id, updatedBlog, { new: true })

  if (!result) {
    const error = new Error('blog with supplied id does not exist')
    error.name = 'NotFoundError'
    throw error
  }

  response.status(204).send(result)
})

module.exports = blogRouter