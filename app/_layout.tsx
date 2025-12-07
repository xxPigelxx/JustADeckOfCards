import { Stack } from "expo-router";

export default function RootLayout() {
   return <Stack> 
    <Stack.Screen 
      name="index" 
      options={{ 
        title: "Home",
        headerBackButtonDisplayMode: "minimal",
        headerShown: false,
      }}
    />
    <Stack.Screen 
      name="create" 
      options={{ 
        title: "", 
        headerBackButtonDisplayMode: "minimal",
        headerTransparent: true,
      }}
    />
    <Stack.Screen 
      name="join" 
      options={{ 
        title: "", 
        headerBackButtonDisplayMode: "minimal",
        headerTransparent: true,
      }}
    />
    <Stack.Screen 
      name="rulebook" 
      options={{ 
        title: "", 
        headerBackButtonDisplayMode: "minimal",
        headerTransparent: true,
      }}
    />
  </Stack>;
}
