var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objSchema = Schema({
    description: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    email: {
        type: String,
        trim: true
    },

    manager: { type: Schema.Types.ObjectId, ref: 'User' },

    business_unit: {
        type: String,
        required: true,
        trim: true
    }
});

mongoose.model('ITTeam', objSchema);
