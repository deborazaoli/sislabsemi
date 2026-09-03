const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/tipos", (req, res) => {
  db.query("SELECT DISTINCT tipoRecurso FROM recurso", (err, r) => {
    if (err) return res.status(500).json(err);
    res.json(r);
  });
});

router.get("/", (req, res) => {
  const { tipo } = req.query;

  let sql = "SELECT * FROM recurso";
  const params = [];

  if (tipo) {
    sql += " WHERE tipoRecurso = ?";
    params.push(tipo);
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

router.post("/", (req, res) => {
  const {
    nome,
    tipoRecurso,
    capacidadePessoas,
    localizacao,
    observacao,
    codigoSeguranca,
    codigoValidade
  } = req.body;

  const idRecurso = "R" + Date.now().toString().slice(-6);

  const sql = `
    INSERT INTO recurso
    (idRecurso, nome, tipoRecurso, capacidadePessoas, localizacao, observacao, codigoSeguranca, codigoValidade, statusRecurso)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponivel')
  `;

  db.query(
    sql,
    [
      idRecurso,
      nome,
      tipoRecurso,
      capacidadePessoas || null,
      localizacao,
      observacao,
      codigoSeguranca || null,
      codigoValidade || null
    ],
    (err) => {
      if (err) {
        console.log("ERRO SQL COMPLETO:", err);
        return res.status(500).json(err);
      }

      res.json({ ok: true });
    }
  );
});

router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM recurso WHERE idRecurso = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ ok: true });
    }
  );
});

router.put("/:id", (req, res) => {
  const {
    nome,
    capacidadePessoas,
    localizacao,
    observacao,
    codigoSeguranca,
    codigoValidade
  } = req.body;

  const sql = `
    UPDATE recurso
    SET
      nome = ?,
      capacidadePessoas = ?,
      localizacao = ?,
      observacao = ?,
      codigoSeguranca = ?,
      codigoValidade = ?
    WHERE idRecurso = ?
  `;

  db.query(
    sql,
    [
      nome,
      capacidadePessoas,
      localizacao,
      observacao,
      codigoSeguranca,
      codigoValidade,
      req.params.id
    ],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Recurso atualizado" });
    }
  );
});

module.exports = router;