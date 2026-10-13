import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import API_URL from "../services/api";


const EMAILS_SALVOS_KEY = "@sislab:emails_salvos";

// Chave onde fica guardado o usuário quando "Manter conectado" está marcado.
// Importe esta constante na tela/botão de sair para remover a sessão.
export const SESSAO_KEY = "@sislab:usuario_logado";


export default function LoginUsuarioScreen({ navigation }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [emailsSalvos, setEmailsSalvos] = useState([]);

  const [emailFocado, setEmailFocado] = useState(false);

  const [carregando, setCarregando] = useState(false);

  const [manterConectado, setManterConectado] = useState(false);

  // Enquanto verifica se já existe sessão salva, não mostra o formulário
  const [verificandoSessao, setVerificandoSessao] = useState(true);


  useEffect(() => {
    carregarEmailsSalvos();
    verificarSessao();
  }, []);


  // Se o usuário escolheu permanecer conectado, entra direto na Home
  const verificarSessao = async () => {

    try {

      const dados = await AsyncStorage.getItem(
        SESSAO_KEY
      );

      if (dados) {

        const usuario = JSON.parse(dados);

        if (usuario) {

          navigation.replace("Home", {
            usuario
          });

          return;
        }

      }

    } catch (error) {

      console.log(
        "Erro ao verificar sessão:",
        error
      );

    }

    setVerificandoSessao(false);

  };


  // Carrega os emails salvos no dispositivo
  const carregarEmailsSalvos = async () => {

    try {

      const dados = await AsyncStorage.getItem(
        EMAILS_SALVOS_KEY
      );

      if (dados) {

        const lista = JSON.parse(dados);

        if (Array.isArray(lista)) {
          setEmailsSalvos(lista);
        }

      }

    } catch (error) {

      console.log(
        "Erro ao carregar emails salvos:",
        error
      );

    }

  };


  // Salva o email usado no login
  const salvarEmail = async (emailUsado) => {

    try {

      const emailLimpo = emailUsado
        .trim()
        .toLowerCase();


      // Remove o email caso ele já exista
      const listaSemDuplicado = emailsSalvos.filter(
        item => item !== emailLimpo
      );


      // Coloca o email usado mais recentemente no início
      const novaLista = [
        emailLimpo,
        ...listaSemDuplicado
      ];


      // Mantém no máximo 5 emails salvos
      const listaFinal = novaLista.slice(0, 5);


      await AsyncStorage.setItem(
        EMAILS_SALVOS_KEY,
        JSON.stringify(listaFinal)
      );


      setEmailsSalvos(listaFinal);

    } catch (error) {

      console.log(
        "Erro ao salvar email:",
        error
      );

    }

  };


  // Guarda (ou apaga) a sessão conforme a caixinha
  const salvarSessao = async (usuario) => {

    try {

      if (manterConectado) {

        await AsyncStorage.setItem(
          SESSAO_KEY,
          JSON.stringify(usuario)
        );

      } else {

        await AsyncStorage.removeItem(
          SESSAO_KEY
        );

      }

    } catch (error) {

      console.log(
        "Erro ao salvar sessão:",
        error
      );

    }

  };


  // Seleciona um email da lista
  const selecionarEmail = (emailSelecionado) => {

    setEmail(emailSelecionado);

    setEmailFocado(false);

  };


  // Remove um email da lista
  const removerEmail = async (emailRemover) => {

    try {

      const novaLista = emailsSalvos.filter(
        item => item !== emailRemover
      );


      await AsyncStorage.setItem(
        EMAILS_SALVOS_KEY,
        JSON.stringify(novaLista)
      );


      setEmailsSalvos(novaLista);

    } catch (error) {

      console.log(
        "Erro ao remover email:",
        error
      );

    }

  };


  const login = async () => {

    if (!email || !senha) {

      Alert.alert(
        "Atenção",
        "Preencha o email e a senha."
      );

      return;
    }


    if (!email.includes("@")) {

      Alert.alert(
        "Email inválido",
        "Informe um email válido contendo '@'."
      );

      return;
    }


    try {

      setCarregando(true);


      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            senha
          })
        }
      );


      const data = await response.json();


      if (!response.ok) {

        Alert.alert(
          "Erro",
          data.message || "Email ou senha inválidos."
        );

        return;
      }


      // Salva o email somente depois de um login bem-sucedido
      await salvarEmail(email);


      // Salva a sessão se "Manter conectado" estiver marcado
      await salvarSessao(data.usuario);


      navigation.replace("Home", {
        usuario: data.usuario,
      });


    } catch (error) {

      console.log(
        "Erro no login:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível conectar ao servidor."
      );

    } finally {

      setCarregando(false);

    }

  };


  if (verificandoSessao) {

    return (

      <SafeAreaView
        style={[styles.safeArea, styles.centralizado]}
      >

        <ActivityIndicator
          size="large"
          color="#007A33"
        />

      </SafeAreaView>

    );

  }


  return (

    <SafeAreaView style={styles.safeArea}>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          <View style={styles.content}>

            {/* LOGO */}

            <Image
              source={require("../assets/logo.png")}
              style={styles.logoImage}
            />


            <Text style={styles.title}>
              Login
            </Text>


            <Text style={styles.subtitle}>
              Entre na sua conta
            </Text>


            {/* EMAIL */}

            <Text style={styles.label}>
              Email
            </Text>


            <View style={styles.emailContainer}>

              <TextInput
                style={styles.input}
                placeholder="Digite seu email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                onFocus={() => setEmailFocado(true)}
              />


              {/* LISTA DE EMAILS SALVOS */}

              {emailFocado && emailsSalvos.length > 0 && (

                <View style={styles.savedEmailsContainer}>

                  <Text style={styles.savedEmailsTitle}>
                    Contas usadas neste dispositivo
                  </Text>


                  {emailsSalvos.map((emailSalvo) => (

                    <View
                      key={emailSalvo}
                      style={styles.savedEmailItem}
                    >

                      <Pressable
                        style={styles.savedEmailButton}
                        onPress={() =>
                          selecionarEmail(emailSalvo)
                        }
                      >

                        <View style={styles.emailCircle}>

                          <Text style={styles.emailCircleText}>
                            @
                          </Text>

                        </View>


                        <Text
                          style={styles.savedEmailText}
                          numberOfLines={1}
                        >
                          {emailSalvo}
                        </Text>

                      </Pressable>


                      <Pressable
                        style={styles.removeEmailButton}
                        onPress={() =>
                          removerEmail(emailSalvo)
                        }
                      >

                        <Text style={styles.removeEmailText}>
                          ×
                        </Text>

                      </Pressable>

                    </View>

                  ))}

                </View>

              )}

            </View>


            {/* SENHA */}

            <Text style={styles.label}>
              Senha
            </Text>


            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              textContentType="password"
              onFocus={() => setEmailFocado(false)}
            />


            {/* MANTER CONECTADO */}

            <Pressable
              style={styles.checkboxRow}
              onPress={() =>
                setManterConectado(!manterConectado)
              }
            >

              <View
                style={[
                  styles.checkbox,
                  manterConectado && styles.checkboxMarcado
                ]}
              >

                {manterConectado && (
                  <Text style={styles.checkboxCheck}>
                    ✓
                  </Text>
                )}

              </View>

              <Text style={styles.checkboxLabel}>
                Manter conectado
              </Text>

            </Pressable>


            {/* ENTRAR */}

            <Pressable
              style={[
                styles.button,
                carregando && styles.buttonDisabled
              ]}
              onPress={login}
              disabled={carregando}
            >

              <Text style={styles.buttonText}>
                {carregando
                  ? "Entrando..."
                  : "Entrar"}
              </Text>

            </Pressable>


            {/* CADASTRO */}

            <Text style={styles.registerText}>
              Ainda não possui uma conta?
            </Text>


            <Pressable
              onPress={() =>
                navigation.navigate("CadastroUsuario")
              }
            >

              <Text style={styles.registerButton}>
                Criar cadastro
              </Text>

            </Pressable>


            {/* SEPARADOR */}

            <View style={styles.separator}>

              <View style={styles.line} />

              <Text style={styles.orText}>
                ou
              </Text>

              <View style={styles.line} />

            </View>


            {/* ADMINISTRADOR */}

            <Pressable
              style={styles.adminButton}
              onPress={() =>
                navigation.navigate("Login")
              }
            >

              <Text style={styles.adminButtonText}>
                Entrar como administrador
              </Text>

            </Pressable>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}


