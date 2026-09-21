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
  Dimensions,
  SafeAreaView,
} from "react-native";

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


  /*
   * Quantos dias tem o mês atual
   */
  const quantidadeDias = new Date(
    anoAtual,
    mesAtual + 1,
    0
  ).getDate();


  /*
   * Dia da semana em que o mês começa
   *
   * 0 = domingo
   * 1 = segunda
   * ...
   */
  const primeiroDia = new Date(
    anoAtual,
    mesAtual,
    1
  ).getDay();


  /*
   * Cria os bloquinhos do calendário
   */
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


  /*
   * Avança um mês
   */
  function proximoMes() {

    if (mesAtual === 11) {

      setMesAtual(0);
      setAnoAtual(anoAtual + 1);

    } else {

      setMesAtual(mesAtual + 1);

    }

  }


  /*
   * Volta um mês
   */
  function mesAnterior() {

    if (mesAtual === 0) {

      setMesAtual(11);
      setAnoAtual(anoAtual - 1);

    } else {

      setMesAtual(mesAtual - 1);

    }

  }


  /*
   * Volta para o mês atual
   */
  function irParaHoje() {

    const agora = new Date();

    setMesAtual(agora.getMonth());
    setAnoAtual(agora.getFullYear());

  }


  /*
   * Transforma a data da reserva em:
   *
   * YYYY-MM-DD
   */
  function obterDataReserva(reserva) {

    if (!reserva.reservaData) {
      return "";
    }

    return String(
      reserva.reservaData
    )
      .split("T")[0];

  }


  /*
   * Retorna todas as reservas de determinado dia
   */
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

    return reservas.filter(
      (reserva) =>
        obterDataReserva(reserva) === dataAtual
    );

  }


  /*
   * Verifica se o dia é hoje
   */
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


  /*
   * Formata horário
   */
  function formatarHora(hora) {

    if (!hora) {
      return "";
    }

    return String(hora).substring(0, 5);

  }


  /*
   * Tela de carregamento
   */
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

      {/* HEADER */}

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


      {/* CONTEÚDO */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >


        {/* CABEÇALHO DO MÊS */}

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


        {/* BOTÃO HOJE */}

        <Pressable
          style={styles.botaoHoje}
          onPress={irParaHoje}
        >

          <Text style={styles.textoHoje}>
            Hoje
          </Text>

        </Pressable>


        {/* CALENDÁRIO */}

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

                return (

                  <View
                    key={index}
                    style={[
                      styles.dia,
                      ehHoje(dia) &&
                      styles.diaHoje
                    ]}
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


                        {/* RESERVAS */}

                        <ScrollView
                          nestedScrollEnabled
                          showsVerticalScrollIndicator={
                            false
                          }
                          style={
                            styles.reservasDia
                          }
                        >

                          {reservasDia.map(
                            (reserva) => (

                              <View
                                key={
                                  reserva.idReserva
                                }
                                style={
                                  styles.reserva
                                }
                              >

                                <Text
                                  style={
                                    styles.reservaRecurso
                                  }
                                  numberOfLines={2}
                                >

                                  {
                                    reserva.nomeRecurso ||
                                    "Recurso"
                                  }

                                </Text>


                                <Text
                                  style={
                                    styles.reservaHora
                                  }
                                >

                                  {
                                    formatarHora(
                                      reserva.horaRetirada
                                    )
                                  }

                                  {" - "}

                                  {
                                    formatarHora(
                                      reserva.horaDevolucao
                                    )
                                  }

                                </Text>

                              </View>

                            )
                          )}

                        </ScrollView>

                      </>

                    )}

                  </View>

                );

              }
            )}

          </View>

        </View>


        {/* LEGENDA */}

        <View style={styles.legenda}>

          <View style={styles.legendaItem}>

            <View style={styles.legendaCor} />

            <Text style={styles.legendaTexto}>
              Reserva
            </Text>

          </View>


          <Text style={styles.info}>
            Toque em outro mês para consultar
            as reservas.
          </Text>

        </View>


      </ScrollView>

    </SafeAreaView>

  );

}


const styles = StyleSheet.create({

  /* TELA */

  container: {
    flex: 1,
    backgroundColor: "#CCFCE4",
  },


  /* HEADER */

  header: {
    height: 75,
    backgroundColor: "#FFF",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 20,
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
    width: 40,
  },


  /* CONTEÚDO */

  content: {
    padding: 15,
    paddingBottom: 30,
  },


  /* MÊS */

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


  /* BOTÃO HOJE */

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


  /* CALENDÁRIO */

  calendario: {
    backgroundColor: "#FFF",

    borderRadius: 12,

    overflow: "hidden",

    borderWidth: 1,

    borderColor: "#DDEEE5",
  },


  /* SEMANA */

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


  /* GRADE */

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


  /* NÚMERO */

  numeroContainer: {
    width: 27,

    height: 27,

    borderRadius: 14,

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 3,
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


  /* RESERVAS DENTRO DO DIA */

  reservasDia: {
    flex: 1,
  },


  reserva: {
    backgroundColor: "#CCFCE4",

    borderLeftWidth: 3,

    borderLeftColor: "#007A33",

    borderRadius: 4,

    padding: 4,

    marginBottom: 3,
  },


  reservaRecurso: {
    fontSize: 10,

    fontWeight: "bold",

    color: "#00652A",
  },


  reservaHora: {
    fontSize: 9,

    color: "#333",

    marginTop: 2,
  },


  /* LEGENDA */

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


  /* LOADING */

  loading: {
    flex: 1,

    justifyContent: "center",

    alignItems: "center",
  },


  loadingText: {
    marginTop: 10,

    fontSize: 15,
  },

});