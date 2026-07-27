import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import PublishScreen from "../screens/PublishScreen";
import AccountScreen from "../screens/AccountScreen";
import MessagesNavigator from "./MessagesNavigator";

const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={() => null}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: "Accueil" }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarLabel: "Favoris" }}
      />
      <Tab.Screen
        name="Publish"
        component={PublishScreen}
        options={{ tabBarLabel: "Publier" }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesNavigator}
        options={{ tabBarLabel: "Messages" }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarLabel: "Compte" }}
      />
    </Tab.Navigator>
  );
}
