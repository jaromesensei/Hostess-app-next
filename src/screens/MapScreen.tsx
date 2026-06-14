import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Linking,
  Dimensions,
  Text,
  FlatList,
  Image,
  Alert,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { WText, WButton, WTag, WBottomSheet } from '@/components/ui';
import { MOCK_PLACES, PLACE_CATEGORIES, MARKER_COLORS, PlaceCategory } from '@/data/mockPlaces';
import { MOCK_SERVICES, SERVICE_CATEGORIES, ServiceCategory } from '@/data/mockServices';
import { PlaceOfInterest, ServiceProvider } from '@/types';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const TEL_AVIV = { latitude: 32.0853, longitude: 34.7818 };

type ScreenMode = 'map' | 'services';

// ─── Category info ────────────────────────────────────────────────────────────

const CAT_INFO: Record<string, { label: string; color: string }> = {
  walker:  { label: 'מטייל/ת כלבים', color: Colors.forest },
  groomer: { label: 'גרומינג',       color: Colors.terra  },
  trainer: { label: 'מאמן/ת',        color: '#D4A017'     },
  sitter:  { label: 'שמרטף/ת',       color: '#3B8EC5'     },
  vet:     { label: 'וטרינר',        color: Colors.error  },
};

// ─── Map: custom marker ───────────────────────────────────────────────────────

const MarkerView: React.FC<{ emoji: string; category: string }> = ({ emoji, category }) => (
  <View style={[styles.markerContainer, { backgroundColor: MARKER_COLORS[category] ?? Colors.terra }]}>
    <Text style={styles.markerEmoji}>{emoji}</Text>
  </View>
);

// ─── Map: category chip ───────────────────────────────────────────────────────

const CategoryChip: React.FC<{
  label: string; emoji: string; isActive: boolean; onPress: () => void;
}> = ({ label, emoji, isActive, onPress }) => (
  <TouchableOpacity
    activeOpacity={0.75}
    onPress={onPress}
    style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
  >
    <Text style={styles.chipEmoji}>{emoji}</Text>
    <WText style={[styles.chipLabel, isActive ? styles.chipLabelActive : styles.chipLabelInactive]}>
      {label}
    </WText>
  </TouchableOpacity>
);

// ─── Map: bottom sheet place card ─────────────────────────────────────────────

