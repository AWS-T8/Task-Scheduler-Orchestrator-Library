const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const connectDB = async () => {
	try {
		const conn = await mongoose.connect('mongodb://localhost:27017/tasks', {
			useUnifiedTopology: true,
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
		});
		console.log(`MongoDB Connected : ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error : ${error.message}`);
		process.exit(1);
	}
};

module.exports = connectDB;
