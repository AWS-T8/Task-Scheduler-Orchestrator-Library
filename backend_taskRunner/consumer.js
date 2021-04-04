var kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });

const defaultTopicName = "scheduler-task";
const kafkaHost = process.env.KAFKA_URL;
const { exec } = require("child_process");

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
  groupId: "sch-tsk-cons-grp",
});

consumer.on("message", function (message) {
  console.log(message);
  const newMessage = message.value.toString().split(" ");
  const id = newMessage[0],
    type = newMessage[1];
  let command;
  if (type === "TASK") {
    command = `node ./taskRunner.js ${id}`;
  } else {
    command = `node ./orchestratorRunner.js ${id}`;
  }
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    // console.log(stderr);
  });
});

consumer.on("error", function (error) {
  console.log(error);
});
