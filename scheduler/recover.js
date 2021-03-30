var kafka = require('kafka-node');
require('dotenv').config({ path: './.env' });

const defaultTopicName = 'aws-kafka';
const kafkaHost = process.env.KAFKA_URL;

const recover = (allTasks) => {
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

	const producer = new kafka.HighLevelProducer(client);

	producer.on('ready', function () {
		console.log('Kafka Producer is connected and ready');
		allTasks.forEach((task) => {
			const id = task._id;
			const payloads = [
				{ topic: defaultTopicName, messages: `${id} POST` },
			];
			producer.send(payloads, function (err, data) {
				if (err) {
					console.log(err);
				} else {
					console.log('Message Sent!');
				}
			});
		});
	});

	producer.on('error', function (error) {
		console.log('Error', error);
	});
};

module.exports = recover;
