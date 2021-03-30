#!/bin/sh
service atd start
node /usr/src/app/scheduler/schedule.js &
node /usr/src/app/scheduler/producer.js 