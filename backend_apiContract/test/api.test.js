const request = require("supertest");
require("dotenv").config({ path: "../.env" });
// const express = require("express");
process.env.TEST = "test";
const app = require("../server.js");
const taskDB = require("../models/taskDB");

const taskURL = "/api/task";
const tasksURL = "/api/tasks";
const id = "60508dd6ccf1384348ccd092";
const connectDB = require("../configure/db.js");
beforeAll(async () => {
  await connectDB();
});

test("GET /", async () => {
  await request(app)
    .get(`${tasksURL}`)
    .expect(200)
    .expect("Content-Type", /json/);
});

describe("GET Requests to /api/tasks", () => {
  test("GET all tasks", async () => {
    const getTasks = new Promise(async () => {
      const allTasks = await taskDB.find();
      return allTasks.map((task) => {
        return {
          id: task._id,
          url: task.url,
          execTime: task.execTime,
          status: task.status,
        };
      });
    });

    getTasks
      .then((tasks) => JSON.stringify(tasks))
      .then(async (tasks) => {
        await request(app)
          .get(`${tasksURL}`)
          .expect(200)
          .expect("Content-Type", /json/)
          .then((res) => JSON.stringify(res.body))
          .then((body) => {
            expect(body).toEqual(tasks);
          });
      });
  });

  const status = "scheduled";
  const getTasksByStatus = new Promise(async () => {
    const allTasks = await taskDB.find({ status: status });
    return allTasks.map((task) => {
      return {
        id: task._id,
        url: task.url,
        execTime: task.execTime,
        status: task.status,
      };
    });
  });

  test("GET all tasks with a given status", async () => {
    getTasksByStatus
      .then((tasks) => JSON.stringify(tasks))
      .then(async (tasks) => {
        await request(app)
          .get(`${tasksURL}/${status}`)
          .expect(200)
          .expect("Content-Type", /json/)
          .then((res) => JSON.stringify(res.body))
          .then((body) => {
            expect(body).toEqual(tasks);
          });
      });
  });
});

describe("GET Requests to /api/task", () => {
  test("GET Single Task /api/task/:taskid", async () => {
    console.log(id);
    await request(app)
      .get(`${taskURL}/${id}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("status");
      });
  });

  test("GET Single Task Invalid Id /api/task/:taskid", async () => {
    await request(app)
      .get(`${taskURL}/45234523`)
      .expect("Content-Type", /json/)
      .expect(404);
  });
});

describe("POST Requests", () => {
  test("POST Task (201)", async () => {
    await request(app)
      .post(`${taskURL}`)
      .send({
        timeDelay: "5000",
        url: "https://xmeme-saksham9575.herokuapp.com/memes",
      })
      .expect("Content-Type", /json/)
      .expect(201)
      .then((res) => {
        expect(res.body).toHaveProperty("id");
      });
  });

  test("POST Task (406)", async () => {
    await request(app)
      .post("/api/task/")
      .send({
        someOtherParam: "5000",
        url: "https://xmeme-saksham9575.herokuapp.com/memes",
      })
      .expect("Content-Type", /json/)
      .expect(406)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Not Acceptable");
      });
  });
});

describe("PATCH Requests", () => {
  test("PATCH Update Task (200)", async () => {
    await request(app)
      .patch(`/api/task/${id}`)
      .send({
        timeDelay: "5000",
      })
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("success", true);
      });
  });

  test("PATCH Update Task (406)", async () => {
    await request(app)
      .patch(`/api/task/${id}`)
      .send({
        timeDelay: "",
      })
      .expect("Content-Type", /json/)
      .expect(406)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Not Acceptable");
      });
  });

  test("PATCH Cancel Task (200)", async () => {
    await request(app)
      .patch(`/api/task/cancel/${id}`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        expect(res.body).toHaveProperty("success", true);
      });
  });

  test("PATCH Cancel Task (403)", async () => {
    await request(app)
      .patch(`/api/task/cancel/${id}`)
      .expect("Content-Type", /json/)
      .expect(403)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Task cannot be cancelled");
      });
  });

  test("PATCH Cancel Task (404)", async () => {
    await request(app)
      .patch(`/api/task/cancel/sanskar`)
      .expect("Content-Type", /json/)
      .expect(404)
      .then((res) => {
        expect(res.body).toHaveProperty("message", "Task not found");
      });
  });
});
