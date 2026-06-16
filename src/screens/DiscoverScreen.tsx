import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  StyleSheet,
  Animated,
  Alert,
  PanResponder,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '@/context/AppContext';
import { MOCK_DOGS, getAgeString, compatibilityScore } from '@/data/mockDogs';
import { Dog } from '@/types';
import { Colors, FontFamily, FontSize, Radius, Shadow, Spacing } from '@/theme';
import { WText, WButton } from '@/components/ui';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_H * 0.68;
const SWIPE_THRESHOLD = 90;
const SWIPE_UP_THRESHOLD = -100;

type FilterType = 'all' | 'walks' | 'friends';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',     label: 'הכל' },
  { key: 'walks',   label: 'טיולים' },
  { key: 'friends', label: 'חברים' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Gradient overlay (pure views, no library dependency) ─────────────────────

const CardGradient: React.FC = () => (
  <>
    <View style={grad.l1} />
    <View style={grad.l2} />
    <View style={grad.l3} />
    <View style={grad.l4} />
  </>
);

const grad = StyleSheet.create({
  l1: { ...StyleSheet.absoluteFillObject, top: '50%', backgroundColor: 'rgba(10,20,15,0.08)' },
  l2: { ...StyleSheet.absoluteFillObject, top: '62%', backgroundColor: 'rgba(10,20,15,0.22)' },
  l3: { ...StyleSheet.absoluteFillObject, top: '74%', backgroundColor: 'rgba(10,20,15,0.45)' },
  l4: { ...StyleSheet.absoluteFillObject, top: '83%', backgroundColor: 'rgba(10,20,15,0.62)' },
});

// ─── Swipe card ───────────────────────────────────────────────────────────────

interface SwipeCardProps {
  dog: Dog;
  myDog: Dog | null;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
  isTop: boolean;
}

const SwipeCard = React.memo<SwipeCardProps>(({
  dog, myDog, onSwipeRight, onSwipeLeft, onSwipeUp, isTop,
}) => {
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const cbRef = useRef({ onSwipeRight, onSwipeLeft, onSwipeUp });
  cbRef.current = { onSwipeRight, onSwipeLeft, onSwipeUp };

  const compat = myDog ? compatibilityScore(myDog, dog) : 72;
  const dist = useRef(Math.floor(Math.random() * 14) + 1).current;

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => isTop,
    onMoveShouldSetPanResponder:  () => isTop,
    onPanResponderMove: (_, { dx, dy }) => {
      tx.setValue(dx);
      ty.setValue(dy);
    },
    onPanResponderRelease: (_, { dx, dy }) => {
      if (dx > SWIPE_THRESHOLD) {
        Animated.parallel([
          Animated.timing(tx, { toValue: SCREEN_W * 1.5, duration: 280, useNativeDriver: true }),
          Animated.timing(ty, { toValue: 60,             duration: 280, useNativeDriver: true }),
        ]).start(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          cbRef.current.onSwipeRight();
        });
      } else if (dx < -SWIPE_THRESHOLD) {
        Animated.parallel([
          Animated.timing(tx, { toValue: -SCREEN_W * 1.5, duration: 280, useNativeDriver: true }),
          Animated.timing(ty, { toValue: 60,              duration: 280, useNativeDriver: true }),
        ]).start(() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          cbRef.current.onSwipeLeft();
        });
      } else if (dy < SWIPE_UP_THRESHOLD) {
        Animated.timing(ty, { toValue: -SCREEN_H, duration: 280, useNativeDriver: true })
          .start(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            cbRef.current.onSwipeUp();
          });
      } else {
        Animated.parallel([
          Animated.spring(tx, { toValue: 0, damping: 18, stiffness: 130, useNativeDriver: true }),
          Animated.spring(ty, { toValue: 0, damping: 18, stiffness: 130, useNativeDriver: true }),
        ]).start();
      }
    },
  })).current;

  const rotate = tx.interpolate({
    inputRange: [-SCREEN_W / 2, 0, SCREEN_W / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = tx.interpolate({ inputRange: [0, SWIPE_THRESHOLD], outputRange: [0, 1], extrapolate: 'clamp' });
  const nopeOpacity = tx.interpolate({ inputRange: [-SWIPE_THRESHOLD, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  if (!isTop) {
    return (
      <View style={[styles.card, { transform: [{ scale: 0.96 }, { translateY: 10 }], zIndex: 0 }] as any}>
        <Image source={{ uri: dog.photos[0] }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <CardGradient />
      </View>
    );
  }

  return (
    <Animated.View
      {...pan.panHandlers}
      style={[styles.card, { transform: [{ translateX: tx }, { translateY: ty }, { rotate }], zIndex: 10 }]}
    >
      <Image source={{ uri: dog.photos[0] }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <CardGradient />

      {/* LIKE stamp */}
      <Animated.View style={[styles.stamp, styles.stampLike, { opacity: likeOpacity }]} pointerEvents="none">
        <WText style={[styles.stampText, { color: Colors.success }]}>נצא?</WText>
      </Animated.View>

      {/* NOPE stamp */}
      <Animated.View style={[styles.stamp, styles.stampNope, { opacity: nopeOpacity }]} pointerEvents="none">
        <WText style={[styles.stampText, { color: Colors.error }]}>דלג</WText>
      </Animated.View>

      {/* Content */}
      <View style={styles.cardContent}>
        {/* Compat badge */}
        <View style={styles.compatBadge}>
          <Ionicons name="star" size={12} color={Colors.yellow} />
          <WText style={styles.compatText}>{compat}% התאמה</WText>
        </View>

        <WText style={styles.dogName}>{dog.name}</WText>

        <WText style={styles.dogMeta}>
          {dog.breed} · {getAgeString(dog.birthDate)} ·{' '}
          <Ionicons name="location" size={12} color="rgba(255,255,255,0.7)" />
          {' '}{dist} ק"מ
        </WText>

        {/* Personality tags */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsRow}>
          {dog.personality.slice(0, 4).map((tag, i) => (
            <View key={i} style={styles.pill}>
              <WText style={styles.pillText}>{tag}</WText>
            </View>
          ))}
        </ScrollView>

        {/* Owner */}
        {dog.ownerName && (
          <WText style={styles.ownerText}>של {dog.ownerName.split(' ')[0]}</WText>
        )}
      </View>
    </Animated.View>
  );
});

// ─── Match modal ──────────────────────────────────────────────────────────────

interface MatchModalProps {
  visible: boolean;
  matchedDog: Dog | null;
  myDog: Dog | null;
  onMessage: () => void;
  onContinue: () => void;
}

const MatchModal = React.memo<MatchModalProps>(({ visible, matchedDog, myDog, onMessage, onContinue }) => {
  const scale1 = useRef(new Animated.Value(0)).current;
  const scale2 = useRef(new Animated.Value(0)).current;
  const titleOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale1.setValue(0);
      scale2.setValue(0);
      titleOp.setValue(0);
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scale1, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }),
          Animated.delay(80),
        ]),
        Animated.parallel([
          Animated.spring(scale2, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 12 }),
          Animated.timing(titleOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [visible]);

  if (!matchedDog) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onContinue}>
      <View style={styles.matchOverlay}>
        <Animated.View style={{ opacity: titleOp, alignItems: 'center', marginBottom: Spacing['2xl'] }}>
          <WText style={styles.matchTitle}>זה מאץ׳!</WText>
          <WText style={styles.matchSub}>תאמו טיול ביחד</WText>
        </Animated.View>

        <View style={styles.matchAvatars}>
          <Animated.Image
            source={{ uri: myDog?.photos[0] ?? 'https://placedog.net/200/200?id=99' }}
            style={[styles.matchAvatar, { transform: [{ scale: scale1 }] }]}
          />
          <View style={styles.matchPawWrap}>
            <MaterialCommunityIcons name="paw" size={28} color={Colors.terra} />
          </View>
          <Animated.Image
            source={{ uri: matchedDog.photos[0] }}
            style={[styles.matchAvatar, { transform: [{ scale: scale2 }] }]}
          />
        </View>

        <WText style={styles.matchSubtitle}>
          {myDog?.name ?? 'הכלב שלך'} ו{matchedDog.name} רוצים להיפגש
        </WText>

        <View style={styles.matchBtns}>
          <TouchableOpacity style={styles.matchBtnPrimary} onPress={onMessage} activeOpacity={0.88}>
            <Ionicons name="paper-plane-outline" size={18} color={Colors.white} />
            <WText style={styles.matchBtnPrimaryText}>שלח הודעה</WText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.matchBtnOutline} onPress={onContinue} activeOpacity={0.88}>
            <WText style={styles.matchBtnOutlineText}>המשך לגלול</WText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

// ─── Action button ────────────────────────────────────────────────────────────

interface ActionBtnProps {
  onPress: () => void;
  size: number;
  bg: string;
  children: React.ReactNode;
}

const ActionBtn: React.FC<ActionBtnProps> = ({ onPress, size, bg, children }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 4 }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true, speed: 30, bounciness: 8 }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        style={[
          styles.actionBtn,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        ]}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Main screen ──────────────────────────────────────────────────────────────

export const DiscoverScreen: React.FC = () => {
  const { state, likeDog, addMatch } = useApp();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [filter, setFilter] = useState<FilterType>('walks');
  const [showMatch, setShowMatch] = useState(false);
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const swipeCountRef = useRef(0);

  const allDogs = React.useMemo(
    () => shuffle(MOCK_DOGS.filter(d => d.id !== state.dog?.id)),
    [state.dog?.id],
  );

  const filtered = React.useMemo(() => {
    if (filter === 'all') return allDogs;
    return allDogs.filter(d => d.lookingFor.includes(filter as any));
  }, [allDogs, filter]);

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [filter]);

  const current = filtered[idx] ?? null;
  const next    = filtered[idx + 1] ?? null;
  const done    = idx >= filtered.length;

  const advance = useCallback(() => setIdx(p => p + 1), []);

  const handleRight = useCallback(() => {
    if (!current) return;
    likeDog(current.id);
    swipeCountRef.current += 1;
    if (swipeCountRef.current % 3 === 0) {
      addMatch(current);
      setMatchedDog(current);
      setShowMatch(true);
    }
    advance();
  }, [current, likeDog, addMatch, advance]);

  const handleLeft = useCallback(() => advance(), [advance]);

  const handleUp = useCallback(() => {
    if (!current) return;
    likeDog(current.id);
    advance();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [current, likeDog, advance]);

  const handleReset = useCallback(() => {
    setIdx(0);
    swipeCountRef.current = 0;
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <WText style={styles.headerTitle}>גלה כלבים</WText>
          <WText style={styles.headerSub}>לטיולים משותפים בלבד</WText>
        </View>
        <TouchableOpacity
          style={styles.filterIconBtn}
          onPress={() => Alert.alert('פילטרים', 'פילטרים מתקדמים יהיו זמינים בקרוב')}
          activeOpacity={0.75}
        >
          <Ionicons name="options-outline" size={22} color={Colors.forest} />
        </TouchableOpacity>
      </View>

      {/* ── Filter chips ────────────────────────────────────────────────────── */}
      <View style={styles.filterBar}>
        {FILTERS.map(f => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setFilter(f.key);
              }}
              activeOpacity={0.75}
            >
              <WText style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</WText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Card stack ──────────────────────────────────────────────────────── */}
      <View style={styles.stack}>
        {done ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="paw" size={72} color={Colors.cream2} />
            <WText style={styles.emptyTitle}>ראית את כולם!</WText>
            <WText style={styles.emptySub}>בדוק שוב מחר</WText>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.85}>
              <WText style={styles.resetBtnText}>רענן</WText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {next && (
              <View style={styles.cardWrap} pointerEvents="none">
                <SwipeCard
                  key={`next-${next.id}`}
                  dog={next}
                  myDog={state.dog}
                  onSwipeRight={() => {}}
                  onSwipeLeft={() => {}}
                  onSwipeUp={() => {}}
                  isTop={false}
                />
              </View>
            )}
            {current && (
              <View style={styles.cardWrap}>
                <SwipeCard
                  key={`top-${current.id}-${idx}`}
                  dog={current}
                  myDog={state.dog}
                  onSwipeRight={handleRight}
                  onSwipeLeft={handleLeft}
                  onSwipeUp={handleUp}
                  isTop
                />
              </View>
            )}
          </>
        )}
      </View>

      {/* ── Action buttons ──────────────────────────────────────────────────── */}
      {!done && current && (
        <View style={styles.actions}>
          <ActionBtn onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleLeft(); }} size={58} bg={Colors.white}>
            <Ionicons name="close" size={28} color={Colors.error} />
          </ActionBtn>

          <ActionBtn onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); handleUp(); }} size={52} bg={Colors.yellow}>
            <Ionicons name="star" size={24} color={Colors.white} />
          </ActionBtn>

          <ActionBtn onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); handleRight(); }} size={68} bg={Colors.terra}>
            <MaterialCommunityIcons name="paw" size={30} color={Colors.white} />
          </ActionBtn>
        </View>
      )}

      {/* ── Match modal ─────────────────────────────────────────────────────── */}
      <MatchModal
        visible={showMatch}
        matchedDog={matchedDog}
        myDog={state.dog}
        onMessage={() => { setShowMatch(false); navigation.navigate('Messages'); }}
        onContinue={() => { setShowMatch(false); setMatchedDog(null); }}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.text,
  },
  headerSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  filterIconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Filter chips
  filterBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
  },
  chip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.cream2,
  },
  chipActive: { backgroundColor: Colors.terra },
  chipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: { color: Colors.white },

  // Card stack
  stack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  cardWrap: {
    position: 'absolute',
    width: SCREEN_W - Spacing.base * 2,
    height: CARD_HEIGHT,
  },
  card: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.cream2,
    ...Shadow.strong,
  },

  // Stamp labels
  stamp: {
    position: 'absolute',
    top: 52,
    borderWidth: 3,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stampLike: { left: 20, borderColor: Colors.success, transform: [{ rotate: '-15deg' }] },
  stampNope: { right: 20, borderColor: Colors.error,   transform: [{ rotate: '15deg'  }] },
  stampText: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    letterSpacing: 2,
  },

  // Card content
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg },
  compatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,200,66,0.20)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-end',
    marginBottom: Spacing.sm,
  },
  compatText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.yellow,
  },
  dogName: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 34,
    color: Colors.white,
    lineHeight: 40,
  },
  dogMeta: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  tagsRow: { flexDirection: 'row', marginTop: Spacing.sm, gap: 6 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.white },
  ownerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.60)',
    marginTop: Spacing.sm,
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingBottom: Spacing.xl,
    gap: Spacing.xl,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },

  // Empty state
  empty: { alignItems: 'center', gap: Spacing.md },
  emptyTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.forest,
  },
  emptySub: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary },
  resetBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.terra,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.md,
  },
  resetBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },

  // Match overlay
  matchOverlay: {
    flex: 1,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  matchTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['4xl'],
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  matchSub: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.70)',
  },
  matchAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  matchAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.terra,
  },
  matchPawWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
  },
  matchBtns: { width: '100%', gap: Spacing.md },
  matchBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.terra,
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    ...Shadow.md,
  },
  matchBtnPrimaryText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  matchBtnOutline: {
    alignItems: 'center',
    borderRadius: Radius.full,
    paddingVertical: Spacing.base,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  matchBtnOutlineText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.80)',
  },
});
