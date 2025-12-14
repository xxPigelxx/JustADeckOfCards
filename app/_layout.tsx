import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          statusBarStyle: "dark",
          headerTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        {/* No header at all */}
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />

        {/* Back button only */}
        <Stack.Screen name="create" />
        <Stack.Screen name="join" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="rulebook/[id]" />
        <Stack.Screen name="controls" />

        {/* No header */}
        <Stack.Screen
          name="gameScreen"
          options={{ headerShown: false, statusBarStyle: "light" }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
