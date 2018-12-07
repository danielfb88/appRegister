var mongoose = require('mongoose');

var schema = mongoose.Schema({

    name: {
        type: String,
        trim: true
    },

    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true
    },

    business_unit: {
        type: String,
        required: true,
        trim: true
    },

    role: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        trim: true
    },

});

mongoose.model('User', schema);
