echo 'Stopping Frontend...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=frontend-img))

echo 'Stopping API Server...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=api-contract-img))

echo '\nStopping Scheduler...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=scheduler-img))

echo '\nStopping TaskRunner...\n'
sudo docker rm $(sudo docker stop $(sudo docker ps -a -q -f ancestor=task-runner-img))

echo '\nStopping Kafka & Mongo...\n'
sudo docker-compose stop

echo '\nAll Services Stopped!\n'