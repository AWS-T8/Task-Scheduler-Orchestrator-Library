//Imports
const taskDB = require("../models/taskDB");
const ObjectID = require("mongodb").ObjectID;

const intReg = new RegExp("^[0-9]+$");

//Post Task
exports.postTask = async (req, res) => {
  // Checking for invalid data
  if (
    !req.body.url ||
    !req.body.timeDelay ||
    !req.body.name ||
    !intReg.test(req.body.timeDelay) ||
    (req.body.retryCount && !intReg.test(req.body.retryCount)) ||
    (req.body.retryAfter && !intReg.test(req.body.retryAfter))
  ) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  //Checking max number of retries
  if (req.body.retryCount && req.body.retryCount > 100) {
    return res
      .status(406)
      .json({ message: "Number of retries should not be more than 100" });
  }

  try {
    //Converting time delay to date
    let currTime = new Date(req.body.timeDelay);
    const finalTime = new Date(currTime.getTime());

    let retryCount = 0,
      retryAfter = 0;
    if (req.body.retryCount) {
      retryCount = req.body.retryCount;
    }
    if (req.body.retryAfter) {
      retryAfter = req.body.retryAfter;
    }

    //Creating the document in DB
    const task = new taskDB({
      name: req.body.name,
      user: req.user.id,
      url: req.body.url,
      scheduledTime: finalTime,
      status: "scheduled",
      initialRetryCount: retryCount,
      retryCount: retryCount,
      retryAfter: retryAfter,
    });
    const newTask = await task.save();

    //Setting up kafka variables
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;

    const payloads = [{ topic: topicName, messages: `${newTask._id} POST` }];
    //Sending message
    producer.send(payloads, function (err, data) {});
    return res.status(201).json({ id: newTask._id });
  } catch (err) {
    //Internal Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Middleware to get a single Task by id
exports.getTask = async (req, res, next) => {
  const id = req.params.id;
  //Input validation
  if (!ObjectID.isValid(id)) {
    return res.status(404).json({ message: "Task not found" });
  }

  let task;
  try {
    task = await taskDB.findById(id);
    // If document not found return 404
    if (!task || task.user != req.user.id) {
      return res.status(404).json({ message: "Task not found" });
    }
  } catch (err) {
    //Internal Server Error
    console.log(err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
  //Save the result in response object
  res.task = task;
  next();
};

//Get Tesk by id
exports.getTaskById = (req, res) => {
  return res.status(200).json({ status: res.task.status });
};

//Update Task by id
exports.updateTask = async (req, res) => {
  //Input validation
  if (!req.body.timeDelay || req.body.timeDelay.length === 0) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  if (!intReg.test(req.body.timeDelay)) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  if (res.task.status !== "scheduled") {
    return res.status(403).json({ message: "Task cannot be updated" });
  }

  //Setting new time
  const currTime = new Date();
  const finalTime = new Date(currTime.getTime() + parseInt(req.body.timeDelay));
  res.task.scheduledTime = finalTime;
  try {
    // Updating the document
    res.task.save().then(() => {
      // Setting kafka variables
      const defaultTopicName = req.defaultTopicName;
      const topicName = req.body.topicName || defaultTopicName;
      const producer = req.producer;

      const payloads = [
        { topic: topicName, messages: `${res.task._id} UPDATE` },
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

//Cancel Task by id
exports.cancelTask = async (req, res) => {
  res.task;
  try {
    //check for not scheduled
    if (res.task.status !== "scheduled") {
      return res.status(403).json({ message: "Task cannot be cancelled" });
    }

    //Change status to cancelled
    res.task.status = "cancelled";
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;
    const payloads = [{ topic: topicName, messages: `${res.task._id} CANCEL` }];

    //Saving the document in db
    res.task.save().then(() => {
      producer.send(payloads, function (err, data) {});
      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    //Internal Server Error
    res.status(400).json({ message: "Internal Server Error" });
  }
};
