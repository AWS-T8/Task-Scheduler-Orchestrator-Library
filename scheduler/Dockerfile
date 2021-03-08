#  Dockerfile for Node Express Backend

FROM node:14-slim

# Create App Directory
RUN mkdir -p /usr/src/app/scheduler
WORKDIR /usr/src/app/scheduler

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Exports
# EXPOSE 3000

CMD ["node","./schedule.js"]