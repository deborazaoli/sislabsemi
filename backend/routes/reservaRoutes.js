const express = require("express");
const router = express.Router();
const db = require("../db");

function gerarCodigoReserva() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";

  let codigo = "";

  for (let i = 0; i < 3; i++) {
    codigo += letras[
      Math.floor(Math.random() * letras.length)
    ];
  }

  for (let i = 0; i < 3; i++) {
    codigo += numeros[
      Math.floor(Math.random() * numeros.length)
    ];
  }

  return codigo;
}

function converterHoraParaMinutos(hora) {
  if (!hora) return null;

  const partes = String(hora).split(":");

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (
    Number.isNaN(horas) ||
    Number.isNaN(minutos)
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
  if (!reservaData || !horaRetirada || !horaDevolucao) {
    return {
      valido: false,
      message: "Informe a data e os horários da reserva."
    };
  }

  const agoraBrasil = obterAgoraBrasil();

  const inicio = converterHoraParaMinutos(
    horaRetirada
  );

  const fim = converterHoraParaMinutos(
    horaDevolucao
  );

  const agora = converterHoraParaMinutos(
    agoraBrasil.hora
  );

  if (inicio === null || fim === null) {
    return {
      valido: false,
      message: "Informe horários válidos."
    };
  }

  if (fim <= inicio) {
    return {
      valido: false,
      message:
        "O horário de devolução deve ser maior que o horário de retirada."
    };
  }

  const duracao = fim - inicio;

  if (duracao < 30) {
    return {
      valido: false,
      message:
        "A reserva deve ter duração mínima de 30 minutos."
    };
  }

  if (reservaData < agoraBrasil.data) {
    return {
      valido: false,
      message:
        "Não é possível fazer uma reserva para uma data passada."
    };
  }

  if (
    reservaData === agoraBrasil.data &&
    inicio <= agora
  ) {
    return {
      valido: false,
      message:
        "A hora de retirada já passou. Escolha um horário futuro."
    };
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
      console.log("Erro ao buscar reservas:", err);

      return res.status(500).json({
        message: "Erro ao buscar reservas."
      });
    }

    res.json(result);
  });
});

