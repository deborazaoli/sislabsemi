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

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";
import API_URL, { apiFetch } from "../services/api";

export default function MinhasReservasScreen({ navigation, route }) {
  const [reservas, setReservas] = useState([]);
  const [filtro, setFiltro] = useState("Geral");

  const filtros = ["Geral", "Salas", "Laboratórios", "Equipamentos"];

  const [editando, setEditando] = useState(null);
  const [novaData, setNovaData] = useState("");
  const [novaHoraInicio, setNovaHoraInicio] = useState("");
  const [novaHoraFim, setNovaHoraFim] = useState("");

  const [alerta, setAlerta] = useState({
    visivel: false,
    titulo: "",
    mensagem: "",
    tipo: "normal"
  });

  const [alertaIdReserva, setAlertaIdReserva] = useState(null);

  const usuario = route?.params?.usuario;
  const idUsuario = usuario?.idUsuario;

  // Exibir a data da reserva no formato brasileiro (DD/MM/AAAA).
  const formatarData = (data) => {
    if (!data) return "";

    const valor = String(data).trim();

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      return valor;
    }

    const dataSemHorario = valor.split("T")[0];
    const partes = dataSemHorario.split("-");

    if (partes.length === 3 && partes[0].length === 4) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }

    return dataSemHorario;
  };

  // Exibir apenas hora e minuto (ex: 14:30 a partir de 14:30:00)
  const formatarHora = (hora) => {
    if (!hora) return "";
    const partes = String(hora).trim().split(":");
    if (partes.length >= 2) {
      return `${partes[0]}:${partes[1]}`;
    }
    return hora;
  };

  // Verificar se a data da reserva já passou em relação a hoje
  const dataJaPassou = (dataReserva) => {
    if (!dataReserva) return false;

    const valor = String(dataReserva).trim();
    let ano, mes, dia;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      const partes = valor.split("/");
      dia = partes[0];
      mes = partes[1];
      ano = partes[2];
    } else {
      const dataSemHorario = valor.split("T")[0];
      const partes = dataSemHorario.split("-");
      if (partes.length === 3 && partes[0].length === 4) {
        ano = partes[0];
        mes = partes[1];
        dia = partes[2];
      } else {
        return false;
      }
    }

    const dReserva = new Date(`${ano}-${mes}-${dia}T00:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return dReserva < hoje;
  };

  // Obter o status real (considerando se já passou da data)
  const getStatusReal = (item) => {
    if (item.statusReserva === "ativa" && dataJaPassou(item.reservaData)) {
      return "finalizada";
    }
    return item.statusReserva;
  };

  // Obter o nome do recurso reservado
  const getNomeRecurso = (item) => {
    return (
      item.nomeRecurso ??
      item.recursoNome ??
      item.nome ??
      item.descricaoRecurso ??
      item.tipoRecurso ??
      "Recurso"
    );
  };

  // Identificar categoria do recurso
  const getCategoriaReserva = (item) => {
    const categoria = String(
      item.tipoRecurso ??
      item.categoriaRecurso ??
      item.tipo ??
      item.categoria ??
      item.tipoReserva ??
      item.recursoTipo ??
      item.nomeTipoRecurso ??
      ""
    ).toLowerCase();

    if (categoria.includes("laborat")) return "Laboratórios";
    if (categoria.includes("equip")) return "Equipamentos";
    if (categoria.includes("sala")) return "Salas";

    const nome = String(getNomeRecurso(item)).toLowerCase();

    if (nome.includes("laborat")) return "Laboratórios";
    if (nome.includes("equip")) return "Equipamentos";
    if (nome.includes("sala")) return "Salas";

    return "Outros";
  };

  // Filtrar reservas
  const reservasFiltradas =
    filtro === "Geral"
      ? reservas
      : reservas.filter(
          item => getCategoriaReserva(item) === filtro
        );

  // Mostrar alerta personalizado
  const mostrarAlerta = (titulo, mensagem, tipo = "normal") => {
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

  // Carregar reservas do usuário
  const carregar = () => {
    if (!idUsuario) {
      console.log("ID do usuário não encontrado.");
      return;
    }

    apiFetch(`${API_URL}/reservas/usuario/${idUsuario}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Não foi possível carregar as reservas.");
        }

        return res.json();
      })
      .then(setReservas)
      .catch(err => {
        console.log("Erro ao carregar reservas:", err);
      });
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [idUsuario])
  );

  // Solicitar cancelamento
  const cancelarReserva = (id) => {
    mostrarAlerta(
      "Cancelar reserva",
      "Realmente deseja cancelar essa reserva?",
      "confirmacao"
    );

    setAlertaIdReserva(id);
  };

  // Confirmar cancelamento
  const confirmarCancelamento = async () => {
    const id = alertaIdReserva;

    fecharAlerta();
    setAlertaIdReserva(null);

    try {
      const resposta = await apiFetch(
        `${API_URL}/reservas/cancelar/${id}`,
        {
          method: "PUT"
        }
      );

      if (!resposta.ok) {
        const data = await resposta.json();

        mostrarAlerta(
          "Erro",
          data.message || "Não foi possível cancelar a reserva.",
          "erro"
        );

        return;
      }

      carregar();
    } catch (error) {
      console.log("Erro ao cancelar reserva:", error);

      mostrarAlerta(
        "Erro",
        "Não foi possível conectar ao servidor.",
        "erro"
      );
    }
  };

  // Salvar edição
  const salvarEdicao = async () => {
    if (!editando) return;

    try {
      const resposta = await apiFetch(
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
        mostrarAlerta(
          "Erro",
          data.message || "Não foi possível editar a reserva.",
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
      console.log("Erro ao editar reserva:", error);

      mostrarAlerta(
        "Erro",
        "Não foi possível conectar ao servidor.",
        "erro"
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.logo}>Minhas Reservas</Text>

        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* CONTEÚDO */}
      <View style={styles.container}>
        <View style={styles.content}>


          {/* FILTROS */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={filtros}
              keyExtractor={item => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setFiltro(item)}
                  style={[
                    styles.filterButton,
                    filtro === item && styles.filterButtonActive
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filtro === item && styles.filterTextActive
                    ]}
                  >
                    {item}
                  </Text>
                  {item === "Geral" && (
                    <View
                      style={[
                        styles.filterCount,
                        filtro === item && styles.filterCountActive
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterCountText,
                          filtro === item &&
                            styles.filterCountTextActive
                        ]}
                      >
                        {reservas.length}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          </View>

          {/* LISTA DE RESERVAS */}
          <FlatList
            data={reservasFiltradas}
            keyExtractor={item => item.idReserva.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}

            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>
                  {reservas.length === 0
                    ? "Nenhuma reserva encontrada"
                    : `Nenhuma reserva de ${filtro.toLowerCase()}`}
                </Text>

                <Text style={styles.emptyText}>
                  {reservas.length === 0
                    ? "Suas reservas aparecerão aqui quando você fizer uma."
                    : "Tente selecionar outra categoria."}
                </Text>
              </View>
            }

            renderItem={({ item }) => {
              const statusReal = getStatusReal(item);
              const color = getStatusColor(statusReal);
              const statusText = getStatusText(statusReal);
              const jaPassou = dataJaPassou(item.reservaData);

              return (
                <View
                  style={[
                    styles.card,
                    { borderLeftColor: color }
                  ]}
                >
                  {/* CATEGORIA E DATA */}
                  <View style={styles.cardTop}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {getCategoriaReserva(item)}
                      </Text>
                    </View>

                    <Text style={styles.date}>
                      {formatarData(item.reservaData)}
                    </Text>
                  </View>

                  <Text style={styles.recursoNome}>
                    {getNomeRecurso(item)}
                  </Text>

                  <Text style={styles.text}>
                    Horário: {formatarHora(item.horaRetirada)} às {formatarHora(item.horaDevolucao)}
                  </Text>

                  <Text style={styles.text}>
                    Responsável: {item.responsavelNome}
                  </Text>

                  <Text style={[styles.status, { color }]}>
                    Status: {statusText}
                  </Text>

                  {/* AÇÕES (Exibidas apenas se a reserva estiver ativa e a data não tiver passado) */}
                  {item.statusReserva === "ativa" && !jaPassou && (
                    <View style={styles.actions}>

                      {/* EDITAR */}
                      <Pressable
                        onPress={() => {
                          setEditando(item);
                          setNovaData(item.reservaData);
                          setNovaHoraInicio(item.horaRetirada);
                          setNovaHoraFim(item.horaDevolucao);
                        }}
                      >
                        <Text style={styles.actionText}>
                          Editar
                        </Text>
                      </Pressable>

                      {/* CANCELAR */}
                      <Pressable
                        onPress={() => cancelarReserva(item.idReserva)}
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
      </View>

      {/* MODAL DE EDIÇÃO */}
      <Modal
        visible={!!editando}
        transparent
        animationType="fade"
        onRequestClose={() => setEditando(null)}
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

            <Pressable onPress={() => setEditando(null)}>
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
                alerta.tipo === "erro" && styles.alertTitleErro,
                alerta.tipo === "sucesso" && styles.alertTitleSucesso
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
    backgroundColor: "#CCFCE4"
  },

  header: {
    height: 60,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  backButton: {
    padding: 5,
    zIndex: 2,
  },

  logo: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#007A33",
    textAlign: "center"
  },

  headerRightPlaceholder: {
    width: 38,
  },

  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain"
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 22
  },

  titleContainer: {
    marginBottom: 18
  },

  filterContainer: {
    marginBottom: 18
  },

  filterList: {
    paddingVertical: 3,
    gap: 8
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B8E7CC",
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 2
  },

  filterButtonActive: {
    backgroundColor: "#007A33",
    borderColor: "#007A33"
  },

  filterText: {
    color: "#007A33",
    fontWeight: "600",
    fontSize: 13
  },

  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "700"
  },
    filterCount: {
    marginLeft: 7,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#CCFCE4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5
  },

  filterCountActive: {
    backgroundColor: "#FFFFFF"
  },

  filterCountText: {
    color: "#007A33",
    fontSize: 11,
    fontWeight: "bold"
  },

  filterCountTextActive: {
    color: "#007A33"
  },

  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginTop: 12,
    alignItems: "center"
  },

  emptyTitle: {
    fontSize: 16,
    color: "#007A33",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 7
  },

  emptyText: {
    textAlign: "center",
    color: "#66756B",
    fontSize: 14,
    lineHeight: 20
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 17,
    borderRadius: 16,
    marginBottom: 13,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#004D20",
    shadowOpacity: 0.08,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowRadius: 5
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 10,
    gap: 8
  },

  categoryBadge: {
    backgroundColor: "#E8F8EF",
    borderRadius: 7,
    paddingHorizontal: 10,
    paddingVertical: 5
  },

  categoryBadgeText: {
    color: "#007A33",
    fontSize: 12,
    fontWeight: "700"
  },

  date: {
    fontWeight: "bold",
    color: "#1F3527",
    fontSize: 15
  },

  recursoNome: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F3527",
    marginBottom: 6
  },

  text: {
    marginBottom: 5,
    color: "#37483D",
    fontSize: 14
  },

  status: {
    fontWeight: "bold",
    marginTop: 2,
    marginBottom: 2,
    fontSize: 14
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5F2E9"
  },

  actionText: {
    color: "#007A33",
    fontWeight: "bold",
    backgroundColor: "#E8F8EF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: "hidden"
  },

  cancelText: {
    color: "#E53935",
    fontWeight: "bold",
    backgroundColor: "#FFF0F0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: "hidden"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000AA",
    justifyContent: "center",
    padding: 20
  },

  modalBox: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 16
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 15
  },

  input: {
    borderWidth: 1,
    borderColor: "#B8D9C4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 11,
    backgroundColor: "#FAFFFC"
  },

  saveBtn: {
    backgroundColor: "#007A33",
    padding: 13,
    borderRadius: 10,
    alignItems: "center"
  },

  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold"
  },

  cancelModal: {
    marginTop: 12,
    color: "#E53935",
    textAlign: "center",
    fontWeight: "bold"
  },

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
    backgroundColor: "#FFFFFF",
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
    color: "#333333",
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
    color: "#FFFFFF",
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
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15
  }
});