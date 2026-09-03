import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

const API_URL = "http://localhost:3000";

export default function CalendarioScreen() {
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

  useEffect(() => {
    carregarReservas();
  }, []);

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
      <Text style={styles.titulo}>Calendário de Reservas</Text>

      {carregando ? (
        <ActivityIndicator size="large" />
      ) : reservas.length === 0 ? (
        <Text style={styles.vazio}>
          Não existem reservas futuras.
        </Text>
      ) : (
        <ScrollView>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },

  vazio: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 30,
  },

  reserva: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
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