import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  useWindowDimensions,
  ScrollView
} from "react-native";

export default function AdminScreen({ navigation }) {

  const { width } = useWindowDimensions();

  // Define o tamanho da tela
  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 380;

  // Tamanho dos cards
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
            paddingHorizontal: isSmallScreen ? 15 : 30
          }
        ]}
      >

        <Text
          style={[
            styles.logo,
            {
              fontSize: isSmallScreen ? 24 : 28
            }
          ]}
        >
          SISLAB
        </Text>


        <Pressable
          style={[
            styles.userButton,
            {
              width: isSmallScreen ? 44 : 50,
              height: isSmallScreen ? 44 : 50,
              borderRadius: isSmallScreen ? 22 : 25
            }
          ]}
          onPress={() => navigation.navigate("Logout")}
        >

          <Image
            source={require("../assets/user.png")}
            style={[
              styles.userIcon,
              {
                width: isSmallScreen ? 34 : 40,
                height: isSmallScreen ? 42 : 50
              }
            ]}
          />

        </Pressable>

      </View>


      {/* CONTEÚDO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 20 : 30,
            paddingVertical: isSmallScreen ? 30 : 50
          }
        ]}
      >

        <View
          style={[
            styles.cardsContainer,
            {
              flexDirection: isSmallScreen ? "column" : "row",
              gap: isSmallScreen ? 20 : 40
            }
          ]}
        >


          {/* LABORATÓRIOS */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45
              }
            ]}
            onPress={() => navigation.navigate("Laboratorios")}
          >

            <Image
              source={require("../assets/lab.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100
                }
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180
                }
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16
                  }
                ]}
              >
                Laboratórios
              </Text>
            </View>

          </Pressable>


          {/* SALAS */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45
              }
            ]}
            onPress={() => navigation.navigate("Salas")}
          >

            <Image
              source={require("../assets/sala.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100
                }
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180
                }
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16
                  }
                ]}
              >
                Salas
              </Text>
            </View>

          </Pressable>


          {/* EQUIPAMENTOS */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45
              }
            ]}
            onPress={() => navigation.navigate("Equipamentos")}
          >

            <Image
              source={require("../assets/equipamento.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100
                }
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180
                }
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16
                  }
                ]}
              >
                Equipamentos
              </Text>
            </View>

          </Pressable>


          {/* RELATÓRIOS */}
          <Pressable
            style={[
              styles.card,
              {
                width: cardWidth,
                height: isSmallScreen ? 220 : 260,
                paddingVertical: isSmallScreen ? 30 : 45
              }
            ]}
            onPress={() => navigation.navigate("Relatorios")}
          >

            <Image
              source={require("../assets/relatorio.png")}
              style={[
                styles.icon,
                {
                  width: isSmallScreen ? 80 : 100,
                  height: isSmallScreen ? 80 : 100
                }
              ]}
            />

            <View
              style={[
                styles.button,
                {
                  width: isSmallScreen ? "80%" : 180
                }
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 14 : 16
                  }
                ]}
              >
                Relatórios
              </Text>
            </View>

          </Pressable>


        </View>

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


  logo: {
    fontWeight: "bold",
    color: "#007A33"
  },


  userButton: {
    backgroundColor: "#007A33",

    justifyContent: "center",
    alignItems: "center"
  },


  userIcon: {
    tintColor: "#FFF",
    resizeMode: "contain"
  },


  content: {
    flexGrow: 1,

    justifyContent: "center",
    alignItems: "center"
  },


  cardsContainer: {
    justifyContent: "center",
    alignItems: "center",

    width: "100%"
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
    borderColor: "#00A884"
  },


  icon: {
    resizeMode: "contain"
  },


  button: {
    backgroundColor: "#007A33",

    paddingVertical: 12,

    borderRadius: 25,

    alignItems: "center"
  },


  buttonText: {
    color: "#FFF",

    fontWeight: "600",

    textAlign: "center"
  }

});
