const mongoose = require("mongoose");

const AulaSchema = mongoose.Schema({
  terca: Object,
  quarta: Object,
  quinta: Object,
  sabado: Object,
});

module.exports = mongoose.model("Aula", AulaSchema);
