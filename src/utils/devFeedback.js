import { Alert } from "react-native";

export function showDevMessage(title, message) {
  Alert.alert(title, message, [{ text: "OK" }]);
}
