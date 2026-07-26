import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MessagesListScreen from "../screens/messages/MessagesListScreen";
import ChatScreen from "../screens/messages/ChatScreen";

const Stack = createNativeStackNavigator();

export default function MessagesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MessagesList" component={MessagesListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
}
