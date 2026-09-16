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
        "http://localhost:3000/auth/cadastro",
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

      console.log(error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    } finally {

      setCarregando(false);

    }

  };


  return (

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
      >

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            onPress={() => navigation.goBack()}
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


          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />


          <TextInput
            style={styles.input}
            placeholder="Matrícula"
            value={matricula}
            onChangeText={setMatricula}
          />


          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />


          <TextInput
            style={styles.input}
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />


          <TextInput
            style={styles.input}
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />


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


        {/* FOOTER */}

        <View style={styles.footer}>

          <Text>
            IFPE Campus Jaboatão
          </Text>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  scroll: {
    flexGrow: 1
  },


  header: {
    height: 75,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
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
    width: 28
  },


  content: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingVertical: 40
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


  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
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
  },


  footer: {
    padding: 15,
    alignItems: "center"
  }

});