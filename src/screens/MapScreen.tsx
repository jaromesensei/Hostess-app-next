import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Dimensions,
  Text,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WText, WButton, WTag, WBottomSheet } from '@/components/ui';
import { MOCK_PLACES, PLACE_CATEGORIES, MARKER_COLORS, PlaceCategory } from '@/data/mockPlaces';
import { PlaceOfInterest } from '@/types';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TEL_AVIV_FALLBACK = {
  latitude: 32.0853,
  longitude: 34.7818,
};

// ─── Custom Marker View ───────────────────────────────────────────────────────
interface MarkerViewProps {
  emoji: string;
  category: string;
}

const MarkerView: React.FC<MarkerViewProps> = ({ emoji, category }) => (
  <View
    style={[
      styles.markerContainer,
      { backgroundColor: MARKER_COLORS[category] ?? Colors.terra },
    ]}
  >
    <Text style={styles.markerEmoji}>{emoji}</Text>
  </View>
);

// ─── Category filter chip ─────────────────────────────────────────────────────
interface CategoryChipProps {
  id: string;
  label: string;
  emoji: string;
  isActive: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = ({
  id,
  label,
  emoji,
  isActive,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
  >
    <Text style={styles.chipEmoji}>{emoji}</Text>
    <WText
      style={[
        styles.chipLabel,
        isActive ? styles.chipLabelActive : styles.chipLabelInactive,
      ]}
    >
      {label}
    </WText>
  </TouchableOpacity>
);

// ─── Place bottom sheet content ───────────────────────────────────────────────
interface PlaceSheetProps {
  place: PlaceOfInterest;
}

const PlaceSheet: React.FC<PlaceSheetProps> = ({ place }) => {
  const starsCount = Math.round(place.rating);
  const stars = '⭐'.repeat(starsCount);

  const handleNavigate = useCallback(() => {
    const url =
      Platform.OS === 'ios'
        ? `maps://app?daddr=${place.latitude},${place.longitude}`
        : `google.navigation:q=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch(() => {
      // fallback to maps.google.com if native map unavailable
      Linking.openURL(
        `https://maps.google.com/?q=${place.latitude},${place.longitude}`
      );
    });
  }, [place.latitude, place.longitude]);

  return (
    <View style={styles.sheetContent}>
      {/* Emoji */}
      <Text style={styles.placeEmoji}>{place.emoji}</Text>

      {/* Name */}
      <WText variant="h3" color={Colors.forest} center style={styles.placeName}>
        {place.name}
      </WText>

      {/* Category badge */}
      <View style={styles.categoryBadgeRow}>
        <WTag
          label={
            PLACE_CATEGORIES.find((c) => c.id === place.category)?.label ??
            place.category
          }
          selected
          selectedColor={Colors.terra}
          small
        />
      </View>

      {/* Rating */}
      <View style={styles.ratingRow}>
        <Text style={styles.ratingStars}>{stars}</Text>
        <WText variant="captionMedium" color={Colors.gray} style={styles.ratingText}>
          {place.rating}/5
        </WText>
      </View>

      {/* Address */}
      <WText variant="body" color={Colors.gray} center style={styles.address}>
        {place.address}
      </WText>

      {/* Open / Closed badge */}
      <View
        style={[
          styles.openBadge,
          place.isOpen ? styles.openBadgeOpen : styles.openBadgeClosed,
        ]}
      >
        <WText
          variant="captionMedium"
          style={place.isOpen ? styles.openBadgeTextOpen : styles.openBadgeTextClosed}
        >
          {place.isOpen ? 'פתוח עכשיו ✓' : 'סגור'}
        </WText>
      </View>

      {/* Phone */}
      {place.phone ? (
        <WText variant="body" color={Colors.terra} center style={styles.phone}>
          📞 {place.phone}
        </WText>
      ) : null}

      {/* Description */}
      <WText
        variant="captionMedium"
        color={Colors.gray}
        center
        numberOfLines={2}
        style={styles.description}
      >
        {place.description}
      </WText>

      {/* Navigate button */}
      <WButton
        label="נווט 🗺️"
        onPress={handleNavigate}
        variant="primary"
        size="md"
        fullWidth
        style={styles.navigateBtn}
      />
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceOfInterest | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('all');

  // Request location permission on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        setUserLocation(TEL_AVIV_FALLBACK);
      }
    })();
  }, []);

  const center = userLocation ?? TEL_AVIV_FALLBACK;

  const filteredPlaces =
    activeCategory === 'all'
      ? MOCK_PLACES
      : MOCK_PLACES.filter((p) => p.category === activeCategory);

  const handleMarkerPress = useCallback((place: PlaceOfInterest) => {
    setSelectedPlace(place);
    setShowBottomSheet(true);
  }, []);

  const handleCategoryPress = useCallback((categoryId: PlaceCategory) => {
    setActiveCategory(categoryId);
    setShowBottomSheet(false);
    setSelectedPlace(null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setShowBottomSheet(false);
  }, []);

  return (
    <View style={styles.root}>
      {/* Map — fills the full screen */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={locationGranted}
        showsMyLocationButton={true}
        showsCompass={true}
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            onPress={() => handleMarkerPress(place)}
            tracksViewChanges={false}
          >
            <MarkerView emoji={place.emoji} category={place.category} />
          </Marker>
        ))}
      </MapView>

      {/* Floating filter bar */}
      <View
        style={[
          styles.filterBar,
          { top: insets.top + 8 },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          keyboardShouldPersistTaps="always"
        >
          {PLACE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              id={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              isActive={activeCategory === cat.id}
              onPress={() => handleCategoryPress(cat.id as PlaceCategory)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Bottom sheet */}
      <WBottomSheet
        visible={showBottomSheet}
        onClose={handleCloseSheet}
        snapHeight={320}
      >
        {selectedPlace ? <PlaceSheet place={selectedPlace} /> : null}
      </WBottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  // ── Custom marker
  markerContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.medium,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  markerEmoji: {
    fontSize: 18,
    lineHeight: 22,
  },

  // ── Filter bar (floating)
  filterBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: Radius.pill,
    backgroundColor: 'transparent',
  },
  filterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    ...Shadow.soft,
    marginRight: 4,
  },
  chipActive: {
    backgroundColor: Colors.terra,
  },
  chipInactive: {
    backgroundColor: Colors.white,
  },
  chipEmoji: {
    fontSize: 14,
    marginRight: 4,
  },
  chipLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  chipLabelActive: {
    color: Colors.white,
  },
  chipLabelInactive: {
    color: Colors.gray,
  },

  // ── Bottom sheet content
  sheetContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.base,
    alignItems: 'center',
  },
  placeEmoji: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  placeName: {
    marginBottom: Spacing.sm,
  },
  categoryBadgeRow: {
    marginBottom: Spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
    gap: 6,
  },
  ratingStars: {
    fontSize: 14,
  },
  ratingText: {
    marginLeft: 4,
  },
  address: {
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
  openBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    marginBottom: Spacing.sm,
  },
  openBadgeOpen: {
    backgroundColor: 'rgba(76,175,125,0.10)',
  },
  openBadgeClosed: {
    backgroundColor: 'rgba(232,93,74,0.12)',
  },
  openBadgeTextOpen: {
    color: Colors.success,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  openBadgeTextClosed: {
    color: Colors.error,
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  phone: {
    marginBottom: Spacing.sm,
  },
  description: {
    marginBottom: Spacing.base,
    paddingHorizontal: Spacing.sm,
  },
  navigateBtn: {
    marginTop: Spacing.xs,
  },
});
