var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var objSchema = Schema({

    name: {
        type: String,
        required: true
    },

    initials: {
        type: String,
    },

    description: {
        type: String
    },

    business_unit: {
        type: String,
        required: true
    },

    lob: {
        type: String,
        required: true
    },

    tags: [{type: String}],

    it_team: [{ type: Schema.Types.ObjectId, ref: 'ITTeam' }],

    date_production_start: {
        type: Date
    },

    client_manager: { type: Schema.Types.ObjectId, ref: 'User' },

    technical_manager: { type: Schema.Types.ObjectId, ref: 'User' },

    type: {
        type: String,
    },

    status: {
        type: String,
    },

    version: {
        type: String
    },

    system_size_ppf: {
        type: String
    },

    version_control: {
        description: {
            type: String
        },
        url: {
            type: String
        },
    },

    data_base: [
        {
            environment: {
                type: String
            },
            dbms: {
                type: String
            },
            ip: {
                type: String
            },
            port: {
                type: Number
            },
            dbname: {
                type: String
            }
        }
    ],

    technology: [
        {
            description: {
                type: String
            },
            version: {
                type: String
            }
        }
    ],

    server: [
        {
            environment: {
                type: String
            },
            ip: {
                type: String
            },
            port: {
                type: Number
            },
            operational_system: {
                type: String
            }
        }
    ],

    microservice_avaliable: [{ type: Schema.Types.ObjectId, ref: 'Microservice' }],
    
    microservice_consumed: [{ type: Schema.Types.ObjectId, ref: 'Microservice' }],

});

mongoose.model('System', objSchema);
