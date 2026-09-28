import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { FontAssets, useAppTheme } from './src/theme';
import { useThemeStore } from './src/store/useThemeStore';

// El splash nativo (logo sobre negro) queda visible hasta tener fuentes y tema.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const theme = useAppTheme();
  const isDark = useThemeStore((state) => state.isDark);
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  // Si una fuente falla se sigue con la del sistema en lugar de quedarse en el splash.
  const [fontsLoaded, fontError] = useFonts(FontAssets);
  const ready = (fontsLoaded || fontError !== null) && hasHydrated;

  React.useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  React.useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return null;
  }

  const navTheme = isDark ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer
          theme={{
            ...navTheme,
            colors: {
              ...navTheme.colors,
              background: theme.background,
              card: theme.surface,
              text: theme.text,
              border: theme.divider,
              primary: theme.primary,
            },
          }}
        >
          <StatusBar style={theme.statusBar} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
