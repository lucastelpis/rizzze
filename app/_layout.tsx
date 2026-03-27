import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Nunito_400Regular: 'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.ttf',
          Nunito_500Medium: 'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.ttf', // Fallback or separate
          Nunito_700Bold: 'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.ttf',
          Nunito_800ExtraBold: 'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.ttf',
          Nunito_900Black: 'https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.ttf',
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setLoaded(true);
        SplashScreen.hideAsync();
      }
    }
    loadFonts();
  }, []);

  if (!loaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
