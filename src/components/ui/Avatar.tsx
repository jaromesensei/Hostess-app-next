import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Shadow } from '@/theme';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  style?: ViewStyle;
  online?: boolean;
}

export const WAvatar: React.FC<AvatarProps> = ({
  uri,
  size = 56,
  style,
  online,
}) => {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <View
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          Shadow.soft,
        ]}
      >
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.placeholder, { borderRadius: size / 2 }]}>
            <MaterialCommunityIcons name="paw" size={size * 0.42} color={Colors.gray} />
          </View>
        )}
      </View>
      {online !== undefined && (
        <View
          style={[
            styles.onlineDot,
            {
              width: size * 0.22,
              height: size * 0.22,
              borderRadius: size * 0.11,
              bottom: 1,
              right: 1,
            },
            { backgroundColor: online ? Colors.success : Colors.gray },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: Colors.white,
  },
  placeholder: {
    flex: 1,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.white,
  },
});
