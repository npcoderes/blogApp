const { Pool, Client } = require("pg");
require('dotenv').config();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

}); 

pool.on('connect', () => {
  console.log('Connected to the database');
});

pool.on('error', (error) => {
  console.error('Database connection error:', error.message);
});

module.exports = { pool };
