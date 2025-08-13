const pgp = require('pg-promise')();

const connection = {
	host: 'localhost',
	port: 5432,
	database: 'TestDatabase',
	user: 'saai',
	password: '2580',
	max: 30
};

module.exports.db = pgp(connection);
module.exports.pgp = pgp;
