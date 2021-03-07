const kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const taskDB = require("./models/taskDB");
const ObjectID = require("mongodb").ObjectID;
const { exec } = require('child_process');

const getTask = (id) => {
    if (!ObjectID.isValid(id)) {
        return null;
	}
	const currentTask = await taskDB.findById(id);
	return currentTask;
};

const schedule = async(id) => {
    const task= await getTask(id);

    //schedule logic
    exec('cat *.js missing_file | wc -l', (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
        task.procID= stdout;
        task.save();
    });
};

const cancel = (id) => {};

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
    console.log(message);
    const res = message.split(" ");
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
