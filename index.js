const { json } = require('express')
const express = require('express')
const mongoose = require('mongoose')
const Post = require('./models/Post.js')
require('dotenv').config()

const app = express()
app.use(express.json())

const connectionUrl = process.env.REACT_APP_DATABASE_URL

mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})
    .then(() => console.log(`connected to mongoDB`))
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
    console.log("*************** logging the req *******************")
    console.log(req)
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

app.listen(PORT, () => console.log('programa iniciou'))