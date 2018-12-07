module.exports = function(app) {

	var api = app.api.it_team;

	app.route('/api/it_team')
		.get(api.list)
		.post(api.new);

	app.route('/api/it_team/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
