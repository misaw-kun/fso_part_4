const blogRouter = require('express').Router()
const Blog = require('../models/Blog')
const middleware = require('../utils/middleware')

blogRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  // .populate('likes', { username: 1 })
  return response.json(blogs)
})

blogRouter.post('/', middleware.userExtractor, async (request, response, next) => {
  try {
    const { body, user } = request

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || [],
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
      await blogtoBeDeleted.remove()
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

blogRouter.put('/:id/likes', middleware.userExtractor, async (request, response, next) => {

  try {
    const { id } = request.params
    const { body, user } = request
    const blogToBeUpdated = await Blog.findById(id)

    if (!blogToBeUpdated) {
      const error = new Error('blog with supplied id does not exist')
      error.name = 'NotFoundError'
      throw error
    }

    if (!user) {
      return response.status(401).send({
        error: 'login to like this blog'
      })
    }

    let result = {}
    if (blogToBeUpdated?.likes?.includes(user.id)) {
      result = await blogToBeUpdated.updateOne({
        $pull: {
          likes: body.likes
        }
      }, { new: true })
    } else {
      result = await blogToBeUpdated.updateOne({
        $push: {
          likes: body.likes
        }
      }, { new: true })
    }

    response.status(200).send(result)

  } catch (e) {
    next(e)
  }
})

module.exports = blogRouter