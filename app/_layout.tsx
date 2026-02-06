import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Globale StatusBar Komponente für iOS, falls du sie hier willst */}
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: "#F2E8DF" },
          // Globaler Standard für Android via Router
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

        <Stack.Screen
          name="gameScreen"
          options={{
            headerShown: false,
            // LOGIK:
            // iOS: Wir setzen statusBarStyle auf undefined (damit Router sich raushält)
            //      und statusBarHidden auf true (damit sie weg ist).
            // Android: Wir setzen statusBarStyle explizit auf "light" via Router.

            statusBarStyle: Platform.OS === "android" ? "light" : undefined,
            statusBarHidden: Platform.OS === "ios",
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
