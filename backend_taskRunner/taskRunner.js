const axios = require("axios");
require("dotenv").config({
  path: "./.env",
});
const mongoose = require("mongoose");
const taskDB = require("./models/taskDB");
const ObjectID = require("mongodb").ObjectID;
const fs = require("fs");

mongoose.connect(process.env.DATABASE_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => {
  console.log("Connected to Database");

  const args = process.argv.slice(2);
  if (args.length === 0) {
    db.close();
    process.exit(0);
  }
  const id = args[0];
  execTask(id);
});

const writeLog = async (taskLog) => {
  let data = await JSON.stringify(taskLog, null, 2);
  fs.writeFile(
    `${process.env.OUTPUT_PATH}/${taskLog.id}-log.json`,
    data,
    (err) => {
      if (err) {
        throw err;
      }
      console.log("Data written to file");
      db.close();
      process.exit(0);
    }
  );
};

const execTask = async (id) => {
  if (!ObjectID.isValid(id)) {
    db.close();
    process.exit(0);
  }
  const currentTask = await taskDB.findById(id);
  if (currentTask.status != "scheduled") {
    db.close();
    process.exit(0);
  }
  currentTask.status = "running";
  //   let schTime = currentTask.execTime.toString().replace(/[{()}]/g, '');
  let schTime = currentTask.execTime.toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  let execTime = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });

  currentTask.save().then((task) => {
    const config = {
      timeout: 930000,
    };
    axios
      .get(task.url, config)
      .then((result) => {
        if (result.status === 200) {
          task.status = "completed";
        } else {
          task.status = "failed";
        }
        task.save().then((res) => {
          const completeTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Kolkata",
          });
          const output = `schTime: ${schTime} || execTime: ${execTime} || completeTime: ${completeTime}\n`;
          console.log(output);
          let taskLog = {
            id: res._id,
            scheduledTime: schTime,
            executionTime: execTime,
            completetionTime: completeTime,
            status: res.status,
          };
          writeLog(taskLog);
        });
      })
      .catch((err) => {
        task.status = "failed";
        const completeTime = new Date().toLocaleString("en-US", {
          timeZone: "Asia/Kolkata",
        });
        task.save().then((res) => {
          const output = `schTime: ${schTime} || execTime: ${execTime} || completeTime: ${completeTime}\n`;
          console.log(output);
          let taskLog = {
            id: res._id,
            scheduledTime: schTime,
            executionTime: execTime,
            completetionTime: completeTime,
            status: res.status,
          };
          writeLog(taskLog);
        });
      });
  });
};
