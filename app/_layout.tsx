import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    MochiBoom: require("../assets/fonts/MochiBoom.ttf"),
  });

  // Falls Font noch lädt: Zeige einfach nichts oder Ladekreis (verhindert Crash)
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#F2E8DF" },
          statusBarStyle: Platform.OS === "android" ? "dark" : undefined,
          headerTitle: "",
          headerTransparent: true,
          headerShadowVisible: false,
          headerBackButtonDisplayMode: "minimal",
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create" />
        <Stack.Screen name="join" />
        <Stack.Screen name="invite" />
        <Stack.Screen name="rulebook/[id]" />
        <Stack.Screen name="controls" />
        <Stack.Screen name="design" />

        <Stack.Screen
          name="gameScreen"
          options={{
            headerShown: false,
            statusBarStyle: Platform.OS === "android" ? "light" : undefined,
            statusBarHidden: Platform.OS === "ios",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
