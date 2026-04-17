//1. importing mysql2
const mysql = require("mysql2");

//2. load env variables
require("dotenv").config();

//3. create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//4. export pool
module.exports = pool;