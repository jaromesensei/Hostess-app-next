import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { WText } from '@/components/ui';
export const DiscoverScreen: React.FC = () => (
  <View style={styles.root}><WText variant="h2" center>גילוי 💛</WText></View>
);
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: Colors.cream, alignItems: 'center', justifyContent: 'center' } });
