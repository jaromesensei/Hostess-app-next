import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { WText } from '@/components/ui';
export const OnboardingStep2: React.FC = () => (
  <View style={styles.root}><WText variant="h2" center>שלב 2</WText></View>
);
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: Colors.cream } });
