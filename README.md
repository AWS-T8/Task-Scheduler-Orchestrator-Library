<h1 align="center">
AWS-T8 <svg xmlns="http://www.w3.org/2000/svg" width="30" height="28" viewBox="0 0 30 21"><path d="M17 3v-2c0-.552.447-1 1-1s1 .448 1 1v2c0 .552-.447 1-1 1s-1-.448-1-1zm-12 1c.553 0 1-.448 1-1v-2c0-.552-.447-1-1-1-.553 0-1 .448-1 1v2c0 .552.447 1 1 1zm13 13v-3h-1v4h3v-1h-2zm-5 .5c0 2.481 2.019 4.5 4.5 4.5s4.5-2.019 4.5-4.5-2.019-4.5-4.5-4.5-4.5 2.019-4.5 4.5zm11 0c0 3.59-2.91 6.5-6.5 6.5s-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5zm-14.237 3.5h-7.763v-13h19v1.763c.727.33 1.399.757 2 1.268v-9.031h-3v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-9v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-3v21h11.031c-.511-.601-.938-1.273-1.268-2z"/></svg>
</h1>

<h3 align="center">Task Scheduler & Orchestrator Library</h3>
<p align="center">Team ID: AWS-T8 | Team Members: <a href="https://github.com/Sanskar31" target="_blank">Sanskar Agarwal</a> &amp; <a href="https://github.com/saksham20189575" target="_blank">Saksham Arora</a></p>

<p align="center">
  <a href="#introduction">Introduction</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#complete-documentation">Documentation</a>

</p>

## Introduction
The aim of our project is to create a Task Scheduler, that takes in a task in the form of a link to AWS lambda function & executes it on the specified time, & an Orchestrator that can schedule an orchestration. The orchestrator schedules a set of tasks collectively. These tasks are executed in a sequential manner, & after the successful execution of each task a condition check task is executed.
 <br/>
Why do we need this? <br/>
Basically companies have multiple workflows that consist of a set of asynchronous tasks that need to be scheduled and executed based on events or other triggers. This is where a task orchestrator and scheduler comes in handy. <br/>
Here we expose an API through which users can schedule the tasks & modify them.

## Key Features

* Secure API Authorization using JWT
* Takes in Lambda URL & schedules it on the specified time.
* Users can cancel or modify the task before the start of it’s execution. 
* Executes a task with an accuracy of under 1 second.
* Retries task specified number of times upon failure of Lambda function (4xx or 5xx response code).
* Supports creation of orchestrations for any number of tasks.
* Users can cancel and modify the orchestration before the start of it’s execution.
* Supports creation of Lambda functions using regular java or python functions. Returns the trigger URL of the created lambda function in response & schedules it.

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Docker](https://www.docker.com/products/docker-desktop). From your command line:
```bash
# Clone this repository
$ git clone https://github.com/Crio-Winter-of-Doing-2021/AWS-T8.git

# Go into the repository
$ cd AWS-T8

# To create the docker images
$ chmod +x setup.sh
$ sudo ./setup.sh 

# To start the scheduler & orchestrator(run docker images as containers) 
$ chmod +x start.sh
$ sudo ./start.sh

# To stop the docker images
$ chmod +x stop.sh
$ sudo ./stop.sh
```

API runs on port : 3000 <br>
Frontend runs on port : 3001

## Tech Stack

* Frontend
  - Language - JavaScript
  - Package management - [NPM](https://www.npmjs.com/)
  - Library - [React](https://reactjs.org/)
  - CSS Framework - [Tailwind CSS](https://tailwindcss.com/)
* Backend 
  - Language - JavaScript
  - Package management - [NPM](https://www.npmjs.com/)
  - Platform - [NodeJs](https://nodejs.org/en/)
* Tools
  - [Apache Kafka](https://kafka.apache.org/)
  - [MongoDB](https://www.mongodb.com/)
  - [Docker](https://www.docker.com/)


## [Complete Documentation](https://docs.google.com/document/d/1Bhax3or9FEDsO5VVvSC2KEXrrg6DDOS7OGVB39NcO_Y/edit)
