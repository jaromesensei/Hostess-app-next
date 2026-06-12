import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/theme';

interface ToggleProps {
  value: boolean;
  onToggle: (val: boolean) => void;
  disabled?: boolean;
}

export const WToggle: React.FC<ToggleProps> = ({ value, onToggle, disabled }) => {
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 22 : 2,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
  }, [value]);

  const handlePress = async () => {
    if (disabled) return;
    await Haptics.selectionAsync();
    onToggle(!value);
  };

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={handlePress}>
      <View style={[styles.track, value ? styles.trackOn : styles.trackOff]}>
        <Animated.View
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: Colors.terra },
  trackOff: { backgroundColor: Colors.cream2 },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: 'rgba(0,0,0,0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
});
