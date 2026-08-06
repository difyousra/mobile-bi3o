import { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, StyleSheet } from "react-native";
import BottomTabNavigator from "./BottomTabNavigator";
import MessagesNavigator from "./MessagesNavigator";
import SearchScreen from "../screens/SearchScreen";
import SearchFiltersScreen from "../screens/search/SearchFiltersScreen";
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
import SecuritySettingsScreen from "../screens/account/SecuritySettingsScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import MyWalletScreen from "../screens/account/MyWalletScreen";
import MyListingsScreen from "../screens/account/MyListingsScreen";
import ChangePasswordScreen from "../screens/account/ChangePasswordScreen";
import SellerProfileScreen from "../screens/account/SellerProfileScreen";
import MyReservationsScreen from "../screens/account/MyReservationsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import PrivacySettingsScreen from "../screens/settings/PrivacySettingsScreen";
import NotificationSettingsScreen from "../screens/settings/NotificationSettingsScreen";
import LotDiscountsSettingsScreen from "../screens/settings/LotDiscountsSettingsScreen";
import DisplaySettingsScreen from "../screens/settings/DisplaySettingsScreen";
import LegalHubScreen from "../screens/settings/LegalHubScreen";
import PrivacyPolicyScreen from "../screens/settings/PrivacyPolicyScreen";
import TermsOfUseScreen from "../screens/settings/TermsOfUseScreen";
import AboutBi3ooScreen from "../screens/settings/AboutBi3ooScreen";
import LegalContactScreen from "../screens/settings/LegalContactScreen";
import MortgageSimulatorScreen from "../screens/simulators/MortgageSimulatorScreen";
import VehicleSimulatorScreen from "../screens/simulators/VehicleSimulatorScreen";
import FloatingTabBar from "./FloatingTabBar";
import CartScreen from "../screens/CartScreen";
import { navigationRef } from "./navigationRef";
import { withProtectedScreen } from "./ProtectedScreen";
import { ENABLE_BUY_WALLET } from "../config/featureFlags";

const Stack = createNativeStackNavigator();

const ProtectedMessages = withProtectedScreen(MessagesNavigator);
const ProtectedCheckout = withProtectedScreen(CheckoutScreen);
const ProtectedBuyAddress = withProtectedScreen(AddressScreen);
const ProtectedBuyAddAddress = withProtectedScreen(AddAddressScreen);
const ProtectedBuyPayment = withProtectedScreen(PaymentMethodScreen);
const ProtectedBuyFinish = withProtectedScreen(FinishPaymentScreen);
const ProtectedAccountSettings = withProtectedScreen(AccountSettingsScreen);
const ProtectedSecuritySettings = withProtectedScreen(SecuritySettingsScreen);
const ProtectedPrivacySettings = withProtectedScreen(PrivacySettingsScreen);
const ProtectedNotificationSettings = withProtectedScreen(
  NotificationSettingsScreen
);
const ProtectedLotDiscountsSettings = withProtectedScreen(
  LotDiscountsSettingsScreen
);
const ProtectedDisplaySettings = withProtectedScreen(DisplaySettingsScreen);
const ProtectedLegalHub = withProtectedScreen(LegalHubScreen);
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
          <Stack.Screen
            name="MapSearch"
            getComponent={() =>
              require("../screens/search/MapSearchScreen").default
            }
          />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
          <Stack.Screen
            name="MortgageSimulator"
            component={MortgageSimulatorScreen}
          />
          <Stack.Screen
            name="VehicleSimulator"
            component={VehicleSimulatorScreen}
          />
          <Stack.Screen
            name="ProductReviews"
            component={ProductReviewsScreen}
          />
          <Stack.Screen
            name="SellerProfile"
            component={SellerProfileScreen}
          />
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="Cart" component={CartScreen} />
          ) : null}
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="Checkout" component={ProtectedCheckout} />
          ) : null}
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="BuyAddress" component={ProtectedBuyAddress} />
          ) : null}
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen
              name="BuyAddAddress"
              component={ProtectedBuyAddAddress}
            />
          ) : null}
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="BuyPayment" component={ProtectedBuyPayment} />
          ) : null}
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="BuyFinish" component={ProtectedBuyFinish} />
          ) : null}
          <Stack.Screen
            name="AccountSettings"
            component={ProtectedAccountSettings}
          />
          <Stack.Screen
            name="SecuritySettings"
            component={ProtectedSecuritySettings}
          />
          <Stack.Screen
            name="PrivacySettings"
            component={ProtectedPrivacySettings}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={ProtectedNotificationSettings}
          />
          <Stack.Screen
            name="LotDiscountsSettings"
            component={ProtectedLotDiscountsSettings}
          />
          <Stack.Screen
            name="DisplaySettings"
            component={ProtectedDisplaySettings}
          />
          <Stack.Screen name="LegalHub" component={ProtectedLegalHub} />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
          <Stack.Screen name="AboutBi3oo" component={AboutBi3ooScreen} />
          <Stack.Screen name="LegalContact" component={LegalContactScreen} />
          <Stack.Screen name="EditProfile" component={ProtectedEditProfile} />
          <Stack.Screen
            name="ChangePassword"
            component={ProtectedChangePassword}
          />
          {ENABLE_BUY_WALLET ? (
            <Stack.Screen name="MyWallet" component={ProtectedMyWallet} />
          ) : null}
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
