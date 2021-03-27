const taskDB = require("../models/taskDB");
const ObjectID = require("mongodb").ObjectID;

const intReg = new RegExp("^[0-9]+$");

exports.postTask = async (req, res) => {
  // Checking for invalid data
  if (
    !req.body.url ||
    !req.body.timeDelay ||
    !req.body.name ||
    !intReg.test(req.body.timeDelay)
  ) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  try {
    let currTime = new Date();
    const finalTime = new Date(
      currTime.getTime() + parseInt(req.body.timeDelay)
    );
    const task = new taskDB({
      name: req.body.name,
      user: req.user.id,
      url: req.body.url,
      execTime: finalTime,
      status: "scheduled",
    });
    const newTask = await task.save();
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;

    const payloads = [{ topic: topicName, messages: `${newTask._id} POST` }];

    producer.send(payloads, function (err, data) {});
    return res.status(201).json({ id: newTask._id });
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};

exports.getTask = async (req, res, next) => {
  const id = req.params.id;
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
    // Server Error
    return res.status(500).json({ message: err.message });
  }
  res.task = task;
  next();
};

exports.getTaskById = (req, res) => {
  return res.status(200).json({ status: res.task.status });
};

exports.updateTask = async (req, res) => {
  if (!req.body.timeDelay || req.body.timeDelay.length === 0) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  if (!intReg.test(req.body.timeDelay)) {
    return res.status(406).json({ message: "Not Acceptable" });
  }

  if (res.task.status !== "scheduled") {
    return res.status(403).json({ message: "Task cannot be updated" });
  }

  const currTime = new Date();
  const finalTime = new Date(currTime.getTime() + parseInt(req.body.timeDelay));
  res.task.execTime = finalTime;
  try {
    // Updating the document
    res.task.save().then(() => {
      const defaultTopicName = req.defaultTopicName;
      const topicName = req.body.topicName || defaultTopicName;
      const producer = req.producer;

      const payloads = [
        { topic: topicName, messages: `${res.task._id} UPDATE` },
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

exports.cancelTask = async (req, res) => {
  // Checking for invalid data
  res.task;
  try {
    //check for not scheduled
    if (res.task.status !== "scheduled") {
      return res.status(403).json({ message: "Task cannot be cancelled" });
    }
    res.task.status = "cancelled";
    const defaultTopicName = req.defaultTopicName;
    const topicName = req.body.topicName || defaultTopicName;
    const producer = req.producer;
    const payloads = [{ topic: topicName, messages: `${res.task._id} CANCEL` }];

    res.task.save().then(() => {
      producer.send(payloads, function (err, data) {});
      res.status(200).json({ success: true });
      res.end();
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
