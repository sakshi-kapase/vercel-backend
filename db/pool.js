//1. imprting mysql2
//1. imprting mysql2
const mysql = require('mysql2');

//2. create connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'sunbeamPortal',
    password: 'group4',
    database: 'project',
    
});

//3. export pool
module.exports = pool;