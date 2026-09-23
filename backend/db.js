require("dotenv").config();

const mysql = require("mysql2");

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_SSL:", process.env.DB_SSL);

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "aluno",
  password: process.env.DB_PASSWORD || "ifpecjbg",
  database: process.env.DB_NAME || "sislab",

  ssl: process.env.DB_SSL === "true"
    ? {
        rejectUnauthorized: false
      }
    : undefined
});

db.connect(err => {
  if (err) {
    console.log("Erro ao conectar ao banco:");
    console.log(err);
  } else {
    console.log("DB conectado");
  }
});

module.exports = db;
