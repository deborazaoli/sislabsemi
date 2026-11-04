import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useFocusEffect } from "@react-navigation/native";

import API_URL from "../services/api";

export default function EquipamentosScreen({ navigation }) {
  const [dados, setDados] = useState([]);

  const carregarDados = () => {
    fetch(
      `${API_URL}/recursos?tipo=equipamento`
    )
      .then(res => res.json())
      .then(setDados)
      .catch(error => {
        console.log(
          "Erro ao carregar equipamentos:",
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
        "Erro ao excluir equipamento:",
        error
      );
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

          <Text style={styles.tituloHeader}>
            Equipamentos
          </Text>

          <View style={styles.headerSpace} />
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
                  tipo: "equipamento"
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
            showsVerticalScrollIndicator={false}
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
                    style={[
                      styles.btn,
                      styles.deleteBtn
                    ]}
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
    backgroundColor: "#FFFFFF",
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

  headerSpace: {
    width: 38
  },

  tituloHeader: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#007A33",
    textAlign: "center"
  },

  backIcon: {
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  addText: {
    fontSize: 28,
    color: "#007A33",
    fontWeight: "bold",
    lineHeight: 30
  },

  card: {
    backgroundColor: "#FFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  nome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 10
  },

  actions: {
    flexDirection: "row"
  },

  btn: {
    backgroundColor: "#007A33",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8
  },

  deleteBtn: {
    backgroundColor: "#E53935"
  },

  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 13
  }
});