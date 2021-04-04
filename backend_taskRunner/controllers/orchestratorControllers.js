const orchestratorDB = require("../models/orchestratorDB");
const ObjectID = require("mongodb").ObjectID;

exports.startOrchestrator = async (req, res) => {
  const id = req.params.id;
  try {
    if (!ObjectID.isValid(id)) {
      return res.status(404).json({ message: "Orchestration Not Found" });
    }
    let orchestrator = await orchestratorDB.findById(id);
    if (!orchestrator) {
      return res.status(404).json({ message: "Orchestration Not Found" });
    }
    let currentIndex = orchestrator.currentIndex;
    if (currentIndex === -1) {
      orchestrator.status = "running fallback";
    } else if (currentIndex & 1) {
      orchestrator.status = "running condition check";
    } else {
      // setting start time of the current task
      let taskNumber = currentIndex / 2 + 1;
      let currentTime = new Date();
      let newStartTime = [...orchestrator.startTime];
      newStartTime[taskNumber - 1] = currentTime
        .toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        })
        .toString();
      orchestrator.startTime = newStartTime;
      orchestrator.status = `running task #${taskNumber}`;
    }

    //Console output
    let output =
      "\n\n" +
      orchestrator.status[0].toUpperCase() +
      orchestrator.status.substring(1) +
      ` Hitting: ${orchestrator.currentUrl}`;
    console.log(output);

    orchestrator.save().then((result) => {
      return res.status(200).json(result);
    });
  } catch (error) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const produceOrchestrator = (req, res, orchestrator) => {
  const defaultTopicName = req.defaultTopicName;
  const topicName = req.body.topicName || defaultTopicName;
  const producer = req.producer;

  const payloads = [
    { topic: topicName, messages: `${orchestrator._id} POST ORCH` },
  ];

  producer.send(payloads, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error Occured In Producing!" });
    } else {
      console.log("Message Sent!");
      return res.status(200).json(orchestrator);
    }
  });
};

exports.saveOrchestrator = async (req, res) => {
  const id = req.query.id;
  const newStatus = req.query.newStatus;
  try {
    if (!ObjectID.isValid(id)) {
      return res.status(404).json({ message: "Orchestration Not Found" });
    }
    let orchestrator = await orchestratorDB.findById(id);
    if (!orchestrator) {
      return res.status(404).json({ message: "Orchestration Not Found" });
    }

    //Setting task number if current index is even
    let taskNumber;
    if (orchestrator.currentIndex % 2 === 0) {
      taskNumber = orchestrator.currentIndex / 2 + 1;
    }

    if (newStatus === "failed") {
      console.log(`URL Failed. CurrentIndex: ${orchestrator.currentIndex}`);
      // Case when any task will fail
      if (orchestrator.currentIndex % 2 === 0) {
        console.log(`Closing execution since a task #${taskNumber} failed`);
        // All the Task URL will be at Even Index just check (orchestrator.currentIndex%2==0)
        let newEndTime = [...orchestrator.endTime];
        newEndTime[taskNumber - 1] = "Failed";
        orchestrator.endTime = newEndTime;
        orchestrator.status = `failed at task #${taskNumber}`;
        orchestrator.save().then((result) => {
          return res.status(200).json(result);
        });
      } else {
        //Case when condition check will fail
        let retryCount = orchestrator.conditionCheckRetries; // added now
        if (orchestrator.currentIndex === -1) {
          console.log("Fallback failed!");
          orchestrator.status = "failed fallback";
          orchestrator.save().then((result) => {
            return res.status(200).json(result);
          });
        } else if (retryCount === 0) {
          console.log("No retries left, scheduling fallback");
          //Run Fallback
          orchestrator.status = "scheduled fallback";
          orchestrator.currentUrl = orchestrator.fallbackTaskUrl;
          orchestrator.currentIndex = -1;
          let currTime = new Date();
          const finalTime = new Date(currTime.getTime());
          orchestrator.scheduledTime = finalTime;
          orchestrator.save().then((result) => {
            produceOrchestrator(req, res, result);
          });
        } else {
          console.log("retrying condition check");
          retryCount--;
          //run conditionCheck
          orchestrator.currentUrl = orchestrator.conditionCheckTaskUrl;
          orchestrator.conditionCheckRetries = retryCount;
          orchestrator.status = "scheduled condition check";
          let currTime = new Date();
          const finalTime = new Date(
            currTime.getTime() + orchestrator.timeDelayBetweenRetries
          );
          orchestrator.scheduledTime = finalTime;
          orchestrator.save().then((result) => {
            produceOrchestrator(req, res, result);
          });
        }
      }
    } else if (newStatus === "completed") {
      console.log(`URL Success: CurrentIndex: ${orchestrator.currentIndex}`);
      // Can be completed
      if (orchestrator.currentIndex === -1) {
        console.log("Fallback successfully executed!");
        orchestrator.status = "completed fallback";
        orchestrator.save().then((result) => {
          return res.status(200).json(result);
        });
      } else if (taskNumber && taskNumber === orchestrator.numberOfTasks) {
        let currentTime = new Date();
        let newEndTime = [...orchestrator.endTime];
        newEndTime[taskNumber - 1] = currentTime
          .toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })
          .toString();
        orchestrator.endTime = newEndTime;
        console.log(`Saving task #${taskNumber}!`);
        orchestrator.status = "completed all tasks";
        orchestrator.save().then((result) => {
          console.log(`Orchestration complete`);
          return res.status(200).json(result);
        });
      } else if (orchestrator.currentIndex & 1) {
        console.log("Condition check was success");
        //Setting current url to the url of next task to be executed
        orchestrator.currentUrl =
          orchestrator.taskUrls[(orchestrator.currentIndex + 1) / 2];
        orchestrator.status = `scheduled task #${taskNumber + 1}`;
        orchestrator.currentIndex = orchestrator.currentIndex + 1;
        let currTime = new Date();
        const finalTime = new Date(currTime.getTime());
        orchestrator.scheduledTime = finalTime;
        orchestrator.save().then((result) => {
          produceOrchestrator(req, res, result);
        });
      } else if (orchestrator.currentIndex === -1) {
        console.log("Fallback successfully executed!");
        orchestrator.status = "completed fallback";
        orchestrator.save().then((result) => {
          return res.status(200).json(result);
        });
      } else if (orchestrator.currentIndex % 2 == 0) {
        console.log(`Saving task #${taskNumber}`);
        // Change currentUrl to conditionCheckUrl
        let currTime = new Date();
        const finalTime = new Date(
          currTime.getTime() + orchestrator.timeDelayForConditionCheck
        );
        let newEndTime = [...orchestrator.endTime];
        newEndTime[taskNumber - 1] = currTime
          .toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          })
          .toString();
        orchestrator.endTime = newEndTime;
        orchestrator.scheduledTime = finalTime;
        orchestrator.currentUrl = orchestrator.conditionCheckTaskUrl;
        orchestrator.status = "scheduled condition check";
        orchestrator.currentIndex = orchestrator.currentIndex + 1;
        orchestrator.save().then((result) => {
          produceOrchestrator(req, res, result);
        });
      }
    } else {
      return res.status(400).json({ message: "Invalid Status" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
