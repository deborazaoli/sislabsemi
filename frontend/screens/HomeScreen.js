import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView,
} from "react-native";

export default function HomeScreen({ navigation, route }) {
  const { width } = useWindowDimensions();

  const usuario = route?.params?.usuario;

  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 380;

  const cardWidth = isSmallScreen
    ? Math.min(width - 40, 360)
    : Math.min(240, (width - 160) / 3);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            height: isSmallScreen ? 65 : 75,
            paddingHorizontal: isSmallScreen ? 15 : 30,
          },
        ]}
      >

        <Text
          style={[
            styles.logo,
            {
              fontSize: isSmallScreen ? 24 : 28,
            },
          ]}
        >
          SISLAB
        </Text>

        {/* BOTÃO DO USUÁRIO / LOGOUT */}
        <Pressable
          style={[
            styles.userButton,
            {
              width: isSmallScreen ? 44 : 50,
              height: isSmallScreen ? 44 : 50,
              borderRadius: isSmallScreen ? 22 : 25,
            },
          ]}
          onPress={() => navigation.navigate("Logout")}
        >

          <Image
            source={require("../assets/user.png")}
            style={[
              styles.userIcon,
              {
                width: isSmallScreen ? 34 : 40,
                height: isSmallScreen ? 42 : 50,
              },
            ]}
          />

        </Pressable>

      </View>

      {/* CONTEÚDO */}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 15 : 30,
            paddingVertical: isSmallScreen ? 30 : 50,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <Text
          style={[
            styles.title,
            {
              fontSize: isVerySmallScreen
                ? 22
                : isSmallScreen
                ? 26
                : 30,
            },
          ]}
        >
          Sistema de Controle de
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              fontSize: isVerySmallScreen
                ? 18
                : isSmallScreen
                ? 21
                : 24,

              marginBottom: isSmallScreen ? 30 : 40,
            },
          ]}
        >
          Laboratórios, Salas e Equipamentos
        </Text>

        <Text
          style={[
            styles.section,
            {
              fontSize: isSmallScreen ? 19 : 22,
              marginBottom: isSmallScreen ? 20 : 30,
            },
          ]}
        >
          O que deseja fazer?
        </Text>

        {/* CARDS */}
        <View
          style={[
            styles.cardsContainer,
            {
              flexDirection: isSmallScreen ? "column" : "row",
              gap: isSmallScreen ? 20 : 40,
              width: "100%",
            },
          ]}
        >

          {/* RESERVA */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45,
              },
            ]}
            onPress={() =>
              navigation.navigate("Reserva", {
                usuario: usuario,
              })
            }
          >

            <Image
              source={require("../assets/reserva.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100,
                },
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16,
                  },
                ]}
              >
                Fazer Reserva
              </Text>
            </View>

          </Pressable>

          {/* CALENDÁRIO */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45,
              },
            ]}
            onPress={() => navigation.navigate("Calendario")}
          >

            <Image
              source={require("../assets/calendario.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100,
                },
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16,
                  },
                ]}
              >
                Calendário
              </Text>
            </View>

          </Pressable>

          {/* MINHAS RESERVAS */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45,
              },
            ]}
            onPress={() =>
              navigation.navigate("MinhasReservas", {
                usuario: usuario,
              })
            }
          >

            <Image
              source={require("../assets/historico.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100,
                },
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180,
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16,
                  },
                ]}
              >
                Minhas Reservas
              </Text>
            </View>

          </Pressable>

        </View>

      </ScrollView>

      {/* FOOTER */}
      <View
        style={[
          styles.footer,
          {
            height: isSmallScreen ? 45 : 50,
          },
        ]}
      >
        <Text
          style={{
            fontSize: isSmallScreen ? 12 : 14,
          }}
        >
          IFPE Campus Jaboatão
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#ccfce4",
  },

  header: {
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    fontWeight: "bold",
    color: "#007A33",
  },

  userButton: {
    backgroundColor: "#007A33",

    justifyContent: "center",
    alignItems: "center",
  },

  userIcon: {
    tintColor: "#FFF",
    resizeMode: "contain",
  },

  content: {
    flexGrow: 1,

    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    fontWeight: "bold",
    textAlign: "center",
  },

  section: {
    fontWeight: "600",
    textAlign: "center",
  },

  cardsContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#FFF",

    borderRadius: 20,

    justifyContent: "space-between",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,

    elevation: 5,

    borderWidth: 3,
    borderColor: "#00A884",
  },

  icon: {
    resizeMode: "contain",
  },

  button: {
    backgroundColor: "#007A33",

    paddingVertical: 12,

    borderRadius: 25,

    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",

    fontWeight: "600",

    textAlign: "center",
  },

  footer: {
    backgroundColor: "#FFFFFF",

    justifyContent: "center",
    alignItems: "center",
  },

});