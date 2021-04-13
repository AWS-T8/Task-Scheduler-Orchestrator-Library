#Creating lambda template
serverless create --template hello-world --path /usr/src/app/backendApiContract/serverless/$1
cd /usr/src/app/backendApiContract/serverless/$1/
#Moving user's file to template folder
rm -rf handler.js
rm -rf serverless.yml
cp /usr/src/app/backendApiContract/data/$1/* /usr/src/app/backendApiContract/serverless/$1/
#Installing dependencies
if [ $2 = "node" ];
then
  npm install
elif [ $2 = "py" ];
then
  pip3 install -r requirements.txt -t /usr/src/app/backendApiContract/serverless/$1/
fi
#Deploying lambda
serverless deploy | grep GET > output.txt
echo " $1" >> output.txt
node /usr/src/app/backendApiContract/LambdaScript.js $(cat output.txt)
#Deleting the lambda folders
cd ..
rm -rf $1/
rm -rf /usr/src/app/backendApiContract/data/$1/