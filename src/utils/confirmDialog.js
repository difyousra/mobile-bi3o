import { Alert, Platform } from "react-native";
import i18n from "../i18n";

/**
 * Dialogue de confirmation compatible web + natif.
 * Sur web, `Alert.alert` est souvent inopérant → `window.confirm`.
 */
export function confirmDialog(title, message, buttons = []) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const ok = window.confirm(`${title}\n\n${message}`);
    const cancelBtn = buttons.find((b) => b.style === "cancel");
    const confirmBtn =
      buttons.find((b) => b.style === "destructive") ||
      buttons.find((b) => b.style !== "cancel");
    if (ok) {
      confirmBtn?.onPress?.();
    } else {
      cancelBtn?.onPress?.();
    }
    return;
  }
  Alert.alert(title, message, buttons);
}

export function alertDialog(title, message, buttons) {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(message ? `${title}\n\n${message}` : title);
    const okBtn =
      buttons?.find((b) => b.style !== "cancel") || buttons?.[buttons.length - 1];
    okBtn?.onPress?.();
    return;
  }
  Alert.alert(title, message, buttons ?? [{ text: i18n.t("mobile.common.ok") }]);
}
