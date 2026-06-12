import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Animated } from 'react-native';

interface MatchModalProps {
  visible: boolean;
  dogName: string;
  onClose: () => void;
}

export function MatchModal({ visible, dogName, onClose }: MatchModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.bigEmoji}>🎉</Text>
          <Text style={styles.title}>It's a Match!</Text>
          <Text style={styles.subtitle}>
            You and {dogName} want to meet!{'\n'}Start planning your playdate 🐾
          </Text>
          <View style={styles.dogsRow}>
            <Text style={styles.dogEmoji}>🐕</Text>
            <Text style={styles.heart}>❤️</Text>
            <Text style={styles.dogEmoji}>🐩</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Keep Swiping 🐾</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.skipBtn}>
            <Text style={styles.skipText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  bigEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF6B35',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  dogsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 28,
  },
  dogEmoji: {
    fontSize: 48,
  },
  heart: {
    fontSize: 32,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  skipBtn: {
    padding: 8,
  },
  skipText: {
    color: '#aaa',
    fontSize: 14,
  },
});
