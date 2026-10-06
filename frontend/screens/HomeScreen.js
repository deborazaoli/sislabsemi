import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from "react-native";

export default function HomeScreen({ navigation, route }) {
  const { width } = useWindowDimensions();

  const usuario = route?.params?.usuario || {};

  const nomeUsuario =
    usuario.nome ||
    usuario.nomeUsuario ||
    usuario.nomeCompleto ||
    "Usuário";

  // Reservas do usuário, caso sejam enviadas junto com o login
  const reservas =
    usuario.reservas ||
    usuario.minhasReservas ||
    [];

  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 380;

  const cardWidth = isSmallScreen
    ? (width - 60) / 2
    : Math.min(240, (width - 160) / 4);

  const cardHeight = isSmallScreen ? 190 : 220;

  return (
    <View style={styles.container}>

      <View
        style={[
          styles.header,
          {
            height: isSmallScreen ? 80 : 90,
            paddingHorizontal: isSmallScreen ? 20 : 30,
          },
        ]}
      >

        <Text
          style={[
            styles.logo,
            {
              fontSize: isSmallScreen ? 28 : 32,
            },
          ]}
        >
          SISLAB
        </Text>

        <Pressable
          style={[
            styles.userButton,
            {
              width: isSmallScreen ? 48 : 54,
              height: isSmallScreen ? 48 : 54,
              borderRadius: isSmallScreen ? 24 : 27,
            },
          ]}
          onPress={() => navigation.navigate("Logout")}
        >
          <Image
            source={require("../assets/user.png")}
            style={styles.userIcon}
          />
        </Pressable>

      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 20 : 30,
            paddingTop: isSmallScreen ? 25 : 35,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <Text
          style={[
            styles.welcome,
            {
              fontSize: isSmallScreen ? 20 : 24,
            },
          ]}
        >
          Olá, {nomeUsuario}!
        </Text>

        <Text style={styles.subtitle}>
          O que você deseja fazer?
        </Text>

        <View style={styles.cardsContainer}>

          {/* FAZER RESERVA */}

          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
            onPress={() =>
              navigation.navigate("Reserva", {
                usuario: usuario,
              })
            }
          >

            <View style={styles.iconContainer}>

              <Image
                source={require("../assets/reserva.png")}
                style={styles.icon}
              />

            </View>

            <View style={styles.button}>

              <Text style={styles.buttonText}>
                Fazer Reserva
              </Text>

            </View>

          </Pressable>

          {/* CALENDÁRIO */}

          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
            onPress={() => navigation.navigate("Calendario")}
          >

            <View style={styles.iconContainer}>

              <Image
                source={require("../assets/calendario.png")}
                style={styles.icon}
              />

            </View>

            <View style={styles.button}>

              <Text style={styles.buttonText}>
                Calendário
              </Text>

            </View>

          </Pressable>

          {/* MINHAS RESERVAS */}

          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
            onPress={() =>
              navigation.navigate("MinhasReservas", {
                usuario: usuario,
              })
            }
          >

            <View style={styles.iconContainer}>

              <Image
                source={require("../assets/historico.png")}
                style={styles.icon}
              />

            </View>

            <View style={styles.button}>

              <Text style={styles.buttonText}>
                Minhas Reservas
              </Text>

            </View>

          </Pressable>

          {/* RELATAR PROBLEMA */}

          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
            ]}
            onPress={() =>
              navigation.navigate("RelatarProblema", {
                usuario: usuario,
              })
            }
          >

            <View style={styles.iconContainer}>

              <Image
                source={require("../assets/problema.png")}
                style={styles.icon}
              />

            </View>

            <View style={styles.button}>

              <Text style={styles.buttonText}>
                Relatar Problema
              </Text>

            </View>

          </Pressable>

        </View>

        {/* ==================================================
            RESERVAS RECENTES
        ================================================== */}

        <Text
          style={[
            styles.recentTitle,
            {
              fontSize: isSmallScreen ? 20 : 24,
            },
          ]}
        >
          Minhas reservas recentes
        </Text>

        <View style={styles.recentReservations}>

          {reservas.length === 0 ? (

            <Text style={styles.emptyText}>
              Você ainda não possui reservas recentes.
            </Text>

          ) : (

            reservas.slice(0, 3).map((reserva, index) => (

              <View
                key={reserva.idReserva || reserva.codigoReserva || index}
                style={styles.reservaItem}
              >

                <Text style={styles.recentText}>
                  {reserva.nomeRecurso ||
                    reserva.recurso ||
                    reserva.nomeSala ||
                    "Recurso reservado"}
                </Text>

                <Text style={styles.reservaDetails}>

                  {reserva.data ||
                    reserva.dataReserva ||
                    "Data não informada"}

                  {" • "}

                  {reserva.horario ||
                    reserva.hora ||
                    "Horário não informado"}

                </Text>

              </View>

            ))

          )}

        </View>

      </ScrollView>

    </View>
  );
}

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#d4fee9",
  },

  // ====================================================
  // HEADER BRANCO
  // ====================================================

  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  logo: {
    fontWeight: "bold",
    color: "#006633",
  },

  userButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",

    borderWidth: 1,
    borderColor: "#d5eee3",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  userIcon: {
    tintColor: "#006633",
    resizeMode: "contain",
    width: "60%",
    height: "60%",
  },

  // ====================================================
  // CONTEÚDO
  // ====================================================

  content: {
    flexGrow: 1,
  },

  welcome: {
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },

  subtitle: {
    color: "#666666",
    fontSize: 15,
    marginBottom: 25,
  },

  // ====================================================
  // CARDS
  // ====================================================

  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 20,

    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,

    borderWidth: 1.5,
    borderColor: "#a6e4cf",

    padding: 15,
  },

  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    resizeMode: "contain",
    width: 90,
    height: 90,
  },

  button: {
    backgroundColor: "#007A33",

    paddingVertical: 10,
    paddingHorizontal: 15,

    borderRadius: 20,

    alignItems: "center",

    width: "100%",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 13,
  },

  // ====================================================
  // RESERVAS RECENTES
  // ====================================================

  recentTitle: {
    fontWeight: "bold",
    color: "#006633",

    marginTop: 35,
    marginBottom: 15,
  },

  recentReservations: {
    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  reservaItem: {
    paddingBottom: 12,
    marginBottom: 12,

    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  recentText: {
    color: "#333333",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  reservaDetails: {
    color: "#666666",
    fontSize: 13,
  },

  emptyText: {
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

});
