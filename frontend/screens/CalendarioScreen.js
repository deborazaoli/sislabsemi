import React, { useState, useCallback, useMemo } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Pressable,
  Image,
  Modal,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";


const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];


const DIAS_SEMANA = [
  "Dom",
  "Seg",
  "Ter",
  "Qua",
  "Qui",
  "Sex",
  "Sáb"
];


export default function CalendarioScreen({ navigation }) {

  const [reservas, setReservas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const hoje = new Date();

  const [mesAtual, setMesAtual] = useState(
    hoje.getMonth()
  );

  const [anoAtual, setAnoAtual] = useState(
    hoje.getFullYear()
  );

  const [modalVisivel, setModalVisivel] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [reservasSelecionadas, setReservasSelecionadas] = useState([]);


  async function carregarReservas() {

    try {

      setCarregando(true);

      const resposta = await fetch(
        `${API_URL}/reservas/all`
      );

      if (!resposta.ok) {

        throw new Error(
          "Não foi possível carregar as reservas."
        );

      }

      const dados = await resposta.json();

      setReservas(dados);

    } catch (erro) {

      console.log(
        "Erro ao carregar reservas:",
        erro
      );

      Alert.alert(
        "Erro",
        "Não foi possível carregar as reservas."
      );

    } finally {

      setCarregando(false);

    }

  }


  useFocusEffect(
    useCallback(() => {
      carregarReservas();
    }, [])
  );


  const quantidadeDias = new Date(
    anoAtual,
    mesAtual + 1,
    0
  ).getDate();


  const primeiroDia = new Date(
    anoAtual,
    mesAtual,
    1
  ).getDay();


  const dias = useMemo(() => {

    const lista = [];

    // Espaços antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
      lista.push(null);
    }

    // Dias do mês
    for (
      let dia = 1;
      dia <= quantidadeDias;
      dia++
    ) {
      lista.push(dia);
    }

    return lista;

  }, [
    primeiroDia,
    quantidadeDias
  ]);

  function proximoMes() {

    if (mesAtual === 11) {

      setMesAtual(0);
      setAnoAtual(anoAtual + 1);

    } else {

      setMesAtual(mesAtual + 1);

    }

  }


  function mesAnterior() {

    if (mesAtual === 0) {

      setMesAtual(11);
      setAnoAtual(anoAtual - 1);

    } else {

      setMesAtual(mesAtual - 1);

    }

  }


  function irParaHoje() {

    const agora = new Date();

    setMesAtual(agora.getMonth());
    setAnoAtual(agora.getFullYear());

  }


  function obterDataReserva(reserva) {

    if (!reserva.reservaData) {
      return "";
    }

    return String(
      reserva.reservaData
    )
      .split("T")[0];

  }


  function reservasDoDia(dia) {

  if (!dia) {
    return [];
  }

  const mesFormatado = String(
    mesAtual + 1
  ).padStart(2, "0");

  const diaFormatado = String(
    dia
  ).padStart(2, "0");

  const dataAtual =
    `${anoAtual}-${mesFormatado}-${diaFormatado}`;

  return reservas
    .filter(
      (reserva) =>
        obterDataReserva(reserva) === dataAtual
    )
    .sort((a, b) => {

      const horaA = String(
        a.horaRetirada || ""
      );

      const horaB = String(
        b.horaRetirada || ""
      );

      return horaA.localeCompare(horaB);

    });

}

  function ehHoje(dia) {

    if (!dia) {
      return false;
    }

    const agora = new Date();

    return (
      dia === agora.getDate() &&
      mesAtual === agora.getMonth() &&
      anoAtual === agora.getFullYear()
    );

  }

  function formatarHora(hora) {

    if (!hora) {
      return "";
    }

    return String(hora).substring(0, 5);

  }

  function abrirReservasDoDia(dia) {

    if (!dia) {
      return;
    }

    const reservasDia =
      reservasDoDia(dia);

    // Se não houver reservas, não abre o modal
    if (reservasDia.length === 0) {
      return;
    }

    setDiaSelecionado(dia);
    setReservasSelecionadas(reservasDia);
    setModalVisivel(true);

  }

  function fecharModal() {

    setModalVisivel(false);
    setDiaSelecionado(null);
    setReservasSelecionadas([]);

  }


  if (carregando) {

    return (

      <SafeAreaView style={styles.container}>

        <View style={styles.header}>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.voltar}
          >

            <Image
              source={require("../assets/seta.png")}
              style={styles.icon}
            />

          </Pressable>


          <Text style={styles.tituloHeader}>
            Calendário
          </Text>


          <View style={styles.espaco} />

        </View>


        <View style={styles.loading}>

          <ActivityIndicator
            size="large"
          />


          <Text style={styles.loadingText}>
            Carregando reservas...
          </Text>

        </View>

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView style={styles.container}>

      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>

        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.voltar}
        >

          <Image
            source={require("../assets/seta.png")}
            style={styles.icon}
          />

        </Pressable>


        <Text style={styles.tituloHeader}>
          Calendário
        </Text>


        <View style={styles.espaco} />

      </View>


      {/* ==================================================
          CONTEÚDO
      ================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >


        {/* ==================================================
            CABEÇALHO DO MÊS
        ================================================== */}

        <View style={styles.mesHeader}>

          <Pressable
            style={styles.navegacao}
            onPress={mesAnterior}
          >

            <Text style={styles.seta}>
              ‹
            </Text>

          </Pressable>


          <Text style={styles.mesTitulo}>

            {MESES[mesAtual]}{" "}
            {anoAtual}

          </Text>


          <Pressable
            style={styles.navegacao}
            onPress={proximoMes}
          >

            <Text style={styles.seta}>
              ›
            </Text>

          </Pressable>

        </View>


        {/* ==================================================
            BOTÃO HOJE
        ================================================== */}

        <Pressable
          style={styles.botaoHoje}
          onPress={irParaHoje}
        >

          <Text style={styles.textoHoje}>
            Hoje
          </Text>

        </Pressable>


        {/* ==================================================
            CALENDÁRIO
        ================================================== */}

        <View style={styles.calendario}>

          {/* DIAS DA SEMANA */}

          <View style={styles.semana}>

            {DIAS_SEMANA.map(
              (dia) => (

                <View
                  key={dia}
                  style={styles.cabecalhoDia}
                >

                  <Text
                    style={styles.textoCabecalho}
                  >
                    {dia}
                  </Text>

                </View>

              )
            )}

          </View>


          {/* DIAS */}

          <View style={styles.grade}>

            {dias.map(
              (dia, index) => {

                const reservasDia =
                  reservasDoDia(dia);

                const quantidadeReservas =
                  reservasDia.length;

                return (

                  <Pressable
                    key={index}
                    style={[
                      styles.dia,

                      ehHoje(dia) &&
                      styles.diaHoje,

                      quantidadeReservas > 0 &&
                      styles.diaComReserva
                    ]}
                    onPress={() =>
                      abrirReservasDoDia(dia)
                    }
                    disabled={
                      !dia ||
                      quantidadeReservas === 0
                    }
                  >

                    {dia && (

                      <>

                        {/* NÚMERO DO DIA */}

                        <View
                          style={[
                            styles.numeroContainer,

                            ehHoje(dia) &&
                            styles.numeroHoje
                          ]}
                        >

                          <Text
                            style={[
                              styles.numeroDia,

                              ehHoje(dia) &&
                              styles.numeroDiaHoje
                            ]}
                          >

                            {dia}

                          </Text>

                        </View>


                        {/* QUANTIDADE DE RESERVAS */}

                        {quantidadeReservas > 0 && (

                          <View
                            style={
                              styles.contadorReservas
                            }
                          >

                            <Text
                              style={
                                styles.numeroReservas
                              }
                            >

                              {quantidadeReservas}

                            </Text>


                            <Text
                              style={
                                styles.textoReservas
                              }
                            >

                              {quantidadeReservas === 1
                                ? "reserva"
                                : "reservas"}

                            </Text>

                          </View>

                        )}

                      </>

                    )}

                  </Pressable>

                );

              }
            )}

          </View>

        </View>


        {/* ==================================================
            LEGENDA
        ================================================== */}

        <View style={styles.legenda}>

          <View style={styles.legendaItem}>

            <View style={styles.legendaCor} />


            <Text style={styles.legendaTexto}>
              Dia com reservas
            </Text>

          </View>


          <Text style={styles.info}>
            Toque em um dia com reservas para
            visualizar os detalhes.
          </Text>

        </View>


      </ScrollView>


      {/* ==================================================
          MODAL DE RESERVAS
      ================================================== */}

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={fecharModal}
      >

        <View style={styles.modalFundo}>

          <View style={styles.modal}>

            {/* CABEÇALHO DO MODAL */}

            <View style={styles.modalHeader}>

              <View>

                <Text style={styles.modalTitulo}>
                  Reservas do dia
                </Text>


                <Text style={styles.modalData}>

                  {diaSelecionado} de{" "}
                  {MESES[mesAtual]}{" "}
                  {anoAtual}

                </Text>

              </View>


              <Pressable
                style={styles.fechar}
                onPress={fecharModal}
              >

                <Text style={styles.fecharTexto}>
                  ×
                </Text>

              </Pressable>

            </View>


            {/* QUANTIDADE */}

            <View style={styles.totalReservas}>

              <Text style={styles.totalNumero}>
                {reservasSelecionadas.length}
              </Text>


              <Text style={styles.totalTexto}>

                {reservasSelecionadas.length === 1
                  ? "reserva encontrada"
                  : "reservas encontradas"}

              </Text>

            </View>


            {/* LISTA */}

            <ScrollView
              style={styles.listaModal}
              showsVerticalScrollIndicator={false}
            >

              {reservasSelecionadas.map(
                (reserva) => (

                  <View
                    key={reserva.idReserva}
                    style={styles.reservaModal}
                  >

                    {/* RECURSO */}

                    <Text
                      style={styles.recursoModal}
                    >

                      {reserva.nomeRecurso ||
                        "Recurso não informado"}

                    </Text>


                    {/* HORÁRIO */}

                    <Text
                      style={styles.horarioModal}
                    >

                      {formatarHora(
                        reserva.horaRetirada
                      )}

                      {" - "}

                      {formatarHora(
                        reserva.horaDevolucao
                      )}

                    </Text>


                    {/* RESPONSÁVEL */}

                    <Text
                      style={styles.responsavelModal}
                    >

                      Responsável:{" "}
                      {reserva.responsavelNome ||
                        "Não informado"}

                    </Text>


                    {/* MATRÍCULA */}

                    {reserva.responsavelMatricula && (

                      <Text
                        style={styles.matriculaModal}
                      >

                        Matrícula:{" "}
                        {reserva.responsavelMatricula}

                      </Text>

                    )}


                    {/* CÓDIGO */}

                    {reserva.codigoReserva && (

                      <Text
                        style={styles.codigoModal}
                      >

                        Código:{" "}
                        {reserva.codigoReserva}

                      </Text>

                    )}

                  </View>

                )
              )}

            </ScrollView>


            {/* BOTÃO FECHAR */}

            <Pressable
              style={styles.botaoFecharModal}
              onPress={fecharModal}
            >

              <Text
                style={styles.textoBotaoFechar}
              >
                Fechar
              </Text>

            </Pressable>

          </View>

        </View>

      </Modal>

    </SafeAreaView>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#CCFCE4",
  },


  // ======================================================
  // HEADER
  // ======================================================

  header: {
    height: 65,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  voltar: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },


  tituloHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007A33",
  },

  espaco: {
    width: 20,
  },

  // CONTEÚDO
  content: {
    padding: 15,
    paddingBottom: 30,
  },

  // MÊS
  mesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },


  mesTitulo: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#007A33",
  },


  navegacao: {
    width: 42,
    height: 42,

    borderRadius: 21,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },

  seta: {
    fontSize: 32,
    color: "#007A33",
    lineHeight: 34,
  },

  botaoHoje: {
    alignSelf: "center",

    backgroundColor: "#FFF",

    paddingHorizontal: 18,

    paddingVertical: 8,

    borderRadius: 20,

    marginBottom: 15,
  },


  textoHoje: {
    color: "#007A33",

    fontWeight: "bold",
  },

  calendario: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "#DDEEE5",
  },


  semana: {
    flexDirection: "row",

    borderBottomWidth: 1,

    borderBottomColor: "#DDEEE5",
  },


  cabecalhoDia: {
    flex: 1,

    minHeight: 40,

    justifyContent: "center",

    alignItems: "center",

    backgroundColor: "#F7FFFA",
  },


  textoCabecalho: {
    fontSize: 12,

    fontWeight: "bold",

    color: "#555",
  },

  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
  },


  dia: {
    width: `${100 / 7}%`,
    minHeight: 100,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E5E5E5",
    padding: 5,
    backgroundColor: "#FFF",
  },

  diaHoje: {
    backgroundColor: "#F0FFF6",
  },

  diaComReserva: {
    backgroundColor: "#F8FFFB",
  },

  numeroContainer: {
    width: 27,
    height: 27,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 7,
  },


  numeroHoje: {
    backgroundColor: "#007A33",
  },


  numeroDia: {
    fontSize: 13,

    fontWeight: "600",

    color: "#333",
  },


  numeroDiaHoje: {
    color: "#FFF",
  },

  // CONTADOR DE RESERVAS
  contadorReservas: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#CCFCE4",
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 3,
    borderLeftWidth: 3,
    borderLeftColor: "#007A33",
  },

  numeroReservas: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#007A33",
  },


  textoReservas: {
    fontSize: 9,
    fontWeight: "600",
    color: "#00652A",
    marginTop: 1,
  },

  legenda: {
    marginTop: 15,

    backgroundColor: "#FFF",

    borderRadius: 12,

    padding: 15,
  },


  legendaItem: {
    flexDirection: "row",

    alignItems: "center",

    marginBottom: 8,
  },


  legendaCor: {
    width: 12,

    height: 12,

    borderRadius: 3,

    backgroundColor: "#CCFCE4",

    borderLeftWidth: 3,

    borderLeftColor: "#007A33",

    marginRight: 8,
  },


  legendaTexto: {
    fontSize: 13,

    fontWeight: "600",

    color: "#333",
  },


  info: {
    fontSize: 12,

    color: "#777",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },


  loadingText: {
    marginTop: 10,

    fontSize: 15,
  },

  modalFundo: {
    flex: 1,

    backgroundColor: "rgba(0, 0, 0, 0.45)",

    justifyContent: "center",

    alignItems: "center",

    padding: 20,
  },


  modal: {
    width: "100%",

    maxWidth: 500,

    maxHeight: "85%",

    backgroundColor: "#FFF",

    borderRadius: 18,

    padding: 20,
  },


  modalHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "flex-start",

    marginBottom: 15,
  },


  modalTitulo: {
    fontSize: 22,

    fontWeight: "bold",

    color: "#007A33",
  },


  modalData: {
    fontSize: 14,

    color: "#666",

    marginTop: 3,
  },


  fechar: {
    width: 38,

    height: 38,

    borderRadius: 19,

    backgroundColor: "#F2F2F2",

    justifyContent: "center",

    alignItems: "center",
  },


  fecharTexto: {
    fontSize: 27,

    color: "#555",

    lineHeight: 29,
  },

  totalReservas: {
    flexDirection: "row",

    alignItems: "center",

    backgroundColor: "#F0FFF6",

    borderRadius: 10,

    padding: 12,

    marginBottom: 12,
  },


  totalNumero: {
    fontSize: 22,

    fontWeight: "bold",

    color: "#007A33",

    marginRight: 7,
  },


  totalTexto: {
    fontSize: 14,

    color: "#444",
  },


  listaModal: {
    marginBottom: 12,
  },


  reservaModal: {
    backgroundColor: "#F7FFFA",

    borderLeftWidth: 4,

    borderLeftColor: "#007A33",

    borderRadius: 10,

    padding: 13,

    marginBottom: 10,
  },


  recursoModal: {
    fontSize: 16,

    fontWeight: "bold",

    color: "#00652A",

    marginBottom: 5,
  },


  horarioModal: {
    fontSize: 15,

    fontWeight: "600",

    color: "#222",

    marginBottom: 7,
  },


  responsavelModal: {
    fontSize: 13,

    color: "#555",

    marginBottom: 3,
  },


  matriculaModal: {
    fontSize: 13,

    color: "#555",

    marginBottom: 3,
  },


  codigoModal: {
    fontSize: 12,

    color: "#777",

    marginTop: 3,
  },


  botaoFecharModal: {
    backgroundColor: "#007A33",

    borderRadius: 10,

    paddingVertical: 13,

    alignItems: "center",
  },


  textoBotaoFechar: {
    color: "#FFF",

    fontSize: 16,

    fontWeight: "bold",
  },

});
