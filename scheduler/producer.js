const express = require("express");
const cors = require("cors");
var kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const ObjectID = require("mongodb").ObjectID;

const app = express();
const PORT = process.env.PORT || 8081;

app.use(cors());
app.use(express.json());

const defaultTopicName = "sch-task";
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

const producer = new kafka.HighLevelProducer(client);

producer.on("ready", function () {
  console.log("Kafka Producer is connected and ready");

  app.get("/:id", (req, res) => {
    console.log("HELLO!");
    if (!ObjectID.isValid(req.params.id)) {
      return res.status(404).json({ message: "Invalid Id" });
    }
    const id = req.params.id;
    const payloads = [{ topic: defaultTopicName, messages: `${id}` }];
    producer.send(payloads, function (err, data) {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error Occured!" });
      } else {
        console.log("Message Sent!");
        return res.status(200).json({ message: "Message Sent!" });
      }
    });
  });
});

producer.on("error", function (error) {
  console.log("Error", error);
});

// API server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
