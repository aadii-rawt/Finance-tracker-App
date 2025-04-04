import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider } from "../context/AuthContext";
import ToastNotification from "../components/ToastNotification";
import { TouchableOpacity } from "react-native";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });


  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);



  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
          {/* <Stack.Screen name="login" /> */}
          {/* <Stack.Screen name="(screens)/add" /> */}
          <Stack.Screen name="(screens)/welcome" options={{headerShown : false}} />
          {/* <Stack.Screen name="(screens)/addtransaction" options={{headerShown : false}} /> */}
          <Stack.Screen name="(screens)/login" options={{headerShown : false}} />
          <Stack.Screen name="(screens)/signup" options={{headerShown : false}} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />

        <ToastNotification />
      </ThemeProvider>
    </AuthProvider>
  );
}
