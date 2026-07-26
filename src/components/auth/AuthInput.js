import { View, TextInput, StyleSheet, Dimensions } from "react-native";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

export default function AuthInput({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  rightIcon,
  keyboardType = "default",
  style,
  editable = true,
  ...rest
}) {
  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        style={[styles.input, rightIcon ? styles.inputWithIcon : null]}
        placeholder={placeholder}
        placeholderTextColor="#9B9B9B"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize="none"
        {...rest}
      />

      {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    height: 45 * scaleY,
    borderRadius: 23 * scaleX,
    borderWidth: 1,
    borderColor: "#E8EDF2",
    paddingHorizontal: 14 * scaleX,
    fontSize: 14 * scaleX,
    fontWeight: "400",
    color: "#222222",
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.035,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputWithIcon: {
    paddingRight: 45 * scaleX,
  },
  rightIcon: {
    position: "absolute",
    right: 15 * scaleX,
    height: 45 * scaleY,
    justifyContent: "center",
    alignItems: "center",
  },
});