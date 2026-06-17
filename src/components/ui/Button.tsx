import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableWithoutFeedback,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Shadow, FontFamily, FontSize, Spacing } from '@/theme';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      damping: 10,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      damping: 14,
      stiffness: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (disabled || loading) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableWithoutFeedback
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.base,
          styles[variant],
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          { transform: [{ scale: scaleAnim }] },
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
                icon ? { marginRight: Spacing.sm } : undefined,
                textStyle,
              ]}
            >
              {label}
            </WText>
          </>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
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
    opacity: 0.42,
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

  // Sizes — use Spacing tokens
  size_sm: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xl,
    minHeight: 40,
  },
  size_md: {
    paddingVertical: Spacing.md + 2,
    paddingHorizontal: Spacing['2xl'] - 4,
    minHeight: 50,
  },
  size_lg: {
    paddingVertical: Spacing.lg - 2,
    paddingHorizontal: Spacing['2xl'] + 4,
    minHeight: 58,
  },

  // Label base
  label: {
    fontFamily: FontFamily.bold,
    color: Colors.white,
  },

  // Label by variant
  labelVariant_primary:   { color: Colors.white },
  labelVariant_secondary: { color: Colors.white },
  labelVariant_outline:   { color: Colors.terra },
  labelVariant_ghost:     { color: Colors.terra },
  labelVariant_danger:    { color: Colors.white },

  // Label by size
  labelSize_sm: { fontSize: FontSize.sm },
  labelSize_md: { fontSize: FontSize.base },
  labelSize_lg: { fontSize: FontSize.md },
});
