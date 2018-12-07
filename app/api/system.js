var mongoose = require('mongoose');

/**
 * Ckeck if the user can modify the business unit
 * @param  {obj} user          		User logged. (req.decoded)
 * @param  {string} business_unit 	Business unit that user wants to modify
 * @return {boolean}               	permision to modify
 */
function userCanModify(user, business_unit) {
    return (user.role == 'admin' || (user.role == 'manager' && user.business_unit == business_unit));
}

module.exports = function(app) {

    var api = {};
    var logger = app.util.logger;
    var helper = app.util.helper;

    var model = mongoose.model('System');
    var modelUser = mongoose.model('User');

    /**
     * List by filters on querystring
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list = function(req, res) {
        // first search how many rows to be used on pagination
        model.find()
            .then(function (objs) {
                var qtd_total = objs.length;

                // new search with filters
                var documentQuery = model.find()
                    .populate('client_manager', '-password')
                    .populate('technical_manager', '-password')
                    .populate('it_team')
                    .populate('microservice_avaliable')
                    .populate('microservice_consumed');

                // order by
                if (!helper.isEmpty(req.query.orderBy)) {
                    if (req.query.orderBy == 'name') {
                        documentQuery.sort(req.query.orderBy);

                    } else if (req.query.orderBy == 'initials') {
                        documentQuery.sort(req.query.orderBy);

                    } else if (req.query.orderBy == 'business_unit') {
                        documentQuery.sort(req.query.orderBy);

                    }
                }

                // pagination
                if (!helper.isEmpty(req.query.page) && !helper.isEmpty(req.query.limit)) {
                    var page = Math.abs(req.query.page) - 1;
                    var limit = Math.abs(req.query.limit);

                    var skip = page * limit;

                    documentQuery.limit(limit);
                    documentQuery.skip(skip);
                }

                /*
                Filters
                */
               var logFilter = {};

                // by name
                if (!helper.isEmpty(req.query.name)) {
                    documentQuery.where('name', { $regex: req.query.name, $options: 'i' });
                    logFilter.name = req.query.name;
                }

                // initials
                if (!helper.isEmpty(req.query.initials)) {
                    documentQuery.where('initials', { $regex: req.query.initials, $options: 'i' });
                    logFilter.initials = req.query.initials;
                }

                // type
                if (!helper.isEmpty(req.query.type)) {
                    documentQuery.where('type', { $regex: req.query.type, $options: 'i' });
                    logFilter.type = req.query.type;
                }

                // status
                if (!helper.isEmpty(req.query.status)) {
                    documentQuery.where('status', { $regex: req.query.status, $options: 'i' });
                    logFilter.status = req.query.status;
                }

                // lob
                if (!helper.isEmpty(req.query.lob)) {
                    documentQuery.where('lob', { $regex: req.query.lob, $options: 'i' });
                    logFilter.lob = req.query.lob;
                }

                // business_unit
                if (!helper.isEmpty(req.query.business_unit)) {
                    documentQuery.where('business_unit', { $regex: req.query.business_unit, $options: 'i' });
                    logFilter.business_unit = req.query.business_unit;
                }

                // client_manager
                if (!helper.isEmpty(req.query.id_client_manager)) {
                    documentQuery.where('client_manager', mongoose.Types.ObjectId(req.query.id_client_manager));
                    logFilter.id_client_manager = req.query.id_client_manager;
                }

                // technical_manager
                if (!helper.isEmpty(req.query.id_technical_manager)) {
                    documentQuery.where('technical_manager', mongoose.Types.ObjectId(req.query.id_technical_manager));
                    logFilter.id_technical_manager = req.query.id_technical_manager;
                }

                // it_team
                if (!helper.isEmpty(req.query.it_team)) {
                    documentQuery.where('it_team', { $in: JSON.parse(req.query.it_team) });
                    logFilter.it_team = req.query.it_team;
                }

                // key words
                if (!helper.isEmpty(req.query.free_search)) {
                    var words = req.query.free_search.trim().replace(/[ ]{2,}/, " ").split(" ");
                    var fields =
                        [
                            'name',
                            'description',
                            'tags',
                        ];

                    var i = 0;
                    var arr_or = [];
                    words.forEach(word => {
                        fields.forEach(field => {
                            var filter = {};
                            filter[field] = { $regex: word, $options: 'i' };
                            arr_or[i] = filter;

                            logFilter[field] = word;
                            i++;
                        });
                    });

                    documentQuery.or(arr_or);
                }

                documentQuery.then(function (objs) {
                    logger.debug("system: Querystring: " + JSON.stringify(req.query));
                    logger.debug("system: Fetched without filters: " + qtd_total + " objects.");
                    logger.debug("system: Fetched with filters: " + objs.length + " objects.");
                    logger.debug('system: Filtred by: ' + JSON.stringify(logFilter) + "\n");

                    res.json({
                        list: objs,
                        totalRows: qtd_total
                    });

                }, function (error) {
                    logger.error(error);
                    res.status(500).json(error);
                });

            }, function (error) {
                logger.error(error);
                res.status(500).json(error);
            });

    };

    /**
     * List when avaliable microservices exists on querystring
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list_whenAvaliableMicroserviceExists = function(req, res) {
        var filter = { $where: "this.microservice_avaliable.length > 0" };

        model.find(filter)
            .populate("microservice_avaliable")
            .then(function(objs) {
                logger.debug("system_whenAvaliableMicroserviceExists: Querystring: NO QUERYSTRING");
                logger.debug("system_whenAvaliableMicroserviceExists: Fetched: "  + objs.length + " objects.");
                logger.debug('system_whenAvaliableMicroserviceExists: Filtred by: ' + JSON.stringify(filter) + "\n");

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
            .then(async function(obj) {
                if (!obj) throw new Error('obj not found.');

                logger.info('SYSTEM FETCHED. id: \'%s\'; name: \'%s\'; by user \'%s\'\n', obj._id, obj.name, req.decoded.email);

                // Populating system
                await model.populate(obj, [
                    { path: 'client_manager', select: '-password' },
                    { path: 'technical_manager', select: '-password' },
                    { path: 'it_team' },
                    { path: 'microservice_avaliable' },
                    { path: 'microservice_consumed' },
                ], function (err, populated) {
                    if (err) throw new Error('Error on populate system.');
                    obj = populated;
                });
                
                // Populating it_team
                await model.populate(obj, { path: 'it_team.manager', model: modelUser, select: '-password' }, function (err, populated) {
                    if (err) throw new Error('Error on populate it_team.');
                    obj = populated;
                });

                // Populating microservice_consumed
                await model.populate(obj, { path: 'microservice_consumed.system', model: model, select: 'name' }, function (err, populated) {
                    if (err) throw new Error('Error on populate microservice_consumed.');
                    obj = populated;
                });

                // sending JSON
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
        model.findById(req.params.id)
            .then(function(obj) {
                if (!obj) throw new Error('obj not found');

                if(!userCanModify(req.decoded, obj.business_unit)) {
                    res.status(403).send({errors: ['User `' + req.decoded.email + '` dont have permission to do this action.']});
                    return;
                }

                model.remove({'_id' : req.params.id})
                    .then(function() {
                        logger.info('SUCCESSFUL DELETED to system. id: \'%s\'; name: \'%s\'; by user \'%s\'\n', obj._id, obj.name, req.decoded.email);
                        res.sendStatus(200);

                    }, function(error) {
                        logger.error(error);
                        res.sendStatus(500);
                    });

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
        req.check('name').not().isEmpty();
        req.check('initials').not().isEmpty();
        req.check('description').not().isEmpty();
        req.check('client_manager').not().isEmpty();
        req.check('technical_manager').not().isEmpty();
        req.check('it_team').not().isEmpty();
        req.check('lob').not().isEmpty();
        req.check('type').not().isEmpty().isIn(['COMERCIAL', 'INTERNAL']);
        req.check('status').not().isEmpty().isIn(['DEVELOPMENT', 'HOMOLOGATION', 'PRODUCTION']);
        req.check('version').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            logger.debug(req.validationErrors());
            res.status(400).send(req.validationErrors());
            return;
        }

        /*
        setting the request owner's business unit to new system
        */
        req.body.business_unit = req.decoded.business_unit;

        model.create(req.body)
            .then(function(obj) {
                logger.info('SUCCESSFUL CREATED to system. id: \'%s\'; name: \'%s\'; by user \'%s\'\n', obj._id, obj.name, req.decoded.email);
                res.status(201).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });

    };

    /**
     * Update
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.update = function(req, res) {
        req.check('name').not().isEmpty();
        req.check('initials').not().isEmpty();
        req.check('description').not().isEmpty();
        req.check('client_manager').not().isEmpty();
        req.check('technical_manager').not().isEmpty();
        req.check('it_team').not().isEmpty();
        req.check('lob').not().isEmpty();
        req.check('type').not().isEmpty().isIn(['COMERCIAL', 'INTERNAL']);
        req.check('status').not().isEmpty().isIn(['DEVELOPMENT', 'HOMOLOGATION', 'PRODUCTION']);
        req.check('version').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            logger.debug(req.validationErrors());
            res.status(400).send(req.validationErrors());
            return;
        }

        /*
        If status different of PRODUCTION set date_production_start to null
        */
        if(req.body.status != 'PRODUCTION')
            req.body.date_production_start = null;

        model.findById(req.params.id)
            .then(function(obj) {
                if (!obj) throw new Error('obj not found.');

                if(!userCanModify(req.decoded, obj.business_unit)) {
                    res.status(403).send({error: "User '" + req.decoded.email + "' dont have permission to do this action."});
                    return;
                }

                model.findByIdAndUpdate(req.params.id, req.body, {new: true})
                    .then(function(obj) {
                        logger.info('SUCCESSFUL UPDATED to system. id: \'%s\'; name: \'%s\'; by user \'%s\'\n', obj._id, obj.name, req.decoded.email);
                        res.status(200).json(obj);

                    }, function(error) {
                        logger.error(error);
                        res.sendStatus(500);
                    })


            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });

    };

    return api;
};
