import React, { useEffect, useRef } from 'react';
import {
  Modal,
  Animated,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Colors, Radius, Spacing, Shadow } from '@/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapHeight?: number;
  scrollable?: boolean;
}

export const WBottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapHeight = SCREEN_HEIGHT * 0.7,
  scrollable = false,
}) => {
  const translateY = useRef(new Animated.Value(snapHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: snapHeight,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const Content = scrollable ? ScrollView : View;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[styles.backdrop, { opacity: backdropOpacity }]}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { maxHeight: snapHeight, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handle} />
          <Content style={scrollable ? { flexGrow: 1 } : undefined}>
            {children}
          </Content>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26,26,46,0.50)',
  },
  sheet: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    paddingBottom: Spacing['3xl'],
    ...Shadow.strong,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Colors.cream2,
    marginTop: Spacing.md,
    marginBottom: Spacing.base,
  },
});
