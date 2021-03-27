echo 'Setting up API...\n'
sudo docker build -t "api-contract-img" ./backend_apiContract/
echo 'Setting up Frontend...\n'
sudo docker build -t "frontend-img" ./frontend/
echo '\nSetting up Scheduler...\n'
sudo docker build -t "scheduler-img" ./scheduler/
echo '\nSetting up taskRunner...\n'
sudo docker build -t "task-runner-img" ./backend_taskRunner/
echo '\nSetting up Mongo...\n'
sudo docker pull mongo:3.6.19-xenial
echo '\nSetting up Zookeeper...\n'
sudo docker pull wurstmeister/zookeeper
echo '\nSetting up Kafka...\n'
sudo docker pull wurstmeister/kafka