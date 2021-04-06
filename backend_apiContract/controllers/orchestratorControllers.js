//Imports
const orchestratorDB = require("../models/orchestratorDB");
const ObjectID = require("mongodb").ObjectID;

//Regex to check for positive integers
const intReg = new RegExp("^[0-9]+$");

//Post Orchestration
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

  //Checking max number of retries
  if (req.body.conditionCheckRetries > 100) {
    return res
      .status(406)
      .json({ message: "Number of retries should not be more than 100" });
  }

  try {
    //Initializing startTime & endTime
    const numberOfTasks = req.body.taskUrls.length;
    let startTime = [],
      endTime = [];
    for (let i = 0; i < numberOfTasks; ++i) {
      startTime.push("-");
      endTime.push("-");
    }

    //Converting time delay to date
    let currTime = new Date();
    const finalTime = new Date(
      currTime.getTime() + parseInt(req.body.initialDelay)
    );

    //Setting current url to first task
    const currentUrl = req.body.taskUrls[0];

    //Creating the document in DB
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
      initialRetryCount: req.body.conditionCheckRetries,
      conditionCheckTaskUrl: req.body.conditionCheckTaskUrl,
      fallbackTaskUrl: req.body.fallbackTaskUrl,
    });
    const newOrchestrator = await orchestrator.save();

    //Setting up kafka variables
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;

    const payloads = [
      { topic: topicName, messages: `${newOrchestrator._id} POST ORCH` },
    ];

    //Sending message
    producer.send(payloads, function (err, data) {});
    return res.status(201).json({ id: newOrchestrator._id });
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Middleware to get a single Orchestration by id
exports.getOrchestrator = async (req, res, next) => {
  const id = req.params.id;
  //Input validation
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
    //Internal Server Error
    console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  //Save the result in response object
  res.orchestrator = orchestrator;
  next();
};

//Get Orchestration by id
exports.getOrchestratorById = (req, res) => {
  return res.status(200).json({ status: res.orchestrator.status });
};

//Update Orchestration by id
exports.updateOrchestrator = async (req, res) => {
  //Input validation
  if (!req.body.initialDelay || req.body.initialDelay.length === 0) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  if (!intReg.test(req.body.initialDelay)) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  if (res.orchestrator.status !== "scheduled") {
    return res.status(403).json({ message: "Orchestrator cannot be updated" });
  }

  //Setting new time
  const currTime = new Date();
  const finalTime = new Date(
    currTime.getTime() + parseInt(req.body.initialDelay)
  );
  res.orchestrator.scheduledTime = finalTime;
  try {
    // Updating the document
    res.orchestrator.save().then(() => {
      // Setting kafka variables
      const defaultTopicName = req.defaultTopicName;
      const topicName = req.body.topicName || defaultTopicName;
      const producer = req.producer;

      const payloads = [
        { topic: topicName, messages: `${res.task._id} UPDATE ORCH` },
      ];

      //Sending message to scheduler
      producer.send(payloads, function (err, data) {});

      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Cancel Orchestration by id
exports.cancelOrchestrator = async (req, res) => {
  try {
    //check for not scheduled
    if (res.orchestrator.status !== "scheduled") {
      return res
        .status(403)
        .json({ message: "Orchestrator cannot be cancelled" });
    }

    //Change status to cancelled
    res.orchestrator.status = "cancelled";

    //Setting up kafka variables
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;
    const payloads = [
      { topic: topicName, messages: `${res.orchestrator._id} CANCEL ORCH` },
    ];

    //Saving the document in db
    res.orchestrator.save().then(() => {
      //Sending message to scheduler
      producer.send(payloads, function (err, data) {});
      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    //Internal Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
