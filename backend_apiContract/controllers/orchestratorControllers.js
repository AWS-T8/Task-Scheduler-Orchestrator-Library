const orchestratorDB = require("../models/orchestratorDB");
const ObjectID = require("mongodb").ObjectID;
const intReg = new RegExp("^[0-9]+$");

exports.postOrchestrator = async (req, res) => {
  // Checking for invalid data
  if (
    !req.body.taskUrls ||
    !req.body.initialDelay ||
    !req.body.name ||
    !req.body.fallbackTaskUrl ||
    !req.body.timeDelayForConditionCheck ||
    !req.body.timeDelayBetweenRetries ||
    !req.body.conditionCheckRetries ||
    !req.body.conditionCheckTaskUrl ||
    req.body.taskUrls.length === 0
  ) {
    console.log(req.body);
    return res.status(406).json({ message: "Not Acceptable" });
  }

  try {
    const numberOfTasks = req.body.taskUrls.length;
    let startTime = [],
      endTime = [];
    for (let i = 0; i < numberOfTasks; ++i) {
      startTime.push("-");
      endTime.push("-");
    }
    let currTime = new Date();
    const finalTime = new Date(
      currTime.getTime() + parseInt(req.body.initialDelay)
    );
    const currentUrl = req.body.taskUrls[0];
    const orchestrator = new orchestratorDB({
      name: req.body.name,
      user: req.user.id,
      taskUrls: req.body.taskUrls,
      numberOfTasks: numberOfTasks,
      currentUrl: currentUrl,
      currentIndex: 0,
      scheduledTime: finalTime,
      status: "scheduled",
      startTime: startTime,
      endTime: endTime,
      timeDelayBetweenRetries: req.body.timeDelayBetweenRetries,
      timeDelayForConditionCheck: req.body.timeDelayForConditionCheck,
      conditionCheckRetries: req.body.conditionCheckRetries,
      conditionCheckTaskUrl: req.body.conditionCheckTaskUrl,
      fallbackTaskUrl: req.body.fallbackTaskUrl,
    });
    const newOrchestrator = await orchestrator.save();
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;

    const payloads = [
      { topic: topicName, messages: `${newOrchestrator._id} POST ORCH` },
    ];

    producer.send(payloads, function (err, data) {});
    return res.status(201).json({ id: newOrchestrator._id });
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};

exports.getOrchestrator = async (req, res, next) => {
  const id = req.params.id;
  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ message: "Orchestrator not found" });
  }
  let orchestrator;
  try {
    orchestrator = await orchestratorDB.findById(id);
    // If document not found return 404
    if (!orchestrator || orchestrator.user != req.user.id) {
      return res.status(404).json({ message: "Orchestrator not found" });
    }
  } catch (err) {
    // Server Error
    return res.status(500).json({ message: err.message });
  }
  res.orchestrator = orchestrator;
  next();
};

exports.getOrchestratorById = (req, res) => {
  return res.status(200).json({ status: res.orchestrator.status });
};

exports.updateOrchestrator = async (req, res) => {
  if (!req.body.initialDelay || req.body.initialDelay.length === 0) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  if (!intReg.test(req.body.initialDelay)) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  if (res.orchestrator.status !== "scheduled") {
    return res.status(403).json({ message: "Orchestrator cannot be updated" });
  }

  const currTime = new Date();
  const finalTime = new Date(
    currTime.getTime() + parseInt(req.body.initialDelay)
  );
  res.orchestrator.scheduledTime = finalTime;
  try {
    // Updating the document
    res.orchestrator.save().then(() => {
      const defaultTopicName = req.defaultTopicName;
      const topicName = req.body.topicName || defaultTopicName;
      const producer = req.producer;

      const payloads = [
        { topic: topicName, messages: `${res.task._id} UPDATE ORCH` },
      ];

      producer.send(payloads, function (err, data) {});

      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};

exports.cancelOrchestrator = async (req, res) => {
  try {
    //check for not scheduled
    if (res.orchestrator.status !== "scheduled") {
      return res
        .status(403)
        .json({ message: "Orchestrator cannot be cancelled" });
    }
    res.orchestrator.status = "cancelled";
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;
    const payloads = [
      { topic: topicName, messages: `${res.orchestrator._id} CANCEL ORCH` },
    ];

    res.orchestrator.save().then(() => {
      producer.send(payloads, function (err, data) {});
      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
