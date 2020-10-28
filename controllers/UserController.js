var logger = require('../config/winston');
const User = require('../models/user');
const Role = require('../models/role');
const config = require('../config/config.js');

module.exports = function(app) {
	
	app.get('/api/users/:id', async function(req, res) {
		
	});

	app.post('/api/users', async function(req, res) {
		
	});
		
}