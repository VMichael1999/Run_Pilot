import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAppTheme } from './src/theme';
import { useThemeStore } from './src/store/useThemeStore';

export default function App() {
  const theme = useAppTheme();
  const isDark = useThemeStore((state) => state.isDark);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  const [fontsLoaded] = useFonts({
    'GeneralSans-Regular': require('./assets/fonts/GeneralSans-Regular.ttf'),
    'GeneralSans-Italic': require('./assets/fonts/GeneralSans-Italic.ttf'),
    'GeneralSans-Bold': require('./assets/fonts/GeneralSans-Bold.ttf'),
    'GeneralSans-BoldItalic': require('./assets/fonts/GeneralSans-BoldItalic.ttf'),
  });

  React.useEffect(() => {
    void loadTheme();
  }, [loadTheme]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
          <StatusBar style={theme.statusBar} />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
