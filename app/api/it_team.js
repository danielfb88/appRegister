var mongoose = require('mongoose');

module.exports = function(app) {

    var api = {};
    var logger = app.util.logger;
    var helper = app.util.helper;

    var model = mongoose.model('ITTeam');

    /**
     * List by filters on querystring
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list = function(req, res) {
        /* filter comming from querystring */
        var filter = {};

        if(!helper.isEmpty(req.query.description))    filter.description    = { $regex: '.*' + req.query.description + '.*', $options: 'i'};
        if(!helper.isEmpty(req.query.business_unit))  filter.business_unit  = { $regex: '.*' + req.query.business_unit + '.*', $options: 'i'};
        if(!helper.isEmpty(req.query.email))   		filter.email           	= { $regex: '.*' + req.query.email + '.*', $options: 'i'};

        if(!helper.isEmpty(req.query.id_manager))   	filter.manager		= mongoose.Types.ObjectId(req.query.id_manager);

        model.find(filter)
            .populate('manager')
            .sort('description')
            .then(function(objs) {
                logger.debug("it_team: Querystring: " + JSON.stringify(req.query));
                logger.debug("it_team: Fetched: "  + objs.length + " objects.");
                logger.debug('it_team: Filtred by: ' + JSON.stringify(filter) + "\n");

                // removing user's password
                objs.forEach(function(obj) {
                    if(obj.manager) obj.manager.password = undefined;
                });

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
            .populate('manager')
            .then(function(obj) {
                if (!obj) throw new Error('obj not found.');
                logger.info('IT_Team \'%s\' fetched by user \'%s\'', req.params.id, req.decoded.email);

                // removing user's password
                if(obj.manager) obj.manager.password = undefined;

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
                logger.info('IT_Team \'%s\' removed by user \'%s\'', req.params.id, req.decoded.email);
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
        req.check('manager').not().isEmpty();
        req.check('business_unit').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        // Verifying if this description already exists
        model.findOne({description: req.body.description}, (err, obj) => {
            if(obj) {
                var message = 'IT Team description `' + req.body.description + '` already registered';
                logger.debug(message);
                res.status(400).send({erros: [message]});

            } else {
                model.create(req.body)
                    .then(function(obj) {
                        logger.info('IT_Team \'%s\' created by user \'%s\'', req.body.description, req.decoded.email);
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
        req.check('manager').not().isEmpty();
        req.check('business_unit').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        model.findByIdAndUpdate(req.params.id, req.body, {new: true})
            .then(function(obj) {
                logger.info('IT_Team \'%s\' updated by user \'%s\'', req.body.description, req.decoded.email);
                res.status(200).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            })
    };

    return api;
};
