import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image
} from "react-native";

export default function Header({
  titulo,
  navigation,
  admin = false
}) {
  return (
    <View style={styles.header}>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.icon}>←</Text>
      </Pressable>

      <View style={styles.center}>
        <Image
          source={{
            uri: "https://picsum.photos/80"
          }}
          style={styles.logo}
        />

        <Text style={styles.titulo}>
          {titulo}
        </Text>
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate(
            admin ? "Logout" : "Login"
          )
        }
      >
        <Text style={styles.icon}>
          👤
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 75,
    backgroundColor: "#FFFFFF",

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 30
  },

  center: {
    alignItems: "center"
  },

  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4
  },

  titulo: {
    fontSize: 22,
    fontWeight: "bold"
  },

  icon: {
    fontSize: 24,
    color: "#007A33"
  }
});