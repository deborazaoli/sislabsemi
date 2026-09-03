import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

export default function RecursoFormScreen({ route, navigation }) {
  const recurso = route.params?.recurso;
  const tipoInicial = route.params?.tipo || recurso?.tipoRecurso || "sala";

  const [tipo, setTipo] = useState(tipoInicial);

  const [nome, setNome] = useState(recurso?.nome || "");
  const [capacidade, setCapacidade] = useState(
    recurso?.capacidadePessoas?.toString() || ""
  );
  const [localizacao, setLocalizacao] = useState(recurso?.localizacao || "");
  const [observacao, setObservacao] = useState(recurso?.observacao || "");

  const [codigoSeguranca, setCodigoSeguranca] = useState(
    recurso?.codigoSeguranca || ""
  );

  const [codigoValidade, setCodigoValidade] = useState(
    recurso?.codigoValidade || ""
  );

  const salvar = async () => {
    try {
      const baseURL = "http://localhost:3000";

      const url = recurso
        ? `${baseURL}/recursos/${recurso.idRecurso}`
        : `${baseURL}/recursos`;

      const body = {
        idRecurso: recurso?.idRecurso,
        nome,
        tipoRecurso: tipo,
        capacidadePessoas:
          tipo === "equipamento" ? null : Number(capacidade || 0),
        localizacao,
        observacao,
        codigoSeguranca: tipo === "equipamento" ? codigoSeguranca : null,
        codigoValidade: tipo === "equipamento" ? codigoValidade : null
      };

      const res = await fetch(url, {
        method: recurso ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error("Erro ao salvar recurso");

      navigation.goBack();

    } catch (err) {
      console.log(err);
      alert("Falha ao salvar recurso");
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>

        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/reserva.png")}
            style={styles.icon}
          />
        </Pressable>

        <Text style={styles.tituloHeader}>
          SISLAB
        </Text>

        <View style={{ width: 28 }} />
      </View>

      {/* CONTEÚDO COM ESPAÇAMENTO */}
      <View style={styles.content}>

        <Text style={styles.title}>
          {recurso ? "Editar Recurso" : "Novo Recurso"}
        </Text>

        {!recurso && (
          <View style={styles.tipoBox}>
            {["sala", "laboratorio", "equipamento"].map((t) => (
              <Pressable
                key={t}
                onPress={() => setTipo(t)}
                style={[
                  styles.tipoBtn,
                  tipo === t && styles.tipoBtnActive
                ]}
              >
                <Text style={{ color: tipo === t ? "#fff" : "#000" }}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        <TextInput
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />

        {tipo !== "equipamento" && (
          <TextInput
            placeholder="Capacidade"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="numeric"
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Localização"
          value={localizacao}
          onChangeText={setLocalizacao}
          style={styles.input}
        />

        <TextInput
          placeholder="Observação"
          value={observacao}
          onChangeText={setObservacao}
          style={styles.input}
        />

        {tipo === "equipamento" && (
          <>
            <TextInput
              placeholder="Código de segurança"
              value={codigoSeguranca}
              onChangeText={setCodigoSeguranca}
              style={styles.input}
            />

            <TextInput
              placeholder="Código de validade"
              value={codigoValidade}
              onChangeText={setCodigoValidade}
              style={styles.input}
            />
          </>
        )}

        <Pressable style={styles.btn} onPress={salvar}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Salvar
          </Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },

  btn: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  tipoBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15
  },

  tipoBtn: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#eee"
  },

  tipoBtnActive: {
    backgroundColor: "#007A33"
  }
});