const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  centralizado: {
    justifyContent: "center",
    alignItems: "center"
  },


  container: {
    flex: 1,
    backgroundColor: "#ccfce4"
  },


  scroll: {
    flexGrow: 1
  },


  content: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    paddingHorizontal: 30,
    paddingVertical: 35
  },


  logoImage: {
    width: 1000,
    height: 150,
    resizeMode: "contain",
    alignSelf: "center",
    marginBottom: 12
  },


  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 8
  },


  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 25
  },


  /* CAMPOS */

  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 3
  },


  emailContainer: {
    position: "relative",
    zIndex: 10
  },


  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 18,
    fontSize: 16
  },


  /* MANTER CONECTADO */

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    alignSelf: "flex-start"
  },


  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#007A33",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10
  },


  checkboxMarcado: {
    backgroundColor: "#007A33"
  },


  checkboxCheck: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 18
  },


  checkboxLabel: {
    fontSize: 15,
    color: "#222"
  },


  /* EMAILS SALVOS */

  savedEmailsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d5eee3",
    marginTop: -10,
    marginBottom: 18,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3
    }
  },


  savedEmailsTitle: {
    fontSize: 13,
    color: "#666",
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 8
  },


  savedEmailItem: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee"
  },


  savedEmailButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15
  },


  emailCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#e3f7ed",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },


  emailCircleText: {
    color: "#007A33",
    fontSize: 17,
    fontWeight: "bold"
  },


  savedEmailText: {
    flex: 1,
    color: "#222",
    fontSize: 14,
    fontWeight: "500"
  },


  removeEmailButton: {
    width: 48,
    height: 50,
    alignItems: "center",
    justifyContent: "center"
  },


  removeEmailText: {
    color: "#888",
    fontSize: 25,
    fontWeight: "300"
  },


  /* BOTÃO */

  button: {
    backgroundColor: "#007A33",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 5
  },


  buttonDisabled: {
    opacity: 0.6
  },


  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold"
  },


  /* CADASTRO */

  registerText: {
    textAlign: "center",
    marginTop: 25,
    color: "#555"
  },


  registerButton: {
    textAlign: "center",
    color: "#007A33",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8
  },


  /* SEPARADOR */

  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25
  },


  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#AAAAAA"
  },


  orText: {
    marginHorizontal: 12,
    color: "#666"
  },


  /* ADMIN */

  adminButton: {
    borderWidth: 2,
    borderColor: "#007A33",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center"
  },


  adminButtonText: {
    color: "#007A33",
    fontSize: 16,
    fontWeight: "bold"
  }

});