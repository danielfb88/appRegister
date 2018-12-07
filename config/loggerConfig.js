// Morgan Logger configuration
const morgan = require('morgan');
const env = require('./env');
var fs = require('fs');
var path = require('path')
var rfs = require('rotating-file-stream')

function pad(num) {
    return (num > 9 ? "" : "0") + num;
}

function generator(time, index) {
    if(! time)
        return new Date().toISOString();

    var month  = time.getFullYear() + "-" + pad(time.getMonth() + 1);
    var day    = pad(time.getDate());
    var hour   = pad(time.getHours());
    var minute = pad(time.getMinutes());

    return month + "/" + month + "-" +
        day + "-" + hour + "-" +  minute + "_" + index + ".log";
}

module.exports = function(app) {

    var logDirectory = path.join(global.appRoot, 'log');

    // ensure log directory exists
    fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

    // create a rotating write stream
    var accessLogStream = rfs(generator, {
      interval: env.LOG_REQUEST_NEW_FILE_INTERVAL, // time rotate to new log-file
      path: logDirectory + '/requests'
    })

    // getting user email and role
    morgan.token('remote-user', function getRemoteUserToken (req) {
        userInfo = req.decoded ? req.decoded.email + '-' + req.decoded.role : undefined;
        return userInfo;
    })

    app.use(morgan(env.LOG_FORMAT, {
        stream: accessLogStream
    }));

};