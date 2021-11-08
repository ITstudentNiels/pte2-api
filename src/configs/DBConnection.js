require('dotenv').config();
import mysql from "mysql2";

let connection = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    rowsAsArray: false,
    multipleStatements: true
})

module.exports = connection;
