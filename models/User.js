const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  passwordHash: String,
  blogs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ]
})

userSchema.set('toJSON', {
  transform: (doc, retDoc) => {
    retDoc.id = retDoc._id.toString()
    delete retDoc._id
    delete retDoc.__v
    delete retDoc.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User