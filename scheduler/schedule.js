const kafka = require('kafka-node');
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const taskDB = require('./models/taskDB');
const ObjectID = require('mongodb').ObjectID;
const { exec } = require('child_process');
const recover = require('./recover.js');

const format = (str) => {
	if (str.length < 2) {
		return '0' + str;
	}
	return str;
};

const getTask = async (id) => {
	if (!ObjectID.isValid(id)) {
		return null;
	}
	const currentTask = await taskDB.findById(id);
	return currentTask;
};

const schedule = async (id) => {
	const task = await getTask(id);
	if (!task) {
		return;
	}
	d = task.execTime;
	Year = format(d.getFullYear().toString());
	Month = format((d.getMonth() + 1).toString()); // Has to be incremented by 1
	date = format(d.getDate().toString());
	hours = format(d.getHours().toString());
	minutes = format(d.getMinutes().toString());
	seconds = format(d.getSeconds().toString());

	exactTime = `${Year}${Month}${date}${hours}${minutes}.${seconds}`;
	console.log(`execute at: ${exactTime}`);

	/**
	 * - Logic for seconds accuracy
	 * - We can find the current time using Date library
	   - if diff<0:
			sleep=0;
	   - if diff>=60
			sleep= seconds
	   - if diff<60
			if(curr_min!=exe_min)
				sleep= seconds
			else
				sleep= exec_sec-curr_sec
	 */
	let curr_date = new Date();
	let diff = d - curr_date;
	let sleepTime = 0;
	let execSecond = d.getSeconds();
	let execMinute = d.getMinutes();
	let curMinute = curr_date.getMinutes();
	let curSecond = curr_date.getSeconds();
	if (diff <= 0) {
		sleepTime = 0;
	} else if (diff >= 60000) {
		sleepTime = execSecond;
	} else {
		if (curMinute != execMinute) {
			sleepTime = seconds;
		} else {
			sleepTime = execSecond - curSecond;
			// sleepTime= 0;
		}
	}
	// command = `echo "node taskRunner.js ${id}" | at -t ${exactTime}`;
	const curlCommand = `curl --location --request GET '${process.env.PRODUCER_URL}/${id}'`;
	command = `echo "sleep ${sleepTime} && ${curlCommand}" | at -t ${exactTime}`;
	//schedule logic
	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		// console.log(stderr);
		task.procID = stderr.match(/\d+/)[0];
		task.save();
	});
};

const cancel = async (id, method) => {
	const task = await getTask(id);
	if (!task) {
		return;
	}
	jobID = task.procID;
	command = `atrm ${jobID}`;
	exec(command, (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		if (method === 'CANCEL') {
			task.status = 'cancelled';
			task.save().then((res) => {
				console.log('cancelled');
			});
		} else {
			console.log('updating');
			schedule(id);
		}
	});
};

// DataBase Connection
mongoose.connect(process.env.DATABASE_URL, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (err) => console.error(err));
db.once('open', async () => {
	console.log('Connected to Database');

	const allTasks = await taskDB.find({ status: 'scheduled' });
	recover(allTasks);

	const defaultTopicName = 'aws-kafka';
	console.log(process.env.KAFKA_URL);
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

	const consumer = new kafka.Consumer(client, [{ topic: defaultTopicName }], {
		groupId: 'node-express-kafka-group',
	});

	consumer.on('message', function (message) {
		const res = message.value.toString().split(' ');
		// console.log(`${res[0]} ${res[1]}`)
		if (res[1] === 'POST') {
			schedule(res[0]);
		} else if (res[1] === 'UPDATE') {
			cancel(res[0], res[1]);
		} else {
			cancel(res[0], res[1]);
		}
	});

	consumer.on('error', function (error) {
		console.log(error);
	});
});
