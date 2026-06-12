import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '@/theme';

interface CardProps extends ViewProps {
  padding?: number;
  radius?: number;
  elevated?: boolean;
}

export const WCard: React.FC<CardProps> = ({
  padding = Spacing.base,
  radius = Radius.medium,
  elevated = true,
  style,
  children,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding, borderRadius: radius },
        elevated ? Shadow.soft : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cream2,
    overflow: 'hidden',
  },
});
