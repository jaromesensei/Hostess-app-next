// Must be the very first import — polyfills browser globals before any
// library code runs (DOMRect, DOMPoint, DOMMatrix for Hermes compatibility)
import './src/polyfills';

import React from 'react';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fontMap } from '@/theme/fonts';
import { AppProvider } from '@/context/AppContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import { Colors } from '@/theme';

export default function App() {
  const [fontsLoaded] = useFonts(fontMap);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.terra} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <RootNavigator />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
