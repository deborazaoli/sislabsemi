import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";

export default function HomeScreen({ navigation, route }) {
  const { width } = useWindowDimensions();

  const usuario = route?.params?.usuario || {};

  const nomeUsuario =
    usuario.nome ||
    usuario.nomeUsuario ||
    usuario.nomeCompleto ||
    "Usuário";

  const [reservas, setReservas] = useState([]);
  const [carregandoReservas, setCarregandoReservas] =
    useState(true);

  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 380;

  const cardWidth = isSmallScreen
    ? (width - 60) / 2
    : Math.min(240, (width - 160) / 4);

  const cardHeight = isSmallScreen ? 190 : 220;

  // BUSCAR RESERVAS DO USUÁRIO
  const buscarReservas = async () => {
    if (!usuario?.idUsuario) {
      setReservas([]);
      setCarregandoReservas(false);
      return;
    }

    try {
      setCarregandoReservas(true);

      const response = await fetch(
        `${API_URL}/reservas/usuario/${usuario.idUsuario}`
      );

      const json = await response.json();

      if (!response.ok) {
        console.log(
          "Erro ao buscar reservas:",
          json
        );

        setReservas([]);
        return;
      }

      if (Array.isArray(json)) {
        setReservas(json);
      } else {
        setReservas([]);
      }
    } catch (error) {
      console.log(
        "Erro ao buscar reservas do usuário:",
        error
      );

      setReservas([]);
    } finally {
      setCarregandoReservas(false);
    }
  };


  useFocusEffect(
    useCallback(() => {
      buscarReservas();
    }, [usuario?.idUsuario])
  );

  const obterDataHoje = () => {
    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
      agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
      agora.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  };

  const dataHoje = obterDataHoje();

  const reservasHoje = reservas.filter(
    (reserva) =>
      reserva.statusReserva === "ativa" &&
      String(reserva.reservaData).slice(0, 10) ===
        dataHoje
  );

  const quantidadeReservasHoje =
    reservasHoje.length;

  const reservasRecentes = reservas
    .filter(
      (reserva) =>
        reserva.statusReserva === "ativa"
    )
    .slice(0, 3);

  const formatarData = (data) => {
    if (!data) {
      return "Data não informada";
    }

    const valor = String(data).slice(0, 10);

    const partes = valor.split("-");

    if (partes.length !== 3) {
      return valor;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  };

  // FORMATAR HORÁRIO
  const formatarHorario = (
    horaRetirada,
    horaDevolucao
  ) => {
    if (!horaRetirada) {
      return "Horário não informado";
    }

    const inicio = String(
      horaRetirada
    ).slice(0, 5);

    if (!horaDevolucao) {
      return inicio;
    }

    const fim = String(
      horaDevolucao
    ).slice(0, 5);

    return `${inicio} - ${fim}`;
  };

  // RENDER

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>

      <View
        style={[
          styles.header,
          {
            height: isSmallScreen ? 80 : 90,
            paddingHorizontal:
              isSmallScreen ? 20 : 30,
          },
        ]}
      >

        <Text
          style={[
            styles.logo,
            {
              fontSize:
                isSmallScreen ? 28 : 32,
            },
          ]}
        >
          SISLAB
        </Text>

        <Pressable
          style={[
            styles.userButton,
            {
              width:
                isSmallScreen ? 48 : 54,
              height:
                isSmallScreen ? 48 : 54,
              borderRadius:
                isSmallScreen ? 24 : 27,
            },
          ]}
          onPress={() =>
            navigation.navigate("Logout")
          }
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
            paddingHorizontal:
              isSmallScreen ? 20 : 30,
            paddingTop:
              isSmallScreen ? 25 : 35,
            paddingBottom: 40,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <Text
          style={[
            styles.welcome,
            {
              fontSize:
                isSmallScreen ? 20 : 24,
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
            onPress={() =>
              navigation.navigate("Calendario")
            }
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
              navigation.navigate(
                "RelatarProblema",
                {
                  usuario: usuario,
                }
              )
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
            RESERVAS DE HOJE
        ================================================== */}

        <View style={styles.todayBox}>

          <View>
            <Text style={styles.todayTitle}>
              Reservas de hoje
            </Text>

            <Text style={styles.todaySubtitle}>
              Reservas ativas para hoje
            </Text>
          </View>

          <View style={styles.todayNumberContainer}>

            {carregandoReservas ? (
              <ActivityIndicator
                size="small"
                color="#007A33"
              />
            ) : (
              <Text style={styles.todayNumber}>
                {quantidadeReservasHoje}
              </Text>
            )}

          </View>

        </View>

        {/* ==================================================
            RESERVAS RECENTES
        ================================================== */}

        <Text
          style={[
            styles.recentTitle,
            {
              fontSize:
                isSmallScreen ? 20 : 24,
            },
          ]}
        >
          Minhas reservas recentes
        </Text>

        <View style={styles.recentReservations}>

          {carregandoReservas ? (

            <View style={styles.loadingContainer}>

              <ActivityIndicator
                size="small"
                color="#007A33"
              />

              <Text style={styles.loadingText}>
                Carregando reservas...
              </Text>

            </View>

          ) : reservasRecentes.length === 0 ? (

            <Text style={styles.emptyText}>
              Você ainda não possui reservas
              recentes.
            </Text>

          ) : (

            reservasRecentes.map(
              (reserva, index) => (

                <View
                  key={
                    reserva.idReserva ||
                    reserva.codigoReserva ||
                    index
                  }
                  style={[
                    styles.reservaItem,
                    index ===
                      reservasRecentes.length - 1 &&
                      styles.ultimoItem,
                  ]}
                >

                  <Text style={styles.recentText}>

                    {reserva.nomeRecurso ||
                      "Recurso reservado"}

                  </Text>

                  <Text
                    style={styles.reservaDetails}
                  >

                    {formatarData(
                      reserva.reservaData
                    )}

                    {" • "}

                    {formatarHorario(
                      reserva.horaRetirada,
                      reserva.horaDevolucao
                    )}

                  </Text>

                </View>

              )
            )

          )}

        </View>

      </ScrollView>

    </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },

  container: {
    flex: 1,
    backgroundColor: "#d4fee9",
  },

  header: {
    height: 75,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
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

  // CARDS
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

  // RESERVAS DE HOJE
  todayBox: {
    backgroundColor: "#FFFFFF",

    borderRadius: 15,

    padding: 18,

    marginTop: 30,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderWidth: 1.5,
    borderColor: "#a6e4cf",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  todayTitle: {
    color: "#006633",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },

  todaySubtitle: {
    color: "#666666",
    fontSize: 13,
  },

  todayNumberContainer: {
    width: 55,
    height: 55,

    borderRadius: 28,

    backgroundColor: "#d4fee9",

    justifyContent: "center",
    alignItems: "center",
  },

  todayNumber: {
    color: "#007A33",
    fontSize: 24,
    fontWeight: "bold",
  },

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

  ultimoItem: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
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

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },

  loadingText: {
    color: "#777777",
    fontSize: 14,
    marginTop: 8,
  },

  emptyText: {
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

});