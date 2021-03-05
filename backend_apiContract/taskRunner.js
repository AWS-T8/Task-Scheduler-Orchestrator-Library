const axios = require('axios');
require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const taskDB = require('./models/taskDB');
const ObjectID = require('mongodb').ObjectID;

// DataBase Connection
mongoose.connect(process.env.DATABASE_URL, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', (err) => console.error(err));
db.once('open', () => {
	console.log('Connected to Database');
	const args = process.argv.slice(2);
	if (args.length === 0) {
		db.close();
		process.exit(0);
	}
	const id = args[0];
	execTask(id);
});

const execTask = async (id) => {
	if (!ObjectID.isValid(id)) {
		db.close();
		process.exit(0);
	}
	const currentTask = await taskDB.findById(id);
	if (currentTask.status != 'scheduled') {
		db.close();
		process.exit(0);
	}
	currentTask.status = 'running';
	currentTask.save().then((task) => {
		axios
			.get('https://xmeme-backend-sanskar.herokuapp.com/memes')
			.then((result) => {
				if (result.status === 200) {
					task.status = 'completed';
				} else {
					task.status = 'failed';
				}
				task.save().then((res) => {
					db.close();
					process.exit(0);
				});
			});
	});
};
