const taskDB = require('../models/taskDB');

exports.getTasks = async (req, res) => {
	try {
		// Get all tasks from db
		const allTasks = await taskDB.find();
		const tasks = await allTasks.map((task) => {
			return {
				id: task._id,
				url: task.url,
				execTime: task.execTime.toLocaleString('en-US', {
					timeZone: 'Asia/Kolkata',
				}),
				status: task.status,
			};
		});
		res.status(200).json(tasks);
	} catch (err) {
		// Server Error
		res.status(500).json({ message: err.message });
	}
};

exports.getTasksByStatus = async (req, res) => {
	try {
		// Get all tasks from db on the basis of status
		if (
			req.params.status === 'completed' ||
			req.params.status === 'failed' ||
			req.params.status === 'successful' ||
			req.params.status === 'running' ||
			req.params.status === 'scheduled'
		) {
			const allTasks = await taskDB.find({ status: req.params.status });
			const tasks = await allTasks.map((task) => {
				return {
					id: task._id,
					url: task.url,
					execTime: task.execTime.toLocaleString('en-US', {
						timeZone: 'Asia/Kolkata',
					}),
					status: task.status,
				};
			});
			return res.status(200).json(tasks);
		}
		return res.status(404).json({ message: 'Status not found' });
	} catch (err) {
		// Server Error
		res.status(500).json({ message: err.message });
	}
};
