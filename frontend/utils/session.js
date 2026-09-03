import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";

export async function getSessionId() {
  let id = await AsyncStorage.getItem("sessionId");

  if (!id) {
    id = uuidv4();
    await AsyncStorage.setItem("sessionId", id);
  }

  return id;
}