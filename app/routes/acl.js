module.exports = function(app) {

    var acl = require('express-acl');

    acl.config({
        baseUrl: 'api'
    });

    app.use(acl.authorize);
};
