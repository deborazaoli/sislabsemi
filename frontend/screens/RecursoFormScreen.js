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

export default function RecursoFormScreen({ route, navigation }) {

  const { width } = useWindowDimensions();

  const isSmallScreen = width < 600;

  // Recurso existente quando for edição
  const recurso = route.params?.recurso;

  // Tipo enviado pela tela de listagem
  // Exemplo:
  // LaboratoriosScreen -> tipo: "laboratorio"
  // SalasScreen -> tipo: "sala"
  // EquipamentosScreen -> tipo: "equipamento"
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
    equipamento: "Equipamento"
  };


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
          tipo === "equipamento"
            ? null
            : Number(capacidade || 0),

        localizacao,

        observacao,

        codigoSeguranca:
          tipo === "equipamento"
            ? codigoSeguranca
            : null,

        codigoValidade:
          tipo === "equipamento"
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

    <View style={styles.container}>


      {/* HEADER */}

      <View
        style={[
          styles.header,
          {
            height: isSmallScreen ? 65 : 75,
            paddingHorizontal: isSmallScreen ? 15 : 30
          }
        ]}
      >

        <Pressable onPress={() => navigation.goBack()}>

          <Image
            source={require("../assets/reserva.png")}
            style={[
              styles.icon,
              {
                width: isSmallScreen ? 24 : 28,
                height: isSmallScreen ? 24 : 28
              }
            ]}
          />

        </Pressable>


        <Text
          style={[
            styles.tituloHeader,
            {
              fontSize: isSmallScreen ? 24 : 28
            }
          ]}
        >
          SISLAB
        </Text>


        <View
          style={{
            width: isSmallScreen ? 24 : 28
          }}
        />

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
            : `Novo ${nomeTipo[tipo]}`
          }
        </Text>


        {/* NOME */}

        <TextInput
          placeholder={
            tipo === "laboratorio"
              ? "Nome do laboratório"
              : tipo === "sala"
              ? "Nome da sala"
              : "Nome do equipamento"
          }
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />


        {/* CAPACIDADE */}

        {tipo !== "equipamento" && (

          <TextInput
            placeholder="Capacidade de pessoas"
            value={capacidade}
            onChangeText={setCapacidade}
            keyboardType="numeric"
            style={styles.input}
          />

        )}


        {/* LOCALIZAÇÃO */}

        <TextInput
          placeholder="Localização"
          value={localizacao}
          onChangeText={setLocalizacao}
          style={styles.input}
        />


        {/* OBSERVAÇÃO */}

        <TextInput
          placeholder="Observação"
          value={observacao}
          onChangeText={setObservacao}
          style={styles.input}
          multiline
        />


        {/* CAMPOS EXCLUSIVOS DO EQUIPAMENTO */}

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


        {/* BOTÃO SALVAR */}

        <Pressable
          style={styles.btn}
          onPress={salvar}
        >

          <Text style={styles.btnText}>
            Salvar
          </Text>

        </Pressable>


      </ScrollView>

    </View>

  );

}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  header: {
    backgroundColor: "#FFFFFF",

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center"
  },


  tituloHeader: {
    fontWeight: "bold",
    color: "#007A33"
  },


  icon: {
    resizeMode: "contain"
  },


  content: {
    flexGrow: 1
  },


  title: {
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000"
  },


  input: {
    backgroundColor: "#FFFFFF",

    padding: 12,

    borderRadius: 10,

    marginBottom: 12,

    minHeight: 48
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