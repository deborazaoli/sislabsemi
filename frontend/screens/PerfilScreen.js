import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Image,
  TextInput,
  Modal,
  ScrollView
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { SESSAO_KEY } from "./LoginUsuarioScreen";
import API_URL from "../services/api";

export default function PerfilScreen({ navigation, route }) {
  const usuario = route?.params?.usuario || {};

  // Estados do usuário
  const [foto, setFoto] = useState(usuario.foto || null);
  const [modalSenhaVisivel, setModalSenhaVisivel] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  // Função para alterar a foto de perfil
  const alterarFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert("Permissão negada", "Precisamos de acesso à galeria para alterar a foto.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
      // Aqui você também pode enviar a foto para a sua API se necessário
    }
  };

  // Função para salvar nova senha
  const salvarNovaSenha = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      Alert.alert("Atenção", "Preencha todos os campos de senha.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    if (novaSenha.length < 6) {
      Alert.alert("Erro", "A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    try {
      // Exemplo de requisição para atualizar senha na API
      const resposta = await fetch(`${API_URL}/usuarios/senha/${usuario.idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senhaAtual, novaSenha })
      });

      if (!resposta.ok) {
        throw new Error("Não foi possível alterar a senha.");
      }

      Alert.alert("Sucesso", "Senha alterada com sucesso!");
      setModalSenhaVisivel(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.log("Erro ao alterar senha:", error);
      Alert.alert("Erro", "Senha atual incorreta ou erro no servidor.");
    }
  };

  // Função de Logout
  const sair = async () => {
    Alert.alert(
      "Fazer Logout",
      "Deseja realmente sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(SESSAO_KEY);
              navigation.reset({
                index: 0,
                routes: [{ name: "LoginUsuario" }]
              });
            } catch (error) {
              console.log("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível encerrar a sessão.");
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>

      {/* HEADER PADRONIZADO */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.voltar}
        >
          <Image
            source={require("../assets/seta.png")}
            style={styles.backIcon}
          />
        </Pressable>

        <Text style={styles.tituloHeader}>Meu Perfil</Text>

        <View style={styles.espaco} />
      </View>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>

        {/* FOTO DE PERFIL */}
        <View style={styles.fotoContainer}>
          <Pressable onPress={alterarFoto} style={styles.avatarWrapper}>
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarPlaceholderText}>
                  {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U"}
                </Text>
              </View>
            )}
            <View style={styles.badgeCamera}>
              <Text style={styles.badgeCameraText}>📷</Text>
            </View>
          </Pressable>
          <Text style={styles.alterarFotoTexto}>Toque para alterar a foto</Text>
        </View>

        {/* INFORMAÇÕES FIXAS */}
        <View style={styles.infoCard}>
          <View style={styles.infoLinha}>
            <Text style={styles.infoRotulo}>Nome</Text>
            <Text style={styles.infoValor}>{usuario.nome || "Não informado"}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.infoLinha}>
            <Text style={styles.infoRotulo}>E-mail</Text>
            <Text style={styles.infoValor}>{usuario.email || "Não informado"}</Text>
          </View>

          <View style={styles.divisor} />

          <View style={styles.infoLinha}>
            <Text style={styles.infoRotulo}>Matrícula</Text>
            <Text style={styles.infoValor}>{usuario.matricula || "Não informada"}</Text>
          </View>
        </View>

        {/* BOTÃO EDITAR SENHA */}
        <Pressable
          style={styles.btnEditarSenha}
          onPress={() => setModalSenhaVisivel(true)}
        >
          <Text style={styles.txtEditarSenha}>Editar Senha</Text>
        </Pressable>

        {/* BOTÃO LOGOUT NO FINAL */}
        <Pressable
          style={styles.btnLogout}
          onPress={sair}
        >
          <Text style={styles.txtLogout}>Fazer Logout</Text>
        </Pressable>

      </ScrollView>

      {/* MODAL DE EDITAR SENHA */}
      <Modal
        visible={modalSenhaVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalSenhaVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Alterar Senha</Text>

            <TextInput
              style={styles.input}
              placeholder="Senha atual"
              placeholderTextColor="#777"
              secureTextEntry
              value={senhaAtual}
              onChangeText={setSenhaAtual}
            />

            <TextInput
              style={styles.input}
              placeholder="Nova senha (mín. 6 caracteres)"
              placeholderTextColor="#777"
              secureTextEntry
              value={novaSenha}
              onChangeText={setNovaSenha}
            />

            <TextInput
              style={styles.input}
              placeholder="Confirmar nova senha"
              placeholderTextColor="#777"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <Pressable style={styles.saveBtn} onPress={salvarNovaSenha}>
              <Text style={styles.saveText}>Salvar Nova Senha</Text>
            </Pressable>

            <Pressable onPress={() => setModalSenhaVisivel(false)}>
              <Text style={styles.cancelModal}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF"
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

  voltar: {
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  backIcon: {
    width: 28,
    height: 28,
    resizeMode: "contain"
  },

  tituloHeader: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
    color: "#007A33",
    textAlign: "center"
  },

  espaco: {
    width: 38,
  },

  conteudo: {
    flexGrow: 1,
    backgroundColor: "#CCFCE4",
    padding: 20,
    alignItems: "center"
  },

  fotoContainer: {
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10
  },

  avatarWrapper: {
    position: "relative",
    width: 110,
    height: 110,
    borderRadius: 55,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: "#FFF"
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#007A33",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF"
  },

  avatarPlaceholderText: {
    fontSize: 45,
    fontWeight: "bold",
    color: "#FFF"
  },

  badgeCamera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFF",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    elevation: 2
  },

  badgeCameraText: {
    fontSize: 14
  },

  alterarFotoTexto: {
    marginTop: 8,
    fontSize: 13,
    color: "#007A33",
    fontWeight: "600"
  },

  infoCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },

  infoLinha: {
    paddingVertical: 10
  },

  infoRotulo: {
    fontSize: 12,
    color: "#777",
    marginBottom: 3,
    fontWeight: "600",
    textTransform: "uppercase"
  },

  infoValor: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold"
  },

  divisor: {
    height: 1,
    backgroundColor: "#EFEFEF"
  },

  btnEditarSenha: {
    width: "100%",
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#007A33",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12
  },

  txtEditarSenha: {
    color: "#007A33",
    fontWeight: "bold",
    fontSize: 16
  },

  btnLogout: {
    width: "100%",
    backgroundColor: "#E53935",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10
  },

  txtLogout: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20
  },

  modalBox: {
    backgroundColor: "#FFF",
    padding: 22,
    borderRadius: 16
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007A33",
    marginBottom: 15,
    textAlign: "center"
  },

  input: {
    borderWidth: 1,
    borderColor: "#B8D9C4",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#FAFFFC",
    color: "#333"
  },

  saveBtn: {
    backgroundColor: "#007A33",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5
  },

  saveText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16
  },

  cancelModal: {
    marginTop: 15,
    color: "#E53935",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 15
  }
});