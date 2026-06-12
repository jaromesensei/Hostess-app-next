import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { mockDogs } from '../data/mockDogs';
import { TagChip } from '../components/TagChip';
import { MatchModal } from '../components/MatchModal';

const { width, height } = Dimensions.get('window');

export default function DiscoverScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [showMatch, setShowMatch] = useState(false);

  const currentDog = mockDogs[currentIndex];
  const isDone = currentIndex >= mockDogs.length;

  const handleAction = (action: 'skip' | 'meet') => {
    const nextSwipeCount = swipeCount + 1;
    setSwipeCount(nextSwipeCount);

    if (action === 'meet' && nextSwipeCount % 3 === 0) {
      setShowMatch(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (isDone) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🐕</Text>
          <Text style={styles.emptyTitle}>No more dogs nearby!</Text>
          <Text style={styles.emptySubtitle}>Check back later for new furry friends 🐾</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D3561" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover 🐾</Text>
        <Text style={styles.counter}>{currentIndex + 1}/{mockDogs.length}</Text>
      </View>

      <View style={styles.card}>
        <Image
          source={{ uri: currentDog.photo }}
          style={styles.photo}
          resizeMode="cover"
        />
        <View style={styles.gradient}>
          <Text style={styles.dogName}>{currentDog.name}</Text>
          <Text style={styles.dogBreed}>
            {currentDog.breed} · {currentDog.age}y · {currentDog.gender}
          </Text>
          <Text style={styles.distance}>📍 {currentDog.distance}</Text>
          <View style={styles.tags}>
            {currentDog.personality.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn]}
          onPress={() => handleAction('skip')}
          activeOpacity={0.75}
        >
          <Text style={styles.skipBtnText}>❌</Text>
          <Text style={styles.skipLabel}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.meetBtn]}
          onPress={() => handleAction('meet')}
          activeOpacity={0.75}
        >
          <Text style={styles.meetBtnText}>✅</Text>
          <Text style={styles.meetLabel}>Meet!</Text>
        </TouchableOpacity>
      </View>

      <MatchModal
        visible={showMatch}
        dogName={currentDog.name}
        onClose={handleMatchClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D3561',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  counter: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#374280',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  dogName: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  dogBreed: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 6,
  },
  distance: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 28,
    paddingHorizontal: 40,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  skipBtn: {
    backgroundColor: '#fff',
  },
  meetBtn: {
    backgroundColor: '#FF6B35',
  },
  skipBtnText: {
    fontSize: 28,
  },
  meetBtnText: {
    fontSize: 28,
  },
  skipLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginTop: 2,
  },
  meetLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3561',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
  },
});
