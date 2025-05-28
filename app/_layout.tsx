// app/_layout.js or RootLayout.js
import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import AppSafeArea from "../components/AppSafeArea";
import ToastNotification from "../components/ToastNotification";
import { AuthProvider } from "../context/AuthContext";
import { useNetStatus } from "../hooks/useNetStatus";
import OfflineScreen from './(screens)/OfflineScreen ';
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const isConnected = useNetStatus(); // ← get connectivity status

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AppSafeArea backgroundColor="#000">
          {isConnected ? (
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/welcome" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/addtransaction" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/login" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/signup" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/(configuration)/category" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/(configuration)/newCategory" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/(configuration)/recurringTransaction" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/configuration" options={{ headerShown: false }} />
              <Stack.Screen name="(screens)/onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          ) : (
            <OfflineScreen /> 
          )}
        </AppSafeArea>
        <StatusBar style="light" />
        <ToastNotification />
      </ThemeProvider>
    </AuthProvider>
  );
}
