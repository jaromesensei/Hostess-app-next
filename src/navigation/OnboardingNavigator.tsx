import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/types';
import { useApp } from '@/context/AppContext';

import { OnboardingStep1 } from '@/screens/onboarding/Step1OwnerInfo';
import { OnboardingStep2 } from '@/screens/onboarding/Step2DogBasics';
import { OnboardingStep3 } from '@/screens/onboarding/Step3DogDetails';
import { OnboardingStep4 } from '@/screens/onboarding/Step4Personality';
import { OnboardingStep5 } from '@/screens/onboarding/Step5LookingFor';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator: React.FC = () => {
  const { state } = useApp();
  const initial: keyof OnboardingStackParamList = state.isAddingAnotherDog ? 'Step2' : 'Step1';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
      initialRouteName={initial}
    >
      <Stack.Screen name="Step1" component={OnboardingStep1} />
      <Stack.Screen name="Step2" component={OnboardingStep2} />
      <Stack.Screen name="Step3" component={OnboardingStep3} />
      <Stack.Screen name="Step4" component={OnboardingStep4} />
      <Stack.Screen name="Step5" component={OnboardingStep5} />
    </Stack.Navigator>
  );
};
