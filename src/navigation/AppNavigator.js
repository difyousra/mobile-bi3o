import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import BottomTabNavigator from "./BottomTabNavigator";
import MessagesNavigator from "./MessagesNavigator";
import SearchScreen from "../screens/SearchScreen";
import SearchFiltersScreen from "../screens/search/SearchFiltersScreen";
import MapSearchScreen from "../screens/search/MapSearchScreen";
import ProductDetailScreen from "../screens/product/ProductDetailScreen";
import ProductReviewsScreen from "../screens/product/ProductReviewsScreen";
import CheckoutScreen from "../screens/buy/CheckoutScreen";
import AddressScreen, {
  AddAddressScreen,
} from "../screens/buy/AddressScreen";
import PaymentMethodScreen, {
  FinishPaymentScreen,
} from "../screens/buy/PaymentMethodScreen";
import AccountSettingsScreen from "../screens/account/AccountSettingsScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import MyWalletScreen from "../screens/account/MyWalletScreen";
import MyListingsScreen from "../screens/account/MyListingsScreen";
import ChangePasswordScreen from "../screens/account/ChangePasswordScreen";
import SellerProfileScreen from "../screens/account/SellerProfileScreen";
import MyReservationsScreen from "../screens/account/MyReservationsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import FloatingTabBar from "./FloatingTabBar";
import CartScreen from "../screens/CartScreen";
import { navigationRef } from "./navigationRef";
import { withProtectedScreen } from "./ProtectedScreen";

const Stack = createNativeStackNavigator();

const ProtectedMessages = withProtectedScreen(MessagesNavigator);
const ProtectedCheckout = withProtectedScreen(CheckoutScreen);
const ProtectedBuyAddress = withProtectedScreen(AddressScreen);
const ProtectedBuyAddAddress = withProtectedScreen(AddAddressScreen);
const ProtectedBuyPayment = withProtectedScreen(PaymentMethodScreen);
const ProtectedBuyFinish = withProtectedScreen(FinishPaymentScreen);
const ProtectedAccountSettings = withProtectedScreen(AccountSettingsScreen);
const ProtectedEditProfile = withProtectedScreen(EditProfileScreen);
const ProtectedChangePassword = withProtectedScreen(ChangePasswordScreen);
const ProtectedMyWallet = withProtectedScreen(MyWalletScreen);
const ProtectedMyListings = withProtectedScreen(MyListingsScreen);
const ProtectedMyReservations = withProtectedScreen(MyReservationsScreen);
const ProtectedNotifications = withProtectedScreen(NotificationsScreen);

export default function AppNavigator() {
  const [navState, setNavState] = useState();

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={setNavState}
      onReady={() => setNavState(navigationRef.getRootState())}
    >
      <View style={styles.root}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="Messages" component={ProtectedMessages} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="SearchFilters" component={SearchFiltersScreen} />
          <Stack.Screen name="MapSearch" component={MapSearchScreen} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen
            name="ProductReviews"
            component={ProductReviewsScreen}
          />
          <Stack.Screen
            name="SellerProfile"
            component={SellerProfileScreen}
          />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={ProtectedCheckout} />
          <Stack.Screen name="BuyAddress" component={ProtectedBuyAddress} />
          <Stack.Screen
            name="BuyAddAddress"
            component={ProtectedBuyAddAddress}
          />
          <Stack.Screen name="BuyPayment" component={ProtectedBuyPayment} />
          <Stack.Screen name="BuyFinish" component={ProtectedBuyFinish} />
          <Stack.Screen
            name="AccountSettings"
            component={ProtectedAccountSettings}
          />
          <Stack.Screen name="EditProfile" component={ProtectedEditProfile} />
          <Stack.Screen
            name="ChangePassword"
            component={ProtectedChangePassword}
          />
          <Stack.Screen name="MyWallet" component={ProtectedMyWallet} />
          <Stack.Screen name="MyListings" component={ProtectedMyListings} />
          <Stack.Screen
            name="MyReservations"
            component={ProtectedMyReservations}
          />
          <Stack.Screen
            name="Notifications"
            component={ProtectedNotifications}
          />
        </Stack.Navigator>
        <FloatingTabBar navigationRef={navigationRef} navState={navState} />
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
