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

function converterHoraParaMinutos(hora) {
  if (!hora) return null;

  const partes = String(hora).split(":");

  if (partes.length < 2) return null;

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (
    !Number.isInteger(horas) ||
    !Number.isInteger(minutos) ||
    horas < 0 ||
    horas > 23 ||
    minutos < 0 ||
    minutos > 59
  ) {
    return null;
  }

  return horas * 60 + minutos;
}

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

  return {
    data: `${valores.year}-${valores.month}-${valores.day}`,
    hora: `${valores.hour}:${valores.minute}:${valores.second}`
  };
}

function validarDataEHorario(
  reservaData,
  horaRetirada,
  horaDevolucao
) {
  const agora = obterAgoraBrasil();

  if (reservaData < agora.data) {
    return {
      valido: false,
      message:
        "Não é possível fazer uma reserva para uma data passada."
    };
  }

  const retirada = converterHoraParaMinutos(
    horaRetirada
  );

  const devolucao = converterHoraParaMinutos(
    horaDevolucao
  );

  if (
    retirada === null ||
    devolucao === null
  ) {
    return {
      valido: false,
      message: "Informe horários válidos."
    };
  }

  if (devolucao <= retirada) {
    return {
      valido: false,
      message:
        "O horário de devolução deve ser maior que o horário de retirada."
    };
  }

  const duracao = devolucao - retirada;

  if (duracao < 30) {
    return {
      valido: false,
      message:
        "A reserva deve ter duração mínima de 30 minutos."
    };
  }

  if (reservaData === agora.data) {
    const horaAtual = converterHoraParaMinutos(
      agora.hora
    );

    if (retirada <= horaAtual) {
      return {
        valido: false,
        message:
          "A hora de retirada já passou. Escolha um horário futuro."
      };
    }
  }

  return {
    valido: true
  };
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
    if (err) {
      return res.status(500).json(err);
    }

    res.json(result);
  });
});

router.get("/usuario/:id", (req, res) => {
  const sql = `
    SELECT * FROM reserva
    WHERE idUsuario = ?
    ORDER BY reservaData DESC
  `;

  db.query(
    sql,
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);
    }
  );
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

  const validacao = validarDataEHorario(
    reservaData,
    horaRetirada,
    horaDevolucao
  );

  if (!validacao.valido) {
    return res.status(400).json({
      message: validacao.message
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

      const codigoReserva =
        gerarCodigoReserva();

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
            message:
              "Reserva criada com sucesso.",
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

  db.query(
    sql,
    [req.params.id],
    (err) => {
      if (err) {
        return res.status(500).json(err);
      }

      res.json({
        message: "Reserva cancelada"
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const {
    reservaData,
    horaRetirada,
    horaDevolucao
  } = req.body;

  if (
    !reservaData ||
    !horaRetirada ||
    !horaDevolucao
  ) {
    return res.status(400).json({
      message:
        "Informe a data e os horários da reserva."
    });
  }

  const validacao = validarDataEHorario(
    reservaData,
    horaRetirada,
    horaDevolucao
  );

  if (!validacao.valido) {
    return res.status(400).json({
      message: validacao.message
    });
  }

  const sqlBusca = `
    SELECT idRecurso
    FROM reserva
    WHERE idReserva = ?
  `;

  db.query(
    sqlBusca,
    [req.params.id],
    (err, resultado) => {
      if (err) {
        return res.status(500).json(err);
      }

      if (resultado.length === 0) {
        return res.status(404).json({
          message:
            "Reserva não encontrada."
        });
      }

      const idRecurso =
        resultado[0].idRecurso;

      const sqlConflito = `
        SELECT *
        FROM reserva
        WHERE idRecurso = ?
          AND reservaData = ?
          AND idReserva <> ?
          AND statusReserva <> 'cancelada'
          AND (? < horaDevolucao AND ? > horaRetirada)
      `;

      db.query(
        sqlConflito,
        [
          idRecurso,
          reservaData,
          req.params.id,
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

          const sql = `
            UPDATE reserva
            SET reservaData = ?,
                horaRetirada = ?,
                horaDevolucao = ?
            WHERE idReserva = ?
          `;

          db.query(
            sql,
            [
              reservaData,
              horaRetirada,
              horaDevolucao,
              req.params.id
            ],
            (err) => {
              if (err) {
                return res.status(500).json(err);
              }

              res.json({
                message:
                  "Reserva atualizada"
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;
