import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.content}>
        <View style={styles.logoArea}>
          <Text style={styles.pawEmoji}>🐾</Text>
          <Text style={styles.appName}>Woofy</Text>
          <Text style={styles.tagline}>דע מה הכלב שלך מרגיש</Text>
        </View>

        <View style={styles.illustrationArea}>
          <Text style={styles.mainDog}>🐕</Text>
          <View style={styles.bubblesRow}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>🎾 Let's play!</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleRight]}>
              <Text style={styles.bubbleText}>🐩 New friends?</Text>
            </View>
          </View>
        </View>

        <View style={styles.featuresRow}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤝</Text>
            <Text style={styles.featureLabel}>Meet Dogs</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🗺️</Text>
            <Text style={styles.featureLabel}>Find Parks</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💬</Text>
            <Text style={styles.featureLabel}>Chat</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Onboarding')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Get Started 🐾</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Join 10,000+ dog owners in your city</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoArea: {
    alignItems: 'center',
  },
  pawEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF6B35',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: '#2D3561',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  illustrationArea: {
    alignItems: 'center',
  },
  mainDog: {
    fontSize: 100,
  },
  bubblesRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  bubble: {
    backgroundColor: '#FFF5F2',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFD5C5',
  },
  bubbleRight: {
    backgroundColor: '#F0F3FF',
    borderColor: '#CDD5FF',
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3561',
  },
  featuresRow: {
    flexDirection: 'row',
    gap: 20,
  },
  feature: {
    alignItems: 'center',
    gap: 4,
  },
  featureIcon: {
    fontSize: 30,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    fontSize: 13,
    color: '#aaa',
  },
});
