const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0
  blogs.forEach(blog => sum += blog.likes)
  return sum
}

const favoriteBlog = (blogs) => {
  let likes = []

  blogs.forEach(blog => likes.push(blog.likes))

  const favorite = blogs.find(blog => blog.likes === Math.max(...likes))

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  let byBlogCount = _.countBy(blogs, (blog) => blog.author)

  let topAuthor = _.maxBy(_.keys(byBlogCount), (key) => byBlogCount[key])
  let topCount = _.maxBy(_.values(byBlogCount), (value) => value)

  // debugger
  return {
    author: topAuthor,
    blogs: topCount
  }
}

const mostLikes = (blogs) => {
  let byBlogCount = _.entries(_.groupBy(blogs, (blog) => blog.author))
  let totalLikesPerAuthor = {}
  byBlogCount.forEach(
    pair => totalLikesPerAuthor[pair[0]] = pair[1].reduce((total, curr) => total + curr.likes, 0))

  return {
    author: _.maxBy(_.keys(totalLikesPerAuthor), (key) => totalLikesPerAuthor[key]),
    likes: _.maxBy(_.values(totalLikesPerAuthor), (value) => value)
  }
  // debugger
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}