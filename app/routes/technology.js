module.exports = function(app) {

	var api = app.api.technology;

	app.route('/api/technology')
		.get(api.list)
		.post(api.new);

	app.route('/api/technology/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
