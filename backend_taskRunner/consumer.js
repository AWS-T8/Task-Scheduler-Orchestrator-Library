var kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });

const defaultTopicName = "sch-task";
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
  command = `node ./taskRunner.js ${message.value}`;
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
