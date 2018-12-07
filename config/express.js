const express = require('express');
const consign = require('consign');
const bodyParser = require('body-parser');
const express_validator = require('express-validator');
const cors = require('./cors');

const app = express();

require('./loggerConfig')(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express_validator());
app.use(cors);

// secret used by JWT
app.set('secret', 'dsa332fdsFDS2112sagf!!@dsfre#2aegg478');

//disable information x-powered-by from header
app.disable('x-powered-by');

var _consign = consign({ cwd: 'app' })
    .include('models')
    .then('util')
    .then('api')

if (process.env.NODE_ENV != 'prod')
    _consign.then('routes/user.js') // if not in production environment, load first

_consign.then('routes/auth.js') // load first
    .then('routes/acl.js') // load first
    .then('routes')
    .into(app);

module.exports = app;
