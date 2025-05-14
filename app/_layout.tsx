import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import ToastNotification from "../components/ToastNotification";
import { AuthProvider } from "../context/AuthContext";

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
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
          <Stack.Screen name="(screens)/welcome" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)/addtransaction" options={{headerShown : false}} />
          <Stack.Screen name="(screens)/login" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)/(configuration)/category" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)/onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />

        <ToastNotification />
      </ThemeProvider>
    </AuthProvider>
  );
}
