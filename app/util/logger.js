// < Winston Logger >
var winston = require('winston');
var env = require(global.appRoot + '/config/env.js');
var fs = require('fs');
require('winston-daily-rotate-file');

// ensure log directory exists
var logDirectory = global.appRoot + '/log/application';
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            timestamp: function() {
                return (new Date()).toISOString();
            }
            ,colorize: true
            ,level: env.LOG_LEVEL
        })
        ,new (winston.transports.DailyRotateFile)({
            filename: logDirectory + '/%DATE%.log'
            ,datePattern: 'YYYY-MM-DD-HH'
            ,maxSize: env.LOG_APPLICATION_FILE_MAXSIZE
            ,maxFiles: env.LOG_APPLICATION_FILE_MAXFILES
            ,level: env.LOG_LEVEL
        })
    ]
});

module.exports = logger;
