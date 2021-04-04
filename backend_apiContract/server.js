require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./configure/db.js");
const app = express();

const PORT = 3000;

const kafka = require("kafka-node");
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
  console.log("Kafka Producer is connected and ready.");
  app.use(function (req, res, next) {
    req.producer = producer;
    req.client = client;
    req.defaultTopicName = defaultTopicName;
    next();
  });

  app.use(cors());

  // DataBase Connection
  connectDB();

  app.use(express.json());

  // Cheking for bad request
  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
      return res.status(400).send({ message: "Invalid request body" }); // Bad request
    }
    next();
  });

  app.get("/", (req, res) => {
    res.status(200).json({ message: "API Is Running" });
  });

  // Routes
  const userRouter = require("./routes/user");
  app.use("/api/user", userRouter);

  //Verify User
  const userVerify = require("./controllers/userController").authenticateToken;
  app.use(userVerify);

  const taskRouter = require("./routes/task");
  app.use("/api/task", taskRouter);

  const tasksRouter = require("./routes/tasks");
  app.use("/api/tasks", tasksRouter);

  const orchestratorRouter = require("./routes/orchestrator");
  app.use("/api/orchestrator", orchestratorRouter);

  const orchestratorsRouter = require("./routes/orchestrators");
  app.use("/api/orchestrators", orchestratorsRouter);

  app.use((req, res) => {
    return res.status(404).json({ message: "404 Not Found" });
  });
});

producer.on("error", function (error) {
  console.log("Error", error);
});

// API server

console.log(process.env.TEST);
if (process.env.TEST === "server") {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
} else {
  module.exports = app;
}
