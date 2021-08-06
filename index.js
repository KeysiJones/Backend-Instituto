const express = require("express");
const mongoose = require("mongoose");
const Post = require("./models/Post.js");
const Counter = require("./models/Counter");
const PORT = process.env.PORT || 3001;
const cors = require("cors");

require("dotenv").config();

var corsOptions = {
  origin: "https://keysijones-blog.vercel.app",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));

const connectionUrl = process.env.REACT_APP_DATABASE_URL;

function getNextSequenceValue(sequenceName) {
  return Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    { new: true, upsert: true }
  ).then((sequenceDocument) => sequenceDocument.sequence_value);
}

mongoose.Promise = global.Promise;

mongoose
  .connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.log(err));

mongoose.connection.on("error", (err) => {
  throw "failed connect to MongoDB";
});

app.get("/", function (req, res) {
  res.status(200).json({ mensagem: "Seja bem vindo meu amigo(a)" });
});

app.get("/posts", function (req, res) {
  Post.find(function (err, posts) {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.status(200).json({ posts: posts });
  });
});

app.get("/counters", function (req, res) {
  Counter.find(function (err, counters) {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.status(200).json({ counters: counters });
  });
});

app.post("/posts", function (req, res) {
  const { title, body, subtitle, created } = req.body;

  const post = new Post({
    title: title,
    body: body,
    subtitle: subtitle,
    created: created,
  });

  getNextSequenceValue("postId").then((sequenceValue) => {
    post.id = sequenceValue;

    post.save(function (err, newPost) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      res.status(200).json({ msg: "Post saved !" });
    });
  });
});

app.get("/post/:postId", function (req, res) {
  const postId = req.params.postId;

  Post.findOne({ id: postId }, function (err, post) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (post == null) {
      return res.status("404").json({ msg: "Post não encontrado !" });
    }

    return res.status(200).json(post);
  });
});

app.put("/posts/:postId", function (req, res) {
  const postId = req.params.postId;

  const { title, subtitle, body } = req.body;

  Post.findOneAndUpdate(
    { id: postId },
    { title, subtitle, body },
    function (err, post) {
      if (err) {
        return res.status(500).json({ erro: err.message });
      }

      return res.status(200).json({
        msg: `Título do post com id ${postId} atualizado com sucesso!`,
      });
    }
  );
});

app.delete("/posts/:postId", (req, res) => {
  const postId = req.params.postId;

  Post.deleteOne({ id: postId }, function (err, post) {
    if (err) {
      return res.status(500).json({ erro: err.message });
    }

    if (post == null) {
      return res.status("404").json({ msg: "Post não encontrado !" });
    }

    return res.status(200).json({ msg: "Post deletado com sucesso" });
  });
});

app.listen(PORT, () => console.log("programa iniciou"));
