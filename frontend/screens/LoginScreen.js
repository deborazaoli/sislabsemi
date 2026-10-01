import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);

      navigation.replace("Admin");

    } catch (error) {
      console.log(error);

      Alert.alert(
        "Erro",
        "Email ou senha inválidos"
      );
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top"]}
    >

      <View style={styles.containerPrincipal}>

        {/* HEADER */}

        <View style={styles.header}>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.voltar}
          >
            <Text style={styles.seta}>‹</Text>
          </Pressable>

          <Text style={styles.logo}>
            SISLAB
          </Text>

          <View style={styles.espaco} />

        </View>

        {/* CONTEÚDO */}

        <View style={styles.conteudo}>

          <Text style={styles.subtitulo}>
            Login
          </Text>

          <TextInput
            placeholder="Email"
            placeholderTextColor="#777"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            placeholder="Senha"
            placeholderTextColor="#777"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={styles.input}
          />

          <Pressable
            style={styles.btn}
            onPress={login}
          >
            <Text style={styles.btnTexto}>
              Entrar
            </Text>
          </Pressable>

        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },

  containerPrincipal: {
    flex: 1,
    backgroundColor: "#CCFCE4"
  },

  header: {
    height: 65,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20
  },

  voltar: {
    width: 40,
    height: 40,

    justifyContent: "center",
    alignItems: "center"
  },

  seta: {
    fontSize: 42,
    color: "#007A33",
    lineHeight: 42
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
  },

  espaco: {
    width: 40
  },

  conteudo: {
    flex: 1,

    justifyContent: "center",

    paddingHorizontal: 30,

    width: "100%"
  },

  subtitulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",

    textAlign: "center",

    marginBottom: 25
  },

  input: {
    width: "100%",

    backgroundColor: "#FFFFFF",

    paddingHorizontal: 16,
    paddingVertical: 15,

    borderRadius: 12,

    marginBottom: 15,

    fontSize: 16,

    borderWidth: 1,
    borderColor: "#E0E0E0"
  },

  btn: {
    width: "100%",

    backgroundColor: "#007A33",

    paddingVertical: 15,

    borderRadius: 12,

    alignItems: "center",

    marginTop: 5
  },

  btnTexto: {
    color: "#FFFFFF",

    fontSize: 16,

    fontWeight: "bold"
  }

});
