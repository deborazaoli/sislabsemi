import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL from "../services/api";

// Lista pré-definida de problemas comuns
const PROBLEMAS_COMUNS = [
  "Ar-condicionado quebrado / não gela",
  "Janela emperrada",
  "Persiana quebrada",
  "Porta emperrada / não fecha",
  "Lâmpada queimada / problema na luz",
  "Tomada não funciona",
  "Projetor / Quadro com defeito",
  "Cadeira / Mesa quebrada",
  "Outro problema"
];

export default function RelatarProblemaScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};

  const [tipoRecurso, setTipoRecurso] = useState("sala"); // "sala" ou "laboratorio"
  
  const [recursosList, setRecursosList] = useState([]);
  const [carregandoRecursos, setCarregandoRecursos] = useState(false);
  const [recursoSelecionado, setRecursoSelecionado] = useState(null);

  const [problemaSelecionado, setProblemaSelecionado] = useState("");
  const [observacaoExtra, setObservacaoExtra] = useState("");

  const [modalLocalVisivel, setModalLocalVisivel] = useState(false);
  const [modalProblemaVisivel, setModalProblemaVisivel] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregarRecursosDoBackend();
  }, [tipoRecurso]);

  const carregarRecursosDoBackend = async () => {
    try {
      setCarregandoRecursos(true);
      setRecursoSelecionado(null); // Reseta a seleção ao trocar de tipo

      const res = await fetch(`${API_URL}/recursos?tipo=${tipoRecurso}`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setRecursosList(data);
      } else {
        setRecursosList([]);
      }
    } catch (error) {
      console.log("Erro ao carregar recursos:", error);
      setRecursosList([]);
    } finally {
      setCarregandoRecursos(false);
    }
  };

  const enviarRelato = async () => {
    if (!recursoSelecionado || !problemaSelecionado.trim()) {
      Alert.alert("Campos obrigatórios", "Por favor, selecione o local e o problema.");
      return;
    }

    try {
      setEnviando(true);

      const descricaoFinal = observacaoExtra.trim() 
        ? `${problemaSelecionado} - Obs: ${observacaoExtra.trim()}`
        : problemaSelecionado;

      const payload = {
        idUsuario: usuario.idUsuario || null,
        responsavelNome: usuario.nome || "Anônimo",
        tipoRecurso: tipoRecurso === "sala" ? "Sala" : "Laboratório",
        nomeRecurso: recursoSelecionado.nome,
        idRecurso: recursoSelecionado.idRecurso,
        descricao: descricaoFinal
      };

      // REQUISIÇÃO REAL PARA O BACKEND
      const res = await fetch(`${API_URL}/problemas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Erro ao enviar relato");
      }

      Alert.alert(
        "Problema relatado!",
        "Obrigado por avisar. O seu relato foi enviado com sucesso para a direção.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.log("Erro ao enviar problema:", error);
      Alert.alert("Erro", error.message || "Não foi possível enviar o relato no momento. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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

          <Text style={styles.tituloHeader}>Relatar Problema</Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.label}>Onde está o problema?</Text>
          <View style={styles.tipoContainer}>
            <Pressable
              style={[
                styles.tipoBotao,
                tipoRecurso === "sala" && styles.tipoBotaoAtivo
              ]}
              onPress={() => setTipoRecurso("sala")}
            >
              <Text
                style={[
                  styles.tipoTexto,
                  tipoRecurso === "sala" && styles.tipoTextoAtivo
                ]}
              >
                Sala
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.tipoBotao,
                tipoRecurso === "laboratorio" && styles.tipoBotaoAtivo
              ]}
              onPress={() => setTipoRecurso("laboratorio")}
            >
              <Text
                style={[
                  styles.tipoTexto,
                  tipoRecurso === "laboratorio" && styles.tipoTextoAtivo
                ]}
              >
                Laboratório
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Selecione o Local</Text>
          <Pressable
            style={styles.dropdownSelector}
            onPress={() => setModalLocalVisivel(true)}
          >
            {carregandoRecursos ? (
              <ActivityIndicator size="small" color="#007A33" />
            ) : (
              <Text style={[styles.dropdownText, !recursoSelecionado && { color: "#888" }]}>
                {recursoSelecionado ? recursoSelecionado.nome : `Toque para escolher a ${tipoRecurso}...`}
              </Text>
            )}
            <Text style={styles.dropdownIcon}>▼</Text>
          </Pressable>
        
          <Text style={styles.label}>Qual é o problema?</Text>
          <Pressable
            style={styles.dropdownSelector}
            onPress={() => setModalProblemaVisivel(true)}
          >
            <Text style={[styles.dropdownText, !problemaSelecionado && { color: "#888" }]}>
              {problemaSelecionado || "Selecione o problema na lista..."}
            </Text>
            <Text style={styles.dropdownIcon}>▼</Text>
          </Pressable>

          {/* DETALHES ADICIONAIS (OPCIONAL) */}
          <Text style={styles.label}>Detalhes Adicionais (Opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Fica na parede do fundo..."
            placeholderTextColor="#888"
            value={observacaoExtra}
            onChangeText={setObservacaoExtra}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* BOTÃO ENVIAR */}
          <Pressable
            style={[styles.btnEnviar, enviando && { opacity: 0.7 }]}
            onPress={enviarRelato}
            disabled={enviando}
          >
            <Text style={styles.btnEnviarTexto}>
              {enviando ? "Enviando..." : "Enviar Relato"}
            </Text>
          </Pressable>

        </ScrollView>
    
        <Modal
          visible={modalLocalVisivel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalLocalVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Selecione o Local</Text>
                <Pressable onPress={() => setModalLocalVisivel(false)}>
                  <Text style={styles.modalFechar}>✕</Text>
                </Pressable>
              </View>

              {recursosList.length === 0 ? (
                <Text style={styles.modalVazio}>Nenhum(a) {tipoRecurso} cadastrado(a).</Text>
              ) : (
                <FlatList
                  data={recursosList}
                  keyExtractor={(item) => String(item.idRecurso)}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.modalItem}
                      onPress={() => {
                        setRecursoSelecionado(item);
                        setModalLocalVisivel(false);
                      }}
                    >
                      <Text style={[
                        styles.modalItemText,
                        recursoSelecionado?.idRecurso === item.idRecurso && styles.modalItemTextAtivo
                      ]}>
                        {item.nome}
                      </Text>
                      {item.localizacao ? (
                        <Text style={styles.modalItemSub}>{item.localizacao}</Text>
                      ) : null}
                    </Pressable>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>

        {/* MODAL 2: LISTA DE PROBLEMAS PADRÃO */}
        <Modal
          visible={modalProblemaVisivel}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalProblemaVisivel(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Selecione o Problema</Text>
                <Pressable onPress={() => setModalProblemaVisivel(false)}>
                  <Text style={styles.modalFechar}>✕</Text>
                </Pressable>
              </View>

              <FlatList
                data={PROBLEMAS_COMUNS}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.modalItem}
                    onPress={() => {
                      setProblemaSelecionado(item);
                      setModalProblemaVisivel(false);
                    }}
                  >
                    <Text style={[
                      styles.modalItemText,
                      problemaSelecionado === item && styles.modalItemTextAtivo
                    ]}>
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>

      </KeyboardAvoidingView>
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

  backButton: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-start",
    zIndex: 2,
  },

  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain"
  },

  tituloHeader: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#007A33",
    textAlign: "center"
  },

  headerSpace: {
    width: 38
  },

  content: {
    padding: 20,
    paddingBottom: 40
  },

  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#006633",
    marginBottom: 8,
    marginTop: 10
  },

  tipoContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10
  },

  tipoBotao: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#A6E4CF"
  },

  tipoBotaoAtivo: {
    backgroundColor: "#007A33",
    borderColor: "#007A33"
  },

  tipoTexto: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#007A33"
  },

  tipoTextoAtivo: {
    color: "#FFF"
  },

  dropdownSelector: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D5EEE3",
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    minHeight: 50
  },

  dropdownText: {
    fontSize: 15,
    color: "#333"
  },

  dropdownIcon: {
    fontSize: 12,
    color: "#007A33",
    fontWeight: "bold"
  },

  input: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D5EEE3",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#333",
    marginBottom: 5
  },

  textArea: {
    height: 90,
    paddingTop: 12
  },

  btnEnviar: {
    backgroundColor: "#007A33",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    marginTop: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  btnEnviarTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },

  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    width: "100%",
    maxHeight: "70%",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10
  },

  modalTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007A33"
  },

  modalFechar: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666",
    paddingHorizontal: 5
  },

  modalVazio: {
    textAlign: "center",
    color: "#777",
    paddingVertical: 20,
    fontSize: 14
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },

  modalItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "500"
  },

  modalItemSub: {
    fontSize: 12,
    color: "#777",
    marginTop: 2
  },

  modalItemTextAtivo: {
    fontWeight: "bold",
    color: "#007A33"
  }
});