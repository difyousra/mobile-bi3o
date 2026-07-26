import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Bi3ooLogo from "./Bi3ooLogo";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

const scaleX = SCREEN_WIDTH / DESIGN_WIDTH;
const scaleY = SCREEN_HEIGHT / DESIGN_HEIGHT;

const HEADER_HEIGHT = 397 * scaleY;
const GRID_GAP = 41.89 * scaleX;

const DOTS = [
  { x: 35, y: 18, s: 1.4 },
  { x: 78, y: 45, s: 1.4 },
  { x: 154, y: 24, s: 1.4 },
  { x: 256, y: 50, s: 1.4 },
  { x: 325, y: 67, s: 1.4 },
  { x: 96, y: 93, s: 1.4 },
  { x: 180, y: 88, s: 1.4 },
  { x: 240, y: 95, s: 1.4 },
  { x: 354, y: 110, s: 1.4 },
  { x: 27, y: 163, s: 1.4 },
  { x: 77, y: 170, s: 1.4 },
  { x: 134, y: 140, s: 1.4 },
  { x: 227, y: 163, s: 1.4 },
  { x: 290, y: 152, s: 1.4 },
  { x: 354, y: 210, s: 1.4 },
  { x: 113, y: 244, s: 1.4 },
  { x: 247, y: 229, s: 1.4 },
  { x: 301, y: 244, s: 1.4 },
  { x: 18, y: 290, s: 1.4 },
  { x: 180, y: 290, s: 1.4 },
  { x: 310, y: 300, s: 1.4 },
  { x: 32, y: 365, s: 1.4 },
];

function GridBackground() {
  const cols = Math.ceil(SCREEN_WIDTH / GRID_GAP) + 1;
  const rows = Math.ceil(HEADER_HEIGHT / GRID_GAP) + 1;

  return (
    <View style={styles.grid} pointerEvents="none">
      {Array.from({ length: cols }).map((_, i) => (
        <View
          key={`v-${i}`}
          style={[
            styles.gridLine,
            {
              left: i * GRID_GAP,
              top: 0,
              width: 1,
              height: HEADER_HEIGHT,
            },
          ]}
        />
      ))}

      {Array.from({ length: rows }).map((_, j) => (
        <View
          key={`h-${j}`}
          style={[
            styles.gridLine,
            {
              left: 0,
              top: j * GRID_GAP,
              width: SCREEN_WIDTH,
              height: 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function AuthHeader({
  title = "Sign Up",
  promptText = "Already have an account? ",
  linkText = "Log In",
  onLinkPress,
  onBackPress,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { height: HEADER_HEIGHT }]}>
      <GridBackground />

      {DOTS.map((dot, index) => {
        const size = dot.s * scaleX;

        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                left: dot.x * scaleX,
                top: dot.y * scaleY,
                width: size,
                height: size,
                borderRadius: size / 2,
              },
            ]}
          />
        );
      })}

      <TouchableOpacity
        style={[
          styles.backButton,
          {
            top: insets.top + 58 * scaleY,
            left: 22 * scaleX,
          },
        ]}
        activeOpacity={0.7}
        onPress={onBackPress}
      >
        <Ionicons name="arrow-back" size={26 * scaleX} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.brandBlock}>
        <Bi3ooLogo />
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.promptRow}>
        <Text style={styles.promptText}>{promptText}</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onLinkPress}>
          <Text style={styles.promptLink}>{linkText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    overflow: "hidden",
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.10)",
  },
  dot: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.45)",
    zIndex: 1,
  },
  backButton: {
    position: "absolute",
    width: 50 * scaleX,
    height: 40 * scaleY,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  brandBlock: {
    position: "absolute",
    top: 100 * scaleY,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  title: {
    fontSize: 30 * scaleX,
    fontWeight: "400",
    color: colors.white,
    letterSpacing: 0.2,
    marginTop: -22 * scaleY,
    left: 32 * scaleX,
  },
  promptRow: {
    position: "absolute",
    top: 240 * scaleY,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  promptText: {
    fontSize: 13.5 * scaleX,
    color: colors.white,
    fontWeight: "500",
  },
  promptLink: {
    fontSize: 13.5 * scaleX,
    color: colors.white,
    fontWeight: "800",
  },
});
