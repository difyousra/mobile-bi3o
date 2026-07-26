import { View, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

export default function ProductImageGallery({
  images,
  activeIndex,
  onSelect,
  layout = "hero",
}) {
  const mainUri = images[activeIndex] ?? images[0];

  if (layout === "side") {
    return (
      <View style={styles.sideWrap}>
        <Image source={{ uri: mainUri }} style={styles.sideMain} />
        <ScrollView style={styles.sideThumbs} showsVerticalScrollIndicator={false}>
          {images.map((uri, index) => (
            <TouchableOpacity
              key={`${uri}-${index}`}
              style={[styles.sideThumb, activeIndex === index && styles.sideThumbActive]}
              onPress={() => onSelect(index)}
            >
              <Image source={{ uri }} style={styles.sideThumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View>
      <Image source={{ uri: mainUri }} style={styles.heroImage} />
      {images.length > 1 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {images.map((uri, index) => (
            <TouchableOpacity
              key={`${uri}-${index}`}
              style={[styles.thumb, activeIndex === index && styles.thumbActive]}
              onPress={() => onSelect(index)}
            >
              <Image source={{ uri }} style={styles.thumbImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}
      {images.length > 1 ? (
        <View style={styles.dots}>
          {images.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeIndex === index && styles.dotActive]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: {
    width: "100%",
    height: 380,
    backgroundColor: "#F5F5F5",
  },
  thumbRow: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
  },
  thumbActive: {
    borderColor: colors.primary,
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 10,
    backgroundColor: colors.navy,
  },
  sideWrap: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  sideMain: {
    flex: 1,
    height: 280,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  sideThumbs: {
    width: 64,
    maxHeight: 280,
  },
  sideThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    marginBottom: 8,
  },
  sideThumbActive: {
    borderColor: colors.primary,
  },
  sideThumbImage: {
    width: "100%",
    height: "100%",
  },
});
