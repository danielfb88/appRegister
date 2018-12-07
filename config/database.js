module.exports = function(uri, app) {

	var mongoose = require('mongoose');
    var logger = app.util.logger;

    // to solve a promise warning
    mongoose.Promise = require('bluebird');
	mongoose.connect(uri, {
        useMongoClient: true,
    });

	mongoose.connection.on('connected', function() {
		logger.debug('Connected to MongoDB')
	});

	mongoose.connection.on('error', function(error) {
		logger.debug('Error in MongoDB connection: ' + error);
	});

	mongoose.connection.on('disconnected', function() {
		logger.debug('Disconnected from MongoDB')
	});

	process.on('SIGINT', function() {
		mongoose.connection.close(function() {
			logger.debug('Application finished. Connection closed.')
			process.exit(0);
		});

	})
};


