import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { mockPlaces, PlaceCategory } from '../data/mockPlaces';
import { PlaceCard } from '../components/PlaceCard';

type FilterCategory = PlaceCategory | 'all';

interface FilterBtn {
  key: FilterCategory;
  label: string;
  emoji: string;
}

const FILTERS: FilterBtn[] = [
  { key: 'all', label: 'All', emoji: '🗺️' },
  { key: 'vet', label: 'Vets', emoji: '🏥' },
  { key: 'park', label: 'Parks', emoji: '🌳' },
  { key: 'beach', label: 'Beaches', emoji: '🏖️' },
  { key: 'cafe', label: 'Cafes', emoji: '☕' },
];

export default function MapScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  const filteredPlaces =
    activeFilter === 'all'
      ? mockPlaces
      : mockPlaces.filter((p) => p.category === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Places 🗺️</Text>
        <Text style={styles.subtitle}>Dog-friendly spots around you</Text>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapPin}>📍</Text>
        <Text style={styles.mapTitle}>Map Coming Soon</Text>
        <Text style={styles.mapSubtitle}>We're adding interactive maps{'\n'}in the next update</Text>
        <View style={styles.mapDots}>
          {['🐕', '🌳', '🏥', '☕', '🐩'].map((emoji, i) => (
            <View key={i} style={[styles.mapDot, { top: [20, 60, 30, 80, 50][i], left: [60, 120, 220, 280, 180][i] }]}>
              <Text style={styles.mapDotEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
        style={styles.filtersContainer}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, activeFilter === f.key && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f.key)}
            activeOpacity={0.7}
          >
            <Text style={styles.filterEmoji}>{f.emoji}</Text>
            <Text style={[styles.filterLabel, activeFilter === f.key && styles.filterLabelActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.placesList}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.resultsCount}>{filteredPlaces.length} places found</Text>
        {filteredPlaces.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3561',
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  mapPlaceholder: {
    marginHorizontal: 16,
    height: 160,
    backgroundColor: '#E8EAF0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapPin: {
    fontSize: 32,
    marginBottom: 4,
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3561',
  },
  mapSubtitle: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  mapDots: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mapDot: {
    position: 'absolute',
  },
  mapDotEmoji: {
    fontSize: 18,
    opacity: 0.3,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersRow: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 4,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
  },
  filterBtnActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  filterEmoji: {
    fontSize: 15,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterLabelActive: {
    color: '#fff',
  },
  placesList: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  resultsCount: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
  },
});
