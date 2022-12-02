const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  author: String,
  url: {
    type: String,
    required: true
  },
  likes: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

blogSchema.set('toJSON', {
  transform: (doc, retDoc) => {
    retDoc.id = retDoc._id.toString()
    delete retDoc._id
    delete retDoc.__v
  }
})

module.exports = mongoose.model('Blog', blogSchema)