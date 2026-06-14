import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import * as ExpSplash from 'expo-splash-screen';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, FontFamily, FontSize } from '@/theme';
import { RootStackParamList } from '@/types';
import { storage } from '@/services/storage';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  const handleNavigate = async () => {
    const done = await storage.isOnboardingComplete();
    navigation.replace(done ? 'MainApp' : 'Onboarding');
  };

  useEffect(() => {
    ExpSplash.hideAsync();

    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const t1 = setTimeout(() => {
      Animated.timing(textOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, 300);

    const t2 = setTimeout(() => {
      handleNavigate();
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <View style={styles.root}>
      <Animated.Text style={[styles.paw, { transform: [{ scale }], opacity }]}>🐾</Animated.Text>
      <Animated.Text style={[styles.title, { opacity: textOpacity }]}>Woofy</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
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
