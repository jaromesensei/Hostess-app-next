import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Radius } from '@/theme';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = useRef(new Animated.Value(current / total)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: current / total,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [current, total]);

  return (
    <View style={styles.track}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.segment,
            { marginLeft: i === 0 ? 0 : 4 },
            i < current ? styles.filled : styles.empty,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 4,
    borderRadius: Radius.pill,
  },
  segment: {
    flex: 1,
    height: 4,
    borderRadius: Radius.pill,
  },
  filled: {
    backgroundColor: Colors.terra,
  },
  empty: {
    backgroundColor: Colors.cream2,
  },
});
