//Imports
require("dotenv").config({ path: "./.env" });
const express = require("express");
const cors = require("cors");
const kafka = require("kafka-node");

const app = express();

const connectDB = require("./configure/db.js");
const rateLimit = require("express-rate-limit");

const PORT = 3000;

//Kafka configurations
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

  //Passing producer object in request
  app.use(function (req, res, next) {
    req.producer = producer;
    req.client = client;
    req.defaultTopicName = defaultTopicName;
    next();
  });

  //Passing CORS headers in requests
  app.use(cors());

  // DataBase Connection
  connectDB();

  app.use(express.json());

  //Setting rate limiter
  if (process.env.TEST === "server") {
    const limiter = rateLimit({
      windowMs: 1 * 1000, // 1 sec window
      max: 2, // start blocking after 2 request
      message: "Too many requests from this IP",
    });
    app.use(limiter);
  }

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
  if (process.env.TEST === "server") {
    app.use(userVerify);
  } else {
    // const user = {
    //   username: "test",
    //   id: "test",
    // };
    // app.use((req, res, next) => {
    //   req.user = user;
    //   next();
    // });
  }

  const taskRouter = require("./routes/task");
  app.use("/api/task", taskRouter);

  const tasksRouter = require("./routes/tasks");
  app.use("/api/tasks", tasksRouter);

  const orchestratorRouter = require("./routes/orchestrator");
  app.use("/api/orchestrator", orchestratorRouter);

  const orchestratorsRouter = require("./routes/orchestrators");
  app.use("/api/orchestrators", orchestratorsRouter);

  //Error route
  app.use((req, res) => {
    return res.status(404).json({ message: "404 Not Found" });
  });
});

producer.on("error", function (error) {
  console.log("Error", error);
});

//For test environment
if (process.env.TEST === "server") {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
} else {
  module.exports = app;
}
