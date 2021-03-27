const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  execTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  result: {
    type: Object,
    required: false,
  },
  procID: {
    type: String,
    required: false,
  },
  startTime: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("task", taskSchema);
