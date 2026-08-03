import { View, StyleSheet } from "react-native";
import HomeHeader from "../home/HomeHeader";
import HomeSearchBar from "../home/HomeSearchBar";
import CategoryChips from "../home/CategoryChips";
import { CATEGORIES } from "../../data/mockHomeData";
import { showDevMessage } from "../../utils/devFeedback";

export default function BuyFlowHeader({ navigation, activeCategory = "clothes" }) {
  return (
    <View style={styles.wrap}>
      <HomeHeader
        onNotificationPress={() =>
          showDevMessage("Notifications", "Bientôt disponible.")
        }
        onLogoPress={() => navigation.navigate("MainTabs", { screen: "Home" })}
      />
      <HomeSearchBar
        placeholder="Search clothes. . ."
        onFilterPress={() => navigation.navigate("SearchFilters")}
        onSubmitEditing={() => navigation.navigate("Search")}
      />
      <CategoryChips
        categories={CATEGORIES}
        activeId={activeCategory}
        onSelect={() => navigation.navigate("MainTabs", { screen: "Home" })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
});
