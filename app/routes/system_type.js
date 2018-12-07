module.exports = function(app) {

	var api = app.api.system_type;

	app.route('/api/system_type')
		.get(api.list)
		.post(api.new);

	app.route('/api/system_type/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
