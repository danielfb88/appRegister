var mongoose = require('mongoose');

var schema = mongoose.Schema({
    description: {
        type: String,
        unique: true,
        required: true,
        trim: true
    }
});

mongoose.model('SystemType', schema);
