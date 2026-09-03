const express = require("express");
const router = express.Router();
const db = require("../db");

function gerarCodigoReserva() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";

  let codigo = "";

  for (let i = 0; i < 3; i++) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }

  for (let i = 0; i < 3; i++) {
    codigo += numeros[Math.floor(Math.random() * numeros.length)];
  }

  return codigo;
}

router.get("/all", (req, res) => {
  const sql = `
    SELECT
      reserva.*,
      recurso.nome AS nomeRecurso
    FROM reserva
    INNER JOIN recurso
      ON reserva.idRecurso = recurso.idRecurso
    WHERE
      reserva.statusReserva = 'ativa'
      AND reserva.reservaData >= CURDATE()
    ORDER BY
      reserva.reservaData,
      reserva.horaRetirada
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.get("/usuario/:id", (req, res) => {
  const sql = `
    SELECT * FROM reserva
    WHERE idUsuario = ?
    ORDER BY reservaData DESC
  `;

  db.query(sql, [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

router.post("/", (req, res) => {
  const {
    responsavelNome,
    responsavelMatricula,
    reservaData,
    horaRetirada,
    horaDevolucao,
    idUsuario,
    idRecurso
  } = req.body;

  if (
    !responsavelNome ||
    !responsavelMatricula ||
    !reservaData ||
    !horaRetirada ||
    !horaDevolucao ||
    !idUsuario ||
    !idRecurso
  ) {
    return res.status(400).json({
      message: "Preencha todos os campos."
    });
  }

const hoje = new Date().toISOString().split("T")[0];

  if (reservaData < hoje) {
    return res.status(400).json({
      message: "A reserva deve ser ser feita apenas para datas futuras."
    });
  }

  if (horaDevolucao <= horaRetirada) {
    return res.status(400).json({
      message:
        "O horário de devolução deve ser maior que o horário de retirada."
    });
  }

  const sqlConflito = `
    SELECT *
    FROM reserva
    WHERE idRecurso = ?
      AND reservaData = ?
      AND statusReserva <> 'cancelada'
      AND (? < horaDevolucao AND ? > horaRetirada)
  `;

  db.query(
    sqlConflito,
    [
      idRecurso,
      reservaData,
      horaRetirada,
      horaDevolucao
    ],
    (err, conflito) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (conflito.length > 0) {
        return res.status(409).json({
          message:
            "Já existe uma reserva para este recurso nesse horário."
        });
      }

      const codigoReserva = gerarCodigoReserva();

      const sql = `
        INSERT INTO reserva (
          codigoReserva,
          responsavelNome,
          responsavelMatricula,
          reservaData,
          horaRetirada,
          horaDevolucao,
          statusReserva,
          idUsuario,
          idRecurso
        )
        VALUES (?, ?, ?, ?, ?, ?, 'ativa', ?, ?)
      `;

      db.query(
        sql,
        [
          codigoReserva,
          responsavelNome,
          responsavelMatricula,
          reservaData,
          horaRetirada,
          horaDevolucao,
          idUsuario,
          idRecurso
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json(err);
          }

          res.status(201).json({
            message: "Reserva criada com sucesso.",
            idReserva: result.insertId,
            codigoReserva
          });
        }
      );
    }
  );
});

router.put("/cancelar/:id", (req, res) => {
  const sql = `
    UPDATE reserva
    SET statusReserva = 'cancelada'
    WHERE idReserva = ?
  `;

  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json(err);

    res.json({ message: "Reserva cancelada" });
  });
});

router.put("/:id", (req, res) => {
  const {
    reservaData,
    horaRetirada,
    horaDevolucao
  } = req.body;

  const sql = `
    UPDATE reserva
    SET reservaData = ?,
        horaRetirada = ?,
        horaDevolucao = ?
    WHERE idReserva = ?
  `;

  db.query(
    sql,
    [reservaData, horaRetirada, horaDevolucao, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "Reserva atualizada" });
    }
  );
});

module.exports = router;
