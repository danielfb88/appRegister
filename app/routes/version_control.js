module.exports = function(app) {

	var api = app.api.version_control;

	app.route('/api/version_control')
		.get(api.list)
		.post(api.new);

	app.route('/api/version_control/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
