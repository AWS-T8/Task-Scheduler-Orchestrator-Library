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
  scheduledTime: {
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
  completetionTime: {
    type: String,
    required: false,
  },
  initialRetryCount: {
    type: Number,
    required: true,
  },
  retryCount: {
    type: Number,
    required: false,
    default: 0,
  },
  retryAfter: {
    type: Number,
    required: false,
    default: 0,
  },
});

module.exports = mongoose.model("task", taskSchema);
