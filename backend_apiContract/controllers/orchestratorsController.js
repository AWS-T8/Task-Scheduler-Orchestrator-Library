//Imports
const orchestratorDB = require("../models/orchestratorDB");

//Get all Orchestrations
exports.getOrchestrators = async (req, res) => {
  try {
    // Get all Orchestrations from db which match user id
    const allOrchestrators = await orchestratorDB.find({ user: req.user.id });
    //Mapping to only return usefull information
    const orchestrators = await allOrchestrators.map((orchestrator) => {
      return {
        id: orchestrator._id,
        name: orchestrator.name,
        user: req.user.id,
        currentIndex: orchestrator.currentIndex,
        scheduledTime: orchestrator.scheduledTime.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        status: orchestrator.status,
        currentUrl: orchestrator.currentUrl,
        taskUrls: orchestrator.taskUrls,
        numberOfTasks: orchestrator.numberOfTasks,
        timeDelayBetweenRetries: orchestrator.timeDelayBetweenRetries,
        timeDelayForConditionCheck: orchestrator.timeDelayForConditionCheck,
        conditionCheckRetries: orchestrator.conditionCheckRetries,
        initialRetryCount: orchestrator.initialRetryCount,
        conditionCheckTaskUrl: orchestrator.conditionCheckTaskUrl,
        fallbackTaskUrl: orchestrator.fallbackTaskUrl,
        endTime: orchestrator.endTime,
        startTime: orchestrator.startTime,
      };
    });
    //Reversing to get recent ones on top
    orchestrators.reverse();
    res.status(200).json(orchestrators);
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Orchestration by status
exports.getOrchestratorsByStatus = async (req, res) => {
  try {
    // Get all Orchestrations from db on the basis of status & user id
    const allOrchestrators = await orchestratorDB.find({
      status: req.params.status,
      user: req.user.id,
    });
    // Mapping to only return usefull information
    const orchestrators = await allOrchestrators.map((orchestrator) => {
      let tempOrch = { ...orchestrator };
      delete tempOrch._id;
      return {
        id: orchestrator._id,
        name: orchestrator.name,
        user: req.user.id,
        scheduledTime: orchestrator.scheduledTime.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        status: orchestrator.status,
        currentUrl: orchestrator.currentUrl,
        firstTaskUrl: orchestrator.firstTaskUrl,
        secondTaskUrl: orchestrator.secondTaskUrl,
        timeDelayBetweenRetries: orchestrator.timeDelayBetweenRetries,
        timeDelayForConditionCheck: orchestrator.timeDelayForConditionCheck,
        conditionCheckRetries: orchestrator.conditionCheckRetries,
        initialRetryCount: orchestrator.initialRetryCount,
        conditionCheckTaskUrl: orchestrator.conditionCheckTaskUrl,
        fallbackTaskUrl: orchestrator.fallbackTaskUrl,
        endTime: orchestrator.endTime,
        startTime: orchestrator.startTime,
      };
    });
    //Reversing to get recent ones on top
    orchestrators.reverse();
    return res.status(200).json(orchestrators);
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
