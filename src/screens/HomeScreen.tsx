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

const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const HEB_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

function getHebDate(): string {
  const now = new Date();
  return `יום ${HEB_DAYS[now.getDay()]}, ${now.getDate()} ${HEB_MONTHS[now.getMonth()]}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'בוקר טוב';
  if (h < 17) return 'צהריים טובים';
  if (h < 21) return 'ערב טוב';
  return 'לילה טוב';
}

function reminderEmoji(type: Reminder['type']): string {
  switch (type) {
    case 'food':       return '🍖';
    case 'walk':       return '🦮';
    case 'medication': return '💊';
    case 'vaccine':    return '💉';
    default:           return '🔔';
  }
}

const REMINDER_ACCENT: Record<Reminder['type'], string> = {
  food:       Colors.success,
  walk:       Colors.forest,
  medication: Colors.terra,
  vaccine:    Colors.yellow,
  other:      Colors.gray,
};

// ── Reminder card ─────────────────────────────────────────────────────────────

const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => {
  const [checked, setChecked] = useState(false);
  const checkOpacity = useRef(new Animated.Value(0)).current;

  const accentColor = REMINDER_ACCENT[reminder.type] ?? Colors.gray;

  const handlePress = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(checkOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(700),
      Animated.timing(checkOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
    setChecked(true);
    setTimeout(() => setChecked(false), 1350);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={handlePress}
      style={[styles.reminderCard, { borderTopColor: accentColor }]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, styles.reminderCheckOverlay, { opacity: checkOpacity }]}>
        <WText style={styles.reminderCheckmark}>✅</WText>
      </Animated.View>

      {/* Colored emoji circle */}
      <View style={[styles.reminderEmojiCircle, { backgroundColor: accentColor + '18' }]}>
        <WText style={styles.reminderEmoji}>{reminderEmoji(reminder.type)}</WText>
      </View>
      <WText style={styles.reminderTitle} numberOfLines={1}>{reminder.title}</WText>
      <WText style={styles.reminderTime}>{reminder.time}</WText>
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state, likeDog, unlikeDog, todaysReminders } = useApp();
  const { dog, ownerName, likedDogIds } = state;

  const reminders = todaysReminders();
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

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <WText style={styles.greeting}>{getGreeting()}, {ownerName || 'שם'} 👋</WText>
          <WText style={styles.dateLabel}>{getHebDate()}</WText>
        </View>
        <TouchableOpacity onPress={handleMyDogTap} activeOpacity={0.8}>
          <WAvatar uri={dog?.photos?.[0] ?? null} size={46} placeholder="🐾" />
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
        {/* ── Reminders ── */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <WText style={styles.sectionTitle}>תזכורות להיום</WText>
            {reminders.length > 0 && (
              <View style={styles.countPill}>
                <WText style={styles.countText}>{reminders.length}</WText>
              </View>
            )}
          </View>

          {reminders.length === 0 ? (
            <View style={styles.noRemindersRow}>
              <View style={styles.noRemindersPill}>
                <WText style={styles.noRemindersText}>אין תזכורות להיום 🎉</WText>
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
          <View style={styles.sectionRow}>
            <WText style={styles.sectionTitle}>כלבים קרובים 🗺️</WText>
            <View style={styles.countPill}>
              <WText style={styles.countText}>{shuffledDogs.length}</WText>
            </View>
          </View>

          {shuffledDogs.length === 0 ? (
            <View style={styles.emptyState}>
              <WText style={styles.emptyEmoji}>🐾</WText>
              <WText variant="h4" color={Colors.forest} center>אין כלבים קרובים כרגע</WText>
              <WText variant="caption" color={Colors.gray} center style={styles.emptySubtext}>
                בדוק שוב מאוחר יותר
              </WText>
            </View>
          ) : (
            <View style={styles.dogList}>
              {shuffledDogs.map((mockDog, index) => (
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

  // ── Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
    shadowColor: 'rgba(44,74,62,0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  headerLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  greeting: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.lg,
    color: Colors.forest,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  dateLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'right',
    marginTop: 2,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: Spacing.lg },

  // ── Section
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.forest,
    textAlign: 'right',
  },
  countPill: {
    backgroundColor: Colors.terraDim,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.terra,
  },

  // ── No reminders
  noRemindersRow: { flexDirection: 'row' },
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

  // ── Reminder cards
  remindersRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: 4,
  },
  reminderCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.base,
    minWidth: 108,
    alignItems: 'center',
    overflow: 'hidden',
    borderTopWidth: 3,
    ...Shadow.soft,
  },
  reminderCheckOverlay: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  reminderCheckmark: { fontSize: 26 },
  reminderEmojiCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  reminderEmoji: { fontSize: 22 },
  reminderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 3,
  },
  reminderTime: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
  },

  // ── Dog list
  dogList: { gap: 0 },
  cardSeparator: { marginTop: Spacing.md },

  // ── Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 56,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  emptySubtext: { marginTop: Spacing.xs },

  bottomPad: { height: Spacing['2xl'] },
});
