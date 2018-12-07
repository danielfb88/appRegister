var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const { body } = require('express-validator/check');

module.exports = function(app) {

    var api = {};
    var logger = app.util.logger;

    var model = mongoose.model('User');

    /**
     * Insert new
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.new = function(req, res) {
        req.check('email').isEmail();
        req.check('password').not().isEmpty();
        req.check('business_unit').not().isEmpty();
        req.check('role').not().isEmpty().isIn(['admin', 'observer', 'manager']);

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            return res.status(400).send(req.validationErrors());
        }

        // search if already exist
        model.findOne({email: req.body.email}, (err, user) => {
            if(user) {
                var message = 'User already registered';
                logger.debug(message)
                res.status(400).send({errors: [message]});

            } else {
                var salt = bcrypt.genSaltSync(10);
                var hash = bcrypt.hashSync(req.body.password, salt);
                req.body.password = hash;

                model.create(req.body)
                    .then(function(obj) {
                        var owner = (req.decoded != undefined) ? req.decoded.email : 'unregistered';
                        logger.info('SUCCESSFUL CREATED to user. id: \'%s\'; email: \'%s\'; by user \'%s\'\n', obj._id, obj.email, owner);
                        res.status(201).json(obj);

                    }, function(error) {
                        logger.error(error);
                        res.status(500).send(error);
                    });
            }
        });

    };

    /**
     * List all
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list = function(req, res) {
        model.find()
            .sort('name')
            .then(function(objs) {
                // removing password
                objs.forEach(function(obj) { obj.password = undefined; });

                res.status(200).json(objs);

            }, function(error) {
                logger.error(error);
                res.status(500).json(error);
            });
    };

    /**
     * Update role
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.updateRole = function(req, res) {
        req.check('role').not().isEmpty().isIn(['admin', 'observer', 'manager']);

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        model.findOneAndUpdate({email: req.params.email}, {$set: {role: req.body.role}}, {new: true})
            .then(function(obj) {
                res.status(200).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            })
    };

    /**
     * Find by email
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.findByEmail = function(req, res) {
        model.findOne({email: req.params.email})
            .then(function(obj) {
                if (!obj)
                    res.status(404).json({'message': 'object not found'});

                // Removing password
                obj.password = undefined;

                res.json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });
    };

    /**
     * Remove by email
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.removeByEmail = function(req, res) {
        model.remove({'email' : req.params.email})
            .then(function() {
                logger.debug('Removing user ' + req.params.email);
                res.sendStatus(200);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });

    };

    /**
     * Update by email
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.updateByEmail = function(req, res) {
        req.check('password').not().isEmpty();
        req.check('business_unit').not().isEmpty();
        req.check('role').not().isEmpty().isIn(['admin', 'observer', 'manager']);

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            return res.status(400).send(req.validationErrors());
        }

        model.findOneAndUpdate({email: req.params.email},
            {
                $set: {
                    'password': req.body.password,
                    'role': req.body.role,
                    'business_unit': req.body.business_unit
                }
            }, {new: true})
            .then(function(obj) {
                res.status(200).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            })
    };

    return api;
};
