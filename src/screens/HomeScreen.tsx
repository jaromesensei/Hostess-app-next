import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, Shadow, Radius, FontFamily, FontSize } from '@/theme';
import { WText, WAvatar } from '@/components/ui';
import { useApp } from '@/context/AppContext';
import { DogCard } from '@/components/DogCard';
import { MOCK_DOGS } from '@/data/mockDogs';
import { Reminder } from '@/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function reminderEmoji(type: Reminder['type']): string {
  switch (type) {
    case 'food': return '🍖';
    case 'walk': return '🦮';
    case 'medication': return '💊';
    case 'vaccine': return '💉';
    default: return '🔔';
  }
}

// ── Reminder card with check animation ───────────────────────────────────────

const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
  const [checked, setChecked] = useState(false);
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(checkOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(checkOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    setChecked(true);
    setTimeout(() => setChecked(false), 1400);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={styles.reminderCard}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.reminderCheckOverlay, { opacity: checkOpacity }]}>
        <WText style={styles.reminderCheckmark}>✅</WText>
      </Animated.View>
      <Animated.View style={{ opacity: cardOpacity }}>
        <WText style={styles.reminderEmoji}>{reminderEmoji(reminder.type)}</WText>
        <WText style={styles.reminderTitle} numberOfLines={1}>
          {reminder.title}
        </WText>
        <WText style={styles.reminderTime}>{reminder.time}</WText>
      </Animated.View>
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, likeDog, unlikeDog, todaysReminders } = useApp();
  const { dog, ownerName, likedDogIds } = state;

  const reminders = todaysReminders();

  // Shuffled dogs, excluding none initially
  const [shuffledDogs, setShuffledDogs] = useState(() => shuffleArray(MOCK_DOGS));
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShuffledDogs(shuffleArray(MOCK_DOGS));
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  const handleMyDogTap = useCallback(() => {
    (navigation as any).navigate('MyDog');
  }, [navigation]);

  const displayedDogs = shuffledDogs;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Sticky header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <WText variant="caption" color={Colors.gray}>
            היי {ownerName || 'שם'} 👋
          </WText>
          <WText variant="h2" color={Colors.forest}>
            מי רוצה לצאת היום?
          </WText>
        </View>
        <TouchableOpacity onPress={handleMyDogTap} activeOpacity={0.8}>
          <WAvatar
            uri={dog?.photos?.[0] ?? null}
            size={44}
            placeholder="🐾"
          />
        </TouchableOpacity>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.terra}
            colors={[Colors.terra]}
          />
        }
      >
        {/* ── Today's reminders ── */}
        <View style={styles.section}>
          <WText variant="captionMedium" color={Colors.gray} style={styles.sectionLabel}>
            תזכורות להיום
          </WText>

          {reminders.length === 0 ? (
            <View style={styles.noRemindersRow}>
              <View style={styles.noRemindersPill}>
                <WText style={styles.noRemindersText}>
                  אין תזכורות להיום 🎉
                </WText>
              </View>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.remindersRow}
            >
              {reminders.map(reminder => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Nearby dogs ── */}
        <View style={styles.section}>
          <View style={styles.nearbyHeader}>
            <WText variant="h4" color={Colors.forest}>
              כלבים קרובים 🗺️
            </WText>
            <View style={styles.filterBadge}>
              <WText style={styles.filterBadgeText}>
                {displayedDogs.length}
              </WText>
            </View>
          </View>

          {displayedDogs.length === 0 ? (
            /* Empty state */
            <View style={styles.emptyState}>
              <WText style={styles.emptyEmoji}>🐾</WText>
              <WText variant="h4" color={Colors.forest} center>
                אין כלבים קרובים כרגע
              </WText>
              <WText variant="caption" color={Colors.gray} center style={styles.emptySubtext}>
                בדוק שוב מאוחר יותר
              </WText>
            </View>
          ) : (
            /* Dog cards list */
            <View style={styles.dogList}>
              {displayedDogs.map((mockDog, index) => (
                <View key={mockDog.id} style={index > 0 ? styles.cardSeparator : undefined}>
                  <DogCard
                    dog={mockDog}
                    myDog={dog ?? undefined}
                    onLike={() => {
                      if (likedDogIds.includes(mockDog.id)) {
                        unlikeDog(mockDog.id);
                      } else {
                        likeDog(mockDog.id);
                      }
                    }}
                    isLiked={likedDogIds.includes(mockDog.id)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* bottom padding */}
        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.cream,
    // Subtle bottom shadow
    shadowColor: Colors.forestShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },

  // ── Scroll ──
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.lg,
  },

  // ── Section ──
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionLabel: {
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // ── No reminders pill ──
  noRemindersRow: {
    flexDirection: 'row',
  },
  noRemindersPill: {
    backgroundColor: 'rgba(232,115,74,0.10)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs + 2,
  },
  noRemindersText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.terra,
  },

  // ── Reminder cards ──
  remindersRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: 4,
  },
  reminderCard: {
    backgroundColor: Colors.cream2,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    minWidth: 110,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.soft,
  },
  reminderCheckOverlay: {
    backgroundColor: Colors.cream2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  reminderCheckmark: {
    fontSize: 26,
  },
  reminderEmoji: {
    fontSize: 24,
    marginBottom: 4,
    textAlign: 'center',
  },
  reminderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  reminderTime: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },

  // ── Nearby header ──
  nearbyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterBadge: {
    backgroundColor: Colors.terraDim,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.terra,
  },

  // ── Dog list ──
  dogList: {
    gap: 0,
  },
  cardSeparator: {
    marginTop: 12,
  },

  // ── Empty state ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: Spacing.xs,
  },

  // Bottom padding
  bottomPad: {
    height: Spacing['2xl'],
  },
});
