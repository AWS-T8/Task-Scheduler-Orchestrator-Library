require('dotenv').config({ path: './.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectDB = require("./configure/db.js");
const app = express();

const PORT = 3000;

app.use(cors());

app.get("/", (req, res) => {
  res.send("API is running");
});

// DataBase Connection
connectDB();

app.use(express.json());

// Cheking for bad request
app.use((err, req, res, next) => {
	if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
		return res.status(400).send({ message: 'Invalid request body' }); // Bad request
	}
	next();
});

// Routes
const taskRouter = require('./routes/task');
app.use('/api/task', taskRouter);

const tasksRouter = require('./routes/tasks');
app.use('/api/tasks', tasksRouter);

// API server
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
