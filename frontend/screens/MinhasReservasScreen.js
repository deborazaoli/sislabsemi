import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Image,
  TextInput,
  Modal,
  Alert
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";


export default function MinhasReservasScreen({
  navigation,
  route
}) {

  const [reservas, setReservas] = useState([]);

  const [editando, setEditando] = useState(null);

  const [novaData, setNovaData] = useState("");

  const [novaHoraInicio, setNovaHoraInicio] =
    useState("");

  const [novaHoraFim, setNovaHoraFim] =
    useState("");


  // Usuário que fez login
  const usuario = route?.params?.usuario;

  const idUsuario = usuario?.idUsuario;


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

    if (!idUsuario) {

      console.log(
        "ID do usuário não encontrado."
      );

      return;
    }


    fetch(
      `${API_URL}/reservas/usuario/${idUsuario}`
    )

      .then(res => {

        if (!res.ok) {
          throw new Error(
            "Não foi possível carregar as reservas."
          );
        }

        return res.json();

      })

      .then(setReservas)

      .catch(err =>
        console.log(
          "Erro ao carregar reservas:",
          err
        )
      );

  };


  useFocusEffect(
    useCallback(() => {

      carregar();

    }, [idUsuario])
  );


  const cancelarReserva = async (id) => {

    try {

      const resposta = await fetch(
        `${API_URL}/reservas/cancelar/${id}`,
        {
          method: "PUT"
        }
      );


      if (!resposta.ok) {

        const data = await resposta.json();

        Alert.alert(
          "Erro",
          data.message ||
          "Não foi possível cancelar a reserva."
        );

        return;
      }


      carregar();


    } catch (error) {

      console.log(
        "Erro ao cancelar reserva:",
        error
      );


      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    }

  };


  const salvarEdicao = async () => {

    if (!editando) {
      return;
    }


    try {

      const resposta = await fetch(
        `${API_URL}/reservas/${editando.idReserva}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            reservaData: novaData,
            horaRetirada: novaHoraInicio,
            horaDevolucao: novaHoraFim
          })
        }
      );


      const data = await resposta.json();


      if (!resposta.ok) {

        Alert.alert(
          "Erro",
          data.message ||
          "Não foi possível editar a reserva."
        );

        return;
      }


      Alert.alert(
        "Sucesso",
        "Reserva atualizada com sucesso."
      );


      setEditando(null);

      carregar();


    } catch (error) {

      console.log(
        "Erro ao editar reserva:",
        error
      );


      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    }

  };


  return (

    <View style={styles.container}>


      {/* HEADER */}

      <View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
        >

          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />

        </Pressable>


        <Text style={styles.logo}>
          SISLAB
        </Text>


        <View style={{ width: 28 }} />

      </View>


      {/* CONTEÚDO */}

      <View style={styles.content}>

        <Text style={styles.title}>
          Minhas Reservas
        </Text>


        <FlatList
          data={reservas}

          keyExtractor={(item) =>
            item.idReserva.toString()
          }

          showsVerticalScrollIndicator={false}

          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Você ainda não possui reservas.
            </Text>
          }

          renderItem={({ item }) => {

            const color =
              getStatusColor(
                item.statusReserva
              );


            return (

              <View
                style={[
                  styles.card,
                  {
                    borderLeftColor: color
                  }
                ]}
              >

                <Text style={styles.date}>
                  Data: {item.reservaData}
                </Text>


                <Text style={styles.text}>
                  Horário:{" "}
                  {item.horaRetirada}
                  {" - "}
                  {item.horaDevolucao}
                </Text>


                <Text
                  style={[
                    styles.status,
                    { color }
                  ]}
                >
                  Status: {item.statusReserva}
                </Text>


                <Text style={styles.text}>
                  Responsável:{" "}
                  {item.responsavelNome}
                </Text>


                <View style={styles.actions}>


                  {/* EDITAR */}

                  <Pressable
                    onPress={() => {

                      setEditando(item);

                      setNovaData(
                        item.reservaData
                      );

                      setNovaHoraInicio(
                        item.horaRetirada
                      );

                      setNovaHoraFim(
                        item.horaDevolucao
                      );

                    }}
                  >

                    <Text style={styles.actionText}>
                      Editar
                    </Text>

                  </Pressable>


                  {/* CANCELAR */}

                  {item.statusReserva === "ativa" && (

                    <Pressable
                      onPress={() =>
                        cancelarReserva(
                          item.idReserva
                        )
                      }
                    >

                      <Text
                        style={
                          styles.cancelText
                        }
                      >
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


      {/* MODAL DE EDIÇÃO */}

      <Modal
        visible={!!editando}
        transparent
        animationType="slide"
        onRequestClose={() =>
          setEditando(null)
        }
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>
              Editar Reserva
            </Text>


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


            <Pressable
              style={styles.saveBtn}
              onPress={salvarEdicao}
            >

              <Text style={styles.saveText}>
                Salvar
              </Text>

            </Pressable>


            <Pressable
              onPress={() =>
                setEditando(null)
              }
            >

              <Text style={styles.cancelModal}>
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

  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  header: {
    height: 75,

    backgroundColor: "#fff",

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


  backIcon: {
    width: 28,

    height: 28,

    resizeMode: "contain"
  },


  content: {
    flex: 1,

    padding: 20
  },


  title: {
    fontSize: 24,

    fontWeight: "bold",

    color: "#007A33",

    marginBottom: 15
  },


  emptyText: {
    textAlign: "center",

    color: "#666",

    marginTop: 30,

    fontSize: 16
  },


  card: {
    backgroundColor: "#fff",

    padding: 15,

    borderRadius: 12,

    marginBottom: 12,

    borderLeftWidth: 6
  },


  date: {
    fontWeight: "bold",

    marginBottom: 5
  },


  text: {
    marginBottom: 3
  },


  status: {
    fontWeight: "bold",

    marginBottom: 3
  },


  actions: {
    flexDirection: "row",

    justifyContent: "space-between",

    marginTop: 10
  },


  actionText: {
    color: "#007A33",

    fontWeight: "bold"
  },


  cancelText: {
    color: "#E53935",

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
  },


  saveText: {
    color: "#fff",

    fontWeight: "bold"
  },


  cancelModal: {
    marginTop: 10,

    color: "#E53935",

    textAlign: "center",

    fontWeight: "bold"
  }

});