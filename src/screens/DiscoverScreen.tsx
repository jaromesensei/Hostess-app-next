import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '@/context/AppContext';
import { MOCK_DOGS, getAgeString, compatibilityScore } from '@/data/mockDogs';
import { Dog } from '@/types';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/theme';
import { WText, WButton } from '@/components/ui';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.68;
const SWIPE_THRESHOLD = 100;
const SWIPE_UP_THRESHOLD = -100;

type FilterType = 'all' | 'friends' | 'breeding' | 'walks';

const FILTER_LABELS: Record<FilterType, string> = {
  all: 'הכל',
  friends: 'חברים',
  breeding: 'זיווג',
  walks: 'טיולים',
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Gradient overlay layers ───────────────────────────────────────────────────
const GradientOverlay: React.FC = () => (
  <>
    <View style={styles.gradientLayer1} />
    <View style={styles.gradientLayer2} />
    <View style={styles.gradientLayer3} />
    <View style={styles.gradientLayer4} />
  </>
);

// ─── Swipe card ───────────────────────────────────────────────────────────────
interface SwipeCardProps {
  dog: Dog;
  myDog: Dog | null;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
  isTop: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  dog,
  myDog,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  isTop,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const compatibility = myDog ? compatibilityScore(myDog, dog) : 72;
  const ageStr = getAgeString(dog.birthDate);
  const distanceKm = Math.floor(Math.random() * 15) + 1;
  const bioPreview =
    dog.bio.length > 60 ? dog.bio.slice(0, 60) + '...' : dog.bio;

  const handleSwipeRight = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwipeRight();
  }, [onSwipeRight]);

  const handleSwipeLeft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipeLeft();
  }, [onSwipeLeft]);

  const handleSwipeUp = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onSwipeUp();
  }, [onSwipeUp]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 300 });
        translateY.value = withTiming(50, { duration: 300 });
        runOnJS(handleSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 300 });
        translateY.value = withTiming(50, { duration: 300 });
        runOnJS(handleSwipeLeft)();
      } else if (translateY.value < SWIPE_UP_THRESHOLD) {
        translateY.value = withTiming(-SCREEN_HEIGHT, { duration: 300 });
        runOnJS(handleSwipeUp)();
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 120 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 120 });
      }
    },
  });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolate.CLAMP
    );
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 0.85],
      Extrapolate.CLAMP
    ),
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [0.85, 0],
      Extrapolate.CLAMP
    ),
  }));

  if (!isTop) {
    return (
      <View
        style={[
          styles.card,
          {
            transform: [{ scale: 0.95 }, { translateY: 8 }],
            zIndex: 0,
            pointerEvents: 'none',
          } as any,
        ]}
      >
        <Image
          source={{ uri: dog.photos[0] }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <GradientOverlay />
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isTop}>
      <Animated.View style={[styles.card, cardAnimatedStyle, { zIndex: 10 }]}>
        <Image
          source={{ uri: dog.photos[0] }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <GradientOverlay />

        {/* Right swipe overlay */}
        <Animated.View
          style={[styles.swipeOverlay, styles.swipeOverlayRight, rightOverlayStyle, { pointerEvents: 'none' } as any]}
        >
          <WText style={styles.swipeLabel}>נפגשים! 🐾</WText>
        </Animated.View>

        {/* Left swipe overlay */}
        <Animated.View
          style={[styles.swipeOverlay, styles.swipeOverlayLeft, leftOverlayStyle, { pointerEvents: 'none' } as any]}
        >
          <WText style={styles.swipeLabel}>דילוג</WText>
        </Animated.View>

        {/* Content */}
        <View style={styles.cardContent}>
          <WText style={styles.dogName}>{dog.name}</WText>

          <WText style={styles.dogMeta}>
            {dog.breed} • {ageStr} • ~{distanceKm} ק&quot;מ
          </WText>

          {/* Personality tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsRow}
          >
            {dog.personality.slice(0, 4).map((tag, i) => (
              <View key={i} style={styles.personalityPill}>
                <WText style={styles.personalityPillText}>{tag}</WText>
              </View>
            ))}
          </ScrollView>

          {/* Compatibility */}
          <View style={styles.compatRow}>
            <WText style={styles.compatText}>
              💛 {compatibility}% התאמה
            </WText>
          </View>

          {/* Bio */}
          <WText style={styles.bioText} numberOfLines={2}>
            {bioPreview}
          </WText>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

// ─── Match Modal ─────────────────────────────────────────────────────────────
interface MatchModalProps {
  visible: boolean;
  matchedDog: Dog | null;
  myDog: Dog | null;
  onMessage: () => void;
  onContinue: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({
  visible,
  matchedDog,
  myDog,
  onMessage,
  onContinue,
}) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onContinue, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onContinue]);

  if (!matchedDog) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onContinue}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.matchCard}>
          <WText style={styles.matchTitle}>זה מאץ&apos;! 🎉</WText>

          <View style={styles.matchAvatarsRow}>
            <Image
              source={{ uri: myDog?.photos[0] ?? 'https://placedog.net/200/200?id=99' }}
              style={styles.matchAvatar}
            />
            <WText style={styles.matchHeart}>❤️</WText>
            <Image
              source={{ uri: matchedDog.photos[0] }}
              style={styles.matchAvatar}
            />
          </View>

          <WText style={styles.matchSubtitle}>
            {myDog?.name ?? 'הכלב שלך'} ו{matchedDog.name} רוצים להיפגש
          </WText>

          <View style={styles.matchButtons}>
            <WButton
              label="שלח הודעה"
              onPress={onMessage}
              variant="primary"
              size="md"
              fullWidth
              style={styles.matchBtn}
            />
            <WButton
              label="המשך לגלול"
              onPress={onContinue}
              variant="outline"
              size="md"
              fullWidth
              style={styles.matchBtn}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const DiscoverScreen: React.FC = () => {
  const { state, likeDog, addMatch } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showMatch, setShowMatch] = useState(false);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [swipeCount, setSwipeCount] = useState(0);

  // Build initial shuffled list, excluding own dog
  const allDogs = React.useMemo(() => {
    const filtered = MOCK_DOGS.filter((d) => d.id !== state.dog?.id);
    return shuffleArray(filtered);
  }, [state.dog?.id]);

  // Apply active filter
  const filteredDogs = React.useMemo(() => {
    if (activeFilter === 'all') return allDogs;
    return allDogs.filter((d) => d.lookingFor.includes(activeFilter));
  }, [allDogs, activeFilter]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeFilter]);

  const currentDog = filteredDogs[currentIndex] ?? null;
  const nextDog = filteredDogs[currentIndex + 1] ?? null;
  const isExhausted = currentIndex >= filteredDogs.length;

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const handleSwipeRight = useCallback(() => {
    if (!currentDog) return;
    likeDog(currentDog.id);
    const newCount = swipeCount + 1;
    setSwipeCount(newCount);
    if (newCount % 3 === 0) {
      addMatch(currentDog);
      setMatchedDog(currentDog);
      setShowMatch(true);
    }
    advanceCard();
  }, [currentDog, swipeCount, likeDog, addMatch, advanceCard]);

  const handleSwipeLeft = useCallback(() => {
    advanceCard();
  }, [advanceCard]);

  const handleSwipeUp = useCallback(() => {
    if (!currentDog) return;
    likeDog(currentDog.id);
    advanceCard();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [currentDog, likeDog, advanceCard]);

  const handleActionPass = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleSwipeLeft();
  }, [handleSwipeLeft]);

  const handleActionMeet = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSwipeRight();
  }, [handleSwipeRight]);

  const handleActionSuperLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    handleSwipeUp();
  }, [handleSwipeUp]);

  const handleMatchMessage = useCallback(() => {
    setShowMatch(false);
    navigation.navigate('Messages');
  }, [navigation]);

  const handleMatchContinue = useCallback(() => {
    setShowMatch(false);
    setMatchedDog(null);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentIndex(0);
    setSwipeCount(0);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {/* Filter chips */}
        <View style={styles.filterBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContent}
          >
            {(Object.keys(FILTER_LABELS) as FilterType[]).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  activeFilter === filter
                    ? styles.filterChipActive
                    : styles.filterChipInactive,
                ]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.75}
              >
                <WText
                  style={[
                    styles.filterChipText,
                    activeFilter === filter
                      ? styles.filterChipTextActive
                      : styles.filterChipTextInactive,
                  ]}
                >
                  {FILTER_LABELS[filter]}
                </WText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Card stack */}
        <View style={styles.cardStack}>
          {isExhausted ? (
            // Empty state
            <View style={styles.emptyState}>
              <WText style={styles.emptyEmoji}>🐾</WText>
              <WText variant="h2" center style={{ color: Colors.forest, marginTop: 12 }}>
                ראית את כולם!
              </WText>
              <WText
                variant="body"
                center
                color={Colors.gray}
                style={{ marginTop: 8, marginBottom: 32 }}
              >
                בדוק שוב מחר 🐾
              </WText>
              <WButton
                label="רענן"
                onPress={handleReset}
                variant="primary"
                size="md"
                fullWidth={false}
              />
            </View>
          ) : (
            <>
              {/* Next card (behind) */}
              {nextDog && (
                <View style={[styles.cardWrapper, { pointerEvents: 'none' } as any]}>
                  <SwipeCard
                    key={`next-${nextDog.id}`}
                    dog={nextDog}
                    myDog={state.dog}
                    onSwipeRight={() => {}}
                    onSwipeLeft={() => {}}
                    onSwipeUp={() => {}}
                    isTop={false}
                  />
                </View>
              )}

              {/* Current top card */}
              {currentDog && (
                <View style={styles.cardWrapper}>
                  <SwipeCard
                    key={`top-${currentDog.id}-${currentIndex}`}
                    dog={currentDog}
                    myDog={state.dog}
                    onSwipeRight={handleSwipeRight}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeUp={handleSwipeUp}
                    isTop={true}
                  />
                </View>
              )}
            </>
          )}
        </View>

        {/* Action buttons */}
        {!isExhausted && currentDog && (
          <View style={styles.actionRow}>
            {/* Pass */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPass]}
              onPress={handleActionPass}
              activeOpacity={0.8}
            >
              <WText style={styles.actionIcon}>❌</WText>
            </TouchableOpacity>

            {/* Super Like */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnSuperLike]}
              onPress={handleActionSuperLike}
              activeOpacity={0.8}
            >
              <WText style={styles.actionIcon}>⭐</WText>
            </TouchableOpacity>

            {/* Meet */}
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnMeet]}
              onPress={handleActionMeet}
              activeOpacity={0.8}
            >
              <WText style={styles.actionIconLarge}>🐾</WText>
            </TouchableOpacity>
          </View>
        )}

        {/* Match Modal */}
        <MatchModal
          visible={showMatch}
          matchedDog={matchedDog}
          myDog={state.dog}
          onMessage={handleMatchMessage}
          onContinue={handleMatchContinue}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // ── Filter bar
  filterBar: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.terra,
  },
  filterChipInactive: {
    backgroundColor: Colors.cream2,
  },
  filterChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  filterChipTextInactive: {
    color: Colors.gray,
  },

  // ── Card stack
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cardWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: Radius.large,
    overflow: 'hidden',
    backgroundColor: Colors.cream2,
    ...Shadow.strong,
  },

  // ── Gradient layers (simulate dark bottom gradient)
  gradientLayer1: {
    ...StyleSheet.absoluteFillObject,
    top: '55%',
    backgroundColor: 'rgba(26,26,46,0.08)',
  },
  gradientLayer2: {
    ...StyleSheet.absoluteFillObject,
    top: '65%',
    backgroundColor: 'rgba(26,26,46,0.20)',
  },
  gradientLayer3: {
    ...StyleSheet.absoluteFillObject,
    top: '75%',
    backgroundColor: 'rgba(26,26,46,0.38)',
  },
  gradientLayer4: {
    ...StyleSheet.absoluteFillObject,
    top: '82%',
    backgroundColor: 'rgba(26,26,46,0.55)',
  },

  // ── Swipe overlays
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.large,
  },
  swipeOverlayRight: {
    backgroundColor: 'rgba(76,175,125,0.55)',
  },
  swipeOverlayLeft: {
    backgroundColor: 'rgba(232,93,74,0.55)',
  },
  swipeLabel: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['3xl'],
    color: Colors.white,
  },

  // ── Card content
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  dogName: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 32,
    color: Colors.white,
    lineHeight: 38,
  },
  dogMeta: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  personalityPill: {
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
  },
  personalityPillText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  compatRow: {
    marginTop: 8,
  },
  compatText: {
    fontFamily: FontFamily.semibold,
    fontSize: 14,
    color: Colors.yellow,
  },
  bioText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 4,
  },

  // ── Action buttons
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingBottom: 24,
    gap: 20,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    ...Shadow.medium,
  },
  actionBtnPass: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  actionBtnSuperLike: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.yellow,
  },
  actionBtnMeet: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.terra,
  },
  actionIcon: {
    fontSize: 22,
  },
  actionIconLarge: {
    fontSize: 26,
  },

  // ── Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 72,
  },

  // ── Match modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlayDark,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  matchCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.large,
    padding: Spacing['2xl'],
    width: '100%',
    alignItems: 'center',
    ...Shadow.strong,
  },
  matchTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.forest,
    marginBottom: 20,
  },
  matchAvatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  matchAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.terra,
  },
  matchHeart: {
    fontSize: 28,
  },
  matchSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  matchButtons: {
    width: '100%',
    gap: 10,
  },
  matchBtn: {
    marginBottom: 8,
  },
});
