const kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const taskDB = require("./models/taskDB");
const ObjectID = require("mongodb").ObjectID;
const { exec } = require('child_process');

const getTask = async (id) => {
  if (!ObjectID.isValid(id)) {
        return null;
	}
	const currentTask = await taskDB.findById(id);
	return currentTask;
};

const schedule = async (id) => {
    const task= await getTask(id);
    if(!task){
      return;
    }
    d = task.execTime;
    Year = d.getFullYear();
    Month = (d.getMonth()+1); // Has to be incremented by 1
    date = d.getDate();
    hours = d.getHours();
    minutes = d.getMinutes();
    seconds = d.getSeconds();

    console.log(`${Year}-${Month}-${date}-${hours}-${minutes}-${seconds}`)

    exactTime = `${Year}${Month}${date}${hours}${minutes}.${seconds}`
    console.log(exactTime)

    command = `echo "node taskRunner.js ${id}" | at -t ${exactTime}`;
    //schedule logic
    exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        task.procID= stdout.match(/\d+/)[0];
        task.save();
    });
};

const cancel = async (id) => {
  const task = await getTask(id); 
  if(!task){
    return;
  }
  jobID = task.procID;
  console.log(jobID);
  command = `atrm ${jobID}`;
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
    task.status = "cancelled";
    task.save();
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

  const defaultTopicName = "test-topic";
  const kafkaHost = "localhost:9092";

  const client = new kafka.KafkaClient({
    kafkaHost: kafkaHost,
  });

  const consumer = new kafka.Consumer(client, [{ topic: defaultTopicName }], {
    groupId: "node-express-kafka-group",
  });

  consumer.on("message", function (message) {
    const res = message.value.toString().split(" ");
    // console.log(`${res[0]} ${res[1]}`)
    if (res[1] === "POST") {
      schedule(res[0]);
    } else {
      cancel(res[0]);
    }
  });

  consumer.on("error", function (error) {
    console.log(error);
  });
});
