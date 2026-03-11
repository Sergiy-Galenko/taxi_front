import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/hooks/useTheme';
import { I18nProvider } from './src/hooks/useI18n';
import { NotificationsProvider } from './src/hooks/useNotifications';
import { SettingsProvider } from './src/hooks/useSettings';
import AppNavigator from './src/navigation/AppNavigator';
import { configureMapbox } from './src/services/mapbox/runtime';
import { UserProvider } from './src/hooks/UserContext';

configureMapbox();

const Main = () => {
  const { theme } = useTheme();
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
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
