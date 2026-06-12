import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { WText } from '@/components/ui';
export const OnboardingStep3: React.FC = () => (
  <View style={styles.root}><WText variant="h2" center>שלב 3</WText></View>
);
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: Colors.cream } });
