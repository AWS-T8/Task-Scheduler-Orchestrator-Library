echo 'Stoping API Server...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=api-contract-img))

echo '\nStoping Scheduler...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=scheduler-img))

echo '\nStoping TaskRunner...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=task-runner-img))

echo '\nStoping Kafka & Mongo...\n'
sudo docker-compose stop

echo '\nAll Services Stopped!\n'