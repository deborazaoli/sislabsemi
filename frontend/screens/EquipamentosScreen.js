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

export default function EquipamentosScreen({ navigation }) {
  const [dados, setDados] = useState([]);

  const carregarDados = () => {
    fetch("http://localhost:3000/recursos?tipo=equipamento")
      .then(res => res.json())
      .then(setDados)
      .catch(console.log);
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const excluir = async (id) => {
    await fetch(`http://localhost:3000/recursos/${id}`, {
      method: "DELETE"
    });

    carregarDados();
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/seta.png")}
            style={styles.icon}
          />
        </Pressable>

        <Text style={styles.tituloHeader}>
          Equipamentos
        </Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>

        <Pressable
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate("RecursoForm", {
              tipo: "equipamento"
            })
          }
        >
          <Text style={styles.addText}>+</Text>
        </Pressable>

        <FlatList
          data={dados}
          keyExtractor={(item) => String(item.idRecurso)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>

              <Text style={styles.nome}>
                {item.nome}
              </Text>

              <View style={styles.actions}>

                <Pressable
                  style={styles.btn}
                  onPress={() =>
                    navigation.navigate("RecursoForm", {
                      recurso: item
                    })
                  }
                >
                  <Text style={styles.btnText}>
                    Editar
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.deleteBtn]}
                  onPress={() => excluir(item.idRecurso)}
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

  /* HEADER PADRÃO */
  header: {
    height: 75,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20
  },

  tituloHeader: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007A33"
  },

  icon: {
    width: 28,
    height: 28,
    resizeMode: "contain"
  },

  /* CONTEÚDO PADRÃO */
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15
  },

  list: {
    paddingBottom: 20
  },

  /* BOTÃO ADD */
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
    fontWeight: "bold",
    alignSelf: "center"
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

  deleteBtn: {
    backgroundColor: "#007A33"
  },

  btnText: {
    color: "#FFF"
  }
});