var fs = require('fs');

var sum_delay = 0;
var sum_time_to_complete = 0;
var count = 0;
var max_delay = 0;

// Get the contents of the directory and loop over it.
fs.readdir('./logs', function (err, list) {
	count = list.length;
	for (var i = 0; i < list.length; i++) {
		// Get the contents of each file on iteration.
		var filename = list[i];
		file = fs.readFileSync('./logs/' + filename);
		var parsedData = JSON.parse(file);
		var scheduledTime = new Date(parsedData.scheduledTime);
		var completetionTime = new Date(parsedData.completetionTime);
		var executionTime = new Date(parsedData.executionTime);
		var delay = Math.abs((executionTime - scheduledTime) / 1000);
		var time_to_complete = (completetionTime - executionTime) / 1000;
		// console.log(`${parsedData.id} ${delay} ${time_to_complete}`);
		sum_delay += delay;
		max_delay = Math.max(max_delay, delay);
		sum_time_to_complete += time_to_complete;
	}
	console.log(`The number of files -> ${count}`);
	if (count > 0) {
		var avg_delay = sum_delay / count;
		var avg_time_to_complete = sum_time_to_complete / count;
		console.log(`Maximum Delay -> ${max_delay}s`);
		console.log(
			`AVG -> Time delay : ${avg_delay.toFixed(
				3
			)}s Execution Time : ${avg_time_to_complete.toFixed(3)}s`
		);
	}
});
