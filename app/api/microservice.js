var mongoose = require('mongoose');

module.exports = function(app) {

    var api = {};
    var logger = app.util.logger;
    var helper = app.util.helper;

    var collectionName = 'Microservice';
    var model = mongoose.model(collectionName);

    /**
     * List by filters on querystring
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.list = function(req, res) {
        /* filter comming from querystring */
        var filter = {};

        if(!helper.isEmpty(req.query.id_system))   	    filter.system		    = mongoose.Types.ObjectId(req.query.id_system);

        if(!helper.isEmpty(req.query.description))      filter.description      = { $regex: '.*' + req.query.description + '.*', $options: 'i'};
        if(!helper.isEmpty(req.query.url))              filter.url              = { $regex: '.*' + req.query.url + '.*', $options: 'i'};
        if(!helper.isEmpty(req.query.http_method))      filter.http_method      = { $regex: '.*' + req.query.http_method + '.*', $options: 'i'};
        if(!helper.isEmpty(req.query.documentation))    filter.documentation    = { $regex: '.*' + req.query.documentation + '.*', $options: 'i'};

        model.find(filter)
            .populate('system')
            .sort('description')
            .then(function(objs) {
                logger.debug(collectionName + ": Querystring: " + JSON.stringify(req.query));
                logger.debug(collectionName + ": Fetched: "  + objs.length + " objects.");
                logger.debug(collectionName + ": Filtred by: " + JSON.stringify(filter) + "\n");

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
            logger.info(collectionName.toUpperCase() + ' FETCHED. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', obj._id, obj.description, req.decoded.email);

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
            logger.info('SUCCESSFUL DELETED to ' + collectionName.toUpperCase() + '. id: \'%s\'; by user \'%s\'\n', req.params.id, req.decoded.email);
            res.sendStatus(200);

        }, function(error) {
            logger.error(error);
            res.sendStatus(500);
        });

    };

    /**
     * Delete an array 
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.delete_array = function(req, res) {
        var arrID = JSON.parse(req.params.arr_id);

        model.remove({'_id' : { $in: arrID}})
            .then(function() {
                logger.info('SUCCESSFUL DELETED to ' + collectionName.toUpperCase() + '. id: \'%s\'; by user \'%s\'\n',
                    JSON.stringify(arrID), req.decoded.email);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });

        res.status(200);
    };

    /**
     * Insert new
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.new = function(req, res) {
        req.check('system').not().isEmpty();
        req.check('description').not().isEmpty();
        req.check('url').not().isEmpty();
        req.check('http_method').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        model.create(req.body)
            .then(function(obj) {
                logger.info('SUCCESSFUL CREATED to ' + collectionName.toUpperCase() + '. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', obj._id, obj.description, req.decoded.email);
                res.status(201).json(obj);

            }, function(error) {
                logger.error(error);
                res.sendStatus(500);
            });
    };

    /**
     * Receive an array to insert
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.new_array = async function(req, res) {
        var arrObj = req.body;

        var arrReturn = [];

        for(var i = 0; i < arrObj.length; i++) {

            // checking if obj already exist
            if(arrObj[i].system && arrObj[i].description) {
                await model.findOne(
                    {
                        system: mongoose.Types.ObjectId(arrObj[i].system),
                        description: arrObj[i].description
                    }
                )
                .then(async function(obj) {
                    if (!obj) {
                        // create a new
                        await model.create(arrObj[i])
                        .then(function(objSaved) {
                            logger.info('SUCCESSFUL CREATED to ' + collectionName.toUpperCase() + '. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', objSaved._id, objSaved.description, req.decoded.email);
                            arrReturn.push(objSaved);

                        }, function(error) {
                            logger.error(error);
                            res.status(500).json(error);
                        });
                    } else {
                        logger.debug(collectionName.toUpperCase() + ' ALREADY EXIST. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', obj._id, obj.description, req.decoded.email);
                    }

                }, function(error) {
                    logger.error(error);
                    res.sendStatus(500);
                });
            }
        }

        var statusOK;
        if(arrReturn.length > 0)
            statusOK = 201; // ok and created
        else
            statusOK = 200; // just ok

        res.status(statusOK).json(arrReturn);
    };

    /**
     * Receive an array to update
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.update_array = async function(req, res) {
        var arrObj = req.body;
        var arrReturn = [];

        for(var i = 0; i < arrObj.length; i++) {

            await model.findByIdAndUpdate(arrObj[i]._id, arrObj[i], {new: true})
                .then(function(obj) {
                    logger.info('SUCCESSFUL UPDATED to ' + collectionName.toUpperCase() + '. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', obj._id, obj.description, req.decoded.email);
                    arrReturn.push(obj);

                }, function(error) {
                    logger.error(error);
                    res.status(500).json(error);
                })

        }

        var statusOK;
        if(arrReturn.length > 0)
            statusOK = 200; // ok
        else
            statusOK = 204; // The server successfully processed the request, but is not returning any content

        res.status(statusOK).json(arrReturn);
    };

    /**
     * Update
     * @param  {request} req request Object
     * @param  {response} res response Object
     * @return {response}
     */
    api.update = function(req, res) {
        req.check('system').not().isEmpty();
        req.check('description').not().isEmpty();
        req.check('url').not().isEmpty();
        req.check('http_method').not().isEmpty();

        if(req.validationErrors()) {
            logger.debug('Validation errors found');
            res.status(400).send(req.validationErrors());
            return;
        }

        model.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(function(obj) {
            logger.info('SUCCESSFUL UPDATED to ' + collectionName.toUpperCase() + '. id: \'%s\'; description: \'%s\'; by user \'%s\'\n', obj._id, obj.description, req.decoded.email);
            res.status(200).json(obj);

        }, function(error) {
            logger.error(error);
            res.sendStatus(500);
        })

    };

    return api;
};