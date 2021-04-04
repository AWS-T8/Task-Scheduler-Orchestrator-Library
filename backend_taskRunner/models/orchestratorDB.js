const mongoose = require("mongoose");

const orchestratorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  taskUrls: {
    type: Array,
    required: true,
  },
  startTime: {
    type: Array,
    required: true,
  },
  startTime: {
    type: Array,
    required: true,
  },
  scheduledTime: {
    type: Date,
    required: true,
  },
  conditionCheckTaskUrl: {
    type: String,
    required: true,
  },
  fallbackTaskUrl: {
    type: String,
    required: true,
  },
  timeDelayForConditionCheck: {
    type: Number,
    required: true,
  },
  conditionCheckRetries: {
    type: Number,
    required: true,
  },
  timeDelayBetweenRetries: {
    type: Number,
    required: true,
  },
  currentUrl: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  procID: {
    type: Number,
    required: false,
  },
  currentIndex: {
    type: Number,
    required: true,
  },
  numberOfTasks: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("orchestrator", orchestratorSchema);
