var kafka = require('kafka-node');
require('dotenv').config({ path: './.env' });

const defaultTopicName = 'sch-task';
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

const producer = new kafka.HighLevelProducer(client);

producer.on('ready', function () {
	console.log('Kafka Producer is connected and ready');
	const args = process.argv.slice(2);
	if (args.length === 0) {
        console.log('Please provide an id to send!');
		process.exit(0);
	}
	const id = args[0];
	const payloads = [{ topic: defaultTopicName, messages: `${id}` }];
	producer.send(payloads, function (err, data) {
		if (err) {
			console.log(err);
		} else {
			console.log('Message Sent!');
		}
		process.exit(0);
	});
});

producer.on('error', function (error) {
	console.log('Error', error);
});
