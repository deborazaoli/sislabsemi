import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";

import API_URL from "../services/api";


export default function CadastroUsuarioScreen({ navigation }) {

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [carregando, setCarregando] = useState(false);


  const cadastrar = async () => {

    if (
      !nome ||
      !matricula ||
      !email ||
      !senha ||
      !confirmarSenha
    ) {
      Alert.alert(
        "Atenção",
        "Preencha todos os campos."
      );

      return;
    }


    if (!email.includes("@")) {

      Alert.alert(
        "Email inválido",
        "Informe um email válido contendo '@'."
      );

      return;
    }


    if (senha.length < 6) {

      Alert.alert(
        "Senha inválida",
        "A senha deve ter no mínimo 6 caracteres."
      );

      return;
    }


    if (senha !== confirmarSenha) {

      Alert.alert(
        "Erro",
        "As senhas não são iguais."
      );

      return;
    }


    try {

      setCarregando(true);


      const response = await fetch(
        `${API_URL}/auth/cadastro`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            nome,
            matricula,
            email,
            senha
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        Alert.alert(
          "Erro",
          data.message || "Não foi possível realizar o cadastro."
        );

        return;
      }


      Alert.alert(
        "Cadastro realizado!",
        "Sua conta foi criada com sucesso.",
        [
          {
            text: "OK",
            onPress: () =>
              navigation.replace("LoginUsuario")
          }
        ]
      );


    } catch (error) {

      console.log("Erro no cadastro:", error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    } finally {

      setCarregando(false);

    }

  };


  return (

    <View style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* HEADER */}

          <View style={styles.header}>

            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >

              <Image
                source={require("../assets/seta.png")}
                style={styles.backIcon}
              />

            </Pressable>


            <Text style={styles.logo}>
              SISLAB
            </Text>


            <View style={styles.headerSpace} />

          </View>


          {/* CONTEÚDO */}

          <View style={styles.content}>

            <Text style={styles.title}>
              Criar cadastro
            </Text>


            <Text style={styles.subtitle}>
              Preencha seus dados para criar uma conta
            </Text>


            {/* NOME */}

            <Text style={styles.label}>
              Nome completo
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite seu nome completo"
              value={nome}
              onChangeText={setNome}
            />


            {/* MATRÍCULA */}

            <Text style={styles.label}>
              Matrícula
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua matrícula"
              value={matricula}
              onChangeText={setMatricula}
              autoCapitalize="characters"
            />


            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="exemplo@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />


            {/* SENHA */}

            <Text style={styles.label}>
              Senha
            </Text>

            <Text style={styles.description}>
              A senha deve ter no mínimo 6 caracteres.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />


            {/* CONFIRMAR SENHA */}

            <Text style={styles.label}>
              Confirmar senha
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Digite a senha novamente"
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
              secureTextEntry
            />


            {/* BOTÃO */}

            <Pressable
              style={[
                styles.button,
                carregando && styles.buttonDisabled
              ]}
              onPress={cadastrar}
              disabled={carregando}
            >

              <Text style={styles.buttonText}>
                {carregando
                  ? "Cadastrando..."
                  : "Cadastrar"}
              </Text>

            </Pressable>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </View>

  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  scroll: {
    flexGrow: 1
  },


  header: {
  height: 85,
  backgroundColor: "#FFFFFF",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingTop: 10
},


  backButton: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center"
  },


  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
  },


  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    tintColor: "#007A33"
  },


  headerSpace: {
    width: 35
  },


  content: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 35
  },


  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 8
  },


  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 25
  },


  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 3
  },


  description: {
    fontSize: 13,
    color: "#666",
    marginBottom: 8
  },


  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
    fontSize: 16
  },


  button: {
    backgroundColor: "#007A33",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5
  },


  buttonDisabled: {
    opacity: 0.6
  },


  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold"
  }

});