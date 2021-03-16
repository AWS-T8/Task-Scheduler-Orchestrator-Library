const axios = require("axios");
require("dotenv").config({
  path: "/home/sanskar/AWS-T8/backend_taskRunner/.env",
});
const mongoose = require("mongoose");
const taskDB = require("./models/taskDB");
const ObjectID = require("mongodb").ObjectID;

const { exec } = require("child_process");

// DataBase Connection

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
    axios
      .get(task.url)
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
          const command = `printf "${output}" >> ${process.env.OUTPUT_PATH}`;
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            db.close();
            process.exit(0);
          });
        });
      })
      .catch((err) => {
        task.status = "failed";
        task.save().then((res) => {
          db.close();
          process.exit(0);
        });
      });
  });
};
