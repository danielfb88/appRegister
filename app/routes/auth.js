module.exports = function(app) {

	var api = app.api.auth;

    app.post('/api/auth', api.auth); // what cames here, auth
    app.use('/api/*', api.checkToken); // what cames here, check

};
