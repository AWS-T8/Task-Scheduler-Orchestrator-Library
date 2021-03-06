//Imports
const kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const ObjectID = require("mongodb").ObjectID;
const { exec } = require("child_process");

const recover = require("./recover.js");
const taskDB = require("./models/taskDB");
const orchestratorDB = require("./models/orchestratorDB");

//Format date to add 0 in front
const format = (str) => {
  if (str.length < 2) {
    return "0" + str;
  }
  return str;
};

//Function to get task by id
const getTask = async (id) => {
  if (!ObjectID.isValid(id)) {
    return null;
  }
  const currentTask = await taskDB.findById(id);
  return currentTask;
};

//Function to get orchestration by id
const getOrchestrator = async (id) => {
  if (!ObjectID.isValid(id)) {
    return null;
  }
  const currentOrchestrator = await orchestratorDB.findById(id);
  return currentOrchestrator;
};

//Function to schedule
const schedule = async (id, type) => {
  let current;
  //Storing the document in current
  if (type === "ORCH") {
    current = await getOrchestrator(id);
  } else {
    current = await getTask(id);
  }

  if (!current) {
    return;
  }

  //Formatting the time to pass to at scheduler
  const d = current.scheduledTime;

  Year = format(d.getFullYear().toString());
  Month = format((d.getMonth() + 1).toString()); // Has to be incremented by 1
  date = format(d.getDate().toString());
  hours = format(d.getHours().toString());
  minutes = format(d.getMinutes().toString());
  seconds = format(d.getSeconds().toString());

  exactTime = `${Year}${Month}${date}${hours}${minutes}.${seconds}`;
  console.log(`execute ${type} ${id} at: ${exactTime}`);

  let curr_date = new Date();
  let diff = d - curr_date;
  let sleepTime = 0;
  let execSecond = d.getSeconds();
  let execMinute = d.getMinutes();
  let curMinute = curr_date.getMinutes();
  let curSecond = curr_date.getSeconds();

  //Setting sleep time to improve accuracy as at only provides sub-minute accuracy
  if (diff <= 0) {
    sleepTime = 0;
  } else if (diff >= 60000) {
    sleepTime = execSecond;
  } else {
    if (curMinute != execMinute) {
      sleepTime = seconds;
    } else {
      sleepTime = execSecond - curSecond;
      // sleepTime= 0;
    }
  }

  //Command to execute
  const curlCommand = `curl --location --request GET '${process.env.PRODUCER_URL}/?id=${id}&type=${type}'`;
  command = `echo "sleep ${sleepTime} && ${curlCommand}" | at -t ${exactTime}`;
  //schedule logic
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(stderr);
    current.procID = parseInt(stderr.match(/\d+/)[0]);
    current.save();
  });
};

//Function to cancel
const cancel = async (id, method, type) => {
  let current;
  //Storing the document in current
  if (type === "ORCH") {
    current = await getOrchestrator(id);
  } else {
    current = await getTask(id);
  }

  if (!current) {
    return;
  }

  //Get process id which is used to cancel the process
  jobID = current.procID;
  //Command to cancel the schedule
  command = `atrm ${jobID}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if (method === "CANCEL") {
      current.status = "cancelled";
      current.save().then((res) => {
        console.log("cancelled");
      });
    } else {
      //If method is update then reschedule
      console.log("updating");
      schedule(id, type);
    }
  });
};

// DataBase Connection
mongoose.connect(process.env.DATABASE_URL, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", async () => {
  console.log("Connected to Database");

  //Get all task & pass them to recover
  const allTasks = await taskDB.find({ status: "scheduled" });
  recover(allTasks);

  //Settting kafka variables
  const defaultTopicName = "aws-kafka";
  const kafkaHost = process.env.KAFKA_URL;

  const client = new kafka.KafkaClient({
    kafkaHost: kafkaHost,
  });

  const topics = [
    {
      topic: defaultTopicName,
      partitions: 1,
      replicationFactor: 1,
    },
  ];

  client.createTopics(topics, (err, result) => {
    // console.log()
  });

  //Creating consumer
  const consumer = new kafka.Consumer(client, [{ topic: defaultTopicName }], {
    groupId: "node-express-kafka-group",
  });

  consumer.on("message", function (message) {
    const res = message.value.toString().split(" ");
    let type;
    //Handling Task
    if (res.length === 2) {
      type = "TASK";
      console.log(`Received: ${res[0]} Method: ${res[1]} TYPE: ${type}`);
      //Handling different types of requests
      if (res[1] === "POST") {
        schedule(res[0], type);
      } else if (res[1] === "UPDATE") {
        cancel(res[0], res[1], type);
      } else if (res[1] === "RETRY") {
        schedule(res[0], type);
      } else if (res[1] === "CANCEL") {
        cancel(res[0], res[1], type);
      }
    }
    //Handling Orchestration 
    else {
      type = "ORCH";
      console.log(`Received: ${res[0]} Method: ${res[1]} Type: ${type}`);
      //Handling different types of requests
      if (res[1] === "POST") {
        schedule(res[0], type);
      } else if (res[1] === "UPDATE") {
        cancel(res[0], res[1], type);
      } else if (res[1] === "CANCEL") {
        cancel(res[0], res[1], type);
      }
    }
  });

  consumer.on("error", function (error) {
    console.log(error);
  });
});
