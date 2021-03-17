echo 'Stoping API Server...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=api-contract-img))
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStoping Scheduler...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=scheduler-img))
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStoping TaskRunner...\n'
forever stop /home/sanskar/AWS-T8/backend_taskRunner/consumer.js
echo '\nSleeping for 5 seconds...\n'
sleep 5
echo '\nStoping Kafka & Mongo...\n'
sudo docker-compose stop
echo '\nAll Services Stopped!\n'