router.get("/usuario/:id", (req, res) => {
  const sql = `
    SELECT
      reserva.*,
      recurso.nome AS nomeRecurso,
      recurso.tipoRecurso
    FROM reserva
    INNER JOIN recurso
      ON reserva.idRecurso = recurso.idRecurso
    WHERE reserva.idUsuario = ?
    ORDER BY
      reserva.reservaData DESC,
      reserva.horaRetirada DESC
  `;

  db.query(
    sql,
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(
          "Erro ao buscar reservas do usuário:",
          err
        );

        return res.status(500).json({
          message:
            "Erro ao buscar reservas do usuário."
        });
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

  const sqlRecurso = `
    SELECT
      idRecurso,
      nome,
      tipoRecurso,
      statusRecurso
    FROM recurso
    WHERE idRecurso = ?
  `;

  db.query(
    sqlRecurso,
    [idRecurso],
    (err, recursos) => {
      if (err) {
        console.log(
          "Erro ao verificar recurso:",
          err
        );

        return res.status(500).json({
          message: "Erro ao verificar o recurso."
        });
      }

      if (recursos.length === 0) {
        return res.status(404).json({
          message: "Recurso não encontrado."
        });
      }

      const recurso = recursos[0];

      if (recurso.statusRecurso !== "disponivel") {
        return res.status(400).json({
          message:
            "Este recurso não está disponível para reserva."
        });
      }

      const sqlUsuario = `
        SELECT
          idUsuario,
          nome,
          matricula,
          email,
          tipoUsuario
        FROM usuario
        WHERE idUsuario = ?
      `;

      db.query(
        sqlUsuario,
        [idUsuario],
        (err, usuarios) => {
          if (err) {
            console.log(
              "Erro ao verificar usuário:",
              err
            );

            return res.status(500).json({
              message: "Erro ao verificar o usuário."
            });
          }

          if (usuarios.length === 0) {
            return res.status(404).json({
              message: "Usuário não encontrado."
            });
          }

          const usuario = usuarios[0];

          if (
            String(usuario.nome).trim() !==
              String(responsavelNome).trim() ||
            String(usuario.matricula || "")
              .trim()
              .toUpperCase() !==
              String(responsavelMatricula)
                .trim()
                .toUpperCase()
          ) {
            return res.status(400).json({
              message:
                "Os dados do responsável não correspondem ao usuário logado."
            });
          }

          const sqlConflito = `
            SELECT
              idReserva,
              codigoReserva,
              responsavelNome,
              reservaData,
              horaRetirada,
              horaDevolucao
            FROM reserva
            WHERE
              idRecurso = ?
              AND reservaData = ?
              AND statusReserva = 'ativa'
              AND (
                ? < horaDevolucao
                AND ? > horaRetirada
              )
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
                console.log(
                  "Erro ao verificar conflito:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Erro ao verificar disponibilidade do recurso."
                });
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
                VALUES (
                  ?, ?, ?, ?, ?, ?, 'ativa', ?, ?
                )
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
                    console.log(
                      "Erro ao criar reserva:",
                      err
                    );

                    return res.status(500).json({
                      message:
                        "Erro ao criar a reserva."
                    });
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
    (err, result) => {
      if (err) {
        console.log(
          "Erro ao cancelar reserva:",
          err
        );

        return res.status(500).json({
          message: "Erro ao cancelar a reserva."
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Reserva não encontrada."
        });
      }

      res.json({
        message: "Reserva cancelada."
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

  const idReserva = req.params.id;

  const sqlReserva = `
    SELECT
      idReserva,
      idRecurso,
      statusReserva
    FROM reserva
    WHERE idReserva = ?
  `;

  db.query(
    sqlReserva,
    [idReserva],
    (err, reservas) => {
      if (err) {
        console.log(
          "Erro ao buscar reserva:",
          err
        );

        return res.status(500).json({
          message: "Erro ao buscar a reserva."
        });
      }

      if (reservas.length === 0) {
        return res.status(404).json({
          message: "Reserva não encontrada."
        });
      }

      const reserva = reservas[0];

      if (reserva.statusReserva !== "ativa") {
        return res.status(400).json({
          message:
            "Somente reservas ativas podem ser editadas."
        });
      }

      const sqlConflito = `
        SELECT idReserva
        FROM reserva
        WHERE
          idRecurso = ?
          AND reservaData = ?
          AND statusReserva = 'ativa'
          AND idReserva <> ?
          AND (
            ? < horaDevolucao
            AND ? > horaRetirada
          )
      `;

      db.query(
        sqlConflito,
        [
          reserva.idRecurso,
          reservaData,
          idReserva,
          horaRetirada,
          horaDevolucao
        ],
        (err, conflito) => {
          if (err) {
            console.log(
              "Erro ao verificar conflito na edição:",
              err
            );

            return res.status(500).json({
              message:
                "Erro ao verificar disponibilidade do recurso."
            });
          }

          if (conflito.length > 0) {
            return res.status(409).json({
              message:
                "Já existe uma reserva para este recurso nesse horário."
            });
          }

          const sql = `
            UPDATE reserva
            SET
              reservaData = ?,
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
              idReserva
            ],
            (err, result) => {
              if (err) {
                console.log(
                  "Erro ao atualizar reserva:",
                  err
                );

                return res.status(500).json({
                  message:
                    "Erro ao atualizar a reserva."
                });
              }

              if (result.affectedRows === 0) {
                return res.status(404).json({
                  message:
                    "Reserva não encontrada."
                });
              }

              res.json({
                message:
                  "Reserva atualizada com sucesso."
              });
            }
          );
        }
      );
    }
  );
});

module.exports = router;