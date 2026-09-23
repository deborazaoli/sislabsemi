
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


  // ALERTA PERSONALIZADO
  const [alerta, setAlerta] = useState({
    visivel: false,
    titulo: "",
    mensagem: "",
    tipo: "normal"
  });


  // Usuário que fez login
  const usuario = route?.params?.usuario;

  const idUsuario = usuario?.idUsuario;


  // Abrir alerta personalizado
  const mostrarAlerta = (
    titulo,
    mensagem,
    tipo = "normal"
  ) => {

    setAlerta({
      visivel: true,
      titulo,
      mensagem,
      tipo
    });

  };


  // Fechar alerta
  const fecharAlerta = () => {

    setAlerta({
      visivel: false,
      titulo: "",
      mensagem: "",
      tipo: "normal"
    });

  };


  // Cor do status
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


  // Texto do status
  const getStatusText = (status) => {

    switch (status) {

      case "ativa":
        return "Ativa";

      case "cancelada":
        return "Cancelada";

      case "finalizada":
        return "Finalizada";

      default:
        return status;

    }

  };


  // Carregar reservas
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


  // Cancelar reserva
  const cancelarReserva = (id) => {

    mostrarAlerta(
      "Cancelar reserva",
      "Realmente deseja cancelar essa reserva?",
      "confirmacao"
    );

    setAlertaIdReserva(id);

  };


  // ID da reserva que será cancelada
  const [alertaIdReserva, setAlertaIdReserva] =
    useState(null);


  // Confirmar cancelamento
  const confirmarCancelamento = async () => {

    const id = alertaIdReserva;

    fecharAlerta();

    setAlertaIdReserva(null);


    try {

      const resposta = await fetch(
        `${API_URL}/reservas/cancelar/${id}`,
        {
          method: "PUT"
        }
      );


      if (!resposta.ok) {

        const data =
          await resposta.json();

        mostrarAlerta(
          "Erro",
          data.message ||
          "Não foi possível cancelar a reserva.",
          "erro"
        );

        return;
      }


      carregar();


    } catch (error) {

      console.log(
        "Erro ao cancelar reserva:",
        error
      );


      mostrarAlerta(
        "Erro",
        "Não foi possível conectar ao servidor.",
        "erro"
      );

    }

  };


  // Salvar edição
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


      const data =
        await resposta.json();


      if (!resposta.ok) {

        mostrarAlerta(
          "Erro",
          data.message ||
          "Não foi possível editar a reserva.",
          "erro"
        );

        return;
      }


      setEditando(null);

      carregar();


      mostrarAlerta(
        "Sucesso",
        "Reserva atualizada com sucesso.",
        "sucesso"
      );


    } catch (error) {

      console.log(
        "Erro ao editar reserva:",
        error
      );


      mostrarAlerta(
        "Erro",
        "Não foi possível conectar ao servidor.",
        "erro"
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


            const statusText =
              getStatusText(
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
                    {
                      color: color
                    }
                  ]}
                >
                  Status: {statusText}
                </Text>


                <Text style={styles.text}>
                  Responsável:{" "}
                  {item.responsavelNome}
                </Text>


                {/* AÇÕES */}

                {item.statusReserva === "ativa" && (

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

                    <Pressable
                      onPress={() =>
                        cancelarReserva(
                          item.idReserva
                        )
                      }
                    >

                      <Text style={styles.cancelText}>
                        Cancelar
                      </Text>

                    </Pressable>

                  </View>

                )}

              </View>

            );

          }}

        />

      </View>


      {/* MODAL DE EDIÇÃO */}

      <Modal
        visible={!!editando}
        transparent
        animationType="fade"
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


      {/* ALERTA PERSONALIZADO */}

      <Modal
        visible={alerta.visivel}
        transparent
        animationType="fade"
        onRequestClose={fecharAlerta}
      >

        <View style={styles.alertOverlay}>

          <View style={styles.alertBox}>

            <Text
              style={[
                styles.alertTitle,
                alerta.tipo === "erro" &&
                  styles.alertTitleErro,

                alerta.tipo === "sucesso" &&
                  styles.alertTitleSucesso
              ]}
            >
              {alerta.titulo}
            </Text>


            <Text style={styles.alertMessage}>
              {alerta.mensagem}
            </Text>


            {alerta.tipo === "confirmacao" ? (

              <View style={styles.alertActions}>

                <Pressable
                  style={styles.alertNoButton}
                  onPress={() => {

                    fecharAlerta();
                    setAlertaIdReserva(null);

                  }}
                >

                  <Text style={styles.alertNoText}>
                    Não
                  </Text>

                </Pressable>


                <Pressable
                  style={styles.alertYesButton}
                  onPress={confirmarCancelamento}
                >

                  <Text style={styles.alertYesText}>
                    Sim
                  </Text>

                </Pressable>

              </View>

            ) : (

              <Pressable
                style={styles.alertOkButton}
                onPress={fecharAlerta}
              >

                <Text style={styles.alertOkText}>
                  OK
                </Text>

              </Pressable>

            )}

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
  },


  /* ALERTA PERSONALIZADO */

  alertOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
    padding: 25
  },


  alertBox: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 8
  },


  alertTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 12,
    textAlign: "center"
  },


  alertTitleErro: {
    color: "#E53935"
  },


  alertTitleSucesso: {
    color: "#007A33"
  },


  alertMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 22
  },


  alertActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },


  alertNoButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E53935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },


  alertNoText: {
    color: "#E53935",
    fontWeight: "bold",
    fontSize: 15
  },


  alertYesButton: {
    flex: 1,
    backgroundColor: "#E53935",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },


  alertYesText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15
  },


  alertOkButton: {
    backgroundColor: "#007A33",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center"
  },


  alertOkText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15
  }

});
