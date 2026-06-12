import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow, FontFamily, FontSize } from '@/theme';
import { WText } from './Text';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const WButton: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  textStyle,
}) => {
  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? Colors.terra : Colors.white}
          size="small"
        />
      ) : (
        <>
          {icon}
          <WText
            style={[
              styles.label,
              styles[`labelVariant_${variant}`],
              styles[`labelSize_${size}`],
              icon ? { marginRight: 8 } : undefined,
              textStyle,
            ]}
          >
            {label}
          </WText>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    ...Shadow.soft,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.48,
  },

  // Variants
  primary: {
    backgroundColor: Colors.terra,
  },
  secondary: {
    backgroundColor: Colors.forest,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.terra,
    shadowOpacity: 0,
    elevation: 0,
  },
  ghost: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  size_sm: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    minHeight: 40,
  },
  size_md: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    minHeight: 50,
  },
  size_lg: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    minHeight: 58,
  },

  // Label base
  label: {
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },

  // Label by variant
  labelVariant_primary: { color: Colors.white },
  labelVariant_secondary: { color: Colors.white },
  labelVariant_outline: { color: Colors.terra },
  labelVariant_ghost: { color: Colors.terra },
  labelVariant_danger: { color: Colors.white },

  // Label by size
  labelSize_sm: { fontSize: FontSize.sm },
  labelSize_md: { fontSize: FontSize.base },
  labelSize_lg: { fontSize: FontSize.md },
});
