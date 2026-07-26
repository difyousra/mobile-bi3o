import { View, StyleSheet, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SkeletonBlock from "../common/SkeletonBlock";
import { colors } from "../../theme/colors";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const H_PAD = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - H_PAD * 2;

function HeroBannerSkeleton() {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroGradientLeft} />
      <View style={styles.heroGradientRight} />

      <View style={styles.heroBottom}>
        <View style={styles.heroButton}>
          <SkeletonBlock width={18} height={18} circle />
        </View>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 0 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <SkeletonBlock
        width={(CONTENT_WIDTH - 36) / 4}
        height={(CONTENT_WIDTH - 36) / 4}
        borderRadius={12}
      />
      <SkeletonBlock
        width={(CONTENT_WIDTH - 36) / 4 - 12}
        height={10}
        borderRadius={5}
        style={styles.productLabel}
      />
    </View>
  );
}

function FeedItemSkeleton() {
  const imageSize = 118;

  return (
    <View style={styles.feedItem}>
      <View style={styles.feedImageWrap}>
        <SkeletonBlock width={imageSize} height={imageSize} borderRadius={14} />
        <SkeletonBlock
          width={22}
          height={22}
          circle
          style={styles.feedBadge}
        />
      </View>

      <View style={styles.feedContent}>
        <SkeletonBlock width="88%" height={12} borderRadius={6} />
        <SkeletonBlock width="72%" height={12} borderRadius={6} />
        <SkeletonBlock width="56%" height={12} borderRadius={6} />
        <SkeletonBlock width="40%" height={12} borderRadius={6} />

        <View style={styles.feedFooter}>
          <SkeletonBlock width={52} height={12} borderRadius={6} />
          <SkeletonBlock width={28} height={28} circle />
        </View>
      </View>
    </View>
  );
}

export default function HomeSkeletonContent() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.header}>
          <SkeletonBlock width={40} height={40} circle />
          <SkeletonBlock
            width={CONTENT_WIDTH - 40 - 88}
            height={40}
            borderRadius={20}
            style={styles.searchBar}
          />
          <View style={styles.headerIcons}>
            <SkeletonBlock width={28} height={28} circle />
            <SkeletonBlock width={28} height={28} circle />
            <SkeletonBlock width={28} height={28} circle />
          </View>
        </View>

        <HeroBannerSkeleton />

        <View style={styles.sectionRow}>
          <SkeletonBlock width={28} height={28} circle />
          <SkeletonBlock
            width={CONTENT_WIDTH - 28 - 52}
            height={14}
            borderRadius={7}
            style={styles.sectionLine}
          />
          <SkeletonBlock width={40} height={40} circle />
        </View>

        <View style={styles.sectionHeader}>
          <SkeletonBlock width={120} height={14} borderRadius={7} />
          <SkeletonBlock width={52} height={12} borderRadius={6} />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsRow}
        >
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </ScrollView>

        <View style={styles.sectionHeader}>
          <SkeletonBlock width={100} height={14} borderRadius={7} />
          <SkeletonBlock width={52} height={12} borderRadius={6} />
        </View>

        <FeedItemSkeleton />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  searchBar: {
    flex: 1,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  heroCard: {
    width: CONTENT_WIDTH,
    height: 176,
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#F4F7FB",
  },
  heroGradientLeft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F4F7FB",
  },
  heroGradientRight: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: "58%",
    backgroundColor: "rgba(245, 180, 188, 0.85)",
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
  },
  heroBottom: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroButton: {
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    backgroundColor: colors.white,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionLine: {
    flex: 1,
    marginHorizontal: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  productsRow: {
    gap: 12,
    paddingBottom: 22,
  },
  productCard: {
    alignItems: "center",
  },
  productLabel: {
    marginTop: 8,
  },
  feedItem: {
    flexDirection: "row",
    gap: 14,
    marginTop: 4,
  },
  feedImageWrap: {
    position: "relative",
  },
  feedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  feedContent: {
    flex: 1,
    gap: 10,
    paddingTop: 4,
  },
  feedFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
});
