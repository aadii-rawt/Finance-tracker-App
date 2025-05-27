import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import ToastNotification from "../components/ToastNotification";
import { AuthProvider } from "../context/AuthContext";

import { useColorScheme } from '@/hooks/useColorScheme';
import AppSafeArea from "../components/AppSafeArea"; // ← import your custom safe area

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={DefaultTheme}>
        <AppSafeArea backgroundColor="#000"> {/* ← wrap your layout */}
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
        </AppSafeArea>
        <StatusBar style="light" /> {/* match barStyle to your AppSafeArea */}
        <ToastNotification />
      </ThemeProvider>
    </AuthProvider>
  );
}
