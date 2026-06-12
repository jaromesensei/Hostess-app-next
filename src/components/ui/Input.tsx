import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  TouchableOpacity,
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
          <TouchableOpacity onPress={onSuffixPress} style={styles.suffix}>
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
      {error && (
        <WText variant="caption" color={Colors.error} style={styles.error}>
          {error}
        </WText>
      )}
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
