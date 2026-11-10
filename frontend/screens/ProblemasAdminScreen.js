import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";

export default function ProblemasAdminScreen({ navigation }) {
  const [problemas, setProblemas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para o modal de alteração de status
  const [modalVisivel, setModalVisivel] = useState(false);
  const [problemaSelecionado, setProblemaSelecionado] = useState(null);

  const carregarProblemas = async () => {
    try {
      setCarregando(true);
      const res = await fetch(`${API_URL}/problemas`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setProblemas(data);
      } else {
        setProblemas([]);
      }
    } catch (error) {
      console.log("Erro ao carregar problemas:", error);
      Alert.alert("Erro", "Não foi possível carregar os relatos.");
    } finally {
      setCarregando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarProblemas();
    }, [])
  );

  const alterarStatus = async (novoStatus) => {
    if (!problemaSelecionado) return;

    try {
      const res = await fetch(`${API_URL}/problemas/${problemaSelecionado.idProblema}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statusProblema: novoStatus })
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Erro ao atualizar status");
      }

      setModalVisivel(false);
      setProblemaSelecionado(null);
      carregarProblemas(); // Recarrega a lista
    } catch (error) {
      console.log("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status do problema.");
    }
  };

  const formatarData = (dataIso) => {
    if (!dataIso) return "";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getCorStatus = (status) => {
    switch (status) {
      case "pendente": return { bg: "#FFF3CD", text: "#856404", label: "Pendente" };
      case "em_andamento": return { bg: "#CCE5FF", text: "#004085", label: "Em Andamento" };
      case "resolvido": return { bg: "#D4EDDA", text: "#155724", label: "Resolvido" };
      default: return { bg: "#E2E3E5", text: "#383D41", label: status };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>

        {/* HEADER PADRONIZADO */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image
              source={require("../assets/seta.png")}
              style={styles.backIcon}
            />
          </Pressable>

          <Text style={styles.tituloHeader}>Gerenciar Relatos</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          <Text style={styles.subtitulo}>
            Acompanhe os problemas relatados pelos usuários e atualize o status de manutenção.
          </Text>

          {carregando ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007A33" />
              <Text style={styles.loadingText}>Carregando relatos...</Text>
            </View>
          ) : problemas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum problema relatado no momento.</Text>
            </View>
          ) : (
            <FlatList
              data={problemas}
              keyExtractor={(item) => String(item.idProblema)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => {
                const statusInfo = getCorStatus(item.statusProblema);
                return (
                  <Pressable
                    style={styles.card}
                    onPress={() => {
                      setProblemaSelecionado(item);
                      setModalVisivel(true);
                    }}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardLocal}>
                        {item.tipoRecurso}: {item.nomeRecurso}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: statusInfo.bg }]}>
                        <Text style={[styles.badgeText, { color: statusInfo.text }]}>
                          {statusInfo.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.cardDescricao}>{item.descricao}</Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardInfo}>Relatado por: <Text style={styles.bold}>{item.responsavelNome}</Text></Text>
                      <Text style={styles.cardData}>{formatarData(item.dataRelato)}</Text>
                    </View>
                  </Pressable>
                );
              }}
            />
          )}
        </View>

        {/* MODAL PARA ALTERAR STATUS */}
        <Modal
          visible={modalVisivel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Alterar Status do Problema</Text>
              {problemaSelecionado && (
                <Text style={styles.modalSubtitulo}>
                  {problemaSelecionado.tipoRecurso}: {problemaSelecionado.nomeRecurso}
                </Text>
              )}

              <Pressable
                style={[styles.statusBtn, { backgroundColor: "#FFF3CD" }]}
                onPress={() => alterarStatus("pendente")}
              >
                <Text style={[styles.statusBtnText, { color: "#856404" }]}>Pendente</Text>
              </Pressable>

              <Pressable
                style={[styles.statusBtn, { backgroundColor: "#CCE5FF" }]}
                onPress={() => alterarStatus("em_andamento")}
              >
                <Text style={[styles.statusBtnText, { color: "#004085" }]}>Em Andamento</Text>
              </Pressable>

              <Pressable
                style={[styles.statusBtn, { backgroundColor: "#D4EDDA" }]}
                onPress={() => alterarStatus("resolvido")}
              >
                <Text style={[styles.statusBtnText, { color: "#155724" }]}>Resolvido</Text>
              </Pressable>

              <Pressable
                style={styles.modalCancelar}
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.modalCancelarText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFFFFF" },
  container: { flex: 1, backgroundColor: "#CCFCE4" },
  header: {
    height: 60,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  backButton: { width: 38, height: 38, justifyContent: "center", alignItems: "flex-start", zIndex: 2 },
  backIcon: { width: 28, height: 28, resizeMode: "contain" },
  tituloHeader: { fontSize: 22, fontWeight: "900", letterSpacing: 1, color: "#007A33", textAlign: "center" },
  headerSpace: { width: 38 },
  content: { flex: 1, padding: 20 },
  subtitulo: { fontSize: 14, color: "#555", marginBottom: 15 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#007A33", fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#666", fontSize: 15 },
  listContainer: { paddingBottom: 20 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardLocal: { fontSize: 16, fontWeight: "bold", color: "#007A33" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  cardDescricao: { fontSize: 14, color: "#333", marginBottom: 12, lineHeight: 20 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 8 },
  cardInfo: { fontSize: 12, color: "#666" },
  cardData: { fontSize: 12, color: "#888" },
  bold: { fontWeight: "bold", color: "#444" },

  // Estilos do Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 20, width: "100%", maxWidth: 350, padding: 20, alignItems: "center", elevation: 5 },
  modalTitulo: { fontSize: 18, fontWeight: "bold", color: "#007A33", marginBottom: 5 },
  modalSubtitulo: { fontSize: 14, color: "#666", marginBottom: 20, textAlign: "center" },
  statusBtn: { width: "100%", padding: 14, borderRadius: 12, alignItems: "center", marginBottom: 10 },
  statusBtnText: { fontSize: 15, fontWeight: "bold" },
  modalCancelar: { marginTop: 10, padding: 10 },
  modalCancelarText: { color: "#E53935", fontWeight: "bold", fontSize: 15 }
});