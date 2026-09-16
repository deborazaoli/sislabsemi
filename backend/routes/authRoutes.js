const express = require("express");
const router = express.Router();
const db = require("../db");

// ==========================================
// GERAR ID AUTOMÁTICO DO USUÁRIO
// ==========================================

function gerarIdUsuario(callback) {

  db.query(
    `
    SELECT idUsuario
    FROM usuario
    ORDER BY idUsuario DESC
    LIMIT 1
    `,
    (err, result) => {

      if (err) {
        return callback(err);
      }

      if (result.length === 0) {
        return callback(null, "U001");
      }

      const ultimoId = result[0].idUsuario;

      const numero = parseInt(
        ultimoId.replace("U", ""),
        10
      );

      const novoNumero = numero + 1;

      const novoId =
        "U" + String(novoNumero).padStart(3, "0");

      callback(null, novoId);
    }
  );
}

// ==========================================
// CADASTRO DE USUÁRIO
// ==========================================

router.post("/cadastro", (req, res) => {

  const {
    nome,
    matricula,
    email,
    senha
  } = req.body;


  if (!nome || !matricula || !email || !senha) {

    return res.status(400).json({
      message: "Preencha todos os campos."
    });

  }


  // Verifica se o email já existe

  db.query(
    "SELECT idUsuario FROM usuario WHERE email = ?",
    [email],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          message: "Erro ao verificar email."
        });

      }


      if (result.length > 0) {

        return res.status(409).json({
          message: "Este email já está cadastrado."
        });

      }


      // Gera o ID

      gerarIdUsuario((err, idUsuario) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            message: "Erro ao gerar ID do usuário."
          });

        }


        /*
          IMPORTANTE:

          O usuário comum SEMPRE será cadastrado
          como "usuario".

          O frontend não pode escolher
          "administrador".
        */

        const tipoUsuario = "usuario";


        db.query(
          `
          INSERT INTO usuario
          (
            idUsuario,
            nome,
            matricula,
            email,
            senha,
            tipoUsuario
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            idUsuario,
            nome,
            matricula,
            email,
            senha,
            tipoUsuario
          ],
          (err, result) => {

            if (err) {

              console.log(err);

              return res.status(500).json({
                message: "Erro ao cadastrar usuário."
              });

            }


            res.status(201).json({

              message: "Usuário cadastrado com sucesso!",

              idUsuario: idUsuario

            });

          }
        );

      });

    }
  );

});


// ==========================================
// LOGIN DO USUÁRIO
// ==========================================

router.post("/login", (req, res) => {

  const {
    email,
    senha
  } = req.body;


  if (!email || !senha) {

    return res.status(400).json({
      message: "Informe email e senha."
    });

  }


  db.query(
    `
    SELECT
      idUsuario,
      nome,
      matricula,
      email,
      tipoUsuario
    FROM usuario
    WHERE email = ?
    AND senha = ?
    `,
    [
      email,
      senha
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          message: "Erro ao realizar login."
        });

      }


      if (result.length === 0) {

        return res.status(401).json({
          message: "Email ou senha inválidos."
        });

      }


      const usuario = result[0];


      // Administrador não entra pelo login comum

      if (usuario.tipoUsuario === "administrador") {

        return res.status(403).json({
          message:
            "Administradores devem utilizar o login administrativo."
        });

      }


      res.json(usuario);

    }
  );

});


module.exports = router;