
// putting the path of appRoot in global var
global.appRoot = require('path').resolve(__dirname);

// loading app
var app = require('./config/express');
const env = require('./config/env');

// loading database
require('./config/database')('mongodb://' + env.DB.DB_HOST + '/' + env.DB.DB_NAME, app);

// loading server
app.listen(env.SERVER_PORT, function() {
    var logger = app.util.logger;
	logger.debug('Server started');
});

module.exports = app
