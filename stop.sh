cd ./backend_apiContract
forever stop server.js
sleep 10
cd ../scheduler
forever stop schedule.js
sleep 10
cd ..
sudo docker-compose stop