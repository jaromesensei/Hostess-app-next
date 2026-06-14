import React, { useCallback, useRef } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Shadow, FontFamily, FontSize } from '@/theme';
import { WText, WTag } from '@/components/ui';
import { Dog } from '@/types';
import { compatibilityScore, getAgeString } from '@/data/mockDogs';

interface DogCardProps {
  dog: Dog;
  myDog?: Dog;
  onLike?: () => void;
  isLiked?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

// Deterministic distance from dog id (0.5 – 15 km)
function getDistance(dogId: string): string {
  let hash = 0;
  for (let i = 0; i < dogId.length; i++) {
    hash = (hash * 31 + dogId.charCodeAt(i)) & 0xffffffff;
  }
  const raw = (Math.abs(hash) % 1450) + 50; // 50-1500 units = 0.5-15.0
  const km = raw / 100;
  return `~${km.toFixed(1)} ק״מ`;
}

// First shared activity between two dogs
function getSharedActivity(dogA: Dog, dogB: Dog): string | null {
  const ACTIVITY_EMOJI: Record<string, string> = {
    ריצה: '🏃',
    פריסבי: '🎾',
    שחייה: '🌊',
    טיולים: '🥾',
    אגיליטי: '⚡',
    אילוף: '🎓',
    סנופרינג: '🐽',
    הנחה: '😌',
    ציד: '🦆',
  };
  const shared = dogA.activities.find(a => dogB.activities.includes(a));
  if (!shared) return null;
  const emoji = ACTIVITY_EMOJI[shared] ?? '🐾';
  return `${emoji} שניהם אוהבים ${shared}`;
}

export const DogCard: React.FC<DogCardProps> = ({
  dog,
  myDog,
  onLike,
  isLiked = false,
  onPress,
  style,
}) => {
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleLike = useCallback(async () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 0.8, damping: 10, stiffness: 300, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1.2, damping: 10, stiffness: 300, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, damping: 14, stiffness: 200, useNativeDriver: true }),
    ]).start();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onLike?.();
  }, [onLike]);

  // Compatibility hint
  let compatHint: React.ReactNode = null;
  if (myDog) {
    const score = compatibilityScore(dog, myDog);
    if (score >= 75) {
      compatHint = (
        <WText style={styles.compatSuccess}>
          💛 מתאים ל{myDog.name}!
        </WText>
      );
    } else {
      const shared = getSharedActivity(dog, myDog);
      if (shared) {
        compatHint = (
          <WText style={styles.compatNeutral}>{shared}</WText>
        );
      }
    }
  }

  const distance = getDistance(dog.id);

  return (
    <TouchableOpacity
      activeOpacity={0.96}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {/* ── Image section ── */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: dog.photos[0] }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Gradient overlay — multiple semi-transparent layers to simulate gradient */}
        <View style={[styles.gradientOverlay, { pointerEvents: 'none' } as any]}>
          <View style={[styles.gradientLayer, { opacity: 0.15 }]} />
          <View style={[styles.gradientLayer, { opacity: 0.25 }]} />
          <View style={[styles.gradientLayer, { opacity: 0.45 }]} />
        </View>

        {/* Text on image */}
        <View style={[styles.imageTextContainer, { pointerEvents: 'none' } as any]}>
          <WText style={styles.dogNameOnImage}>{dog.name}</WText>
          <WText style={styles.dogMetaOnImage}>
            {dog.breed} · {getAgeString(dog.birthDate)} · {distance}
          </WText>
          {(dog.ownerName || dog.ownerCity) && (
            <View style={styles.ownerChip}>
              <WText style={styles.ownerChipText}>
                👤 {[dog.ownerName, dog.ownerCity].filter(Boolean).join(' · ')}
              </WText>
            </View>
          )}
        </View>
      </View>

      {/* ── Below image section ── */}
      <View style={styles.belowImage}>
        {/* Personality tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsRow}
          style={styles.tagsScroll}
        >
          {dog.personality.map(tag => (
            <WTag
              key={tag}
              label={tag}
              small
              color={Colors.gray}
              style={styles.tag}
            />
          ))}
        </ScrollView>

        {/* Bottom row: compat hint + heart */}
        <View style={styles.bottomRow}>
          <View style={styles.compatContainer}>
            {compatHint}
          </View>

          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <TouchableOpacity
              onPress={handleLike}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.heartButton}
            >
              <WText style={styles.heartIcon}>
                {isLiked ? '❤️' : '🤍'}
              </WText>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: Colors.cream2,
    ...Shadow.medium,
  },

  // Image
  imageContainer: {
    height: 220,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 220,
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    justifyContent: 'flex-end',
  },
  gradientLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: 'rgba(26,26,46,1)',
  },
  imageTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  dogNameOnImage: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 22,
    color: Colors.white,
    lineHeight: 28,
  },
  dogMetaOnImage: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },

  ownerChip: {
    marginTop: 5,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  ownerChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.92)',
  },

  // Below image
  belowImage: {
    backgroundColor: Colors.cream2,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  tagsScroll: {
    marginBottom: Spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: 2,
  },
  tag: {
    marginRight: 0,
  },

  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compatContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  compatSuccess: {
    fontFamily: FontFamily.semibold,
    fontSize: 12,
    color: Colors.success,
  },
  compatNeutral: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.gray,
  },
  heartButton: {
    padding: 4,
  },
  heartIcon: {
    fontSize: 22,
  },
});
