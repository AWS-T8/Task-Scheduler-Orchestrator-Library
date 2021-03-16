sudo docker container stop $(sudo docker container ls –aq)
sudo docker container rm $(sudo docker container ls –aq)
sudo docker rmi $(sudo docker images -a -q)
yes | sudo docker volume prune 
yes | sudo docker system prune -a   