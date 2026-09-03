import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Pressable,
  Image
} from "react-native";

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

      Alert.alert("Erro", "Email ou senha inválidos");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ccfce4" }}>

      <View style={styles.header}>

        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.logo}>SISLAB</Text>

        <View style={{ width: 30 }} />

      </View>

      <View style={styles.container}>


        <Text style={styles.subtitulo}>Login</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />

        <Button title="Entrar" onPress={login} />

      </View>

    </View>
  );
}

const styles = {
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

  container: {
    flex: 1,
    justifyContent: "center",
    padding: 30
  },

  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15
  },

  subtitulo: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20
  }
};