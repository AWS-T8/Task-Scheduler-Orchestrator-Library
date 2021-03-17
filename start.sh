echo 'Starting Kafka & Mongo...\n'
sudo docker-compose up -d
echo '\nSleeping for 15 seconds...\n'
sleep 15
echo 'Starting API Server...\n'
sudo docker run -p 3000:3000 --network=host -d api-contract-img
echo '\nSleeping for 10 seconds...\n'
sleep 10
echo '\nStarting Scheduler...\n'
sudo docker run --network=host -d scheduler-img
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStarting taskRunner...\n'
sudo docker run -d --network=host -v /home/sanskar/AWS-T8/backend_taskRunner/logs:/usr/src/app/taskRunner/logs task-runner-img
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nAll Services Started!\n'