sudo docker-compose up -d
sleep 20
cd ./backend_apiContract
forever start server.js
sleep 10
cd ../scheduler
forever start schedule.js
sleep 10
cd ..
