const axios = require('axios');
const fetch = require('node-fetch');
require('dotenv').config({
	path: './.env',
});
const ObjectID = require('mongodb').ObjectID;
const fs = require('fs');

const writeLog = async (taskLog) => {
	let data = await JSON.stringify(taskLog, null, 2);
	fs.writeFile(
		`${process.env.OUTPUT_PATH}/${taskLog.id}-log.json`,
		data,
		(err) => {
			if (err) {
				throw err;
			}
			console.log('Data written to file');
			process.exit(0);
		}
	);
};

const getTask = async (id) => {
	const url = `${process.env.SERVER_URL}/task/start/${id}`;
	const task = await fetch(url)
		.then((result) => {
			if (result.status == 200) {
				return result.json();
			}
			console.log(result.status);
			process.exit(0);
		})
		.then((res) => {
			return res;
		});
	return task;
};

const saveTask = (id, newStatus) => {
	const url = `${process.env.SERVER_URL}/task/save/?id=${id}&newStatus=${newStatus}`;
	fetch(url)
		.then((result) => {
			if (result.status == 200) {
				return result.json();
			}
			console.log(result.status);
			process.exit(0);
		})
		.then((res) => {
			let scheduledTime = res.scheduledTime.toLocaleString('en-US', {
				timeZone: 'Asia/Kolkata',
			});
			let startTime = res.startTime.toLocaleString('en-US', {
				timeZone: 'Asia/Kolkata',
			});
			let completetionTime = res.completetionTime.toLocaleString(
				'en-US',
				{
					timeZone: 'Asia/Kolkata',
				}
			);
			const output = `scheduledTime: ${scheduledTime} || executionTime: ${startTime} || completetionTime: ${completetionTime}\n`;
			console.log(output);
			let taskLog = {
				id: res._id,
				scheduledTime: scheduledTime,
				executionTime: startTime,
				completetionTime: completetionTime,
				status: res.status,
			};
			writeLog(taskLog);
		});
};

const execTask = async (id) => {
	if (!ObjectID.isValid(id)) {
		process.exit(0);
	}

	const currentTask = await getTask(id);

	const config = {
		timeout: 930000,
	};
	axios
		.get(currentTask.url, config)
		.then((result) => {
			let newStatus;
			if (result.status === 200) {
				newStatus = 'completed';
			} else {
				newStatus = 'failed';
			}
			saveTask(id, newStatus);
		})
		.catch((err) => {
			let newStatus = 'failed';
			saveTask(id, newStatus);
		});
};

const args = process.argv.slice(2);
if (args.length === 0) {
	process.exit(0);
}
const id = args[0];
execTask(id);
