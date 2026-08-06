import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import VehicleFinancingSimulator from "../../features/vehicules/components/VehicleFinancingSimulator";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";

export default function VehicleSimulatorScreen({ navigation, route }) {
  const { t } = useAppLanguage();
  const initialPrix = Number(route?.params?.prix) || 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.back}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={22} color={colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("vehiculesUi.simulatorTitle")}</Text>
        <View style={styles.back} />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <VehicleFinancingSimulator initialPrix={initialPrix} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: colors.textHeading,
  },
  content: { padding: 16, paddingBottom: 40 },
});
