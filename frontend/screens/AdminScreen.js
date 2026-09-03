import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

export default function AdminScreen({ navigation }) {
  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <Text style={styles.logo}>
          SISLAB
        </Text>

        <Pressable
          style={styles.userButton}
          onPress={() => navigation.navigate("Logout")}
        >
          <Image
            source={require("../assets/user.png")}
            style={styles.userIcon}
          />
        </Pressable>

      </View>

      <View style={styles.content}>


        <View style={styles.cardsContainer}>

          {/* LABORATÓRIOS */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Laboratorios")}
          >
            <Image
              source={require("../assets/lab.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Laboratórios
              </Text>
            </View>
          </Pressable>

          {/* SALAS */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Salas")}
          >
            <Image
              source={require("../assets/sala.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Salas
              </Text>
            </View>
          </Pressable>

          {/* EQUIPAMENTOS */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Equipamentos")}
          >
            <Image
              source={require("../assets/equipamento.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Equipamentos
              </Text>
            </View>
          </Pressable>

          {/* RELATÓRIOS */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Relatorios")}
          >
            <Image
              source={require("../assets/relatorio.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Relatórios
              </Text>
            </View>
          </Pressable>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },

  header: {
    height: 75,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 30
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
  },

  userButton: {
    backgroundColor: "#007A33",
    width: 50,
    height: 50,
    borderRadius: 25,

    justifyContent: "center",
    alignItems: "center"
  },

  userIcon: {
    width: 40,
    height: 50,
    tintColor: "#FFF",
    resizeMode: "contain"
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  cardsContainer: {
    flexDirection: "row",
    gap: 40,
    flexWrap: "wrap",
    justifyContent: "center"
  },

  card: {
    width: 240,
    height: 260,

    backgroundColor: "#FFF",

    borderRadius: 20,

    justifyContent: "space-between",
    alignItems: "center",

    paddingVertical: 45,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 5,

    borderWidth: 3,
    borderColor: "#00A884"
  },

  icon: {
    width: 100,
    height: 100,
    resizeMode: "contain"
  },

  button: {
    backgroundColor: "#007A33",

    width: 180,
    paddingVertical: 12,

    borderRadius: 25,

    alignItems: "center"
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16
  }
});