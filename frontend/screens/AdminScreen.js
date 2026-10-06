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

export default function AdminScreen({ navigation }) {
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 600;
  const isVerySmallScreen = width < 380;

  // No computador: os 4 cards ficam em uma única fila.
  // No celular: ficam 2 por linha.
  const cardWidth = isSmallScreen
    ? (width - 60) / 2
    : (width - 160) / 4;

  const cardHeight = isSmallScreen ? 190 : 230;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View
        style={[
          styles.header,
          {
            height: isSmallScreen ? 80 : 90,
            paddingHorizontal: isSmallScreen ? 20 : 30,
          },
        ]}
      >
        <Text
          style={[
            styles.logo,
            {
              fontSize: isSmallScreen ? 28 : 32,
            },
          ]}
        >
          SISLAB
        </Text>

        <Pressable
          style={[
            styles.userButton,
            {
              width: isSmallScreen ? 48 : 54,
              height: isSmallScreen ? 48 : 54,
              borderRadius: isSmallScreen ? 24 : 27,
            },
          ]}
          onPress={() => navigation.navigate("Logout")}
        >
          <Image
            source={require("../assets/user.png")}
            style={styles.userIcon}
          />
        </Pressable>
      </View>

      {/* CONTEÚDO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingHorizontal: isSmallScreen ? 20 : 40,
            paddingTop: isSmallScreen ? 25 : 40,
            paddingBottom: 40,
          },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                fontSize: isSmallScreen ? 23 : 28,
              },
            ]}
          >
            Área Administrativa
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                fontSize: isVerySmallScreen ? 13 : 15,
              },
            ]}
          >
            Gerencie os recursos e informações do SISLAB.
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.cardsContainer}>
          {/* LABORATÓRIOS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("Laboratorios")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../assets/lab.png")}
                style={styles.icon}
              />
            </View>

            <View style={styles.button}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 13 : 14,
                  },
                ]}
              >
                Laboratórios
              </Text>
            </View>
          </Pressable>

          {/* SALAS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("Salas")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../assets/sala.png")}
                style={styles.icon}
              />
            </View>

            <View style={styles.button}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 13 : 14,
                  },
                ]}
              >
                Salas
              </Text>
            </View>
          </Pressable>

          {/* EQUIPAMENTOS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("Equipamentos")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../assets/equipamento.png")}
                style={styles.icon}
              />
            </View>

            <View style={styles.button}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 13 : 14,
                  },
                ]}
              >
                Equipamentos
              </Text>
            </View>
          </Pressable>

          {/* RELATÓRIOS */}
          <Pressable
            style={({ pressed }) => [
              styles.card,
              {
                width: cardWidth,
                height: cardHeight,
              },
              pressed && styles.cardPressed,
            ]}
            onPress={() => navigation.navigate("Relatorios")}
          >
            <View style={styles.iconContainer}>
              <Image
                source={require("../assets/relatorio.png")}
                style={styles.icon}
              />
            </View>

            <View style={styles.button}>
              <Text
                style={[
                  styles.buttonText,
                  {
                    fontSize: isVerySmallScreen ? 13 : 14,
                  },
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
    backgroundColor: "#e3f7ed",
  },

  header: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  logo: {
    fontWeight: "bold",
    color: "#006633",
  },

  userButton: {
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d5eee3",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  userIcon: {
    width: "60%",
    height: "60%",
    tintColor: "#006633",
    resizeMode: "contain",
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
  },

  titleContainer: {
    width: "100%",
    maxWidth: 1200,
    marginBottom: 30,
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    color: "#006633",
    marginBottom: 6,
  },

  subtitle: {
    color: "#666666",
  },

  cardsContainer: {
    width: "100%",
    maxWidth: 1200,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderWidth: 1.5,
    borderColor: "#a6e4cf",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    width: 90,
    height: 90,
    resizeMode: "contain",
  },

  button: {
    width: "100%",
    backgroundColor: "#007A33",
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
});