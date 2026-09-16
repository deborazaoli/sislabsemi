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


    try {

      setCarregando(true);


      const response = await fetch(
        "http://localhost:3000/auth/login",
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


      // Login realizado
      // Envia os dados do usuário para a Home

      navigation.replace("Home", {
        usuario: data
      });


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

          <Text style={styles.logo}>
            SISLAB
          </Text>

        </View>


        {/* CONTEÚDO */}

        <View style={styles.content}>

          <Text style={styles.title}>
            Login
          </Text>


          <Text style={styles.subtitle}>
            Entre na sua conta
          </Text>


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


        {/* FOOTER */}

        <View style={styles.footer}>

          <Text style={styles.footerText}>
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

    justifyContent: "center",
    alignItems: "center"
  },


  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
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


  footer: {
    padding: 15,

    alignItems: "center"
  },


  footerText: {
    fontSize: 14
  }

});

