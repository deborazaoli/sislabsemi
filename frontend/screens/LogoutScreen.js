import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet
} from "react-native";

import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function LogoutScreen({
  navigation
}) {

  const sair = async () => {
    await signOut(auth);

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "Home"
        }
      ]
    });
  };

  return (
    <View style={styles.container}>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#CCFCE4",
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