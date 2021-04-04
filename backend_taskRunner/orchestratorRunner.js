const axios = require("axios");
const fetch = require("node-fetch");
require("dotenv").config({
  path: "./.env",
});
const ObjectID = require("mongodb").ObjectID;

const getOrchestrator = async (id) => {
  const url = `${process.env.SERVER_URL}/orchestrator/start/${id}`;
  const orchestrator = await fetch(url)
    .then((result) => {
      if (result.status == 200) {
        return result.json();
      }
      console.log(result.status);
      process.exit(0);
    })
    .then((res) => {
      return res;
    });
  return orchestrator;
};

const saveOrchestrator = (id, newStatus) => {
  const url = `${process.env.SERVER_URL}/orchestrator/save/?id=${id}&newStatus=${newStatus}`;
  fetch(url)
    .then((result) => {
      if (result.status == 200) {
        return result.json();
      }
      console.log(result.status);
      process.exit(0);
    })
    .then((res) => {
      console.log(res);
      // let scheduledTime = res.scheduledTime.toLocaleString("en-US", {
      //   timeZone: "Asia/Kolkata",
      // });
      // let startTime = res.startTime.toLocaleString("en-US", {
      //   timeZone: "Asia/Kolkata",
      // });
      // let completetionTime = res.completetionTime.toLocaleString("en-US", {
      //   timeZone: "Asia/Kolkata",
      // });
      // const output = `scheduledTime: ${scheduledTime} || executionTime: ${startTime} || completetionTime: ${completetionTime}\n`;
      // console.log(output);
      //   let taskLog = {
      //     id: res._id,
      //     scheduledTime: scheduledTime,
      //     executionTime: startTime,
      //     completetionTime: completetionTime,
      //     status: res.status,
      //   };
      //   writeLog(taskLog);
    });
};

const execOrchestrator = async (id) => {
  if (!ObjectID.isValid(id)) {
    process.exit(0);
  }
  const currentOrchestrator = await getOrchestrator(id);
  const config = {
    timeout: 930000,
  };
  axios
    .get(currentOrchestrator.currentUrl, config)
    .then((result) => {
      let newStatus;
      if (result.status === 200) {
        newStatus = "completed";
      } else {
        newStatus = "failed";
      }
      saveOrchestrator(id, newStatus);
    })
    .catch((err) => {
      let newStatus = "failed";
      saveOrchestrator(id, newStatus);
    });
};

const args = process.argv.slice(2);
if (args.length === 0) {
  process.exit(0);
}
const id = args[0];
execOrchestrator(id);
