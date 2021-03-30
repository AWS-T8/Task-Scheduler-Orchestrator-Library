const taskDB = require('../models/taskDB');

exports.getTasks = async (req, res) => {
	try {
		// Get all tasks from db
		const allTasks = await taskDB.find({ user: req.user.id });
		const tasks = await allTasks.map((task) => {
			return {
				id: task._id,
				name: task.name,
				user: task.user,
				url: task.url,
				scheduledTime: task.scheduledTime.toLocaleString('en-US', {
					timeZone: 'Asia/Kolkata',
				}),
				status: task.status,
				startTime: task.startTime
					? task.startTime.toLocaleString('en-US', {
							timeZone: 'Asia/Kolkata',
					  })
					: 'Yet to start',

				retryCount: task.retryCount,
				retryAfter: task.retryAfter,
			};
		});
		tasks.reverse();
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
			req.params.status === 'scheduled' ||
			req.params.status === 'cancelled'
		) {
			const allTasks = await taskDB.find({
				status: req.params.status,
				user: req.user.id,
			});
			const tasks = await allTasks.map((task) => {
				return {
					id: task._id,
					user: req.user.id,
					url: task.url,
					name: task.name,
					scheduledTime: task.scheduledTime.toLocaleString('en-US', {
						timeZone: 'Asia/Kolkata',
					}),
					status: task.status,
					startTime: task.startTime
						? task.startTime.toLocaleString('en-US', {
								timeZone: 'Asia/Kolkata',
						  })
						: 'Yet to start',

					retryCount: task.retryCount,
					retryAfter: task.retryAfter,
				};
			});
			tasks.reverse();
			return res.status(200).json(tasks);
		}
		return res.status(404).json({ message: 'Status not found' });
	} catch (err) {
		// Server Error
		res.status(500).json({ message: err.message });
	}
};
