const kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const taskDB = require("./models/taskDB");
const ObjectID = require("mongodb").ObjectID;
const { exec } = require("child_process");

const format = (str) => {
  if (str.length < 2) {
    return "0" + str;
  }
  return str;
};

const getTask = async (id) => {
  if (!ObjectID.isValid(id)) {
    return null;
  }
  const currentTask = await taskDB.findById(id);
  return currentTask;
};

const schedule = async (id) => {
  const task = await getTask(id);
  if (!task) {
    return;
  }
  d = task.execTime;
  Year = format(d.getFullYear().toString());
  Month = format((d.getMonth() + 1).toString()); // Has to be incremented by 1
  date = format(d.getDate().toString());
  hours = format(d.getHours().toString());
  minutes = format(d.getMinutes().toString());
  seconds = format(d.getSeconds().toString());

  exactTime = `${Year}${Month}${date}${hours}${minutes}.${seconds}`;
  console.log(`execute at: ${exactTime}`);

  // command = `echo "node taskRunner.js ${id}" | at -t ${exactTime}`;
  command = `echo "node ${process.env.TASK_RUNNER_PATH} ${id}" | at -t ${exactTime}`;
  // command = 'echo "ls -l > output.txt" | at now +1 minute';
  //schedule logic
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(stderr);
    task.procID = stderr.match(/\d+/)[0];
    task.save();
  });
};

const cancel = async (id, method) => {
  const task = await getTask(id);
  if (!task) {
    return;
  }
  jobID = task.procID;
  command = `atrm ${jobID}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    if(method==='CANCEL'){
      task.status = "cancelled";
      task.save().then(res => {
        console.log("cancelled");
      });
    }
    else{
      console.log("updating");
      schedule(id);
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
db.once("open", () => {
  console.log("Connected to Database");

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

  const consumer = new kafka.Consumer(client, [{ topic: defaultTopicName }], {
    groupId: "node-express-kafka-group",
  });

  consumer.on("message", function (message) {
    const res = message.value.toString().split(" ");
    // console.log(`${res[0]} ${res[1]}`)
    if (res[1] === "POST") {
      schedule(res[0]);
    } else if(res[1]==='UPDATE'){
      cancel(res[0], res[1]);
    }
     else {
      cancel(res[0], res[1]);
    }
  });

  consumer.on("error", function (error) {
    console.log(error);
  });
});
