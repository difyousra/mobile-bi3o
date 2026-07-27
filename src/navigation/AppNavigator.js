import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
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

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const navigationRef = useNavigationContainerRef();
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
          <Stack.Screen name="Messages" component={MessagesNavigator} />
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
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="BuyAddress" component={AddressScreen} />
          <Stack.Screen
            name="BuyAddAddress"
            component={AddAddressScreen}
          />
          <Stack.Screen name="BuyPayment" component={PaymentMethodScreen} />
          <Stack.Screen
            name="BuyFinish"
            component={FinishPaymentScreen}
          />
          <Stack.Screen
            name="AccountSettings"
            component={AccountSettingsScreen}
          />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen
            name="ChangePassword"
            component={ChangePasswordScreen}
          />
          <Stack.Screen name="MyWallet" component={MyWalletScreen} />
          <Stack.Screen
            name="MyListings"
            component={MyListingsScreen}
          />
          <Stack.Screen
            name="MyReservations"
            component={MyReservationsScreen}
          />
          <Stack.Screen
            name="Notifications"
            component={NotificationsScreen}
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
