var mongoose = require('mongoose');

module.exports = function(app) {

    var api = {};
    var logger = app.util.logger;
    var helper = app.util.helper;

    var model = mongoose.model('Technology');

    /**
     * List by filters on querystring
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list = function(req, res) {
        /* filter comming from querystring */
        var filter = {};

        if(!helper.isEmpty(req.query.description)) filter.description = { $regex: '.*' + req.query.description + '.*', $options: 'i'};

        model.find(filter)
            .sort('description')
            .then(function(objs) {
                logger.debug("technology: Querystring: " + JSON.stringify(req.query));
                logger.debug("technology: Fetched: "  + objs.length + " objects.");
                logger.debug('technology: Filtred by: ' + JSON.stringify(filter) + "\n");

                res.json(objs);

            }, function(error) {
                logger.error(error);
                res.status(500).json(error);
            });

    };

    /**
     * Find by ID
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.findById = function(req, res) {
        model.findById(req.params.id)
            .then(function(obj) {
                if (!obj) throw new Error('obj not found.');
                logger.info('Technology \'%s\' fetched by user \'%s\'', req.params.id, req.decoded.email);
                res.json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });
    };

    /**
     * Remove by ID
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.removeById = function(req, res) {
        model.remove({'_id' : req.params.id})
            .then(function() {
                logger.info('Technology \'%s\' removed by user \'%s\'', req.params.id, req.decoded.email);
                res.sendStatus(200);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });

    };

    /**
     * Insert new
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.new = function(req, res) {
        req.check('description').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        // Verifying if this description already exists
        model.findOne({description: req.body.description}, (err, obj) => {
            if(obj) {
                var message = 'Technology description `' + req.body.description + '` already registered';
                logger.debug(message);
                res.status(400).send({erros: [message]});

            } else {
                model.create(req.body)
                    .then(function(obj) {
                        logger.info('Technology \'%s\' created by user \'%s\'', req.body.description, req.decoded.email);
                        res.status(201).json(obj);

                    }, function(error) {
                        logger.error(error);
                        res.sendStatus(500);
                    });
            }

        });
    };

    /**
     * Update
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.update = function(req, res) {
        req.check('description').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        model.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(function(obj) {
                logger.info('Technology \'%s\' updated by user \'%s\'', req.body.description, req.decoded.email);
                res.status(200).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            })
    };

    return api;
};
