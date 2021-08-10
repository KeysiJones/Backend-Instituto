const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Post = require("./models/Post.js");
const User = require("./models/User.js");
const Counter = require("./models/Counter");
const PORT = process.env.PORT || 3001;
const cors = require("cors");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
const generateSequence = require("./config/sequenceGenerator");

require("dotenv").config();

const app = express();
app.use(express.json());

const corsOptions = require("./config/corsOptions.js");

app.use(cors(corsOptions));

const connectionUrl = process.env.REACT_APP_DATABASE_URL;

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

app.get("/counters", auth, function (req, res) {
  Counter.find(function (err, counters) {
    if (err) {
      return res.status(500).json({
        error: err.message,
      });
    }

    res.status(200).json({ counters: counters });
  });
});

app.post("/posts", auth, function (req, res) {
  const { title, body, subtitle, created } = req.body;

  const post = new Post({
    title: title,
    body: body,
    subtitle: subtitle,
    created: created,
  });

  generateSequence("postId").then((sequenceValue) => {
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

app.put("/post/:postId", auth, function (req, res) {
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

app.delete("/post/:postId", auth, (req, res) => {
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

// Register
// ...

app.post("/register", async (req, res) => {
  // Our register logic starts here
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(password && username)) {
      res.status(400).send("All input is required");
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ username });

    if (oldUser) {
      return res.status(409).send("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      username: username,
      password: encryptedPassword,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, username: username },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

// Login
app.post("/login", async (req, res) => {
  // Our login logic starts here
  try {
    // Get user input
    const { password, username } = req.body;

    // Validate user input
    if (!(username && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign({ user_id: user._id }, process.env.TOKEN_KEY, {
        expiresIn: "2h",
      });

      // save user token
      user.token = token;

      // user
      res.status(200).json(user);
    }
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
  // Our register logic ends here
});

app.listen(PORT, () => console.log("programa iniciou"));
