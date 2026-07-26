import { SafeAreaView } from "react-native-safe-area-context";
import AccountContent from "../components/account/AccountContent";

export default function AccountScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <AccountContent />
    </SafeAreaView>
  );
}
