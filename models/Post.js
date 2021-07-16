const mongoose = require('mongoose')

const PostSchema = mongoose.Schema({
    id: Number,
    title: String,
    body: String
})

module.exports = mongoose.model('Post', PostSchema)