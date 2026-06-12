import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { WText } from '@/components/ui';

// Full implementation in Step 6
export const SplashScreen: React.FC = () => (
  <View style={styles.root}>
    <WText variant="h1" color={Colors.white} center>🐾 Woofy</WText>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.forest, alignItems: 'center', justifyContent: 'center' },
});
