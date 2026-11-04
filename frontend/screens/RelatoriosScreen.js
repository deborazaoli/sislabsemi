import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL from "../services/api";

export default function RelatoriosScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};
  const [relatorio, setRelatorio] = useState([]);

  const buscar = async () => {
    try {
      const res = await fetch(`${API_URL}/reservas/all`);
      const data = await res.json();

      setRelatorio(data);
    } catch (error) {
      console.log("Erro ao buscar relatório:", error);
      alert("Não foi possível carregar o relatório.");
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

          <Text style={styles.tituloHeader}>Relatórios</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* CONTEÚDO */}
        <View style={styles.content}>
          <Pressable style={styles.btn} onPress={buscar}>
            <Text style={styles.btnText}>
              Gerar relatório
            </Text>
          </Pressable>

          <ScrollView showsVerticalScrollIndicator={false}>
            {relatorio.map((r) => (
              <View key={r.idReserva} style={styles.card}>
                <Text style={styles.nome}>
                  {r.responsavelNome}
                </Text>

                <Text style={styles.texto}>
                  Data: {r.reservaData}
                </Text>

                <Text style={styles.texto}>
                  Status: {r.statusReserva}
                </Text>
              </View>
            ))}
          </ScrollView>
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

  btn: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15
  },

  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  },

  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#007A33"
  },

  texto: {
    fontSize: 14,
    color: "#333"
  }
});