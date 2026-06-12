import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Place } from '../data/mockPlaces';

interface PlaceCardProps {
  place: Place;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{place.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address}>📍 {place.address}</Text>
        <View style={styles.meta}>
          <Text style={styles.rating}>⭐ {place.rating}</Text>
          <View style={[styles.badge, place.isOpen ? styles.openBadge : styles.closedBadge]}>
            <Text style={[styles.badgeText, place.isOpen ? styles.openText : styles.closedText]}>
              {place.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 26,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3561',
    marginBottom: 3,
  },
  address: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  openBadge: {
    backgroundColor: '#E8F8F0',
  },
  closedBadge: {
    backgroundColor: '#FEE8E8',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  openText: {
    color: '#27AE60',
  },
  closedText: {
    color: '#E74C3C',
  },
});
