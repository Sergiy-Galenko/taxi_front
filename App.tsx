import React from 'react';
import { useReducedMotion } from './src/shared/hooks/useReducedMotion';
import FlashMessage from 'react-native-flash-message';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { I18nProvider } from './src/hooks/useI18n';
import { NotificationsProvider } from './src/hooks/useNotifications';
import { SettingsProvider } from './src/hooks/useSettings';
import AppNavigator from './src/navigation/AppNavigator';
import { UserProvider } from './src/hooks/UserContext';

const Main = () => {
  const { theme } = useTheme();
  const reducedMotion = useReducedMotion();
  const paperTheme = React.useMemo(() => ({ ...theme, animation: { ...theme.animation, scale: reducedMotion ? 0 : theme.animation.scale } }), [theme, reducedMotion]);
  return (
    <PaperProvider theme={paperTheme}>
      <AppNavigator />
      <FlashMessage position="top" />
    </PaperProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <UserProvider>
                  <Main />
                </UserProvider>
              </NotificationsProvider>
            </SettingsProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
