import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ChatScreen from '../screens/ChatScreen';
import { TabNavigator } from './TabNavigator';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { isOnboarded } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboarded ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen
            name="Onboarding"
            component={OnboardingScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
