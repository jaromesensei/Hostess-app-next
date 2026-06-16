import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { getDailyTip, getTipCycled, getTipPoolSize } from '@/data/mockAITips';
import { Dog } from '@/types';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - Spacing.base * 2;

interface AIDailyTipProps {
  dog: Dog;
}

function getAgeYears(birthDate: string): number {
  const ms = Date.now() - new Date(birthDate).getTime();
  return Math.floor(ms / (365.25 * 24 * 3600 * 1000));
}

export const AIDailyTip: React.FC<AIDailyTipProps> = ({ dog }) => {
  const age      = getAgeYears(dog.birthDate);
  const poolSize = getTipPoolSize(dog.size);

  const [offsetIdx, setOffsetIdx]   = useState(0);
  const [isLoading, setIsLoading]   = useState(false);
  const [tip, setTip]               = useState(() => getDailyTip(dog.size, age));

  // Shimmer animation
  const shimmerX = useRef(new Animated.Value(-CARD_W)).current;
  const shimmerLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startShimmer = useCallback(() => {
    shimmerX.setValue(-CARD_W);
    shimmerLoop.current = Animated.loop(
      Animated.timing(shimmerX, {
        toValue: CARD_W,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    shimmerLoop.current.start();
  }, [shimmerX, CARD_W]);

  const stopShimmer = useCallback(() => {
    shimmerLoop.current?.stop();
  }, []);

  // Refresh button — cycle to next tip with fake 800ms load
  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    startShimmer();

    const nextOffset = (offsetIdx + 1) % poolSize;
    setTimeout(() => {
      setOffsetIdx(nextOffset);
      setTip(getTipCycled(dog.size, age, nextOffset));
      setIsLoading(false);
      stopShimmer();
    }, 800);
  }, [offsetIdx, poolSize, dog.size, age, startShimmer, stopShimmer]);

  // Fade-in of tip text
  const textOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!isLoading) {
      textOpacity.setValue(0);
      Animated.timing(textOpacity, { toValue: 1, duration: 380, useNativeDriver: true }).start();
    }
  }, [tip, isLoading]);

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <View style={styles.aiIconWrap}>
            <MaterialCommunityIcons name="paw" size={14} color={Colors.white} />
          </View>
          <WText style={styles.label}>טיפ יומי מ-Woofy AI</WText>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isLoading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Ionicons
            name="refresh"
            size={18}
            color="rgba(255,255,255,0.65)"
            style={isLoading ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {/* Tip text or shimmer skeleton */}
      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonLine}>
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
          </View>
          <View style={[styles.skeletonLine, { width: '78%', marginTop: 8 }]}>
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
          </View>
          <View style={[styles.skeletonLine, { width: '55%', marginTop: 8 }]}>
            <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]} />
          </View>
        </View>
      ) : (
        <Animated.View style={{ opacity: textOpacity }}>
          <WText style={styles.tipText}>{tip}</WText>
        </Animated.View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={13} color="rgba(255,255,255,0.45)" />
        <WText style={styles.footerText}>מבוסס על מחקר וטרינרי</WText>
        <View style={styles.dotRow}>
          {Array.from({ length: Math.min(poolSize, 4) }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === offsetIdx % Math.min(poolSize, 4) && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.secondary,
    padding: Spacing.base,
    ...Shadow.md,
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  aiIconWrap: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  spinning: { opacity: 0.5 },

  tipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.white,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: Spacing.md,
  },

  // Skeleton shimmer
  skeletonWrap: { marginBottom: Spacing.md },
  skeletonLine: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.12)',
    width: '100%',
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    background: 'transparent',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    // Gradient shimmer via overlapping semi-transparent band
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.12)',
    paddingTop: Spacing.sm,
    marginTop: Spacing.xs,
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.40)',
    flex: 1,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  dotActive: {
    backgroundColor: Colors.terra,
    width: 14,
  },
});
