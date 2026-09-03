import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Modal
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

export default function MinhasReservasScreen({ navigation }) {
  const [reservas, setReservas] = useState([]);

  const [editando, setEditando] = useState(null);
  const [novaData, setNovaData] = useState("");
  const [novaHoraInicio, setNovaHoraInicio] = useState("");
  const [novaHoraFim, setNovaHoraFim] = useState("");

  const idUsuario = "U002";

  const getStatusColor = (status) => {
    switch (status) {
      case "ativa":
        return "#007A33";
      case "cancelada":
        return "#E53935";
      case "finalizada":
        return "#6B7280";
      default:
        return "#007A33";
    }
  };

  const carregar = () => {
    fetch(`http://localhost:3000/reservas/usuario/${idUsuario}`)
      .then(res => res.json())
      .then(setReservas)
      .catch(err => console.log(err));
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [])
  );

  const cancelarReserva = async (id) => {
    await fetch(`http://localhost:3000/reservas/cancelar/${id}`, {
      method: "PUT"
    });

    carregar();
  };

  const salvarEdicao = async () => {
    await fetch(`http://localhost:3000/reservas/${editando.idReserva}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservaData: novaData,
        horaRetirada: novaHoraInicio,
        horaDevolucao: novaHoraFim
      })
    });

    setEditando(null);
    carregar();
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.logo}>SISLAB</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Minhas Reservas</Text>

        <FlatList
          data={reservas}
          keyExtractor={(item) => item.idReserva.toString()}
          renderItem={({ item }) => {
            const color = getStatusColor(item.statusReserva);

            return (
              <View style={[styles.card, { borderLeftColor: color }]}>
                <Text style={styles.date}>📅 {item.reservaData}</Text>

                <Text style={styles.text}>
                  ⏰ {item.horaRetirada} - {item.horaDevolucao}
                </Text>

                <Text style={[styles.status, { color }]}>
                  📌 {item.statusReserva}
                </Text>

                <Text style={styles.text}>👤 {item.responsavelNome}</Text>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => {
                      setEditando(item);
                      setNovaData(item.reservaData);
                      setNovaHoraInicio(item.horaRetirada);
                      setNovaHoraFim(item.horaDevolucao);
                    }}
                  >
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>

                  {item.statusReserva === "ativa" && (
                    <Pressable onPress={() => cancelarReserva(item.idReserva)}>
                      <Text style={{ color: "#E53935", fontWeight: "bold" }}>
                        Cancelar
                      </Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>

      <Modal visible={!!editando} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Reserva</Text>

            <TextInput
              placeholder="Data"
              value={novaData}
              onChangeText={setNovaData}
              style={styles.input}
            />

            <TextInput
              placeholder="Hora início"
              value={novaHoraInicio}
              onChangeText={setNovaHoraInicio}
              style={styles.input}
            />

            <TextInput
              placeholder="Hora fim"
              value={novaHoraFim}
              onChangeText={setNovaHoraFim}
              style={styles.input}
            />

            <Pressable style={styles.saveBtn} onPress={salvarEdicao}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Salvar
              </Text>
            </Pressable>

            <Pressable onPress={() => setEditando(null)}>
              <Text style={{ marginTop: 10, color: "red" }}>
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ccfce4" },

  header: {
    height: 75,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30
  },

  logo: { fontSize: 28, fontWeight: "bold", color: "#007A33" },

  backIcon: { width: 28, height: 28, resizeMode: "contain" },

  content: { flex: 1, padding: 20 },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 15
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 6
  },

  date: { fontWeight: "bold", marginBottom: 5 },

  text: { marginBottom: 3 },

  status: { fontWeight: "bold", marginBottom: 3 },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },

  actionText: {
    color: "#007A33",
    fontWeight: "bold"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    padding: 20
  },

  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },

  saveBtn: {
    backgroundColor: "#007A33",
    padding: 12,
    borderRadius: 8,
    alignItems: "center"
  }
});