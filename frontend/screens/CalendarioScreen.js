import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://localhost:3000";

export default function CalendarioScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  async function carregarReservas() {
    try {
      setCarregando(true);

      const resposta = await fetch(`${API_URL}/reservas/all`);

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as reservas.");
      }

      const dados = await resposta.json();

      setReservas(dados);
    } catch (erro) {
      console.log("Erro ao carregar reservas:", erro);

      Alert.alert(
        "Erro",
        "Não foi possível carregar as reservas."
      );
    } finally {
      setCarregando(false);
    }
  }


  useFocusEffect(
    useCallback(() => {
      carregarReservas();
    }, [])
  );

  function formatarData(data) {
    if (!data) return "";

    const partes = data.split("T")[0].split("-");

    if (partes.length !== 3) return data;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function formatarHora(hora) {
    if (!hora) return "";

    return hora.substring(0, 5);
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.voltar}
        >
          <Image
            source={require("../assets/seta.png")}
            style={styles.icon}
          />
        </Pressable>

        <Text style={styles.tituloHeader}>
          Calendário de Reservas
        </Text>

        
        <View style={styles.espaco} />

      </View>

      {/* CONTEÚDO */}
      <View style={styles.content}>

        {carregando ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>
              Carregando reservas...
            </Text>
          </View>

        ) : reservas.length === 0 ? (

          <Text style={styles.vazio}>
            Não existem reservas futuras.
          </Text>

        ) : (

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.lista}
          >

            {reservas.map((reserva) => (

              <View
                key={reserva.idReserva}
                style={styles.reserva}
              >

                <Text style={styles.data}>
                  {formatarData(reserva.reservaData)}
                </Text>

                <Text style={styles.recurso}>
                  {reserva.nomeRecurso}
                </Text>

                <Text style={styles.horario}>
                  {formatarHora(reserva.horaRetirada)}
                  {" - "}
                  {formatarHora(reserva.horaDevolucao)}
                </Text>

                <Text style={styles.responsavel}>
                  Responsável: {reserva.responsavelNome}
                </Text>

              </View>

            ))}

          </ScrollView>

        )}

      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  /* TELA */
  container: {
    flex: 1,
    backgroundColor: "#CCFCE4",
  },

  /* HEADER */
  header: {
    height: 75,
    backgroundColor: "#FFF",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 20,
  },

  voltar: {
    width: 28,
    height: 28,
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
  },

  espaco: {
    width: 28,
  },

  /* CONTEÚDO */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
  },

  lista: {
    paddingBottom: 20,
  },

  /* CARREGAMENTO */
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 15,
  },

  /* QUANDO NÃO HÁ RESERVAS */
  vazio: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },

  /* CARD DA RESERVA */
  reserva: {
    backgroundColor: "#FFF",

    padding: 16,

    borderRadius: 4,

    marginBottom: 10,
  },

  data: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  recurso: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 5,
  },

  horario: {
    fontSize: 15,
    marginBottom: 5,
  },

  responsavel: {
    fontSize: 14,
    color: "#666",
  },

});