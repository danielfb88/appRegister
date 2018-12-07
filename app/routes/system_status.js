module.exports = function(app) {

	var api = app.api.system_status;

	app.route('/api/system_status')
		.get(api.list)
		.post(api.new);

	app.route('/api/system_status/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
