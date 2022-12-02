const User = require('../models/User')

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

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  starterBlogs,
  usersInDb
}