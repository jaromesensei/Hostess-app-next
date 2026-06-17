import React, { useState, useMemo } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { Post } from '@/types';
import { MOCK_POSTS } from '@/data/mockFeed';

const { width: SCREEN_W } = Dimensions.get('window');
const CELL = Math.floor(SCREEN_W / 3);

// Deterministic mock stats from dogId
function mockStats(dogId: string, postCount: number) {
  const s = dogId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return {
    posts: postCount,
    followers: ((s * 137) % 800) + 80,
    following: ((s * 53)  % 250) + 30,
    distanceKm: ((s * 17) % 18) + 1,
  };
}

export interface DogProfileInfo {
  dogId: string;
  dogName: string;
  dogPhoto: string;
  ownerName: string;
  ownerCity: string;
  userPosts?: Post[];   // state.posts from context (user-created posts)
}

interface DogProfileModalProps {
  profile: DogProfileInfo | null;
  onClose: () => void;
}

export const DogProfileModal: React.FC<DogProfileModalProps> = ({ profile, onClose }) => {
  const [following, setFollowing] = useState(false);
  const [followAnim] = useState(new Animated.Value(1));

  const handleReport = () => {
    Alert.alert('דווח', 'בחר סיבה לדיווח', [
      { text: 'תוכן פוגעני',      onPress: () => Alert.alert('תודה', 'הדיווח נשלח לבדיקה') },
      { text: 'ספאם',             onPress: () => Alert.alert('תודה', 'הדיווח נשלח לבדיקה') },
      { text: 'פרופיל מזויף',    onPress: () => Alert.alert('תודה', 'הדיווח נשלח לבדיקה') },
      { text: 'התנהגות לא הולמת', onPress: () => Alert.alert('תודה', 'הדיווח נשלח לבדיקה') },
      { text: 'ביטול', style: 'cancel' },
    ]);
  };

  const handleBlock = () => {
    if (!profile) return;
    Alert.alert(
      'חסום משתמש',
      `לחסום את ${profile.dogName}? לא תראה יותר את הפרופיל הזה.`,
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'חסום', style: 'destructive', onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onClose(); } },
      ],
    );
  };

  const handleMoreOptions = () => {
    if (!profile) return;
    Alert.alert(profile.dogName, undefined, [
      { text: 'דווח על משתמש', style: 'destructive', onPress: handleReport },
      { text: 'חסום משתמש',    style: 'destructive', onPress: handleBlock },
      { text: 'ביטול', style: 'cancel' },
    ]);
  };

  const dogPosts = useMemo(() => {
    if (!profile) return [];
    const all = [...(profile.userPosts ?? []), ...MOCK_POSTS];
    return all.filter(p => p.dogId === profile.dogId);
  }, [profile]);

  const stats = useMemo(
    () => profile ? mockStats(profile.dogId, dogPosts.length) : { posts: 0, followers: 0, following: 0 },
    [profile, dogPosts.length],
  );

  const handleFollow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.spring(followAnim, { toValue: 0.88, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.spring(followAnim, { toValue: 1,    useNativeDriver: true, speed: 20, bounciness: 5 }),
    ]).start();
    setFollowing(f => !f);
  };

  if (!profile) return null;

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom'] as any}>
        {/* Forest header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="chevron-down" size={26} color={Colors.white} />
          </TouchableOpacity>
          <WText style={styles.headerTitle}>{profile.dogName}</WText>
          <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} onPress={handleMoreOptions}>
            <Ionicons name="ellipsis-horizontal" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={dogPosts}
          keyExtractor={p => p.id}
          numColumns={3}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={(
            <View>
              {/* Hero section (forest) */}
              <View style={styles.hero}>
                {/* Avatar */}
                <Image source={{ uri: profile.dogPhoto }} style={styles.heroAvatar} />

                {/* Name + owner */}
                <WText style={styles.heroName}>{profile.dogName}</WText>
                <WText style={styles.heroOwner}>
                  {profile.ownerName ? `של ${profile.ownerName.split(' ')[0]}  ·  ` : ''}{stats.distanceKm} ק"מ ממך
                </WText>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <StatItem value={stats.posts}     label="פוסטים"  />
                  <View style={styles.statDivider} />
                  <StatItem value={stats.followers} label="עוקבים"  />
                  <View style={styles.statDivider} />
                  <StatItem value={stats.following} label="עוקב"    />
                </View>

                {/* Follow button */}
                <Animated.View style={{ transform: [{ scale: followAnim }] }}>
                  <TouchableOpacity
                    style={[styles.followBtn, following && styles.followBtnActive]}
                    onPress={handleFollow}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={following ? 'checkmark' : 'add'}
                      size={16}
                      color={following ? Colors.forest : Colors.white}
                    />
                    <WText style={[styles.followBtnText, following && styles.followBtnTextActive]}>
                      {following ? 'עוקב/ת' : 'עקוב/י'}
                    </WText>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              {/* Cream section top */}
              <View style={styles.creamTop}>
                {/* Grid header */}
                <View style={styles.gridHeader}>
                  <Ionicons name="grid-outline" size={20} color={Colors.forest} />
                </View>
              </View>
            </View>
          )}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridCell} activeOpacity={0.85}>
              <Image source={{ uri: item.photo }} style={styles.gridImage} resizeMode="cover" />
              {item.likes > 0 && (
                <View style={styles.gridLikes}>
                  <Ionicons name="heart" size={10} color={Colors.white} />
                  <WText style={styles.gridLikesText}>{item.likes}</WText>
                </View>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={(
            <View style={styles.emptyGrid}>
              <Ionicons name="camera-outline" size={52} color={Colors.cream2} />
              <WText style={styles.emptyGridText}>אין פוסטים עדיין</WText>
              <WText style={styles.emptyGridSub}>{profile.dogName} עוד לא פרסם/ה תמונות</WText>
            </View>
          )}
          contentContainerStyle={styles.grid}
        />
      </SafeAreaView>
    </Modal>
  );
};

// ─── Stat item ────────────────────────────────────────────────────────────────

const StatItem: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <View style={styles.statItem}>
    <WText style={styles.statValue}>{value.toLocaleString()}</WText>
    <WText style={styles.statLabel}>{label}</WText>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.forest },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.forest,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },

  hero: {
    backgroundColor: Colors.forest,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'] + Radius.large,
  },

  heroAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: Colors.cream2,
    marginBottom: Spacing.md,
  },
  heroName: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.white,
    marginBottom: 4,
  },
  heroOwner: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: Spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.xl,
  },
  statItem: { alignItems: 'center', gap: 2 },
  statValue: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.lg,
    color: Colors.white,
  },
  statLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.7)',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    ...Shadow.soft,
  },
  followBtnActive: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.forest,
  },
  followBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  followBtnTextActive: { color: Colors.forest },

  creamTop: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    marginTop: -Radius.large,
  },
  gridHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },

  grid: {
    backgroundColor: Colors.cream,
    flexGrow: 1,
    paddingBottom: 40,
  },
  gridCell: {
    width: CELL,
    height: CELL,
    position: 'relative',
  },
  gridImage: {
    width: CELL - 1,
    height: CELL - 1,
    backgroundColor: Colors.cream2,
    margin: 0.5,
  },
  gridLikes: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  gridLikesText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },

  emptyGrid: {
    alignItems: 'center',
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing['3xl'],
    gap: Spacing.sm,
    backgroundColor: Colors.cream,
  },
  emptyGridText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  emptyGridSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'center',
  },
});
