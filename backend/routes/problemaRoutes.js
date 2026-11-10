const express = require("express");
const router = express.Router();
const db = require("../db");

// Função para obter data e hora atual do Brasil (Recife)
function obterAgoraBrasil() {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Recife",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const valores = {};
  partes.forEach((parte) => {
    valores[parte.type] = parte.value;
  });

  return `${valores.year}-${valores.month}-${valores.day} ${valores.hour}:${valores.minute}:${valores.second}`;
}

// ======================================================
// CADASTRAR UM NOVO PROBLEMA / RELATO
// ======================================================
router.post("/", (req, res) => {
  const {
    idUsuario,
    responsavelNome,
    tipoRecurso,
    nomeRecurso,
    idRecurso,
    descricao
  } = req.body;

  // ----------------------------------------------
  // VERIFICAR CAMPOS OBRIGATÓRIOS
  // ----------------------------------------------
  if (!tipoRecurso || !nomeRecurso || !descricao) {
    return res.status(400).json({
      message: "Preencha o tipo, o local do recurso e a descrição do problema."
    });
  }

  const dataRelato = obterAgoraBrasil();
  const statusProblema = "pendente"; // status inicial para a direção gerenciar

  const sql = `
    INSERT INTO problema (
      idUsuario,
      responsavelNome,
      tipoRecurso,
      nomeRecurso,
      idRecurso,
      descricao,
      statusProblema,
      dataRelato
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      idUsuario || null,
      responsavelNome || "Anônimo",
      tipoRecurso,
      nomeRecurso,
      idRecurso || null,
      descricao,
      statusProblema,
      dataRelato
    ],
    (err, result) => {
      if (err) {
        console.log("Erro ao registrar problema:", err);
        return res.status(500).json({
          message: "Erro ao registrar o problema no servidor."
        });
      }

      return res.status(201).json({
        ok: true,
        message: "Problema relatado com sucesso!",
        idProblema: result.insertId
      });
    }
  );
});

// ======================================================
// LISTAR TODOS OS PROBLEMAS (Para a Área Administrativa)
// ======================================================
router.get("/", (req, res) => {
  const sql = `
    SELECT * 
    FROM problema 
    ORDER BY dataRelato DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Erro ao buscar problemas:", err);
      return res.status(500).json({
        message: "Erro ao buscar os problemas relatados."
      });
    }

    res.json(results);
  });
});

// ======================================================
// ATUALIZAR STATUS DO PROBLEMA (Ex: de 'pendente' para 'resolvido')
// ======================================================
router.put("/:id/status", (req, res) => {
  const { statusProblema } = req.body;
  const idProblema = req.params.id;

  if (!statusProblema) {
    return res.status(400).json({
      message: "Informe o novo status do problema."
    });
  }

  const sql = `
    UPDATE problema 
    SET statusProblema = ? 
    WHERE idProblema = ?
  `;

  db.query(sql, [statusProblema, idProblema], (err, result) => {
    if (err) {
      console.log("Erro ao atualizar status do problema:", err);
      return res.status(500).json({
        message: "Erro ao atualizar status."
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Problema não encontrado."
      });
    }

    res.json({
      ok: true,
      message: "Status do problema atualizado com sucesso!"
    });
  });
});

module.exports = router;