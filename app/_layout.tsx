import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useGlobalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@/config/posthog';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AudioProvider } from '@/context/AudioContext';
import { StreakProvider } from '@/context/StreakContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SheepGrowthProvider } from '@/context/SheepGrowthContext';
import { SleepProvider } from '@/context/SleepContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { UserProvider } from '@/context/UserContext';
import { SyncObserver } from '@/components/SyncObserver';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="player" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SyncObserver />
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <PostHogProvider
      client={posthog}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
        propsToCapture: ['testID'],
        maxElementsCaptured: 20,
      }}
      enableSessionReplay={true}
      sessionReplayConfig={{
        maskAllTextInputs: true,
        maskAllImages: true,
      }}
    >
      <ThemeProvider>
        <UserProvider>
        <SubscriptionProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SheepGrowthProvider>
            <StreakProvider>
              <SleepProvider>
                <AudioProvider>
                  <NotificationProvider>
                    <RootLayoutContent />
                  </NotificationProvider>
                </AudioProvider>
              </SleepProvider>
            </StreakProvider>
          </SheepGrowthProvider>
        </NavigationThemeProvider>
        </SubscriptionProvider>
        </UserProvider>
      </ThemeProvider>
    </PostHogProvider>
  );
}
