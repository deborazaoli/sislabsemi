import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Pressable,
  Image
} from "react-native";

export default function RelatoriosScreen({ navigation }) {
  const [relatorio, setRelatorio] = useState([]);

  const buscar = async () => {
    const res = await fetch("http://localhost:3000/reservas/all");
    const data = await res.json();
    setRelatorio(data);
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
          SISLAB
        </Text>

        <View style={{ width: 28 }} />
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
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#CCFCE4"
  },

  header: {
    height: 75,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30
  },

  tituloHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
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

  btn: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginBottom: 15
  },

  btnText: {
    color: "#FFF",
    fontWeight: "bold"
  },

  card: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  nome: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  },

  texto: {
    fontSize: 14
  }
});