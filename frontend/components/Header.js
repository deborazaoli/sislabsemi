import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

export default function Header({
  titulo,
  navigation,
  usuario
}) {
  return (
    <View style={styles.header}>
      {/* BOTÃO DE VOLTAR */}
      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.voltarButton}
      >
        <Image
          source={require("../assets/seta.png")}
          style={styles.backIcon}
        />
      </Pressable>

      {/* TÍTULO CENTRALIZADO */}
      <View style={styles.center}>
        <Text style={styles.titulo}>
          {titulo}
        </Text>
      </View>

      {/* BOTÃO DE PERFIL */}
      <Pressable
        onPress={() =>
          navigation.navigate("Perfil", { usuario })
        }
        style={styles.userButton}
      >
        <Image
          source={require("../assets/user.png")}
          style={styles.userIcon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  voltarButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 2,
  },

  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#007A33",
    textAlign: "center",
  },

  userButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d5eee3",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  userIcon: {
    width: "60%",
    height: "60%",
    tintColor: "#006633",
    resizeMode: "contain",
  },
});