module.exports = function(app) {

	var api = app.api.database;

	app.route('/api/database')
		.get(api.list)
		.post(api.new);

	app.route('/api/database/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
