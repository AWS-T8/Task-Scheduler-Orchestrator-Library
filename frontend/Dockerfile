#  Dockerfile for React
FROM node:latest

# Create App Directory
RUN mkdir -p /usr/src/app/frontend
WORKDIR /usr/src/app/frontend

# Copy Build Folder
COPY /build /usr/src/app/frontend

# Exports
EXPOSE 3001

CMD ["npx","serve", "-s", ".", "-l", "3001"]