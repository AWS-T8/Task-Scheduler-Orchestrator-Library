const orchestratorDB = require("../models/orchestratorDB");

exports.getOrchestrators = async (req, res) => {
  try {
    // Get all tasks from db
    const allOrchestrators = await orchestratorDB.find({ user: req.user.id });
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
        conditionCheckTaskUrl: orchestrator.conditionCheckTaskUrl,
        fallbackTaskUrl: orchestrator.fallbackTaskUrl,
        endTime: orchestrator.endTime,
        startTime: orchestrator.startTime,
      };
    });
    orchestrators.reverse();
    res.status(200).json(orchestrators);
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};

exports.getOrchestratorsByStatus = async (req, res) => {
  try {
    // Get all tasks from db on the basis of status
    if (
      req.params.status === "completed" ||
      req.params.status === "failed" ||
      req.params.status === "fallback completed" ||
      req.params.status === "scheduled fallback" ||
      req.params.status === "scheduled condition check" ||
      req.params.status === "running" ||
      req.params.status === "scheduled" ||
      req.params.status === "cancelled"
    ) {
      const allOrchestrators = await orchestratorDB.find({
        status: req.params.status,
        user: req.user.id,
      });
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
          conditionCheckTaskUrl: orchestrator.conditionCheckTaskUrl,
          fallbackTaskUrl: orchestrator.fallbackTaskUrl,
          endTime: orchestrator.endTime,
          startTime: orchestrator.startTime,
        };
      });
      orchestrators.reverse();
      return res.status(200).json(orchestrators);
    }
    return res.status(404).json({ message: "Status not found" });
  } catch (err) {
    // Server Error
    res.status(500).json({ message: err.message });
  }
};
