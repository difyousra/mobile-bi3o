import { View, StyleSheet } from "react-native";

const SKELETON = "#E9EDF2";

export default function SkeletonBlock({
  width,
  height,
  borderRadius = 8,
  style,
  circle = false,
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: circle ? height / 2 : borderRadius,
          backgroundColor: SKELETON,
        },
        style,
      ]}
    />
  );
}

export { SKELETON };
