#  Dockerfile for Ubuntu
FROM ubuntu

# Create App Directory
RUN mkdir -p /usr/src/app/backendApiContract
WORKDIR /usr/src/app/backendApiContract

#Install packages
RUN apt-get -y update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get -y install expect
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
RUN apt install -y unzip
RUN unzip awscliv2.zip
RUN ./aws/install
RUN npm install -g serverless --silent

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

#Setting aws config & serverless
RUN chmod +x aws_configure.sh
RUN chmod +x aws_configure_expect.sh
RUN ./aws_configure_expect.sh
RUN ./aws_configure_expect.sh
RUN ./aws_configure_expect.sh
RUN aws configure set region us-east-2
RUN serverless config credentials --provider aws --key <Your_ACCESS_KEY> --secret <Your_Secret_Key> --profile default -o

# Exports
EXPOSE 3000

CMD ["node","server.js"]