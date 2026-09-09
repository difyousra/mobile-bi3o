import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { useAppLanguage } from "../../i18n/LanguageProvider";
import VoiceSearchButton from "../search/VoiceSearchButton";

export default function HomeSearchBar({
  value,
  onChangeText,
  onFilterPress,
  placeholder,
  onSubmitEditing,
  onVoiceFinalResult,
  showFilterButton = true,
  showVoiceSearch = true,
}) {
  const { t } = useAppLanguage();

  const handleVoiceFinal = (text) => {
    const trimmed = String(text || "").trim();
    if (!trimmed) return;
    onChangeText?.(trimmed);
    if (onVoiceFinalResult) {
      onVoiceFinalResult(trimmed);
      return;
    }
    onSubmitEditing?.({ nativeEvent: { text: trimmed } });
  };

  return (
    <View style={styles.row}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={colors.iconMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder ?? t("mobile.search.placeholder", {
            defaultValue: t("search.placeholder", {
              defaultValue: t("nav.searchPlaceholder"),
            }),
          })}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
          onSubmitEditing={onSubmitEditing}
        />
        {showVoiceSearch ? (
          <VoiceSearchButton
            onTranscript={onChangeText}
            onFinalResult={handleVoiceFinal}
          />
        ) : null}
      </View>

      {showFilterButton && onFilterPress ? (
        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.85}
          onPress={onFilterPress}
        >
          <Ionicons name="options-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    paddingVertical: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
