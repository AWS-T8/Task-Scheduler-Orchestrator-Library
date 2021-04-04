const express = require("express");
const cors = require("cors");
var kafka = require("kafka-node");
require("dotenv").config({ path: "./.env" });
const connectDB = require("./configure/db.js");

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors());
app.use(express.json());

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

const producer = new kafka.HighLevelProducer(client);

producer.on("ready", function () {
  console.log("Kafka Producer is connected and ready");
  app.use(function (req, res, next) {
    req.producer = producer;
    req.client = client;
    req.defaultTopicName = defaultTopicName;
    next();
  });

  connectDB();

  const taskControllers = require("./controllers/taskControllers");
  app.get("/task/start/:id", taskControllers.startTask);
  app.get("/task/save", taskControllers.saveTask);

  const orchestratorControllers = require("./controllers/orchestratorControllers");

  app.get("/orchestrator/start/:id", orchestratorControllers.startOrchestrator);
  app.get("/orchestrator/save", orchestratorControllers.saveOrchestrator);

  app.get("/", (req, res) => {
    res.status(200).json({ message: "API is running" });
  });
  app.use((req, res) => {
    res.status(404).json({ message: "Invalid URL" });
  });
});

producer.on("error", function (error) {
  console.log("Error", error);
});

// API server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
