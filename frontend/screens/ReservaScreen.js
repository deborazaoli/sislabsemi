import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  Platform
} from "react-native";

import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";

const formatTime = (date) => {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}:00`;
};

export default function ReservaScreen({ navigation }) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");

  const [tipo, setTipo] = useState("");
  const [recurso, setRecurso] = useState("");
  const [listaRecursos, setListaRecursos] = useState([]);

  const [data, setData] = useState(new Date());
  const [horaInicio, setHoraInicio] = useState(new Date());
  const [horaFim, setHoraFim] = useState(new Date());

  const [showDate, setShowDate] = useState(false);
  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

  const buscarRecursos = async (tipoSelecionado) => {
    try {
      const res = await fetch(
        `http://localhost:3000/recursos?tipo=${tipoSelecionado}`
      );
      const json = await res.json();
      setListaRecursos(json);
    } catch (err) {
      console.log(err);
    }
  };

  const salvarReserva = async () => {
    try {
      if (!nome || !matricula || !tipo || !recurso) {
        alert("Preencha todos os campos obrigatórios");
        return;
      }

      const payload = {
      responsavelNome: nome,
      responsavelMatricula: matricula,
      reservaData: data.toISOString().split("T")[0],
      horaRetirada: formatTime(horaInicio),
      horaDevolucao: formatTime(horaFim),
      idUsuario: "U002",
      idRecurso: recurso
    };

      const res = await fetch("http://localhost:3000/reservas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        alert(json.message || "Erro ao criar reserva");
        return;
      }

      alert("Reserva criada com sucesso!");
      navigation.goBack();

    } catch (err) {
      console.log(err);
      alert("Erro ao salvar reserva");
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.logo}>SISLAB</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>

        <Text style={styles.title}>Fazer Reserva</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          style={styles.input}
          placeholder="Matrícula"
          value={matricula}
          onChangeText={setMatricula}
        />

        {Platform.OS === "web" ? (
          <input
            type="date"
            value={data.toISOString().split("T")[0]}
            onChange={(e) => setData(new Date(e.target.value))}
            style={styles.webInput}
          />
        ) : (
          <>
            <Pressable style={styles.input} onPress={() => setShowDate(true)}>
              <Text>Data: {data.toLocaleDateString()}</Text>
            </Pressable>

            {showDate && (
              <DateTimePicker
                value={data}
                mode="date"
                onChange={(e, selected) => {
                  setShowDate(false);
                  if (selected) setData(selected);
                }}
              />
            )}
          </>
        )}

        {/* HORA INICIO */}
        {Platform.OS === "web" ? (
          <input
            type="time"
            value={horaInicio.toTimeString().slice(0, 5)}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":");
              const d = new Date();
              d.setHours(h, m);
              setHoraInicio(d);
            }}
            style={styles.webInput}
          />
        ) : (
          <>
            <Pressable style={styles.input} onPress={() => setShowInicio(true)}>
              <Text>Início: {horaInicio.toTimeString().slice(0, 5)}</Text>
            </Pressable>

            {showInicio && (
              <DateTimePicker
                value={horaInicio}
                mode="time"
                is24Hour
                onChange={(e, selected) => {
                  setShowInicio(false);
                  if (selected) setHoraInicio(selected);
                }}
              />
            )}
          </>
        )}

        {/* HORA FIM */}
        {Platform.OS === "web" ? (
          <input
            type="time"
            value={horaFim.toTimeString().slice(0, 5)}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":");
              const d = new Date();
              d.setHours(h, m);
              setHoraFim(d);
            }}
            style={styles.webInput}
          />
        ) : (
          <>
            <Pressable style={styles.input} onPress={() => setShowFim(true)}>
              <Text>Fim: {horaFim.toTimeString().slice(0, 5)}</Text>
            </Pressable>

            {showFim && (
              <DateTimePicker
                value={horaFim}
                mode="time"
                is24Hour
                onChange={(e, selected) => {
                  setShowFim(false);
                  if (selected) setHoraFim(selected);
                }}
              />
            )}
          </>
        )}

        <Text style={styles.label}>Tipo de Recurso</Text>

        <View style={styles.pickerBox}>
          <Picker
            selectedValue={tipo}
            onValueChange={(value) => {
              setTipo(value);
              setRecurso("");
              setListaRecursos([]);
              if (value) buscarRecursos(value);
            }}
          >
            <Picker.Item label="Selecione o tipo" value="" />
            <Picker.Item label="Sala" value="Sala" />
            <Picker.Item label="Laboratório" value="Laboratório" />
            <Picker.Item label="Equipamento" value="Equipamento" />
          </Picker>
        </View>

        {tipo !== "" && (
          <View style={styles.pickerBox}>
            <Picker selectedValue={recurso} onValueChange={setRecurso}>
              <Picker.Item label="Escolha o recurso" value="" />

              {listaRecursos.map((item) => (
                <Picker.Item
                  key={item.idRecurso}
                  label={item.nome}
                  value={item.idRecurso}
                />
              ))}
            </Picker>
          </View>
        )}

        <Pressable style={styles.button} onPress={salvarReserva}>
          <Text style={styles.buttonText}>Reservar</Text>
        </Pressable>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ccfce4" },

  header: {
    height: 75,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30
  },

  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33"
  },

  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain"
  },

  content: {
    flex: 1,
    padding: 30
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 20
  },

  input: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },

  webInput: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #ccc"
  },

  label: {
    fontWeight: "bold",
    marginBottom: 10
  },

  pickerBox: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginBottom: 15
  },

  button: {
    backgroundColor: "#007A33",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 15
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "bold"
  }
});