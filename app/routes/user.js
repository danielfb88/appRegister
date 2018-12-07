module.exports = function(app) {

    var api = app.api.user;

    app.route('/api/user')
        .get(api.list)
        .post(api.new);

    app.route('/api/user/:email')
        .get(api.findByEmail)
        .delete(api.removeByEmail)
        .put(api.updateByEmail);

    app.route('/api/user/updateRole/:email')
        .put(api.updateRole);

};
