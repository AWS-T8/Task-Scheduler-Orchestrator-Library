const mongoose = require("mongoose");

const lambdaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  handlerName: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
    default: "Yet to be created",
  },
  runtime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  functionPath: {
    type: String,
    required: false,
    default: "Does not exist",
  },
  requirementsPath: {
    type: String,
    required: false,
    default: "Does not exist",
  },
});

module.exports = mongoose.model("lambda", lambdaSchema);
