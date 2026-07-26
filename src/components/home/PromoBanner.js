import { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;
const BANNER_WIDTH = SCREEN_WIDTH - H_PAD * 2;

export default function PromoBanner({ banners, onCtaPress }) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / BANNER_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        decelerationRate="fast"
        snapToInterval={BANNER_WIDTH}
      >
        {banners.map((banner) => (
          <View key={banner.id} style={styles.banner}>
            <View style={styles.textBlock}>
              <Text style={styles.title}>{banner.title}</Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
              <TouchableOpacity
                style={styles.cta}
                activeOpacity={0.85}
                onPress={() => onCtaPress(banner)}
              >
                <Text style={styles.ctaText}>{banner.cta}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.textDark} />
              </TouchableOpacity>
            </View>
            <Image source={{ uri: banner.image }} style={styles.image} />
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {banners.map((banner, index) => (
          <View
            key={banner.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 22,
  },
  banner: {
    width: BANNER_WIDTH,
    height: 170,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1A1C1E",
    flexDirection: "row",
  },
  textBlock: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
    zIndex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 6,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
    lineHeight: 16,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textDark,
  },
  image: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "50%",
    resizeMode: "cover",
    opacity: 0.9,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },
});
