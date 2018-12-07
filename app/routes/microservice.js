module.exports = function(app) {

	var api = app.api.microservice;

	app.route('/api/microservice')
		.get(api.list)
        .post(api.new);
        
    app.route('/api/microservice_array')
		.post(api.new_array)
		.put(api.update_array)

    app.route('/api/microservice_array/:arr_id')
        .delete(api.delete_array)

	app.route('/api/microservice/:id')
		.get(api.findById)
		.delete(api.removeById)
		.put(api.update);
};
