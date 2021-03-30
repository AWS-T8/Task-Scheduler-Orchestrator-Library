#  Dockerfile for ubuntu
FROM ubuntu

# Create App Directory
RUN mkdir -p /usr/src/app/taskRunner
WORKDIR /usr/src/app/taskRunner

#Install packages
RUN apt-get -y update
RUN apt install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
RUN apt-get install -y nodejs

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
EXPOSE 8082

RUN chmod a+x /usr/src/app/taskRunner/start.sh

CMD ["/usr/src/app/taskRunner/start.sh"]