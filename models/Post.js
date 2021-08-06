const mongoose = require("mongoose");

const PostSchema = mongoose.Schema({
  id: Number,
  title: String,
  subtitle: String,
  body: String,
  created: String,
});

module.exports = mongoose.model("Post", PostSchema);
