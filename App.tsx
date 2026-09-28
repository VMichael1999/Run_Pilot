import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppTheme, useIsDark } from './src/theme';
import { useThemeStore } from './src/store/useThemeStore';

// El splash nativo (logo sobre negro) queda visible hasta cargar el tema guardado.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const theme = useAppTheme();
  const isDark = useIsDark();
  const hasHydrated = useThemeStore((state) => state.hasHydrated);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  // Se usa la letra del sistema: no hay fuentes que esperar, solo el tema guardado.
  const ready = hasHydrated;

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
