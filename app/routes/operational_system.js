module.exports = function(app) {

	var api = app.api.operational_system;

	app.route('/api/os')
		.get(api.list)
		.post(api.new);

	app.route('/api/os/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
