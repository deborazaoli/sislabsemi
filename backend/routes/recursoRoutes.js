const express = require("express");
const router = express.Router();
const db = require("../db");

// Converte o tipo usado pelo aplicativo
// para o tipo usado no banco de dados
function converterTipo(tipo) {
  const tipos = {
    sala: "Sala",
    laboratorio: "Laboratório",
    equipamento: "Equipamento",

    // Também aceita os valores que já vêm do banco
    Sala: "Sala",
    Laboratório: "Laboratório",
    Equipamento: "Equipamento"
  };

  return tipos[tipo] || null;
}


// ===============================
// LISTAR TIPOS
// ===============================
router.get("/tipos", (req, res) => {
  db.query(
    "SELECT DISTINCT tipoRecurso FROM recurso",
    (err, resultado) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Erro ao buscar tipos de recursos."
        });
      }

      res.json(resultado);
    }
  );
});


// ===============================
// LISTAR RECURSOS
// ===============================
router.get("/", (req, res) => {
  const { tipo } = req.query;

  let sql = "SELECT * FROM recurso";
  const params = [];

  if (tipo) {
    const tipoBanco = converterTipo(tipo);

    if (!tipoBanco) {
      return res.status(400).json({
        message: "Tipo de recurso inválido."
      });
    }

    sql += " WHERE tipoRecurso = ?";
    params.push(tipoBanco);
  }

  db.query(sql, params, (err, resultado) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Erro ao buscar recursos."
      });
    }

    res.json(resultado);
  });
});


// ===============================
// CADASTRAR RECURSO
// ===============================
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

  if (!nome || !tipoRecurso) {
    return res.status(400).json({
      message: "Nome e tipo do recurso são obrigatórios."
    });
  }

  const tipoBanco = converterTipo(tipoRecurso);

  if (!tipoBanco) {
    return res.status(400).json({
      message: "Tipo de recurso inválido."
    });
  }

  const idRecurso = "R" + Date.now().toString().slice(-6);

  const sql = `
    INSERT INTO recurso
    (
      idRecurso,
      nome,
      tipoRecurso,
      capacidadePessoas,
      localizacao,
      observacao,
      codigoSeguranca,
      codigoValidade,
      statusRecurso
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'disponivel')
  `;

  db.query(
    sql,
    [
      idRecurso,
      nome,
      tipoBanco,
      capacidadePessoas || null,
      localizacao || null,
      observacao || null,
      codigoSeguranca || null,
      codigoValidade || null
    ],
    (err) => {
      if (err) {
        console.log("ERRO SQL COMPLETO:", err);

        return res.status(500).json({
          message: "Erro ao cadastrar recurso.",
          erro: err.message
        });
      }

      res.status(201).json({
        ok: true,
        message: "Recurso cadastrado com sucesso!",
        idRecurso
      });
    }
  );
});


// ===============================
// EXCLUIR RECURSO
// ===============================
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM recurso WHERE idRecurso = ?",
    [req.params.id],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Erro ao excluir recurso."
        });
      }

      res.json({
        ok: true,
        message: "Recurso excluído com sucesso!"
      });
    }
  );
});


// ===============================
// EDITAR RECURSO
// ===============================
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
      capacidadePessoas || null,
      localizacao || null,
      observacao || null,
      codigoSeguranca || null,
      codigoValidade || null,
      req.params.id
    ],
    (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: "Erro ao atualizar recurso."
        });
      }

      res.json({
        ok: true,
        message: "Recurso atualizado com sucesso!"
      });
    }
  );
});


module.exports = router;