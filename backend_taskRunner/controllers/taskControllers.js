const taskDB = require("../models/taskDB");
const ObjectID = require("mongodb").ObjectID;

exports.startTask = async (req, res) => {
  const id = req.params.id;
  try {
    if (!ObjectID.isValid(id)) {
      return res.status(404).json({ message: "Task Not Found" });
    }
    let task = await taskDB.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }
    if (task.status != "scheduled") {
      return res
        .status(403)
        .json({ message: `Task is in ${task.status} state` });
    }
    task.status = "running";
    task.startTime = new Date();
    task.save().then((result) => {
      return res.status(200).json(result);
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const retryTask = (req, res, task) => {
  const defaultTopicName = req.defaultTopicName;
  const topicName = req.body.topicName || defaultTopicName;
  const producer = req.producer;

  const payloads = [{ topic: topicName, messages: `${task._id} RETRY` }];
  console.log(payloads);

  producer.send(payloads, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error Occured In Producing!" });
    } else {
      console.log("Message Sent!");
      //returning 202 so that task runner does not write the logs
      return res.status(202).json({ message: "Retry Scheduled!" });
    }
  });
};

exports.saveTask = async (req, res) => {
  const id = req.query.id;
  const newStatus = req.query.newStatus;
  try {
    if (!ObjectID.isValid(id)) {
      return res.status(404).json({ message: "Task Not Found" });
    }
    let task = await taskDB.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task Not Found" });
    }
    let retryCount = task.retryCount;
    if (newStatus === "failed" && retryCount > 0) {
      retryCount--;
      task.retryCount = retryCount;
      task.status = "scheduled";
      let currTime = new Date();
      const finalTime = new Date(
        currTime.getTime() + task.retryAfter
      );
      task.scheduledTime = finalTime;
      task.save().then((result) => {
        retryTask(req, res, result);
      });
    } else {
      task.status = newStatus;
      task.completetionTime = new Date();
      task.save().then((result) => {
        return res.status(200).json(result);
      });
    }
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
