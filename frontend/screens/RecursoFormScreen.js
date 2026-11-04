import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import API_URL from "../services/api";

export default function RecursoFormScreen({ route, navigation }) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 600;

  // Recurso existente quando for edição
  const recurso = route.params?.recurso;

  // Tipo enviado pela tela de listagem
  const tipo = recurso?.tipoRecurso || route.params?.tipo || "sala";

  const [nome, setNome] = useState(recurso?.nome || "");
  const [capacidade, setCapacidade] = useState(
    recurso?.capacidadePessoas?.toString() || ""
  );
  const [localizacao, setLocalizacao] = useState(
    recurso?.localizacao || ""
  );
  const [observacao, setObservacao] = useState(
    recurso?.observacao || ""
  );
  const [codigoSeguranca, setCodigoSeguranca] = useState(
    recurso?.codigoSeguranca || ""
  );
  const [codigoValidade, setCodigoValidade] = useState(
    recurso?.codigoValidade || ""
  );

  // Nome do tipo para aparecer no título
  const nomeTipo = {
    sala: "Sala",
    laboratorio: "Laboratório",
    equipamento: "Equipamento",
    Sala: "Sala",
    Laboratório: "Laboratório",
    Equipamento: "Equipamento"
  };

  const salvar = async () => {
    try {
      const url = recurso
        ? `${API_URL}/recursos/${recurso.idRecurso}`
        : `${API_URL}/recursos`;

      const body = {
        idRecurso: recurso?.idRecurso,
        nome,
        tipoRecurso: tipo,
        capacidadePessoas:
          tipo === "equipamento" || tipo === "Equipamento"
            ? null
            : Number(capacidade || 0),
        localizacao,
        observacao,
        codigoSeguranca:
          tipo === "equipamento" || tipo === "Equipamento"
            ? codigoSeguranca
            : null,
        codigoValidade:
          tipo === "equipamento" || tipo === "Equipamento"
            ? codigoValidade
            : null
      };

      const res = await fetch(url, {
        method: recurso ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const erro = await res.text();
        console.log("Erro do servidor:", erro);
        throw new Error("Erro ao salvar recurso");
      }

      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Falha ao salvar recurso");
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

          <Text style={styles.tituloHeader}>SISLAB</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* CONTEÚDO */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: isSmallScreen ? 15 : 20,
              paddingTop: isSmallScreen ? 20 : 30,
              paddingBottom: 30
            }
          ]}
        >

          <Text
            style={[
              styles.title,
              {
                fontSize: isSmallScreen ? 20 : 22
              }
            ]}
          >
            {recurso
              ? `Editar ${nomeTipo[tipo]}`
              : `Novo ${nomeTipo[tipo]}`}
          </Text>

          {/* NOME */}
          <TextInput
            placeholder={
              tipo === "laboratorio" || tipo === "Laboratório"
                ? "Nome do laboratório"
                : tipo === "sala" || tipo === "Sala"
                ? "Nome da sala"
                : "Nome do equipamento"
            }
            placeholderTextColor="#888"
            value={nome}
            onChangeText={setNome}
            style={styles.input}
          />

          {/* CAPACIDADE */}
          {tipo !== "equipamento" && tipo !== "Equipamento" && (
            <TextInput
              placeholder="Capacidade de pessoas"
              placeholderTextColor="#888"
              value={capacidade}
              onChangeText={setCapacidade}
              keyboardType="numeric"
              style={styles.input}
            />
          )}

          {/* LOCALIZAÇÃO */}
          <TextInput
            placeholder="Localização"
            placeholderTextColor="#888"
            value={localizacao}
            onChangeText={setLocalizacao}
            style={styles.input}
          />

          {/* OBSERVAÇÃO */}
          <TextInput
            placeholder="Observação"
            placeholderTextColor="#888"
            value={observacao}
            onChangeText={setObservacao}
            style={styles.input}
            multiline
          />

          {/* CAMPOS EXCLUSIVOS DO EQUIPAMENTO */}
          {(tipo === "equipamento" || tipo === "Equipamento") && (
            <>
              <TextInput
                placeholder="Código de segurança"
                placeholderTextColor="#888"
                value={codigoSeguranca}
                onChangeText={setCodigoSeguranca}
                style={styles.input}
              />

              <TextInput
                placeholder="Código de validade"
                placeholderTextColor="#888"
                value={codigoValidade}
                onChangeText={setCodigoValidade}
                style={styles.input}
              />
            </>
          )}

          {/* BOTÃO SALVAR */}
          <Pressable style={styles.btn} onPress={salvar}>
            <Text style={styles.btnText}>Salvar</Text>
          </Pressable>

        </ScrollView>

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
    flexGrow: 1
  },

  title: {
    fontWeight: "bold",
    marginBottom: 20,
    color: "#007A33"
  },

  input: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    minHeight: 48,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E5E5E5"
  },

  btn: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8
  },

  btnText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16
  }
});