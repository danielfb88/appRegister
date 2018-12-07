module.exports = function(app) {

	var api = app.api.business_unit;

	app.route('/api/business_unit')
		.get(api.list)
		.post(api.new);

	app.route('/api/business_unit/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
