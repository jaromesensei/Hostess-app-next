import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface TagChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export function TagChip({ label, selected = false, onPress }: TagChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF6B35',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#FF6B35',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF6B35',
  },
  textSelected: {
    color: '#fff',
  },
});
