#Creating lambda template
serverless create --template hello-world --path /home/sanskar/AWS-T8/backend_apiContract/serverless/$1
cd /home/sanskar/AWS-T8/backend_apiContract/serverless/$1/
#Moving user's file to template folder
rm -rf handler.js
rm -rf serverless.yml
cp /home/sanskar/AWS-T8/backend_apiContract/data/$1/* /home/sanskar/AWS-T8/backend_apiContract/serverless/$1/
#Installing dependencies
if [ $2 = "node" ];
then
  npm install
elif [ $2 = "py" ];
then
  pip3 install -r requirements.txt -t /home/sanskar/AWS-T8/backend_apiContract/serverless/$1/
fi
#Deploying lambda
serverless deploy | grep GET > output.txt
echo " $1" >> output.txt
node /home/sanskar/AWS-T8/backend_apiContract/LambdaScript.js $(cat output.txt)
#Deleting the lambda folders
cd ..
sudo rm -rf $1/
sudo rm -rf /home/sanskar/AWS-T8/backend_apiContract/data/$1/