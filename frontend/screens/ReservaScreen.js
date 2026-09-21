import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";

import API_URL from "../services/api";

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}:00`;
};

export default function ReservaScreen({ navigation, route }) {

  // Usuário que fez login
  const usuario = route?.params?.usuario;

  const [nome, setNome] = useState(usuario?.nome || "");
  const [matricula, setMatricula] = useState(usuario?.matricula || "");

  const [tipo, setTipo] = useState("");
  const [recurso, setRecurso] = useState("");
  const [listaRecursos, setListaRecursos] = useState([]);

  const [tipoAberto, setTipoAberto] = useState(false);
  const [recursoAberto, setRecursoAberto] = useState(false);

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());

  const [showDate, setShowDate] = useState(false);
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

  const buscarRecursos = async (tipoSelecionado) => {
    try {
      const res = await fetch(
        `${API_URL}/recursos?tipo=${tipoSelecionado}`
      );

      const json = await res.json();

      setListaRecursos(json);

    } catch (err) {
      console.log("Erro ao buscar recursos:", err);
      alert("Não foi possível carregar os recursos.");
    }
  };

  const selecionarTipo = (tipoSelecionado) => {
    setTipo(tipoSelecionado);
    setRecurso("");
    setListaRecursos([]);

    setTipoAberto(false);
    setRecursoAberto(false);

    if (tipoSelecionado) {
      buscarRecursos(tipoSelecionado);
    }
  };

  const selecionarRecurso = (idRecurso) => {
    setRecurso(idRecurso);
    setRecursoAberto(false);
  };

  const nomeTipo = () => {
    if (!tipo) {
      return "Selecione o tipo";
    }

    return tipo;
  };

  const nomeRecurso = () => {
    if (!recurso) {
      return "Escolha o recurso";
    }

    const itemSelecionado = listaRecursos.find(
      (item) => item.idRecurso === recurso
    );

    return itemSelecionado?.nome || "Escolha o recurso";
  };

  const salvarReserva = async () => {
    try {

      if (!nome || !matricula || !tipo || !recurso) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      // Verifica se existe usuário logado
      if (!usuario?.idUsuario) {
        alert("Usuário não identificado. Faça login novamente.");
        return;
      }

      const payload = {
        responsavelNome: nome,
        responsavelMatricula: matricula,
        reservaData: data.toISOString().split("T")[0],
        horaRetirada: formatTime(horaInicio),
        horaDevolucao: formatTime(horaFim),

        // Usuário que realmente está logado
        idUsuario: usuario.idUsuario,

        idRecurso: recurso
      };

      const res = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Erro ao criar reserva");
        return;
      }

      alert("Reserva criada com sucesso!");

      navigation.goBack();

    } catch (err) {

      console.log("Erro ao salvar reserva:", err);

      alert("Erro ao salvar reserva");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >

        {/* HEADER */}

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

          <Text style={styles.logo}>
            SISLAB
          </Text>

          <View style={styles.headerSpace} />

        </View>

        {/* CONTEÚDO */}

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.title}>
            Fazer Reserva
          </Text>

          {/* NOME */}

          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
          />

          {/* MATRÍCULA */}

          <TextInput
            style={styles.input}
            placeholder="Matrícula"
            value={matricula}
            onChangeText={setMatricula}
          />

          {/* DATA */}

          {Platform.OS === "web" ? (

            <input
              type="date"
              value={data.toISOString().split("T")[0]}
              onChange={(e) => setData(new Date(e.target.value))}
              style={styles.webInput}
            />

          ) : (

            <>
              <Pressable
                style={styles.input}
                onPress={() => setShowDate(true)}
              >
                <Text style={styles.inputText}>
                  Data: {data.toLocaleDateString()}
                </Text>
              </Pressable>

              {showDate && (
                <DateTimePicker
                  value={data}
                  mode="date"
                  onChange={(e, selected) => {
                    setShowDate(false);

                    if (selected) {
                      setData(selected);
                    }
                  }}
                />
              )}
            </>

          )}

          {/* HORA INÍCIO */}

          {Platform.OS === "web" ? (

            <input
              type="time"
              value={horaInicio.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":");

                const d = new Date();

                d.setHours(h, m);

                setHoraInicio(d);
              }}
              style={styles.webInput}
            />

          ) : (

            <>
              <Pressable
                style={styles.input}
                onPress={() => setShowInicio(true)}
              >
                <Text style={styles.inputText}>
                  Início: {horaInicio.toTimeString().slice(0, 5)}
                </Text>
              </Pressable>

              {showInicio && (
                <DateTimePicker
                  value={horaInicio}
                  mode="time"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowInicio(false);

                    if (selected) {
                      setHoraInicio(selected);
                    }
                  }}
                />
              )}
            </>

          )}

          {/* HORA FIM */}

          {Platform.OS === "web" ? (

            <input
              type="time"
              value={horaFim.toTimeString().slice(0, 5)}
              onChange={(e) => {
                const [h, m] = e.target.value.split(":");

                const d = new Date();

                d.setHours(h, m);

                setHoraFim(d);
              }}
              style={styles.webInput}
            />

          ) : (

            <>
              <Pressable
                style={styles.input}
                onPress={() => setShowFim(true)}
              >
                <Text style={styles.inputText}>
                  Fim: {horaFim.toTimeString().slice(0, 5)}
                </Text>
              </Pressable>

              {showFim && (
                <DateTimePicker
                  value={horaFim}
                  mode="time"
                  is24Hour
                  onChange={(e, selected) => {
                    setShowFim(false);

                    if (selected) {
                      setHoraFim(selected);
                    }
                  }}
                />
              )}
            </>

          )}

          {/* TIPO DE RECURSO */}

          <Text style={styles.label}>
            Tipo de Recurso
          </Text>

          <View style={styles.dropdownContainer}>

            <Pressable
              style={styles.dropdown}
              onPress={() => {
                setTipoAberto(!tipoAberto);
                setRecursoAberto(false);
              }}
            >

              <Text
                style={[
                  styles.dropdownText,
                  !tipo && styles.placeholder
                ]}
              >
                {nomeTipo()}
              </Text>

              <Text style={styles.arrow}>
                {tipoAberto ? "▲" : "▼"}
              </Text>

            </Pressable>

            {tipoAberto && (
              <View style={styles.dropdownList}>

                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => selecionarTipo("Sala")}
                >
                  <Text style={styles.dropdownItemText}>
                    Sala
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => selecionarTipo("Laboratório")}
                >
                  <Text style={styles.dropdownItemText}>
                    Laboratório
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.dropdownItem}
                  onPress={() => selecionarTipo("Equipamento")}
                >
                  <Text style={styles.dropdownItemText}>
                    Equipamento
                  </Text>
                </Pressable>

              </View>
            )}

          </View>

          {/* RECURSO ESPECÍFICO */}

          {tipo !== "" && (

            <>
              <Text style={styles.label}>
                Recurso
              </Text>

              <View style={styles.dropdownContainer}>

                <Pressable
                  style={styles.dropdown}
                  onPress={() => {
                    setRecursoAberto(!recursoAberto);
                    setTipoAberto(false);
                  }}
                >

                  <Text
                    style={[
                      styles.dropdownText,
                      !recurso && styles.placeholder
                    ]}
                  >
                    {nomeRecurso()}
                  </Text>

                  <Text style={styles.arrow}>
                    {recursoAberto ? "▲" : "▼"}
                  </Text>

                </Pressable>

                {recursoAberto && (
                  <View style={styles.dropdownList}>

                    {listaRecursos.length === 0 ? (

                      <View style={styles.emptyItem}>
                        <Text style={styles.emptyText}>
                          Nenhum recurso disponível.
                        </Text>
                      </View>

                    ) : (

                      listaRecursos.map((item) => (

                        <Pressable
                          key={item.idRecurso}
                          style={styles.dropdownItem}
                          onPress={() =>
                            selecionarRecurso(item.idRecurso)
                          }
                        >

                          <Text style={styles.dropdownItemText}>
                            {item.nome}
                          </Text>

                        </Pressable>

                      ))

                    )}

                  </View>
                )}

              </View>
            </>

          )}

          {/* BOTÃO */}

          <Pressable
            style={styles.button}
            onPress={salvarReserva}
          >

            <Text style={styles.buttonText}>
              Reservar
            </Text>

          </Pressable>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },

  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },

  header: {
    height: 75,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start"
  },

  headerSpace: {
    width: 40
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

  scroll: {
    flex: 1
  },

  content: {
    padding: 30,
    paddingBottom: 60
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 20
  },

  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 50,
    justifyContent: "center"
  },

  inputText: {
    color: "#333"
  },

  webInput: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #ccc",
    backgroundColor: "#FFF",
    boxSizing: "border-box",
    width: "100%"
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 5,
    color: "#333"
  },

  dropdownContainer: {
    position: "relative",
    zIndex: 10,
    marginBottom: 15
  },

  dropdown: {
    backgroundColor: "#FFF",
    minHeight: 52,
    borderRadius: 12,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#DDD"
  },

  dropdownText: {
    fontSize: 16,
    color: "#333",
    flex: 1
  },

  placeholder: {
    color: "#777"
  },

  arrow: {
    fontSize: 14,
    color: "#007A33",
    marginLeft: 10
  },

  dropdownList: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#DDD",
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.15,
    shadowRadius: 4
  },

  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE"
  },

  dropdownItemText: {
    fontSize: 16,
    color: "#333"
  },

  emptyItem: {
    padding: 15
  },

  emptyText: {
    color: "#777"
  },

  button: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 10
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  }

});