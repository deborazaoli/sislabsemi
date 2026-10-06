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
  Alert
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import DateTimePicker from "@react-native-community/datetimepicker";

import API_URL from "../services/api";

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");

  return `${h}:${m}:00`;
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
  return (
    date.getHours() * 60 +
    date.getMinutes()
  );
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

  const nome = usuario?.nome || "";
  const matricula = usuario?.matricula || "";

  const [tipo, setTipo] = useState("");
  const [recurso, setRecurso] = useState("");
  const [listaRecursos, setListaRecursos] = useState([]);

  const [tipoAberto, setTipoAberto] = useState(false);
  const [recursoAberto, setRecursoAberto] = useState(false);

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(
    new Date(Date.now() + 60 * 60 * 1000)
  );

  const [showDate, setShowDate] = useState(false);
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

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
    if (!tipoSelecionado) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    const agora = new Date();

    const hoje = dataSemHora(agora);
    const dataConsulta = dataSemHora(dataSelecionada);

    /*
     * Não consulta o backend se a data já passou.
     */
    if (dataConsulta < hoje) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    const inicio = obterMinutosDoDia(
      inicioSelecionado
    );

    const fim = obterMinutosDoDia(
      fimSelecionado
    );

    /*
     * Não consulta o backend enquanto o horário
     * estiver inválido.
     */
    if (fim <= inicio) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    /*
     * A reserva precisa ter pelo menos 30 minutos.
     */
    if (fim - inicio < 30) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    try {
      const dataFormatada =
        formatDate(dataSelecionada);

      const horaRetirada =
        formatTime(inicioSelecionado);

      const horaDevolucao =
        formatTime(fimSelecionado);

      const url =
        `${API_URL}/recursos/disponiveis` +
        `?tipo=${encodeURIComponent(tipoSelecionado)}` +
        `&data=${encodeURIComponent(dataFormatada)}` +
        `&horaRetirada=${encodeURIComponent(horaRetirada)}` +
        `&horaDevolucao=${encodeURIComponent(horaDevolucao)}`;

      console.log(
        "Buscando recursos disponíveis:",
        url
      );

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

      /*
       * Se o usuário tinha escolhido um recurso
       * que deixou de estar disponível depois da
       * mudança de horário/data, remove a seleção.
       */
      if (
        recurso &&
        !recursos.some(
          (item) =>
            String(item.idRecurso) ===
            String(recurso)
        )
      ) {
        setRecurso("");
      }
    } catch (err) {
      console.log(
        "Erro ao buscar recursos disponíveis:",
        err
      );

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

    /*
     * Passa os valores atuais diretamente para a função
     * para não depender da atualização assíncrona do estado.
     */
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
      (item) =>
        String(item.idRecurso) === String(id)
    );

    return encontrado?.nome || "Selecione o recurso";
  };

  const validarReserva = () => {
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

    const minutosAgora =
      obterMinutosDoDia(agora);

    const minutosInicio =
      obterMinutosDoDia(horaInicio);

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
      (fim.getTime() - inicio.getTime()) /
      (1000 * 60);

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

      /*
       * Se outra pessoa acabou de reservar o recurso
       * enquanto esta tela estava aberta, o backend
       * retorna 409.
       */
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

      mostrarErro(
        "Reserva realizada",
        `Reserva criada com sucesso!\n\nCódigo: ${json.codigoReserva}`
      );

      navigation.goBack();
    } catch (err) {
      console.log(
        "Erro ao salvar reserva:",
        err
      );

      mostrarErro(
        "Erro",
        "Não foi possível salvar a reserva."
      );
    }
  };

  const alterarData = (event, selectedDate) => {
    setShowDate(false);

    if (selectedDate) {
      setData(selectedDate);

      setRecurso("");
      setListaRecursos([]);

      /*
       * Usa a nova data diretamente na consulta.
       */
      if (tipo) {
        buscarRecursosDisponiveis({
          tipoSelecionado: tipo,
          dataSelecionada: selectedDate,
          inicioSelecionado: horaInicio,
          fimSelecionado: horaFim
        });
      }
    }
  };

  const alterarHoraInicio = (
    event,
    selectedTime
  ) => {
    setShowInicio(false);

    if (selectedTime) {
      setHoraInicio(selectedTime);

      setRecurso("");
      setListaRecursos([]);

      /*
       * Usa o novo horário diretamente na consulta.
       */
      if (tipo) {
        buscarRecursosDisponiveis({
          tipoSelecionado: tipo,
          dataSelecionada: data,
          inicioSelecionado: selectedTime,
          fimSelecionado: horaFim
        });
      }
    }
  };

  const alterarHoraFim = (
    event,
    selectedTime
  ) => {
    setShowFim(false);

    if (selectedTime) {
      setHoraFim(selectedTime);

      setRecurso("");
      setListaRecursos([]);

      /*
       * Usa o novo horário diretamente na consulta.
       */
      if (tipo) {
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

  const horaInicioWeb = `${String(
    horaInicio.getHours()
  ).padStart(2, "0")}:${String(
    horaInicio.getMinutes()
  ).padStart(2, "0")}`;

  const horaFimWeb = `${String(
    horaFim.getHours()
  ).padStart(2, "0")}:${String(
    horaFim.getMinutes()
  ).padStart(2, "0")}`;

  const atualizarDataWeb = (event) => {
    const valor = event.target.value;

    if (!valor) return;

    const [ano, mes, dia] = valor
      .split("-")
      .map(Number);

    const novaData = new Date(
      ano,
      mes - 1,
      dia,
      data.getHours(),
      data.getMinutes()
    );

    setData(novaData);

    setRecurso("");
    setListaRecursos([]);

    /*
     * Atualiza os recursos imediatamente usando
     * a nova data.
     */
    if (tipo) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: novaData,
        inicioSelecionado: horaInicio,
        fimSelecionado: horaFim
      });
    }
  };

  const atualizarHoraInicioWeb = (event) => {
    const valor = event.target.value;

    if (!valor) return;

    const [hora, minuto] = valor
      .split(":")
      .map(Number);

    const novaHora = new Date(horaInicio);

    novaHora.setHours(hora);
    novaHora.setMinutes(minuto);
    novaHora.setSeconds(0);
    novaHora.setMilliseconds(0);

    setHoraInicio(novaHora);

    setRecurso("");
    setListaRecursos([]);

    /*
     * Atualiza os recursos imediatamente usando
     * o novo horário.
     */
    if (tipo) {
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

    if (!valor) return;

    const [hora, minuto] = valor
      .split(":")
      .map(Number);

    const novaHora = new Date(horaFim);

    novaHora.setHours(hora);
    novaHora.setMinutes(minuto);
    novaHora.setSeconds(0);
    novaHora.setMilliseconds(0);

    setHoraFim(novaHora);

    setRecurso("");
    setListaRecursos([]);

    /*
     * Atualiza os recursos imediatamente usando
     * o novo horário.
     */
    if (tipo) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: data,
        inicioSelecionado: horaInicio,
        fimSelecionado: novaHora
      });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
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
          <Text style={styles.title}>
            Fazer Reserva
          </Text>

          <Text style={styles.label}>
            Nome do responsável
          </Text>

          <View style={styles.inputBloqueado}>
            <Text style={styles.inputBloqueadoTexto}>
              {nome}
            </Text>
          </View>

          <Text style={styles.label}>
            Matrícula
          </Text>

          <View style={styles.inputBloqueado}>
            <Text style={styles.inputBloqueadoTexto}>
              {matricula}
            </Text>
          </View>

          <Text style={styles.label}>
            Data de reserva
          </Text>

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
              <Text style={styles.label}>
                Hora de retirada
              </Text>

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
                    <Text style={styles.inputText}>
                      {horaInicioWeb}
                    </Text>
                  </Pressable>

                  {showInicio && (
                    <DateTimePicker
                      value={horaInicio}
                      mode="time"
                      display="default"
                      onChange={alterarHoraInicio}
                    />
                  )}
                </>
              )}
            </View>

            <View style={styles.horarioColuna}>
              <Text style={styles.label}>
                Hora de devolução
              </Text>

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
                    <Text style={styles.inputText}>
                      {horaFimWeb}
                    </Text>
                  </Pressable>

                  {showFim && (
                    <DateTimePicker
                      value={horaFim}
                      mode="time"
                      display="default"
                      onChange={alterarHoraFim}
                    />
                  )}
                </>
              )}
            </View>
          </View>

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
              <Text style={styles.dropdownText}>
                {nomeTipo(tipo)}
              </Text>

              <Text style={styles.arrow}>
                {tipoAberto ? "▲" : "▼"}
              </Text>
            </Pressable>

            {tipoAberto && (
              <View style={styles.dropdownList}>
                {[
                  "Sala",
                  "Laboratório",
                  "Equipamento"
                ].map((item) => (
                  <Pressable
                    key={item}
                    style={styles.dropdownItem}
                    onPress={() =>
                      selecionarTipo(item)
                    }
                  >
                    <Text style={styles.dropdownItemText}>
                      {item}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <Text style={styles.label}>
            Recurso
          </Text>

          <View style={styles.dropdownContainer}>
            <Pressable
              style={styles.dropdown}
              onPress={() => {
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
                        selecionarRecurso(
                          item.idRecurso
                        )
                      }
                    >
                      <Text
                        style={
                          styles.dropdownItemText
                        }
                      >
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

  label: {
    fontWeight: "bold",
    marginBottom: 5,
    marginTop: 2,
    color: "#333"
  },

  inputBloqueado: {
    backgroundColor: "#F1F3F2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    minHeight: 50,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8DDD9"
  },

  inputBloqueadoTexto: {
    fontSize: 16,
    color: "#444"
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
  }
});