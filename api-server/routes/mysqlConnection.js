var mysql = require('mysql');


var connection = mysql.createConnection(process.env.MYSQL_URL);

module.exports = connection;
