import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutScreen({ navigation }) {

  const sair = async () => {
    await signOut(auth);

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "LoginUsuario"
        }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>

      <View style={styles.container}>

        <View style={styles.header}>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.voltar}
          >
            <Text style={styles.seta}>‹</Text>
          </Pressable>

          <Text style={styles.tituloHeader}>
            Logout
          </Text>

          <View style={styles.espaco} />

        </View>

        <View style={styles.conteudo}>

          <Text style={styles.title}>
            Deseja sair?
          </Text>

          <Pressable
            style={styles.btn}
            onPress={sair}
          >
            <Text style={styles.txt}>
              Fazer Logout
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
    backgroundColor: "#FFF"
  },

  container: {
    flex: 1,
    backgroundColor: "#CCFCE4"
  },

  header: {
    height: 75,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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

  tituloHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007A33"
  },

  espaco: {
    width: 40
  },

  conteudo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    fontSize: 24,
    marginBottom: 20
  },

  btn: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 12
  },

  txt: {
    color: "#FFF",
    fontWeight: "bold"
  }

});