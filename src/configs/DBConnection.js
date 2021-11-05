require('dotenv').config();
import mysql from "mysql2";

let connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
<<<<<<< HEAD
    multipleStatements: true,
=======
    multipleStatements: true
>>>>>>> 99fb57ed01f86315e6c19a719d8e03a94719a3ac
});

//let connection = mysql.createPool({
//	host: process.env.DB_host,
//	user: process.env.DB_USERNAME,
//	password: process.env.DB_PASSWORD,
//	database: process.env.DB_NAME,
//	multipleStatements: true,
//	connectionLimit: 10,
//});

connection.connect(function(err) {
    if (err) throw err;
    console.log("Database connected!");
});

module.exports = connection;
