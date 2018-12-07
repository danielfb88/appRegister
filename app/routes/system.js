module.exports = function (app) {

	var api = app.api.system;

	app.route('/api/system')
		.get(api.list)
		.post(api.new);

	app.route('/api/system/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
