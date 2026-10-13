import React, { useState } from "react";

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Modal
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import DateTimePicker from "@react-native-community/datetimepicker";

import API_URL from "../services/api";

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");

  return `${h}:${m}:00`;
};

const formatTimeCurto = (date) => {
  if (!date) return "";

  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");

  return `${h}:${m}`;
};

const formatDate = (date) => {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
};

const dataSemHora = (date) => {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
};

const obterMinutosDoDia = (date) => {
  return date.getHours() * 60 + date.getMinutes();
};

const mostrarErro = (titulo, mensagem) => {
  if (Platform.OS === "web") {
    window.alert(`${titulo}\n\n${mensagem}`);
  } else {
    Alert.alert(titulo, mensagem);
  }
};

export default function ReservaScreen({ navigation, route }) {
  const usuario = route?.params?.usuario;

  // Continuam sendo usados no envio da reserva, mas não aparecem mais no formulário
  const nome = usuario?.nome || "";
  const matricula = usuario?.matricula || "";

  const [tipo, setTipo] = useState("");
  const [recurso, setRecurso] = useState("");
  const [listaRecursos, setListaRecursos] = useState([]);

  const [tipoAberto, setTipoAberto] = useState(false);
  const [recursoAberto, setRecursoAberto] = useState(false);

  const [data, setData] = useState(new Date());

  // Início e fim começam vazios para o usuário escolher
  const [horaInicio, setHoraInicio] = useState(null);
  const [horaFim, setHoraFim] = useState(null);

  const [showDate, setShowDate] = useState(false);
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

  // Detalhes da reserva recém-criada (abre a lista/modal)
  const [reservaCriada, setReservaCriada] = useState(null);

  const horariosSelecionados = () => !!horaInicio && !!horaFim;

  /*
   * Impede escolher tipo/recurso antes de selecionar os horários.
   */
  const exigirHorarios = () => {
    if (!horariosSelecionados()) {
      mostrarErro(
        "Horário não selecionado",
        "Selecione o horário de início e fim antes de escolher o tipo de reserva e o recurso."
      );

      return false;
    }

    return true;
  };

  /*
   * Mostra alerta se o intervalo for inválido (fim antes/igual ao início
   * ou duração menor que 30 minutos). Retorna true se houver erro.
   */
  const alertarIntervaloInvalido = (inicio, fim) => {
    if (!inicio || !fim) return false;

    const minutosInicio = obterMinutosDoDia(inicio);
    const minutosFim = obterMinutosDoDia(fim);

    if (minutosFim <= minutosInicio) {
      mostrarErro(
        "Horário inválido",
        "A hora de fim deve ser depois da hora de início."
      );

      return true;
    }

    if (minutosFim - minutosInicio < 30) {
      mostrarErro(
        "Duração inválida",
        "A reserva deve ter duração mínima de 30 minutos."
      );

      return true;
    }

    return false;
  };

  /*
   * Busca somente os recursos que estão disponíveis
   * para o tipo, data e intervalo de horário selecionados.
   */
  const buscarRecursosDisponiveis = async ({
    tipoSelecionado = tipo,
    dataSelecionada = data,
    inicioSelecionado = horaInicio,
    fimSelecionado = horaFim
  } = {}) => {
    if (!tipoSelecionado || !inicioSelecionado || !fimSelecionado) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    const agora = new Date();

    const hoje = dataSemHora(agora);
    const dataConsulta = dataSemHora(dataSelecionada);

    if (dataConsulta < hoje) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    const inicio = obterMinutosDoDia(inicioSelecionado);
    const fim = obterMinutosDoDia(fimSelecionado);

    if (fim <= inicio) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    if (fim - inicio < 30) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    try {
      const dataFormatada = formatDate(dataSelecionada);
      const horaRetirada = formatTime(inicioSelecionado);
      const horaDevolucao = formatTime(fimSelecionado);

      const url =
        `${API_URL}/recursos/disponiveis` +
        `?tipo=${encodeURIComponent(tipoSelecionado)}` +
        `&data=${encodeURIComponent(dataFormatada)}` +
        `&horaRetirada=${encodeURIComponent(horaRetirada)}` +
        `&horaDevolucao=${encodeURIComponent(horaDevolucao)}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(
          json.message ||
            json.erro ||
            json.mensagem ||
            "Não foi possível carregar os recursos."
        );
      }

      const recursos = Array.isArray(json)
        ? json
        : json.recursos || [];

      setListaRecursos(recursos);

      if (
        recurso &&
        !recursos.some(
          (item) => String(item.idRecurso) === String(recurso)
        )
      ) {
        setRecurso("");
      }
    } catch (err) {
      console.log("Erro ao buscar recursos disponíveis:", err);

      setListaRecursos([]);
      setRecurso("");

      mostrarErro(
        "Erro",
        "Não foi possível carregar os recursos disponíveis."
      );
    }
  };

  const selecionarTipo = (valor) => {
    setTipo(valor);
    setRecurso("");
    setListaRecursos([]);

    setTipoAberto(false);
    setRecursoAberto(false);

    buscarRecursosDisponiveis({
      tipoSelecionado: valor,
      dataSelecionada: data,
      inicioSelecionado: horaInicio,
      fimSelecionado: horaFim
    });
  };

  const selecionarRecurso = (valor) => {
    setRecurso(valor);
    setRecursoAberto(false);
  };

  const nomeTipo = (valor) => {
    if (valor === "Sala") return "Sala";
    if (valor === "Laboratório") return "Laboratório";
    if (valor === "Equipamento") return "Equipamento";

    return "Selecione o tipo de recurso";
  };

  const nomeRecurso = (id) => {
    const encontrado = listaRecursos.find(
      (item) => String(item.idRecurso) === String(id)
    );

    return encontrado?.nome || "Selecione o recurso";
  };

  const validarReserva = () => {
    if (!horariosSelecionados()) {
      mostrarErro(
        "Horário não selecionado",
        "Selecione o horário de início e fim da reserva."
      );

      return false;
    }

    const agora = new Date();

    const hoje = dataSemHora(agora);
    const dataSelecionada = dataSemHora(data);

    if (dataSelecionada < hoje) {
      mostrarErro(
        "Data inválida",
        "Não é possível fazer uma reserva para uma data passada."
      );

      return false;
    }

    const inicio = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      horaInicio.getHours(),
      horaInicio.getMinutes(),
      0
    );

    const fim = new Date(
      data.getFullYear(),
      data.getMonth(),
      data.getDate(),
      horaFim.getHours(),
      horaFim.getMinutes(),
      0
    );

    const minutosAgora = obterMinutosDoDia(agora);
    const minutosInicio = obterMinutosDoDia(horaInicio);

    if (
      dataSelecionada.getTime() === hoje.getTime() &&
      minutosInicio < minutosAgora
    ) {
      mostrarErro(
        "Horário inválido",
        "A hora de retirada já passou. Escolha o horário atual ou um horário futuro."
      );

      return false;
    }

    if (fim <= inicio) {
      mostrarErro(
        "Horário inválido",
        "A hora de devolução deve ser depois da hora de retirada."
      );

      return false;
    }

    const duracaoMinutos =
      (fim.getTime() - inicio.getTime()) / (1000 * 60);

    if (duracaoMinutos < 30) {
      mostrarErro(
        "Duração inválida",
        "A reserva deve ter duração mínima de 30 minutos."
      );

      return false;
    }

    return true;
  };

  const salvarReserva = async () => {
    if (!nome || !matricula || !tipo || !recurso) {
      mostrarErro(
        "Campos obrigatórios",
        "Preencha todos os campos obrigatórios."
      );

      return;
    }

    if (!usuario?.idUsuario) {
      mostrarErro(
        "Usuário não identificado",
        "Faça login novamente para realizar uma reserva."
      );

      return;
    }

    if (!validarReserva()) {
      return;
    }

    try {
      const payload = {
        responsavelNome: nome,
        responsavelMatricula: matricula,
        reservaData: formatDate(data),
        horaRetirada: formatTime(horaInicio),
        horaDevolucao: formatTime(horaFim),
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

      if (res.status === 409) {
        setRecurso("");

        await buscarRecursosDisponiveis();

        mostrarErro(
          "Recurso indisponível",
          json.message ||
            json.mensagem ||
            "Esse recurso acabou de ser reservado por outra pessoa para esse horário. A lista foi atualizada."
        );

        return;
      }

      if (!res.ok) {
        mostrarErro(
          "Não foi possível realizar a reserva",
          json.message ||
            json.mensagem ||
            "Ocorreu um erro ao criar a reserva."
        );

        return;
      }

      // Monta a lista com os detalhes da reserva recém-feita
      setReservaCriada({
        codigo: json.codigoReserva,
        tipo,
        recurso: nomeRecurso(recurso),
        data: data.toLocaleDateString("pt-BR"),
        inicio: formatTimeCurto(horaInicio),
        fim: formatTimeCurto(horaFim),
        responsavel: nome,
        matricula
      });
    } catch (err) {
      console.log("Erro ao salvar reserva:", err);

      mostrarErro("Erro", "Não foi possível salvar a reserva.");
    }
  };

  const fecharDetalhes = () => {
    setReservaCriada(null);

    // Ajuste o nome da rota caso sua tela inicial tenha outro nome
    navigation.navigate("Home", { usuario });
  };

  const limparSelecaoRecurso = () => {
    setRecurso("");
    setListaRecursos([]);
    setRecursoAberto(false);
  };

  const alterarData = (event, selectedDate) => {
    setShowDate(false);

    if (selectedDate) {
      setData(selectedDate);
      limparSelecaoRecurso();

      if (tipo && horariosSelecionados()) {
        buscarRecursosDisponiveis({
          tipoSelecionado: tipo,
          dataSelecionada: selectedDate,
          inicioSelecionado: horaInicio,
          fimSelecionado: horaFim
        });
      }
    }
  };

  const alterarHoraInicio = (event, selectedTime) => {
    setShowInicio(false);

    if (selectedTime) {
      setHoraInicio(selectedTime);
      limparSelecaoRecurso();

      if (tipo && horaFim) {
        buscarRecursosDisponiveis({
          tipoSelecionado: tipo,
          dataSelecionada: data,
          inicioSelecionado: selectedTime,
          fimSelecionado: horaFim
        });
      }
    }
  };

  const alterarHoraFim = (event, selectedTime) => {
    setShowFim(false);

    if (selectedTime) {
      setHoraFim(selectedTime);
      limparSelecaoRecurso();

      if (alertarIntervaloInvalido(horaInicio, selectedTime)) return;

      if (tipo && horaInicio) {
        buscarRecursosDisponiveis({
          tipoSelecionado: tipo,
          dataSelecionada: data,
          inicioSelecionado: horaInicio,
          fimSelecionado: selectedTime
        });
      }
    }
  };

  const dataWeb = formatDate(data);
  const horaInicioWeb = formatTimeCurto(horaInicio);
  const horaFimWeb = formatTimeCurto(horaFim);

  const atualizarDataWeb = (event) => {
    const valor = event.target.value;

    if (!valor) return;

    const [ano, mes, dia] = valor.split("-").map(Number);

    const novaData = new Date(ano, mes - 1, dia);

    setData(novaData);
    limparSelecaoRecurso();

    if (tipo && horariosSelecionados()) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: novaData,
        inicioSelecionado: horaInicio,
        fimSelecionado: horaFim
      });
    }
  };

  const criarHoraWeb = (valor) => {
    const [hora, minuto] = valor.split(":").map(Number);

    const novaHora = new Date();

    novaHora.setHours(hora);
    novaHora.setMinutes(minuto);
    novaHora.setSeconds(0);
    novaHora.setMilliseconds(0);

    return novaHora;
  };

  const atualizarHoraInicioWeb = (event) => {
    const valor = event.target.value;

    // Campo limpo pelo usuário
    if (!valor) {
      setHoraInicio(null);
      limparSelecaoRecurso();
      return;
    }

    const novaHora = criarHoraWeb(valor);

    setHoraInicio(novaHora);
    limparSelecaoRecurso();

    if (tipo && horaFim) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: data,
        inicioSelecionado: novaHora,
        fimSelecionado: horaFim
      });
    }
  };

  const atualizarHoraFimWeb = (event) => {
    const valor = event.target.value;

    if (!valor) {
      setHoraFim(null);
      limparSelecaoRecurso();
      return;
    }

    const novaHora = criarHoraWeb(valor);

    setHoraFim(novaHora);
    limparSelecaoRecurso();

    if (alertarIntervaloInvalido(horaInicio, novaHora)) return;

    if (tipo && horaInicio) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: data,
        inicioSelecionado: horaInicio,
        fimSelecionado: novaHora
      });
    }
  };

  
  const detalhes = reservaCriada
    ? [
        [
          { rotulo: "Recurso", valor: reservaCriada.recurso },
          { rotulo: "Tipo", valor: reservaCriada.tipo },
        ],
        [
          { rotulo: "Data", valor: reservaCriada.data },
          { rotulo: "Código da reserva", valor: reservaCriada.codigo },
        ],
        [
          { rotulo: "Início", valor: reservaCriada.inicio },
          { rotulo: "Fim", valor: reservaCriada.fim },
        ],
        [
          { rotulo: "Responsável", valor: reservaCriada.responsavel },
        ],
        [
          { rotulo: "Matrícula", valor: reservaCriada.matricula },
        ],
      ]
    : [];


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Image
              source={require("../assets/seta.png")}
              style={styles.backIcon}
            />
          </Pressable>

          <Text style={styles.logo}>SISLAB</Text>

          <View style={styles.headerSpace} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Fazer Reserva</Text>

          <Text style={styles.label}>Data de reserva</Text>

          {Platform.OS === "web" ? (
            <View style={styles.webInputContainer}>
              <input
                type="date"
                value={dataWeb}
                min={formatDate(new Date())}
                onChange={atualizarDataWeb}
                style={styles.webInput}
              />
            </View>
          ) : (
            <>
              <Pressable
                style={styles.inputCompact}
                onPress={() => setShowDate(true)}
              >
                <Text style={styles.inputText}>
                  {data.toLocaleDateString("pt-BR")}
                </Text>
              </Pressable>

              {showDate && (
                <DateTimePicker
                  value={data}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={alterarData}
                />
              )}
            </>
          )}

          <View style={styles.horariosContainer}>
            <View style={styles.horarioColuna}>
              <Text style={styles.label}>Início</Text>

              {Platform.OS === "web" ? (
                <View style={styles.webInputContainer}>
                  <input
                    type="time"
                    value={horaInicioWeb}
                    onChange={atualizarHoraInicioWeb}
                    style={styles.webInput}
                  />
                </View>
              ) : (
                <>
                  <Pressable
                    style={styles.inputCompact}
                    onPress={() => setShowInicio(true)}
                  >
                    <Text
                      style={
                        horaInicio
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {horaInicio ? horaInicioWeb : "Selecione"}
                    </Text>
                  </Pressable>

                  {showInicio && (
                    <DateTimePicker
                      value={horaInicio || new Date()}
                      mode="time"
                      display="default"
                      onChange={alterarHoraInicio}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.horarioColuna}>
              <Text style={styles.label}>Fim</Text>

              {Platform.OS === "web" ? (
                <View style={styles.webInputContainer}>
                  <input
                    type="time"
                    value={horaFimWeb}
                    onChange={atualizarHoraFimWeb}
                    style={styles.webInput}
                  />
                </View>
              ) : (
                <>
                  <Pressable
                    style={styles.inputCompact}
                    onPress={() => setShowFim(true)}
                  >
                    <Text
                      style={
                        horaFim
                          ? styles.inputText
                          : styles.placeholderText
                      }
                    >
                      {horaFim ? horaFimWeb : "Selecione"}
                    </Text>
                  </Pressable>

                  {showFim && (
                    <DateTimePicker
                      value={horaFim || new Date()}
                      mode="time"
                      display="default"
                      onChange={alterarHoraFim}
                    />
                  )}
                </>
              )}
            </View>
          </View>

          <Text style={styles.label}>Tipo de reserva</Text>

          <View style={styles.dropdownContainer}>
            <Pressable
              style={styles.dropdown}
              onPress={() => {
                if (!exigirHorarios()) return;

                setTipoAberto(!tipoAberto);
                setRecursoAberto(false);
              }}
            >
              <Text style={styles.dropdownText}>
                {nomeTipo(tipo)}
              </Text>

              <Text style={styles.arrow}>
                {tipoAberto ? "▲" : "▼"}
              </Text>
            </Pressable>

            {tipoAberto && (
              <View style={styles.dropdownList}>
                {["Sala", "Laboratório", "Equipamento"].map(
                  (item) => (
                    <Pressable
                      key={item}
                      style={styles.dropdownItem}
                      onPress={() => selecionarTipo(item)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {item}
                      </Text>
                    </Pressable>
                  )
                )}
              </View>
            )}
          </View>

          <Text style={styles.label}>Recurso</Text>

          <View style={styles.dropdownContainer}>
            <Pressable
              style={styles.dropdown}
              onPress={() => {
                if (!exigirHorarios()) return;

                if (alertarIntervaloInvalido(horaInicio, horaFim)) return;

                if (listaRecursos.length > 0) {
                  setRecursoAberto(!recursoAberto);
                  setTipoAberto(false);
                }
              }}
            >
              <Text style={styles.dropdownText}>
                {recurso
                  ? nomeRecurso(recurso)
                  : "Selecione o recurso"}
              </Text>

              <Text style={styles.arrow}>
                {recursoAberto ? "▲" : "▼"}
              </Text>
            </Pressable>

            {recursoAberto && (
              <View style={styles.dropdownList}>
                {listaRecursos.length > 0 ? (
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
                ) : (
                  <View style={styles.emptyItem}>
                    <Text style={styles.emptyText}>
                      Nenhum recurso disponível.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Pressable style={styles.button} onPress={salvarReserva}>
            <Text style={styles.buttonText}>Reservar</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={!!reservaCriada}
        transparent
        animationType="fade"
        onRequestClose={fecharDetalhes}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              Reserva realizada!
            </Text>

            <ScrollView>
              
  {detalhes.map((linha, index) => (
    <View key={index} style={styles.detalheLinha}>
      {linha.map((item) => (
        <View key={item.rotulo} style={styles.detalheColuna}>
          <Text style={styles.detalheRotulo}>
            {item.rotulo}
          </Text>
          <Text style={styles.detalheValor}>
            {item.valor}
          </Text>
        </View>
      ))}
    </View>
  ))}

            </ScrollView>

            <Pressable
              style={styles.button}
              onPress={fecharDetalhes}
            >
              <Text style={styles.buttonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 2,
    color: "#333"
  },

  inputCompact: {
    backgroundColor: "#FFF",
    padding: 13,
    borderRadius: 12,
    marginBottom: 8,
    minHeight: 48,
    justifyContent: "center"
  },

  inputText: {
    color: "#333",
    fontSize: 16
  },

  placeholderText: {
    color: "#999",
    fontSize: 16
  },

  webInputContainer: {
    width: "100%",
    marginBottom: 8
  },

  webInput: {
    padding: 13,
    marginBottom: 0,
    borderRadius: 12,
    border: "1px solid #ccc",
    backgroundColor: "#FFF",
    boxSizing: "border-box",
    width: "100%",
    minHeight: 48,
    fontSize: 16,
    color: "#333"
  },

  horariosContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 5
  },

  horarioColuna: {
    flex: 1,
    minWidth: 0
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
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24
  },

  modalCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    maxHeight: "85%"
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 16,
    textAlign: "center"
  },
  
  detalheLinha: {
  flexDirection: "row",
  gap: 16,
  paddingVertical: 10,
},

detalheColuna: {
  flex: 1,
  minWidth: 0,
},

detalheRotulo: {
  fontSize: 13,
  color: "#777",
  marginBottom: 2,
},

detalheValor: {
  fontSize: 16,
  fontWeight: "bold",
  color: "#333",
},
});