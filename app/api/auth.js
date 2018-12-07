var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt');

module.exports = function(app) {

    var api = {};
    var model = mongoose.model('User');
    var logger = app.util.logger;

    /**
    * Authenticate user
    *
    * @param  {request} req request Object
    * @param  {response} res response Object
    * @return {response}
    */
    api.auth = function(req, res) {
        var promise = new Promise(function(resolve, reject) {
            model.findOne({
                email: req.body.email,
            })
            .then(function(user) {
                if(user && bcrypt.compareSync(req.body.password, user.password)) {
                    user.password = undefined;
                    var token = jwt.sign(user.toObject(), app.get('secret'), {
                        expiresIn: 86400 // 24h
                    });

                    logger.info('User \'%s\' Autenticated! Token addicted on response', user.email);

                    res.set('x-access-token', token); // adding token on head of request
                    res.end(); //sending response

                    resolve(res);

                } else {
                    let authErrorMessage = 'Authentication failed. User or Password invalid.';
                    logger.info('Authentication failed. User \'%s\'', req.body.email);
                    res.status(401);
                    res.json({ message: authErrorMessage });

                    reject(res);
                }
            });

        });


        return promise;
    };

    /**
    * Check token
    * All requests will pitch here
    *
    * @param  {request} req request Object
    * @param  {response} res response Object
    * @return {response}
    */
    api.checkToken = function(req, res, next) {
        var token = req.headers['x-access-token']; //get token on head of request

        if(token) {
            logger.debug('Request ' + req.method + ' to ' + req.baseUrl);
            logger.debug('Token received. Decoding....');

            jwt.verify(token, app.get('secret'), function(err, decoded) {
                if (err) {
                    logger.debug('Token REJECTED\n');
                    res.sendStatus(401);

                } else {

                    logger.debug('Token ACCEPTED');
                    logger.debug('Logged user: ' + decoded.email + '\n');
                    req.decoded = decoded;
                    next();
                }
            });

        } else {
            logger.debug('No token received.\n');
            return res.sendStatus(401);
        }
    };

    return api;
};
