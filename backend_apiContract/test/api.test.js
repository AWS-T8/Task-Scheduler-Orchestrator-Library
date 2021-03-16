const request = require("supertest");
// const express = require("express");
const app = require("../server.js");
const taskDB = require("../models/taskDB");

const taskURL = "/api/task";
const tasksURL = "/api/tasks";

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
          .expect(2041)
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
    const getRandomTask = new Promise(async () => {
      const task = await taskDB.aggregate([{ $sample: { size: 1 } }]);
      return { id: task._id, status: task.status };
    });

    getRandomTask.then(async (props) => {
      console.log(props.id);
      const id = props.id;
      const status = props.status;

      await request(app)
        .get(`${taskURL}/${id}`)
        .expect("Content-Type", /json/)
        .expect(201)
        .then((res) => {
          expect(res.body).toHaveProperty("status", status);
        });
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
      .post("/api/task/")
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

// describe("PATCH Requests", () => {
//   let ranTask;
//   beforeEach(async (done) => {
//     const getRandomTask = new Promise(async () => {
//       const task = await taskDB.aggregate([{ $sample: { size: 1 } }]);
//       // id= task._id;
//       console.log(task);
//       return task;
//     });
//     await getRandomTask.then((task) => {
//       console.log("HELLO");
//       ranTask = task;
//       return done();
//     });
//   });

//   describe("PATCH To Requests", () => {
//     test("PATCH Update Task (200)", async () => {
//       console.log(ranTask._id);
//       await request(app)
//         .patch(`/api/task/${ranTask._id}`)
//         .send({
//           timeDelay: "10000",
//         })
//         .expect("Content-Type", /json/)
//         .expect(200)
//         .then((res) => {
//           expect(res.body).toHaveProperty("success", "true");
//         });
//     });
//   });
// });
