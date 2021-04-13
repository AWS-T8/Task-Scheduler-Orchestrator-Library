#  Dockerfile for React
FROM node:latest

# Create App Directory
RUN mkdir -p /usr/src/app/frontend
WORKDIR /usr/src/app/frontend

# Install Dependencies
COPY package*.json ./

RUN npm install --silent

# Copy app source code
COPY . .

# Run build command
RUN npm run-script build

# Exports
EXPOSE 3001

CMD ["npx","serve", "-s", "build", "-l", "3001"]