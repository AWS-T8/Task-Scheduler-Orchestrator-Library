#  Dockerfile for Ubuntu
FROM ubuntu

# Create App Directory
RUN mkdir -p /usr/src/app/scheduler
WORKDIR /usr/src/app/scheduler

#Install packages
RUN apt-get -y update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs
RUN apt-get -y install at 

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 8081

RUN chmod a+x /usr/src/app/scheduler/start.sh

CMD ["/usr/src/app/scheduler/start.sh"]