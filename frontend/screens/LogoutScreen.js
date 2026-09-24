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
          name: "LoginUsuario"
        }
      ]
    });
  };

  return (

    

    
    <View style={styles.container}>
<View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.voltar}
        >

        

        </Pressable>



        <View style={styles.espaco} />

      </View>
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

  header: {
    height: 75,
    backgroundColor: "#FFF",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 20,
  },


  voltar: {
    width: 40,
    height: 40,

    justifyContent: "center",

    alignItems: "center",
  },


  icon: {
    width: 28,
    height: 28,

    resizeMode: "contain",
  },


  tituloHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007A33",
  },


  espaco: {
    width: 40,
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
