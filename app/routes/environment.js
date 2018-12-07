module.exports = function(app) {

	var api = app.api.environment;

	app.route('/api/environment')
		.get(api.list)
		.post(api.new);

	app.route('/api/environment/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
