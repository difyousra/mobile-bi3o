import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import PublishScreen from "../screens/PublishScreen";
import AccountScreen from "../screens/AccountScreen";
import MessagesNavigator from "./MessagesNavigator";
import { withProtectedTab } from "./ProtectedScreen";
import { useAuth } from "../context/AuthContext";
import { isProtectedTab, returnToTab } from "./authRoutes";

const Tab = createBottomTabNavigator();

const ProtectedFavorites = withProtectedTab(FavoritesScreen, "Favorites");
const ProtectedPublish = withProtectedTab(PublishScreen, "Publish");
const ProtectedMessagesTab = withProtectedTab(MessagesNavigator, "Messages");
const ProtectedAccount = withProtectedTab(AccountScreen, "Account");

export default function BottomTabNavigator() {
  const { isAuthenticated, requireAuth } = useAuth();

  const protectedTabListeners = (tabName) => ({
    tabPress: (e) => {
      if (isAuthenticated || !isProtectedTab(tabName)) return;
      e.preventDefault();
      requireAuth(returnToTab(tabName));
    },
  });

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
        component={ProtectedFavorites}
        options={{ tabBarLabel: "Favoris" }}
        listeners={protectedTabListeners("Favorites")}
      />
      <Tab.Screen
        name="Publish"
        component={ProtectedPublish}
        options={{ tabBarLabel: "Publier" }}
        listeners={protectedTabListeners("Publish")}
      />
      <Tab.Screen
        name="Messages"
        component={ProtectedMessagesTab}
        options={{ tabBarLabel: "Messages" }}
        listeners={protectedTabListeners("Messages")}
      />
      <Tab.Screen
        name="Account"
        component={ProtectedAccount}
        options={{ tabBarLabel: "Compte" }}
        listeners={protectedTabListeners("Account")}
      />
    </Tab.Navigator>
  );
}
