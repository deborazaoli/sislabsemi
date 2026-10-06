import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useWindowDimensions } from "react-native";

const API_URL = "http://localhost:3000";

export default function ReservaScreen({ navigation, route }) {
  const { width } = useWindowDimensions();

  const usuario = route?.params?.usuario || {};

  const nome =
    usuario.nome ||
    usuario.nomeUsuario ||
    usuario.nomeCompleto ||
    "";

  const matricula =
    usuario.matricula ||
    usuario.idUsuario ||
    "";

  const [tipo, setTipo] = useState("");
  const [recurso, setRecurso] = useState("");

  const [listaRecursos, setListaRecursos] = useState([]);

  const [mostrarTipos, setMostrarTipos] = useState(false);
  const [mostrarRecursos, setMostrarRecursos] = useState(false);

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + 30);
    agora.setSeconds(0);
    agora.setMilliseconds(0);
    return agora;
  });

  const [horaFim, setHoraFim] = useState(() => {
    const agora = new Date();
    agora.setMinutes(agora.getMinutes() + 90);
    agora.setSeconds(0);
    agora.setMilliseconds(0);
    return agora;
  });

  const [mostrarData, setMostrarData] = useState(false);
  const [mostrarHoraInicio, setMostrarHoraInicio] = useState(false);
  const [mostrarHoraFim, setMostrarHoraFim] = useState(false);

  const [carregandoRecursos, setCarregandoRecursos] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const tipos = [
    {
      valor: "Sala",
      label: "Sala",
    },
    {
      valor: "Laboratório",
      label: "Laboratório",
    },
    {
      valor: "Equipamento",
      label: "Equipamento",
    },
  ];

  function mostrarAlerta(titulo, mensagem) {
    if (Platform.OS === "web") {
      window.alert(`${titulo}\n\n${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  function formatDate(date) {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const dia = String(date.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
  }

  function formatDateBR(date) {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  function formatTime(date) {
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}:00`;
  }

  function formatTimeBR(date) {
    const horas = String(date.getHours()).padStart(2, "0");
    const minutos = String(date.getMinutes()).padStart(2, "0");

    return `${horas}:${minutos}`;
  }

  function converterMinutos(date) {
    return date.getHours() * 60 + date.getMinutes();
  }

  function mesmoDiaHoje(date) {
    const hoje = new Date();

    return (
      date.getFullYear() === hoje.getFullYear() &&
      date.getMonth() === hoje.getMonth() &&
      date.getDate() === hoje.getDate()
    );
  }

  function dataAnteriorHoje(date) {
    const hoje = new Date();

    const dataComparacao = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    const hojeComparacao = new Date(
      hoje.getFullYear(),
      hoje.getMonth(),
      hoje.getDate()
    );

    return dataComparacao < hojeComparacao;
  }

  function intervaloValido(inicio, fim) {
    const inicioMinutos = converterMinutos(inicio);
    const fimMinutos = converterMinutos(fim);

    if (fimMinutos <= inicioMinutos) {
      return false;
    }

    const duracao = fimMinutos - inicioMinutos;

    return duracao >= 30;
  }

  async function buscarRecursosDisponiveis({
    tipoSelecionado = tipo,
    dataSelecionada = data,
    inicioSelecionado = horaInicio,
    fimSelecionado = horaFim,
  } = {}) {
    if (!tipoSelecionado) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    if (dataAnteriorHoje(dataSelecionada)) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    if (!intervaloValido(inicioSelecionado, fimSelecionado)) {
      setListaRecursos([]);
      setRecurso("");
      return;
    }

    try {
      setCarregandoRecursos(true);

      const dataFormatada = formatDate(dataSelecionada);
      const horaRetirada = formatTime(inicioSelecionado);
      const horaDevolucao = formatTime(fimSelecionado);

      const url =
        `${API_URL}/recursos/disponiveis` +
        `?tipo=${encodeURIComponent(tipoSelecionado)}` +
        `&data=${encodeURIComponent(dataFormatada)}` +
        `&horaRetirada=${encodeURIComponent(horaRetirada)}` +
        `&horaDevolucao=${encodeURIComponent(horaDevolucao)}`;

      const resposta = await fetch(url);

      const texto = await resposta.text();

      let dados;

      try {
        dados = JSON.parse(texto);
      } catch (erro) {
        console.log("Resposta inválida do servidor:", texto);

        throw new Error(
          "O servidor retornou uma resposta inválida."
        );
      }

      if (!resposta.ok) {
        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível buscar os recursos disponíveis."
        );
      }

      const recursos = Array.isArray(dados)
        ? dados
        : Array.isArray(dados.recursos)
        ? dados.recursos
        : [];

      setListaRecursos(recursos);

      if (
        recurso &&
        !recursos.some(
          (item) => String(item.idRecurso) === String(recurso)
        )
      ) {
        setRecurso("");
      }
    } catch (erro) {
      console.log("Erro ao buscar recursos disponíveis:", erro);

      setListaRecursos([]);
      setRecurso("");

      mostrarAlerta(
        "Erro",
        erro.message ||
          "Não foi possível carregar os recursos disponíveis."
      );
    } finally {
      setCarregandoRecursos(false);
    }
  }

  function selecionarTipo(valor) {
    setTipo(valor);
    setRecurso("");
    setMostrarTipos(false);
    setMostrarRecursos(false);

    buscarRecursosDisponiveis({
      tipoSelecionado: valor,
      dataSelecionada: data,
      inicioSelecionado: horaInicio,
      fimSelecionado: horaFim,
    });
  }

  function selecionarRecurso(id) {
    setRecurso(String(id));
    setMostrarRecursos(false);
  }

  function alterarData(event, selectedDate) {
    setMostrarData(false);

    if (!selectedDate) {
      return;
    }

    setData(selectedDate);
    setRecurso("");

    buscarRecursosDisponiveis({
      tipoSelecionado: tipo,
      dataSelecionada: selectedDate,
      inicioSelecionado: horaInicio,
      fimSelecionado: horaFim,
    });
  }

  function alterarHoraInicio(event, selectedTime) {
    setMostrarHoraInicio(false);

    if (!selectedTime) {
      return;
    }

    setHoraInicio(selectedTime);
    setRecurso("");

    buscarRecursosDisponiveis({
      tipoSelecionado: tipo,
      dataSelecionada: data,
      inicioSelecionado: selectedTime,
      fimSelecionado: horaFim,
    });
  }

  function alterarHoraFim(event, selectedTime) {
    setMostrarHoraFim(false);

    if (!selectedTime) {
      return;
    }

    setHoraFim(selectedTime);
    setRecurso("");

    buscarRecursosDisponiveis({
      tipoSelecionado: tipo,
      dataSelecionada: data,
      inicioSelecionado: horaInicio,
      fimSelecionado: selectedTime,
    });
  }

  function validarReserva() {
    if (!nome.trim()) {
      mostrarAlerta(
        "Atenção",
        "Não foi possível identificar o nome do usuário."
      );
      return false;
    }

    if (!matricula) {
      mostrarAlerta(
        "Atenção",
        "Não foi possível identificar o usuário."
      );
      return false;
    }

    if (!tipo) {
      mostrarAlerta(
        "Atenção",
        "Selecione o tipo de recurso."
      );
      return false;
    }

    if (!recurso) {
      mostrarAlerta(
        "Atenção",
        "Selecione um recurso disponível."
      );
      return false;
    }

    if (dataAnteriorHoje(data)) {
      mostrarAlerta(
        "Data inválida",
        "Não é possível fazer uma reserva para uma data anterior a hoje."
      );
      return false;
    }

    const agora = new Date();

    if (mesmoDiaHoje(data)) {
      const inicioMinutos = converterMinutos(horaInicio);
      const agoraMinutos =
        agora.getHours() * 60 + agora.getMinutes();

      if (inicioMinutos <= agoraMinutos) {
        mostrarAlerta(
          "Horário inválido",
          "Para reservas de hoje, o horário de retirada deve ser posterior ao horário atual."
        );
        return false;
      }
    }

    const inicioMinutos = converterMinutos(horaInicio);
    const fimMinutos = converterMinutos(horaFim);

    if (fimMinutos <= inicioMinutos) {
      mostrarAlerta(
        "Horário inválido",
        "O horário de devolução deve ser posterior ao horário de retirada."
      );
      return false;
    }

    const duracao = fimMinutos - inicioMinutos;

    if (duracao < 30) {
      mostrarAlerta(
        "Horário inválido",
        "A reserva deve ter duração mínima de 30 minutos."
      );
      return false;
    }

    if (listaRecursos.length === 0) {
      mostrarAlerta(
        "Recurso indisponível",
        "Não existem recursos disponíveis para esse tipo, data e horário."
      );
      return false;
    }

    const recursoExiste = listaRecursos.some(
      (item) => String(item.idRecurso) === String(recurso)
    );

    if (!recursoExiste) {
      mostrarAlerta(
        "Recurso indisponível",
        "O recurso selecionado não está mais disponível para esse horário. Escolha outro recurso."
      );

      setRecurso("");

      buscarRecursosDisponiveis();

      return false;
    }

    return true;
  }

  async function realizarReserva() {
    if (!validarReserva()) {
      return;
    }

    try {
      setSalvando(true);

      const dadosReserva = {
        responsavelNome: nome,
        responsavelMatricula: matricula,
        reservaData: formatDate(data),
        horaRetirada: formatTime(horaInicio),
        horaDevolucao: formatTime(horaFim),
        idUsuario: usuario.idUsuario,
        idRecurso: recurso,
      };

      console.log("Enviando reserva:", dadosReserva);

      const resposta = await fetch(`${API_URL}/reservas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosReserva),
      });

      const texto = await resposta.text();

      let dados;

      try {
        dados = JSON.parse(texto);
      } catch (erro) {
        console.log("Resposta inválida do servidor:", texto);

        throw new Error(
          "O servidor retornou uma resposta inválida."
        );
      }

      if (!resposta.ok) {
        if (resposta.status === 409) {
          setRecurso("");

          await buscarRecursosDisponiveis();

          throw new Error(
            dados?.mensagem ||
              "Esse recurso acabou de ser reservado por outra pessoa para esse horário."
          );
        }

        throw new Error(
          dados?.mensagem ||
            dados?.erro ||
            "Não foi possível realizar a reserva."
        );
      }

      mostrarAlerta(
        "Reserva realizada!",
        `Sua reserva foi criada com sucesso.\n\nCódigo da reserva: ${
          dados.codigoReserva || "Gerado pelo sistema"
        }`
      );

      setTipo("");
      setRecurso("");
      setListaRecursos([]);

      navigation.goBack();
    } catch (erro) {
      console.log("Erro ao realizar reserva:", erro);

      mostrarAlerta(
        "Erro",
        erro.message ||
          "Não foi possível realizar a reserva."
      );
    } finally {
      setSalvando(false);
    }
  }

  useEffect(() => {
    setRecurso("");

    if (tipo && intervaloValido(horaInicio, horaFim)) {
      buscarRecursosDisponiveis({
        tipoSelecionado: tipo,
        dataSelecionada: data,
        inicioSelecionado: horaInicio,
        fimSelecionado: horaFim,
      });
    } else {
      setListaRecursos([]);
    }
  }, []);

  const recursoSelecionado = listaRecursos.find(
    (item) => String(item.idRecurso) === String(recurso)
  );

  const larguraConteudo =
    width >= 1000 ? 900 : width >= 600 ? 700 : "100%";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.textoVoltar}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>SISLAB</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.conteudo,
            {
              width: larguraConteudo,
            },
          ]}
        >
          <Text style={styles.titulo}>Fazer Reserva</Text>

          <Text style={styles.subtitulo}>
            Escolha a data, horário e recurso que deseja reservar.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Responsável</Text>

            <View style={styles.campoDesabilitado}>
              <Text style={styles.valorDesabilitado}>
                {nome || "Usuário"}
              </Text>
            </View>

            <Text style={styles.label}>Matrícula</Text>

            <View style={styles.campoDesabilitado}>
              <Text style={styles.valorDesabilitado}>
                {matricula || "Não identificada"}
              </Text>
            </View>

            <Text style={styles.label}>Data da reserva</Text>

            {Platform.OS === "web" ? (
              <View style={styles.campoWeb}>
                <TextInput
                  style={styles.inputWeb}
                  value={formatDate(data)}
                  onChangeText={(texto) => {
                    const partes = texto.split("-");

                    if (partes.length !== 3) {
                      return;
                    }

                    const ano = Number(partes[0]);
                    const mes = Number(partes[1]);
                    const dia = Number(partes[2]);

                    if (
                      !ano ||
                      !mes ||
                      !dia ||
                      mes < 1 ||
                      mes > 12 ||
                      dia < 1 ||
                      dia > 31
                    ) {
                      return;
                    }

                    const novaData = new Date(
                      ano,
                      mes - 1,
                      dia
                    );

                    setData(novaData);
                    setRecurso("");

                    buscarRecursosDisponiveis({
                      tipoSelecionado: tipo,
                      dataSelecionada: novaData,
                      inicioSelecionado: horaInicio,
                      fimSelecionado: horaFim,
                    });
                  }}
                  placeholder="AAAA-MM-DD"
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.seletor}
                  onPress={() => setMostrarData(true)}
                >
                  <Text style={styles.seletorTexto}>
                    {formatDateBR(data)}
                  </Text>

                  <Text style={styles.seta}>⌄</Text>
                </TouchableOpacity>

                {mostrarData && (
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

            {Platform.OS === "web" && (
              <TouchableOpacity
                style={styles.botaoDataWeb}
                onPress={() => setMostrarData(!mostrarData)}
              >
                <Text style={styles.botaoDataWebTexto}>
                  Alterar data
                </Text>
              </TouchableOpacity>
            )}

            {Platform.OS === "web" && mostrarData && (
              <View style={styles.avisoWeb}>
                <Text style={styles.avisoWebTexto}>
                  Digite a data no formato AAAA-MM-DD.
                </Text>
              </View>
            )}

            <Text style={styles.label}>Hora de retirada</Text>

            {Platform.OS === "web" ? (
              <View style={styles.campoWeb}>
                <TextInput
                  style={styles.inputWeb}
                  value={formatTimeBR(horaInicio)}
                  onChangeText={(texto) => {
                    const partes = texto.split(":");

                    if (partes.length !== 2) {
                      return;
                    }

                    const horas = Number(partes[0]);
                    const minutos = Number(partes[1]);

                    if (
                      Number.isNaN(horas) ||
                      Number.isNaN(minutos) ||
                      horas < 0 ||
                      horas > 23 ||
                      minutos < 0 ||
                      minutos > 59
                    ) {
                      return;
                    }

                    const novaHora = new Date(horaInicio);
                    novaHora.setHours(horas);
                    novaHora.setMinutes(minutos);
                    novaHora.setSeconds(0);
                    novaHora.setMilliseconds(0);

                    setHoraInicio(novaHora);
                    setRecurso("");

                    buscarRecursosDisponiveis({
                      tipoSelecionado: tipo,
                      dataSelecionada: data,
                      inicioSelecionado: novaHora,
                      fimSelecionado: horaFim,
                    });
                  }}
                  placeholder="HH:MM"
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.seletor}
                  onPress={() => setMostrarHoraInicio(true)}
                >
                  <Text style={styles.seletorTexto}>
                    {formatTimeBR(horaInicio)}
                  </Text>

                  <Text style={styles.seta}>⌄</Text>
                </TouchableOpacity>

                {mostrarHoraInicio && (
                  <DateTimePicker
                    value={horaInicio}
                    mode="time"
                    display="default"
                    onChange={alterarHoraInicio}
                  />
                )}
              </>
            )}

            <Text style={styles.label}>Hora de devolução</Text>

            {Platform.OS === "web" ? (
              <View style={styles.campoWeb}>
                <TextInput
                  style={styles.inputWeb}
                  value={formatTimeBR(horaFim)}
                  onChangeText={(texto) => {
                    const partes = texto.split(":");

                    if (partes.length !== 2) {
                      return;
                    }

                    const horas = Number(partes[0]);
                    const minutos = Number(partes[1]);

                    if (
                      Number.isNaN(horas) ||
                      Number.isNaN(minutos) ||
                      horas < 0 ||
                      horas > 23 ||
                      minutos < 0 ||
                      minutos > 59
                    ) {
                      return;
                    }

                    const novaHora = new Date(horaFim);
                    novaHora.setHours(horas);
                    novaHora.setMinutes(minutos);
                    novaHora.setSeconds(0);
                    novaHora.setMilliseconds(0);

                    setHoraFim(novaHora);
                    setRecurso("");

                    buscarRecursosDisponiveis({
                      tipoSelecionado: tipo,
                      dataSelecionada: data,
                      inicioSelecionado: horaInicio,
                      fimSelecionado: novaHora,
                    });
                  }}
                  placeholder="HH:MM"
                />
              </View>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.seletor}
                  onPress={() => setMostrarHoraFim(true)}
                >
                  <Text style={styles.seletorTexto}>
                    {formatTimeBR(horaFim)}
                  </Text>

                  <Text style={styles.seta}>⌄</Text>
                </TouchableOpacity>

                {mostrarHoraFim && (
                  <DateTimePicker
                    value={horaFim}
                    mode="time"
                    display="default"
                    onChange={alterarHoraFim}
                  />
                )}
              </>
            )}

            <Text style={styles.label}>Tipo de recurso</Text>

            <TouchableOpacity
              style={styles.seletor}
              onPress={() => {
                setMostrarTipos(!mostrarTipos);
                setMostrarRecursos(false);
              }}
            >
              <Text
                style={[
                  styles.seletorTexto,
                  !tipo && styles.placeholder,
                ]}
              >
                {tipo || "Selecione o tipo"}
              </Text>

              <Text style={styles.seta}>⌄</Text>
            </TouchableOpacity>

            {mostrarTipos && (
              <View style={styles.dropdown}>
                {tipos.map((item) => (
                  <TouchableOpacity
                    key={item.valor}
                    style={styles.opcao}
                    onPress={() => selecionarTipo(item.valor)}
                  >
                    <Text style={styles.opcaoTexto}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.label}>Recurso</Text>

            <TouchableOpacity
              style={[
                styles.seletor,
                (!tipo ||
                  carregandoRecursos ||
                  listaRecursos.length === 0) &&
                  styles.seletorDesabilitado,
              ]}
              disabled={
                !tipo ||
                carregandoRecursos ||
                listaRecursos.length === 0
              }
              onPress={() => {
                setMostrarRecursos(!mostrarRecursos);
                setMostrarTipos(false);
              }}
            >
              {carregandoRecursos ? (
                <View style={styles.carregandoLinha}>
                  <ActivityIndicator
                    size="small"
                    color="#007A33"
                  />

                  <Text style={styles.carregandoTexto}>
                    Buscando recursos disponíveis...
                  </Text>
                </View>
              ) : (
                <>
                  <Text
                    style={[
                      styles.seletorTexto,
                      !recurso && styles.placeholder,
                    ]}
                  >
                    {recursoSelecionado
                      ? recursoSelecionado.nome
                      : !tipo
                      ? "Selecione o tipo primeiro"
                      : listaRecursos.length === 0
                      ? "Nenhum recurso disponível"
                      : "Selecione o recurso"}
                  </Text>

                  <Text style={styles.seta}>⌄</Text>
                </>
              )}
            </TouchableOpacity>

            {mostrarRecursos &&
              listaRecursos.length > 0 && (
                <View style={styles.dropdown}>
                  {listaRecursos.map((item) => (
                    <TouchableOpacity
                      key={item.idRecurso}
                      style={styles.opcao}
                      onPress={() =>
                        selecionarRecurso(item.idRecurso)
                      }
                    >
                      <Text style={styles.opcaoTexto}>
                        {item.nome}
                      </Text>

                      {item.localizacao ? (
                        <Text style={styles.opcaoDetalhe}>
                          {item.localizacao}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            {tipo &&
              !carregandoRecursos &&
              listaRecursos.length === 0 &&
              intervaloValido(horaInicio, horaFim) && (
                <View style={styles.avisoIndisponibilidade}>
                  <Text style={styles.avisoIndisponibilidadeTexto}>
                    Nenhum {tipo.toLowerCase()} está disponível
                    para a data e horário selecionados.
                  </Text>
                </View>
              )}

            {tipo &&
              !intervaloValido(horaInicio, horaFim) && (
                <View style={styles.avisoHorario}>
                  <Text style={styles.avisoHorarioTexto}>
                    Escolha um horário de devolução pelo menos
                    30 minutos após o horário de retirada para
                    consultar os recursos disponíveis.
                  </Text>
                </View>
              )}

            <TouchableOpacity
              style={[
                styles.botaoReservar,
                salvando && styles.botaoDesabilitado,
              ]}
              disabled={salvando}
              onPress={realizarReserva}
            >
              {salvando ? (
                <View style={styles.carregandoBotao}>
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />

                  <Text style={styles.textoBotao}>
                    Realizando reserva...
                  </Text>
                </View>
              ) : (
                <Text style={styles.textoBotao}>
                  Confirmar Reserva
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoCancelar}
              onPress={() => navigation.goBack()}
              disabled={salvando}
            >
              <Text style={styles.textoCancelar}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ccfce4",
  },

  header: {
    height: 72,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#d9eee4",
  },

  botaoVoltar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#e3f7ed",
    alignItems: "center",
    justifyContent: "center",
  },

  textoVoltar: {
    fontSize: 34,
    lineHeight: 36,
    color: "#007A33",
    marginTop: -3,
  },

  logo: {
    fontSize: 25,
    fontWeight: "800",
    color: "#007A33",
    letterSpacing: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    alignItems: "center",
    paddingVertical: 35,
    paddingHorizontal: 20,
  },

  conteudo: {
    maxWidth: 900,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "800",
    color: "#006633",
    marginBottom: 6,
  },

  subtitulo: {
    fontSize: 15,
    color: "#4f665b",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 26,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#174d35",
    marginBottom: 8,
    marginTop: 15,
  },

  campoDesabilitado: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#d9e8e0",
    borderRadius: 10,
    backgroundColor: "#f3f7f5",
    justifyContent: "center",
    paddingHorizontal: 14,
  },

  valorDesabilitado: {
    fontSize: 15,
    color: "#687a70",
  },

  seletor: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#a6e4cf",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seletorDesabilitado: {
    backgroundColor: "#f3f7f5",
    borderColor: "#d9e8e0",
  },

  seletorTexto: {
    flex: 1,
    fontSize: 15,
    color: "#173b2b",
  },

  placeholder: {
    color: "#7c8f85",
  },

  seta: {
    fontSize: 20,
    color: "#007A33",
    marginLeft: 10,
  },

  dropdown: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#a6e4cf",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },

  opcao: {
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#edf4f0",
  },

  opcaoTexto: {
    fontSize: 15,
    color: "#173b2b",
    fontWeight: "600",
  },

  opcaoDetalhe: {
    fontSize: 12,
    color: "#718178",
    marginTop: 3,
  },

  carregandoLinha: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  carregandoTexto: {
    fontSize: 14,
    color: "#60756a",
    marginLeft: 9,
  },

  avisoIndisponibilidade: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#fff4df",
  },

  avisoIndisponibilidadeTexto: {
    fontSize: 13,
    color: "#76531c",
    lineHeight: 19,
  },

  avisoHorario: {
    marginTop: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#eef7f2",
  },

  avisoHorarioTexto: {
    fontSize: 13,
    color: "#456454",
    lineHeight: 19,
  },

  campoWeb: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#a6e4cf",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
  },

  inputWeb: {
    width: "100%",
    minHeight: 46,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#173b2b",
    border: "none",
    outlineStyle: "none",
    backgroundColor: "transparent",
  },

  botaoDataWeb: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingVertical: 5,
  },

  botaoDataWebTexto: {
    fontSize: 13,
    color: "#007A33",
    fontWeight: "600",
  },

  avisoWeb: {
    marginTop: 5,
    padding: 8,
    backgroundColor: "#eef7f2",
    borderRadius: 8,
  },

  avisoWebTexto: {
    fontSize: 12,
    color: "#557063",
  },

  botaoReservar: {
    marginTop: 28,
    minHeight: 50,
    borderRadius: 12,
    backgroundColor: "#007A33",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  botaoDesabilitado: {
    opacity: 0.7,
  },

  textoBotao: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  carregandoBotao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  botaoCancelar: {
    marginTop: 10,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#b8d9ca",
    alignItems: "center",
    justifyContent: "center",
  },

  textoCancelar: {
    color: "#496257",
    fontSize: 14,
    fontWeight: "700",
  },
});