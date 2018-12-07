var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objSchema = Schema({

    system: {
        type: Schema.Types.ObjectId, ref: 'System',
        required: true
    },

    description: {
        type: String,
        required: true
    },

    url: {
        type: String,
        required: true
    },

    http_method: {
        type: String,
        required: true
    },

    documentation: {
        type: String
    }

});

mongoose.model('Microservice', objSchema);
