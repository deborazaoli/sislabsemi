import React, { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image
} from "react-native";

import API_URL from "../services/api";


export default function LoginUsuarioScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);


  const login = async () => {

    if (!email || !senha) {

      Alert.alert(
        "Atenção",
        "Preencha o email e a senha."
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


    try {

      setCarregando(true);


      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            senha
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        Alert.alert(
          "Erro",
          data.message || "Email ou senha inválidos."
        );

        return;
      }


      navigation.replace("Home", {
        usuario: data
      });


    } catch (error) {

      console.log("Erro no login:", error);

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    } finally {

      setCarregando(false);

    }

  };


  return (

    <SafeAreaView style={styles.safeArea}>

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


          {/* CONTEÚDO */}

          <View style={styles.content}>

            {/* LOGO */}

            <Image
              source={require("../assets/logo.png")}
              style={styles.logoImage}
            />


            <Text style={styles.title}>
              Login
            </Text>


            <Text style={styles.subtitle}>
              Entre na sua conta
            </Text>


            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>


            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
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


            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />


            {/* ENTRAR */}

            <Pressable
              style={[
                styles.button,
                carregando && styles.buttonDisabled
              ]}
              onPress={login}
              disabled={carregando}
            >

              <Text style={styles.buttonText}>
                {carregando
                  ? "Entrando..."
                  : "Entrar"}
              </Text>

            </Pressable>


            {/* CADASTRO */}

            <Text style={styles.registerText}>
              Ainda não possui uma conta?
            </Text>


            <Pressable
              onPress={() =>
                navigation.navigate("CadastroUsuario")
              }
            >

              <Text style={styles.registerButton}>
                Criar cadastro
              </Text>

            </Pressable>


            {/* ADMINISTRADOR */}

            <View style={styles.separator}>

              <View style={styles.line} />

              <Text style={styles.orText}>
                ou
              </Text>

              <View style={styles.line} />

            </View>


            <Pressable
              style={styles.adminButton}
              onPress={() =>
                navigation.navigate("Login")
              }
            >

              <Text style={styles.adminButtonText}>
                Entrar como administrador
              </Text>

            </Pressable>

          </View>



        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

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


  /* HEADER */

  header: {
    height: 65,
    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center"
  },


  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
  },


  /* CONTEÚDO */

  content: {
    flex: 1,

    width: "100%",
    maxWidth: 500,

    alignSelf: "center",

    paddingHorizontal: 30,
    paddingVertical: 35
  },


  logoImage: {
    width: 1000,
    height: 150,

    resizeMode: "contain",

    alignSelf: "center",

    marginBottom: 12
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


  /* CAMPOS */

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


  /* BOTÃO */

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


  /* CADASTRO */

  registerText: {
    textAlign: "center",

    marginTop: 25,

    color: "#555"
  },


  registerButton: {
    textAlign: "center",

    color: "#007A33",

    fontSize: 16,

    fontWeight: "bold",

    marginTop: 8
  },


  /* SEPARADOR */

  separator: {
    flexDirection: "row",

    alignItems: "center",

    marginVertical: 25
  },


  line: {
    flex: 1,

    height: 1,

    backgroundColor: "#AAAAAA"
  },


  orText: {
    marginHorizontal: 12,

    color: "#666"
  },


  /* ADMIN */

  adminButton: {
    borderWidth: 2,

    borderColor: "#007A33",

    borderRadius: 12,

    paddingVertical: 13,

    alignItems: "center"
  },


  adminButtonText: {
    color: "#007A33",

    fontSize: 16,

    fontWeight: "bold"
  },


  /* FOOTER */

  footer: {
    padding: 15,

    alignItems: "center"
  },


  footerText: {
    fontSize: 14
  }

});