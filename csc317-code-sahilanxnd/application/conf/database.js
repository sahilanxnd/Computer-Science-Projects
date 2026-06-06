const mysql = require("mysql2");
const { getDbConfig } = require("./db-config");

const pool = mysql.createPool(getDbConfig());

module.exports = pool.promise();
