var mysql = require('mysql');

var dbConfig = {
  host: '127.0.0.1',
  user: 'sun',
  password: '1999',
  database: 'linebot'
};

var connection = mysql.createConnection(dbConfig);

module.exports = connection;