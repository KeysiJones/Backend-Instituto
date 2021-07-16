const { json } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const Post = require('./models/Post.js')

const app = express()

mongoose.connect("mongodb://localhost:27017/post", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log('connected to mongodb'))
    .catch(err => console.log(err))

app.get("/posts", function (req, res) {
    Post.find(function (err, posts) {
        if (err) {
            return res.status(500).json({
                error: err.message
            })
        }

        res.status(200).json({ posts: posts })
    })
})

app.post("/posts", function (req, res) {
    const { id, title, body } = req.body

    const post = new Post({
        id: id,
        title: title,
        body: body
    })

    post.save(function (err, newPost) {
        if (err) {
            return res.status(500).json({ erro: err.message })
        }

        res.status(200).json({ msg: "Post saved !" })
    })
})

app.get("/posts/:postId", function (req, res) {
    const postId = req.params.postId

    Post.findOne({ id: postId }, function (err, post) {
        if (err) {
            return res.status(500).json({ erro: err.message })
        }

        if (post == null) {
            return res.status('404').json({ msg: 'Post não encontrado !' })
        }

        return res.status(200).json(post)
    })
})

app.put("/posts/:postId", function (req, res) {
    const postId = req.params.postId

    const { title } = req.body

    Post.findOneAndUpdate({ id: postId }, {title: title}, function(err, post) {
        if (err) {
            return res.status(500).json({ erro: err.message })
        }

        return res.status(200).json({msg: 'Título do post atualizado !'})
    })
})

app.delete("/posts/:postId", (req, res) => {
    
    const postId = req.params.postId
    
    Post.deleteOne({id: postId}, function(err, post) {
        if(err) {
            return res.status(500).json({ erro: err.message })
        }

        if (post == null) {
            return res.status('404').json({ msg: 'Post não encontrado !' })
        }

        return res.status(200).json({msg: 'Post deletado com sucesso'})
    })
})

const PORT = 3000
app.use(json())
app.listen(PORT, () => console.log('programa iniciou'))