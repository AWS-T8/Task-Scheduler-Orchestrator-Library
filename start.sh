echo 'Starting Kafka & Mongo...\n'
sudo docker-compose up -d
echo '\nSleeping for 10 seconds...\n'
sleep 10
echo '\nStarting taskRunner...\n'
sudo docker run -p 8082:8082 -d --network=host -v /home/sanskar/AWS-T8/backend_taskRunner/logs:/usr/src/app/taskRunner/logs task-runner-img
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStarting Scheduler...\n'
sudo docker run -p 8081:8081 --network=host -d scheduler-img
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStarting API Server...\n'
sudo docker run -p 3000:3000 --network=host -d api-contract-img
echo '\nSleeping for 10 seconds...\n'
sleep 10
echo '\nStarting Frontend...\n'
sudo docker run -p 3001:3001 --network=host -d frontend-img
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nAll Services Started!\n'