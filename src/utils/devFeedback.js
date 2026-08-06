import { Alert } from "react-native";
import i18n from "../i18n";

export function showDevMessage(title, message) {
  Alert.alert(title, message, [{ text: i18n.t("mobile.common.ok") }]);
}