const PlaceSheet: React.FC<{ place: PlaceOfInterest }> = ({ place }) => {
  const stars = '⭐'.repeat(Math.round(place.rating));

  const handleNavigate = () => {
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${place.latitude},${place.longitude}`
      : `google.navigation:q=${place.latitude},${place.longitude}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${place.latitude},${place.longitude}`)
    );
  };

  return (
    <View style={styles.sheetContent}>
      <Text style={styles.placeEmoji}>{place.emoji}</Text>
      <WText variant="h3" color={Colors.forest} center style={styles.placeName}>{place.name}</WText>
      <View style={styles.categoryBadgeRow}>
        <WTag
          label={PLACE_CATEGORIES.find(c => c.id === place.category)?.label ?? place.category}
          selected selectedColor={Colors.terra} small
        />
      </View>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingStars}>{stars}</Text>
        <WText variant="captionMedium" color={Colors.gray}>{place.rating}/5</WText>
      </View>
      <WText variant="body" color={Colors.gray} center style={styles.address}>{place.address}</WText>
      <View style={[styles.openBadge, place.isOpen ? styles.openBadgeOpen : styles.openBadgeClosed]}>
        <WText variant="captionMedium" style={place.isOpen ? styles.openTextOpen : styles.openTextClosed}>
          {place.isOpen ? 'פתוח עכשיו ✓' : 'סגור'}
        </WText>
      </View>
      {place.phone && <WText variant="body" color={Colors.terra} center style={styles.phone}>📞 {place.phone}</WText>}
      <WText variant="captionMedium" color={Colors.gray} center numberOfLines={2} style={styles.description}>
        {place.description}
      </WText>
      <WButton label="נווט 🗺️" onPress={handleNavigate} variant="primary" size="md" fullWidth style={styles.navigateBtn} />
    </View>
  );
};

// ─── Services: provider card ──────────────────────────────────────────────────

const ServiceCard: React.FC<{
  provider: ServiceProvider;
  onPress: () => void;
  onBook: () => void;
}> = ({ provider, onPress, onBook }) => {
  const cat = CAT_INFO[provider.category];
  const stars = Math.round(provider.rating);

  return (
    <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.serviceCardInner}>
        {/* Avatar */}
        <Image source={{ uri: provider.photo }} style={styles.serviceAvatar} />

        {/* Info */}
        <View style={styles.serviceInfo}>
          <View style={styles.serviceNameRow}>
            <WText style={styles.serviceName} numberOfLines={1}>{provider.name}</WText>
            {provider.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.forest} />
              </View>
            )}
          </View>

          <View style={styles.serviceCatRow}>
            <View style={[styles.catBadge, { backgroundColor: cat.color + '18' }]}>
              <WText style={[styles.catBadgeText, { color: cat.color }]}>{cat.label}</WText>
            </View>
            <WText style={styles.serviceDistance}>📍 {provider.distanceKm} ק"מ</WText>
          </View>

          <View style={styles.serviceRatingRow}>
            {'⭐'.repeat(stars).split('').map((s, i) => (
              <Text key={i} style={styles.starSmall}>{s}</Text>
            ))}
            <WText style={styles.serviceRating}>{provider.rating}</WText>
            <WText style={styles.serviceReviews}>({provider.reviewCount})</WText>
          </View>

          <View style={styles.servicePriceRow}>
            <WText style={styles.servicePrice}>
              ₪{provider.priceFrom}/{provider.pricePer === 'hour' ? 'שעה' : provider.pricePer === 'day' ? 'יום' : 'ביקור'}
            </WText>
            {provider.isAvailable
              ? <View style={styles.availableBadge}><WText style={styles.availableText}>פנוי ✓</WText></View>
              : <View style={styles.busyBadge}><WText style={styles.busyText}>תפוס</WText></View>
            }
          </View>
        </View>
      </View>

      {/* Badges row */}
      {provider.badges.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow} contentContainerStyle={{ gap: 6 }}>
          {provider.badges.map(b => (
            <View key={b} style={styles.badge}>
              <WText style={styles.badgeText}>{b}</WText>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Book button */}
      <TouchableOpacity
        style={[styles.bookBtn, !provider.isAvailable && styles.bookBtnDisabled]}
        onPress={e => { (e as any).stopPropagation?.(); onBook(); }}
        disabled={!provider.isAvailable}
        activeOpacity={0.8}
      >
        <WText style={[styles.bookBtnText, !provider.isAvailable && styles.bookBtnTextDisabled]}>
          {provider.isAvailable ? 'הזמן עכשיו 🐾' : 'לא פנוי כעת'}
        </WText>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

// ─── Services: detail modal ───────────────────────────────────────────────────

const ServiceDetailModal: React.FC<{
  provider: ServiceProvider | null;
  onClose: () => void;
  onBook: () => void;
}> = ({ provider, onClose, onBook }) => {
  if (!provider) return null;
  const cat = CAT_INFO[provider.category];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.svcModalSafe} edges={['top', 'bottom'] as any}>
        {/* Forest-style header in category color */}
        <View style={[styles.svcModalHeader, { backgroundColor: cat.color }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color={Colors.white} />
          </TouchableOpacity>
          <WText style={styles.svcModalHeaderTitle} numberOfLines={1}>{provider.name}</WText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero */}
          <View style={[styles.svcHero, { backgroundColor: cat.color }]}>
            <Image source={{ uri: provider.photo }} style={styles.svcHeroPhoto} />
            <View style={styles.svcHeroInfo}>
              <WText style={styles.svcHeroName}>{provider.ownerName}</WText>
              <WText style={styles.svcHeroCat}>{cat.label}</WText>
              <View style={styles.svcHeroRating}>
                <WText style={styles.svcHeroStar}>★</WText>
                <WText style={styles.svcHeroRatingText}>{provider.rating} ({provider.reviewCount} ביקורות)</WText>
              </View>
            </View>
            {provider.isVerified && (
              <View style={styles.svcHeroVerified}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                <WText style={styles.svcHeroVerifiedText}>מאומת</WText>
              </View>
            )}
          </View>

          {/* Detail card */}
          <View style={styles.svcDetailCard}>
            {/* Badges */}
            <View style={styles.svcBadgesWrap}>
              {provider.badges.map(b => (
                <View key={b} style={[styles.badge, { backgroundColor: cat.color + '15', borderColor: cat.color + '30' }]}>
                  <WText style={[styles.badgeText, { color: cat.color }]}>✓ {b}</WText>
                </View>
              ))}
            </View>

            {/* Location + availability */}
            <View style={styles.svcMetaRow}>
              <View style={styles.svcMetaItem}>
                <Ionicons name="location-outline" size={16} color={Colors.terra} />
                <WText style={styles.svcMetaText}>{provider.location}</WText>
              </View>
              <View style={styles.svcMetaItem}>
                <Ionicons name="navigate-outline" size={16} color={Colors.gray} />
                <WText style={styles.svcMetaText}>{provider.distanceKm} ק"מ ממך</WText>
              </View>
            </View>

            {/* Bio */}
            <WText style={styles.svcBio}>{provider.bio}</WText>

            {/* Services price list */}
            <WText style={styles.svcServicesTitle}>שירותים ומחירים</WText>
            {provider.services.map((s, i) => (
              <View key={i} style={styles.svcPriceRow}>
                <WText style={styles.svcPriceLabel}>{s.label}</WText>
                <WText style={styles.svcPriceValue}>₪{s.price}<WText style={styles.svcPricePer}>/{s.per}</WText></WText>
              </View>
            ))}

            {/* CTA */}
            <WButton
              label={provider.isAvailable ? '🐾 הזמן עכשיו' : 'לא פנוי כעת'}
              onPress={onBook}
              variant="primary"
              size="lg"
              fullWidth
              disabled={!provider.isAvailable}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export const MapScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<ScreenMode>('map');

  // Map state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceOfInterest | null>(null);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory>('all');

  // Services state
  const [svcCategory, setSvcCategory] = useState<ServiceCategory>('all');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      } else {
        setUserLocation(TEL_AVIV);
      }
    })();
  }, []);

  const center = userLocation ?? TEL_AVIV;
  const filteredPlaces = activeCategory === 'all' ? MOCK_PLACES : MOCK_PLACES.filter(p => p.category === activeCategory);
  const filteredServices = useMemo(
    () => svcCategory === 'all' ? MOCK_SERVICES : MOCK_SERVICES.filter(s => s.category === svcCategory),
    [svcCategory],
  );

  const handleMarkerPress = useCallback((place: PlaceOfInterest) => {
    setSelectedPlace(place); setShowBottomSheet(true);
  }, []);

  const handleCategoryPress = useCallback((cat: PlaceCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(cat); setShowBottomSheet(false); setSelectedPlace(null);
  }, []);

  const handleSvcCategoryPress = useCallback((cat: ServiceCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSvcCategory(cat);
  }, []);

  const handleBook = useCallback((provider: ServiceProvider) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSelectedProvider(null);
    Alert.alert(
      'הזמנה נשלחה! 🐾',
      `${provider.ownerName} יצור/תיצור קשר בקרוב לאישור הפרטים.\n\n${provider.name}`,
      [{ text: 'תודה רבה!', style: 'default' }],
    );
  }, []);

  const switchMode = useCallback((m: ScreenMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMode(m);
    setShowBottomSheet(false);
  }, []);

  // ── Mode toggle (persistent header) ────────────────────────────────────────

  const ModeToggle = (
    <SafeAreaView style={styles.modeBar} edges={['top'] as any}>
      <View style={styles.modeToggle}>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'map' && styles.modeBtnActive]}
          onPress={() => switchMode('map')}
          activeOpacity={0.8}
        >
          <Ionicons name="map-outline" size={15} color={mode === 'map' ? Colors.white : Colors.gray} />
          <WText style={[styles.modeBtnText, mode === 'map' && styles.modeBtnTextActive]}>מפה</WText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeBtn, mode === 'services' && styles.modeBtnActive]}
          onPress={() => switchMode('services')}
          activeOpacity={0.8}
        >
          <Ionicons name="storefront-outline" size={15} color={mode === 'services' ? Colors.white : Colors.gray} />
          <WText style={[styles.modeBtnText, mode === 'services' && styles.modeBtnTextActive]}>שירותים</WText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // ── Map view ────────────────────────────────────────────────────────────────

  const MapContent = (
    <View style={styles.mapContainer}>
      <MapView
        style={styles.map}
        initialRegion={{ ...center, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
        showsUserLocation={locationGranted}
        showsMyLocationButton
        showsCompass
      >
        {filteredPlaces.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            onPress={() => handleMarkerPress(place)}
            tracksViewChanges={false}
          >
            <MarkerView emoji={place.emoji} category={place.category} />
          </Marker>
        ))}
      </MapView>

      {/* Floating filter chips */}
      <View style={styles.filterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
          keyboardShouldPersistTaps="always"
        >
          {PLACE_CATEGORIES.map(cat => (
            <CategoryChip
              key={cat.id}
              label={cat.label}
              emoji={cat.emoji}
              isActive={activeCategory === cat.id}
              onPress={() => handleCategoryPress(cat.id as PlaceCategory)}
            />
          ))}
        </ScrollView>
      </View>

      <WBottomSheet visible={showBottomSheet} onClose={() => setShowBottomSheet(false)} snapHeight={320}>
        {selectedPlace ? <PlaceSheet place={selectedPlace} /> : null}
      </WBottomSheet>
    </View>
  );

  // ── Services view ───────────────────────────────────────────────────────────

  const ServicesContent = (
    <View style={styles.servicesContainer}>
      {/* Category filter */}
      <View style={styles.svcFilterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.svcFilterContent}>
          {SERVICE_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.svcChip, svcCategory === cat.id && styles.svcChipActive]}
              onPress={() => handleSvcCategoryPress(cat.id as ServiceCategory)}
              activeOpacity={0.75}
            >
              <Text style={styles.svcChipEmoji}>{cat.emoji}</Text>
              <WText style={[styles.svcChipLabel, svcCategory === cat.id && styles.svcChipLabelActive]}>
                {cat.label}
              </WText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <WText style={styles.svcCount}>{filteredServices.length} נותני שירות</WText>

      {/* Provider list */}
      <FlatList
        data={filteredServices}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ServiceCard
            provider={item}
            onPress={() => setSelectedProvider(item)}
            onBook={() => handleBook(item)}
          />
        )}
        contentContainerStyle={styles.svcList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
      />

      {/* Provider detail modal */}
      {selectedProvider && (
        <ServiceDetailModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
          onBook={() => handleBook(selectedProvider)}
        />
      )}
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {ModeToggle}
      {mode === 'map' ? MapContent : ServicesContent}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  // Mode toggle bar
  modeBar: { backgroundColor: Colors.white, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  modeToggle: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.pill,
    padding: 3,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    gap: 5,
  },
  modeBtnActive: { backgroundColor: Colors.forest },
  modeBtnText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.gray },
  modeBtnTextActive: { color: Colors.white },

  // Map
  mapContainer: { flex: 1 },
  map: { flex: 1 },
  filterBar: { position: 'absolute', top: 8, left: 16, right: 16 },
  filterContent: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.pill, ...Shadow.soft, marginRight: 4,
  },
  chipActive: { backgroundColor: Colors.terra },
  chipInactive: { backgroundColor: Colors.white },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipLabel: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm },
  chipLabelActive: { color: Colors.white },
  chipLabelInactive: { color: Colors.gray },

  // Place bottom sheet
  sheetContent: { paddingHorizontal: Spacing.base, paddingBottom: Spacing.base, alignItems: 'center' },
  placeEmoji: { fontSize: 56, textAlign: 'center', marginBottom: Spacing.sm },
  placeName: { marginBottom: Spacing.sm },
  categoryBadgeRow: { marginBottom: Spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xs, gap: 6 },
  ratingStars: { fontSize: 14 },
  address: { marginTop: 4, marginBottom: Spacing.sm },
  openBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.pill, marginBottom: Spacing.sm },
  openBadgeOpen: { backgroundColor: 'rgba(76,175,125,0.10)' },
  openBadgeClosed: { backgroundColor: 'rgba(232,93,74,0.12)' },
  openTextOpen: { color: Colors.success, fontFamily: FontFamily.semibold, fontSize: FontSize.sm },
  openTextClosed: { color: Colors.error, fontFamily: FontFamily.semibold, fontSize: FontSize.sm },
  phone: { marginBottom: Spacing.sm },
  description: { marginBottom: Spacing.base, paddingHorizontal: Spacing.sm },
  navigateBtn: { marginTop: Spacing.xs },

  // Map markers
  markerContainer: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
    ...Shadow.medium, borderWidth: 2, borderColor: Colors.white,
  },
  markerEmoji: { fontSize: 18, lineHeight: 22 },

  // Services container
  servicesContainer: { flex: 1, backgroundColor: Colors.cream },
  svcFilterWrap: {
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.sm,
  },
  svcFilterContent: { paddingHorizontal: Spacing.base, gap: Spacing.sm },
  svcChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.pill, backgroundColor: Colors.cream2,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  svcChipActive: { backgroundColor: Colors.forest, borderColor: Colors.forest },
  svcChipEmoji: { fontSize: 14 },
  svcChipLabel: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.gray },
  svcChipLabelActive: { color: Colors.white },
  svcCount: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.gray,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    textAlign: 'right',
  },
  svcList: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['2xl'] },

  // Service card
  serviceCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    padding: Spacing.base,
    ...Shadow.soft,
  },
  serviceCardInner: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  serviceAvatar: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.cream2 },
  serviceInfo: { flex: 1 },
  serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 3, justifyContent: 'flex-end' },
  serviceName: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, textAlign: 'right', flex: 1 },
  verifiedBadge: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  serviceCatRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 4, justifyContent: 'flex-end' },
  catBadge: { borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  catBadgeText: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs },
  serviceDistance: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.gray },
  serviceRatingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4, justifyContent: 'flex-end' },
  starSmall: { fontSize: 11 },
  serviceRating: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text, marginLeft: 2 },
  serviceReviews: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.gray },
  servicePriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: Spacing.sm },
  servicePrice: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.forest },
  availableBadge: { backgroundColor: 'rgba(76,175,125,0.12)', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  availableText: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.success },
  busyBadge: { backgroundColor: 'rgba(232,93,74,0.10)', borderRadius: Radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  busyText: { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.error },
  badgesRow: { marginBottom: Spacing.md },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.cream2, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  badgeText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.gray },
  bookBtn: {
    backgroundColor: Colors.terra, borderRadius: Radius.medium,
    paddingVertical: Spacing.md, alignItems: 'center',
  },
  bookBtnDisabled: { backgroundColor: Colors.cream2 },
  bookBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.white },
  bookBtnTextDisabled: { color: Colors.gray },

  // Service detail modal
  svcModalSafe: { flex: 1, backgroundColor: Colors.cream },
  svcModalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
  },
  svcModalHeaderTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.white,
    flex: 1, textAlign: 'center', marginHorizontal: Spacing.sm,
  },
  svcHero: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.base,
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.lg,
    paddingBottom: Spacing['2xl'] + Radius.large,
  },
  svcHeroPhoto: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)' },
  svcHeroInfo: { flex: 1 },
  svcHeroName: { fontFamily: FontFamily.displayBlack, fontSize: FontSize['2xl'], color: Colors.white, textAlign: 'right', marginBottom: 2 },
  svcHeroCat: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.8)', textAlign: 'right', marginBottom: Spacing.xs },
  svcHeroRating: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'flex-end' },
  svcHeroStar: { fontSize: 14, color: Colors.yellow },
  svcHeroRatingText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.9)' },
  svcHeroVerified: {
    position: 'absolute', top: Spacing.lg, left: Spacing.xl,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm, paddingVertical: 4,
  },
  svcHeroVerifiedText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },
  svcDetailCard: {
    backgroundColor: Colors.cream, borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large, marginTop: -Radius.large,
    padding: Spacing.xl, gap: Spacing.lg,
  },
  svcBadgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'flex-end' },
  svcMetaRow: { flexDirection: 'row', gap: Spacing.xl, justifyContent: 'flex-end' },
  svcMetaItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  svcMetaText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text },
  svcBio: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text, textAlign: 'right', lineHeight: 24 },
  svcServicesTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, textAlign: 'right', marginBottom: -Spacing.sm },
  svcPriceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
  },
  svcPriceLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right', flex: 1 },
  svcPriceValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.forest },
  svcPricePer: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.gray },
});
