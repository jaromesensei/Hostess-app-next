import React, { useState, useRef, useEffect } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors, Radius, Spacing, FontFamily, FontSize } from '@/theme';
import { WText } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  onSuffixPress?: () => void;
}

export const WInput: React.FC<InputProps> = ({
  label,
  error,
  prefix,
  suffix,
  onSuffixPress,
  style,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const errorOpacity  = useRef(new Animated.Value(0)).current;
  const errorTranslateY = useRef(new Animated.Value(-4)).current;

  // Animate error message in/out
  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(errorTranslateY, { toValue: 0, damping: 16, stiffness: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(errorOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(errorTranslateY, { toValue: -4, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  return (
    <View style={styles.wrapper}>
      {label && (
        <WText variant="captionMedium" color={Colors.gray} style={styles.label}>
          {label}
        </WText>
      )}
      <View
        style={[
          styles.container,
          focused && styles.containerFocused,
          error ? styles.containerError : undefined,
        ]}
      >
        {suffix && (
          <TouchableOpacity
            onPress={onSuffixPress}
            style={styles.suffix}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {suffix}
          </TouchableOpacity>
        )}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          textAlign="right"
          {...props}
        />
        {prefix && <View style={styles.prefix}>{prefix}</View>}
      </View>
      <Animated.View style={{ opacity: errorOpacity, transform: [{ translateY: errorTranslateY }] }}>
        {error ? (
          <WText variant="caption" color={Colors.error} style={styles.error}>
            {error}
          </WText>
        ) : null}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
    textAlign: 'right',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingHorizontal: Spacing.base,
    minHeight: 52,
  },
  containerFocused: {
    borderColor: Colors.terra,
    backgroundColor: Colors.white,
  },
  containerError: {
    borderColor: Colors.error,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  prefix: {
    marginRight: Spacing.sm,
  },
  suffix: {
    marginLeft: Spacing.sm,
  },
  error: {
    marginTop: Spacing.xs,
    textAlign: 'right',
  },
});
