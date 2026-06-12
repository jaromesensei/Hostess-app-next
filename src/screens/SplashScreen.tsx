import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as ExpSplash from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontFamily, FontSize } from '@/theme';
import { RootStackParamList } from '@/types';
import { storage } from '@/services/storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const pawStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const handleNavigate = async () => {
    const done = await storage.isOnboardingComplete();
    navigation.replace(done ? 'MainApp' : 'Onboarding');
  };

  useEffect(() => {
    ExpSplash.hideAsync();

    // Animate paw in with spring
    scale.value = withSpring(1, { damping: 12, stiffness: 120 });
    opacity.value = withTiming(1, { duration: 600 });

    // Fade in text slightly after
    const t1 = setTimeout(() => {
      textOpacity.value = withTiming(1, { duration: 500 });
    }, 300);

    // Navigate after 2 seconds
    const t2 = setTimeout(() => {
      runOnJS(handleNavigate)();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View style={styles.root}>
      <Animated.Text style={[styles.paw, pawStyle]}>🐾</Animated.Text>
      <Animated.Text style={[styles.title, textStyle]}>Woofy</Animated.Text>
      <Animated.Text style={[styles.tagline, textStyle]}>
        דע מה הכלב שלך מרגיש
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.forest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paw: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 56,
    color: Colors.white,
    marginBottom: 12,
    writingDirection: 'rtl',
  },
  tagline: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.7)',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
