import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { WText } from '@/components/ui';
// Full implementation in Step 8
export const WelcomeMomentScreen: React.FC = () => (
  <View style={styles.root}><WText variant="h2" center>ברוכים הבאים! 🐾</WText></View>
);
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' } });
