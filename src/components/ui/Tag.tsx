import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Radius, Spacing, FontFamily, FontSize } from '@/theme';
import { WText } from './Text';

interface TagProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  selectedColor?: string;
  style?: ViewStyle;
  small?: boolean;
}

export const WTag: React.FC<TagProps> = ({
  label,
  selected = false,
  onPress,
  color = Colors.gray,
  selectedColor = Colors.terra,
  style,
  small = false,
}) => {
  const handlePress = async () => {
    if (!onPress) return;
    await Haptics.selectionAsync();
    onPress();
  };

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.tag,
        small ? styles.tagSmall : undefined,
        selected
          ? { backgroundColor: selectedColor, borderColor: selectedColor }
          : { backgroundColor: 'transparent', borderColor: color },
        style,
      ]}
    >
      <WText
        style={[
          styles.label,
          small ? styles.labelSmall : undefined,
          { color: selected ? Colors.white : color },
        ]}
      >
        {label}
      </WText>
    </Container>
  );
};

const styles = StyleSheet.create({
  tag: {
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagSmall: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: FontSize.xs,
  },
});
