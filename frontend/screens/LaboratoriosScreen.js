import React, { useState, useCallback } from "react";

import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";


export default function LaboratoriosScreen({ navigation }) {

  const [dados, setDados] = useState([]);


  const carregarDados = () => {

    fetch(
      `${API_URL}/recursos?tipo=laboratorio`
    )
      .then(res => res.json())
      .then(setDados)
      .catch(error => {
        console.log(
          "Erro ao carregar laboratórios:",
          error
        );
      });

  };


  useFocusEffect(
    useCallback(() => {

      carregarDados();

    }, [])
  );


  const excluir = async (id) => {

    try {

      await fetch(
        `${API_URL}/recursos/${id}`,
        {
          method: "DELETE"
        }
      );

      carregarDados();

    } catch (error) {

      console.log(
        "Erro ao excluir laboratório:",
        error
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
            style={styles.icon}
          />

        </Pressable>


        <Text style={styles.tituloHeader}>
          Laboratórios
        </Text>


        <View style={{ width: 28 }} />

      </View>


      {/* CONTEÚDO */}

      <View style={styles.content}>


        {/* ADICIONAR */}

        <Pressable
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate(
              "RecursoForm",
              {
                tipo: "laboratorio"
              }
            )
          }
        >

          <Text style={styles.addText}>
            +
          </Text>

        </Pressable>


        {/* LISTA */}

        <FlatList
          data={dados}

          keyExtractor={(item) =>
            String(item.idRecurso)
          }

          contentContainerStyle={styles.list}

          renderItem={({ item }) => (

            <View style={styles.card}>

              <Text style={styles.nome}>
                {item.nome}
              </Text>


              <View style={styles.actions}>


                {/* EDITAR */}

                <Pressable
                  style={styles.btn}
                  onPress={() =>
                    navigation.navigate(
                      "RecursoForm",
                      {
                        recurso: item
                      }
                    )
                  }
                >

                  <Text style={styles.btnText}>
                    Editar
                  </Text>

                </Pressable>


                {/* EXCLUIR */}

                <Pressable
                  style={styles.btn}
                  onPress={() =>
                    excluir(item.idRecurso)
                  }
                >

                  <Text style={styles.btnText}>
                    Excluir
                  </Text>

                </Pressable>

              </View>

            </View>

          )}

        />

      </View>

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#CCFCE4"
  },


  header: {
    height: 75,

    backgroundColor: "#FFF",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: 20
  },


  tituloHeader: {
    fontSize: 26,

    fontWeight: "bold"
  },


  icon: {
    width: 28,

    height: 28,

    resizeMode: "contain"
  },


  content: {
    flex: 1,

    paddingHorizontal: 20,

    paddingTop: 15
  },


  list: {
    paddingBottom: 20
  },


  addBtn: {
    width: 45,

    height: 45,

    borderRadius: 30,

    backgroundColor: "#FFF",

    justifyContent: "center",

    alignItems: "center",

    marginBottom: 20
  },


  addText: {
    fontSize: 30,

    color: "#007A33",

    fontWeight: "bold"
  },


  card: {
    backgroundColor: "#FFF",

    padding: 12,

    borderRadius: 4,

    marginBottom: 10,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center"
  },


  nome: {
    fontSize: 16
  },


  actions: {
    flexDirection: "row"
  },


  btn: {
    backgroundColor: "#007A33",

    paddingHorizontal: 18,

    paddingVertical: 8,

    borderRadius: 20,

    marginLeft: 8
  },


  btnText: {
    color: "#FFF"
  }

});