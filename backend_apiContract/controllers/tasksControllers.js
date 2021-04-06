//Imports
const taskDB = require("../models/taskDB");

//Get all Tasks
exports.getTasks = async (req, res) => {
  try {
    // Get all Tasks from db which match user id
    const allTasks = await taskDB.find({ user: req.user.id });
    //Mapping to only return usefull information
    const tasks = await allTasks.map((task) => {
      return {
        id: task._id,
        name: task.name,
        user: task.user,
        url: task.url,
        scheduledTime: task.scheduledTime.toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        }),
        status: task.status,
        startTime: task.startTime
          ? task.startTime.toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
            })
          : "Yet to start",

        retryCount: task.retryCount,
        retryAfter: task.retryAfter,
        initialRetryCount: task.initialRetryCount,
      };
    });
    //Reversing to get recent ones on top
    tasks.reverse();
    res.status(200).json(tasks);
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Get Tasks by status
exports.getTasksByStatus = async (req, res) => {
  try {
    // Get all Tasks from db on the basis of status & user id
    if (
      req.params.status === "completed" ||
      req.params.status === "failed" ||
      req.params.status === "successful" ||
      req.params.status === "running" ||
      req.params.status === "scheduled" ||
      req.params.status === "cancelled"
    ) {
      const allTasks = await taskDB.find({
        status: req.params.status,
        user: req.user.id,
      });
      const tasks = await allTasks.map((task) => {
        return {
          id: task._id,
          user: req.user.id,
          url: task.url,
          name: task.name,
          scheduledTime: task.scheduledTime.toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          }),
          status: task.status,
          startTime: task.startTime
            ? task.startTime.toLocaleString("en-US", {
                timeZone: "Asia/Kolkata",
              })
            : "Yet to start",

          retryCount: task.retryCount,
          retryAfter: task.retryAfter,
          initialRetryCount: task.initialRetryCount,
        };
      });
      //Reversing to get recent ones on top
      tasks.reverse();
      return res.status(200).json(tasks);
    }
    return res.status(404).json({ message: "Status not found" });
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
