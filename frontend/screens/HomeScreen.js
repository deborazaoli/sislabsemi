import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.logo}>
          SISLAB
        </Text>

        <Pressable
  style={styles.adminButton}
  onPress={() => navigation.navigate("Login")}
>
  <Text style={styles.adminText}>
    Entrar como administrador
  </Text>
</Pressable>
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>
          Sistema de Controle de
        </Text>

        <Text style={styles.subtitle}>
          Laboratórios, Salas e Equipamentos
        </Text>

        <Text style={styles.section}>
          O que deseja fazer?
        </Text>

        <View style={styles.cardsContainer}>

          {/* RESERVA */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Reserva")}
          >
            <Image
              source={require("../assets/reserva.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Fazer Reserva
              </Text>
            </View>
          </Pressable>

          {/* CALENDÁRIO */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Calendario")}
          >
            <Image
              source={require("../assets/calendario.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Calendário
              </Text>
            </View>
          </Pressable>

          {/* HISTÓRICO */}
          <Pressable
            style={styles.card}
            onPress={() => navigation.navigate("Historico")}
          >
            <Image
              source={require("../assets/historico.png")}
              style={styles.icon}
            />

            <View style={styles.button}>
              <Text style={styles.buttonText}>
                Minhas Reservas
              </Text>
            </View>
          </Pressable>

        </View>
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text>
          IFPE Campus Jaboatão
        </Text>
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

  adminButton: {
    backgroundColor: "#007A33",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25
  },

  adminText: {
    color: "#FFF",
    fontWeight: "600"
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    fontSize: 30,
    fontWeight: "bold"
  },

  subtitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    textAlign: "center"
  },

  section: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30
  },

  cardsContainer: {
    flexDirection: "row",
    gap: 40
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
    resizeMode: "contain",
    justifyContent: "space-between",
    alignItems: "center",
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
  },

  footer: {
    height: 50,

    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center"
  }
});