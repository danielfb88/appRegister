module.exports = function(app) {

	var api = app.api.lob;

	app.route('/api/lob')
		.get(api.list)
		.post(api.new);

	app.route('/api/lob/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
