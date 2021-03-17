#  Dockerfile for Node Express Backend
FROM node:latest

# Create App Directory
RUN mkdir -p /usr/src/app/taskRunner
WORKDIR /usr/src/app/taskRunner

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

CMD ["node","consumer.js"]