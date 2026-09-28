const express = require("express");
const router = express.Router();
const db = require("../db");


// ======================================================
// GERAR ID DO USUÁRIO
// ======================================================

const gerarIdUsuario = () => {

  return new Promise((resolve, reject) => {

    const sql = `
      SELECT idUsuario
      FROM usuario
      WHERE idUsuario LIKE 'U%'
      ORDER BY CAST(SUBSTRING(idUsuario, 2) AS UNSIGNED) DESC
      LIMIT 1
    `;

    db.query(sql, (err, results) => {

      if (err) {
        reject(err);
        return;
      }


      if (results.length === 0) {
        resolve("U001");
        return;
      }


      const ultimoId = results[0].idUsuario;

      const numero = parseInt(
        ultimoId.substring(1),
        10
      );


      const novoNumero = numero + 1;


      const novoId =
        "U" +
        String(novoNumero).padStart(3, "0");


      resolve(novoId);

    });

  });

};


// ======================================================
// CADASTRO DE USUÁRIO
// ======================================================

router.post("/cadastro", async (req, res) => {

  try {

    let {
      nome,
      matricula,
      email,
      senha
    } = req.body;


    // ----------------------------------------------
    // VERIFICAR CAMPOS OBRIGATÓRIOS
    // ----------------------------------------------

    if (
      !nome ||
      !matricula ||
      !email ||
      !senha
    ) {

      return res.status(400).json({
        message: "Preencha todos os campos."
      });

    }


    // ----------------------------------------------
    // PADRONIZAR DADOS
    // ----------------------------------------------

    nome = nome.trim();

    matricula = matricula
      .trim()
      .toUpperCase();

    email = email
      .trim()
      .toLowerCase();


    // ----------------------------------------------
    // VALIDAR MATRÍCULA
    // ----------------------------------------------

    /*
      Formato da matrícula do campus:

      AAAA + SEMESTRE + CURSO + CAMPUS + NÚMEROS

      Exemplo:

      20241TDS-JG0165

      2024 = ano de entrada
      1    = semestre
      TDS  = curso
      JG   = campus
      0165 = número do aluno
    */

    const formatoMatricula =
      /^\d{5}[A-Z]{3}-[A-Z]{2}\d{4}$/;


    if (!formatoMatricula.test(matricula)) {

      return res.status(400).json({
        message:
          "Matrícula inválida. Use o formato 20241TDS-JG0165."
      });

    }


    // ----------------------------------------------
    // VALIDAR EMAIL
    // ----------------------------------------------

    if (!email.includes("@")) {

      return res.status(400).json({
        message:
          "Informe um email válido contendo '@'."
      });

    }


    // ----------------------------------------------
    // VALIDAR SENHA
    // ----------------------------------------------

    if (senha.length < 6) {

      return res.status(400).json({
        message:
          "A senha deve ter no mínimo 6 caracteres."
      });

    }


    // ----------------------------------------------
    // VERIFICAR SE O EMAIL JÁ EXISTE
    // ----------------------------------------------

    const verificarEmail = `
      SELECT idUsuario
      FROM usuario
      WHERE email = ?
      LIMIT 1
    `;


    const emailExistente =
      await new Promise((resolve, reject) => {

        db.query(
          verificarEmail,
          [email],
          (err, results) => {

            if (err) {
              reject(err);
              return;
            }

            resolve(results);

          }
        );

      });


    if (emailExistente.length > 0) {

      return res.status(400).json({
        message:
          "Este email já está cadastrado."
      });

    }


    // ----------------------------------------------
    // VERIFICAR SE A MATRÍCULA JÁ EXISTE
    // ----------------------------------------------

    const verificarMatricula = `
      SELECT idUsuario
      FROM usuario
      WHERE matricula = ?
      LIMIT 1
    `;


    const matriculaExistente =
      await new Promise((resolve, reject) => {

        db.query(
          verificarMatricula,
          [matricula],
          (err, results) => {

            if (err) {
              reject(err);
              return;
            }

            resolve(results);

          }
        );

      });


    if (matriculaExistente.length > 0) {

      return res.status(400).json({
        message:
          "Esta matrícula já está cadastrada."
      });

    }


    // ----------------------------------------------
    // GERAR ID DO USUÁRIO
    // ----------------------------------------------

    const idUsuario =
      await gerarIdUsuario();


    // ----------------------------------------------
    // CADASTRAR USUÁRIO
    // ----------------------------------------------

    const sql = `
      INSERT INTO usuario
      (
        idUsuario,
        nome,
        matricula,
        email,
        senha,
        tipoUsuario
      )
      VALUES (?, ?, ?, ?, ?, 'usuario')
    `;


    db.query(
      sql,
      [
        idUsuario,
        nome,
        matricula,
        email,
        senha
      ],
      (err) => {

        if (err) {

          console.log(
            "Erro ao cadastrar usuário:",
            err
          );


          return res.status(500).json({
            message:
              "Erro ao realizar cadastro."
          });

        }


        return res.status(201).json({

          message:
            "Cadastro realizado com sucesso.",

          usuario: {
            idUsuario,
            nome,
            matricula,
            email,
            tipoUsuario: "usuario"
          }

        });

      }
    );


  } catch (error) {

    console.log(
      "Erro na rota de cadastro:",
      error
    );


    return res.status(500).json({
      message:
        "Erro interno do servidor."
    });

  }

});


// ======================================================
// LOGIN DE USUÁRIO
// ======================================================

router.post("/login", (req, res) => {

  const {
    email,
    senha
  } = req.body;


  if (!email || !senha) {

    return res.status(400).json({
      message:
        "Informe email e senha."
    });

  }


  const sql = `
    SELECT
      idUsuario,
      nome,
      matricula,
      email,
      senha,
      tipoUsuario
    FROM usuario
    WHERE email = ?
    LIMIT 1
  `;


  db.query(
    sql,
    [email.trim().toLowerCase()],
    (err, results) => {

      if (err) {

        console.log(
          "Erro no login:",
          err
        );


        return res.status(500).json({
          message:
            "Erro ao realizar login."
        });

      }


      if (results.length === 0) {

        return res.status(401).json({
          message:
            "Email ou senha incorretos."
        });

      }


      const usuario = results[0];


      if (usuario.senha !== senha) {

        return res.status(401).json({
          message:
            "Email ou senha incorretos."
        });

      }


      // ----------------------------------------------
      // IMPEDIR ADMINISTRADOR NO LOGIN COMUM
      // ----------------------------------------------

      if (
        usuario.tipoUsuario ===
        "administrador"
      ) {

        return res.status(403).json({
          message:
            "Administradores devem utilizar o login administrativo."
        });

      }


      return res.status(200).json({

        message:
          "Login realizado com sucesso.",

        usuario: {
          idUsuario:
            usuario.idUsuario,

          nome:
            usuario.nome,

          matricula:
            usuario.matricula,

          email:
            usuario.email,

          tipoUsuario:
            usuario.tipoUsuario

        }

      });

    }
  );

});


module.exports = router;