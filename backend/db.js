const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "ifpecjbg",
  database: "sislab"
});

db.connect(err => {
  if (err) console.log(err);
  else console.log("DB conectado");
});

module.exports = db;