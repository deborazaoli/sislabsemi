const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.query(
    "SELECT * FROM usuario WHERE email = ? AND senha = ?",
    [email, senha],
    (err, result) => {
      if (err) return res.status(500).json(err);
      if (result.length === 0)
        return res.status(401).json({ message: "Login inválido" });

      res.json(result[0]);
    }
  );
});

module.exports = router;