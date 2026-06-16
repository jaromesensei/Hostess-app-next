import React, { useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useApp } from '@/context/AppContext';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText, WAvatar } from '@/components/ui';
import { Match } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const now = new Date();
  const d   = new Date(iso);
  const diffH = (now.getTime() - d.getTime()) / 3_600_000;
  if (diffH < 24 && d.getDate() === now.getDate()) {
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }
  if (diffH < 48) return 'אתמול';
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

function isOnline(id: string): boolean {
  let h = 0;
  for (let i = 0; i < id.length; i++) { h = (h << 5) - h + id.charCodeAt(i); h |= 0; }
  return (h & 1) === 0;
}

function countUnread(match: Match): number {
  if (match.isRead) return 0;
  return match.messages.filter(m => m.senderId !== 'me').length || 1;
}

// ─── Swipe delete action ──────────────────────────────────────────────────────

const SwipeDeleteAction = (_prog: Animated.AnimatedInterpolation<number>, drag: Animated.AnimatedInterpolation<number>) => {
  const scale = drag.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
  return (
    <View style={deleteAction.wrap}>
      <Animated.View style={[deleteAction.btn, { transform: [{ scale }] }]}>
        <Ionicons name="trash-outline" size={22} color={Colors.white} />
        <WText style={deleteAction.text}>הסר</WText>
      </Animated.View>
    </View>
  );
};

const deleteAction = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 24, backgroundColor: Colors.error, width: 100 },
  btn:  { alignItems: 'center', gap: 3 },
  text: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },
});

// ─── New Match bubble (horizontal scroll) ─────────────────────────────────────

const NewMatchBubble: React.FC<{ match: Match; onPress: () => void }> = ({ match, onPress }) => (
  <TouchableOpacity style={bubble.wrap} onPress={onPress} activeOpacity={0.8}>
    <View style={bubble.ring}>
      <Image source={{ uri: match.dog.photos?.[0] }} style={bubble.avatar} />
      {isOnline(match.id) && <View style={bubble.onlineDot} />}
    </View>
    <WText style={bubble.name} numberOfLines={1}>{match.dog.name}</WText>
    <WText style={bubble.sub}>לחץ לשלוח</WText>
  </TouchableOpacity>
);

const bubble = StyleSheet.create({
  wrap:      { alignItems: 'center', width: 72 },
  ring:      { width: 68, height: 68, borderRadius: 34, borderWidth: 2.5, borderColor: Colors.terra, position: 'relative' },
  avatar:    { width: 63, height: 63, borderRadius: 31.5, margin: 2.5 - 0.5, backgroundColor: Colors.cream2 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 13, height: 13, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  name:      { fontFamily: FontFamily.semibold, fontSize: FontSize.xs, color: Colors.text, marginTop: 5, textAlign: 'center' },
  sub:       { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.gray, textAlign: 'center' },
});

// ─── Conversation row ─────────────────────────────────────────────────────────

interface RowProps {
  match: Match;
  onPress: () => void;
  onUnmatch: () => void;
}

const ConvoRow = React.memo<RowProps>(({ match, onPress, onUnmatch }) => {
  const swipeRef = useRef<Swipeable>(null);
  const lastMsg  = match.messages.length > 0
    ? match.messages[match.messages.length - 1].text
    : 'שלח הודעה ראשונה';
  const unread  = countUnread(match);
  const online  = isOnline(match.id);
  const isNew   = !match.isRead;

  const handleUnmatch = () => {
    swipeRef.current?.close();
    Alert.alert(
      'הסרת התאמה',
      `להסיר את ${match.dog.name} מהרשימה?`,
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'הסר', style: 'destructive', onPress: () => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); onUnmatch(); } },
      ]
    );
  };

  return (
    <Swipeable
      ref={swipeRef}
      renderLeftActions={SwipeDeleteAction}
      leftThreshold={60}
      onSwipeableOpen={handleUnmatch}
      friction={2}
      overshootLeft={false}
    >
      <TouchableOpacity
        style={[styles.row, isNew && styles.rowUnread]}
        onPress={onPress}
        activeOpacity={0.75}
      >
        <WAvatar uri={match.dog.photos?.[0] ?? null} size={56} online={online} />

        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <WText style={[styles.dogName, isNew && styles.dogNameBold]}>
              {match.dog.name}
            </WText>
            <WText style={[styles.timestamp, isNew && styles.timestampBold]}>
              {formatTime(match.matchedAt)}
            </WText>
          </View>

          <View style={styles.rowBottom}>
            <WText style={[styles.preview, isNew && styles.previewBold]} numberOfLines={1}>
              {isNew && unread > 0 && '• '}{lastMsg}
            </WText>
            {unread > 0 && (
              <View style={styles.badge}>
                <WText style={styles.badgeText}>{unread > 9 ? '9+' : unread}</WText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export const MessagesScreen: React.FC = () => {
  const { state, markMatchRead, removeMatch } = useApp();
  const navigation = useNavigation<any>();

  const sorted = [...state.matches].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
  });

  const newMatches = sorted.filter(m => m.messages.length === 0);
  const convos     = sorted.filter(m => m.messages.length > 0 || m.isRead);
  const allRows    = sorted; // show all in the list regardless

  const openChat = useCallback((match: Match) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    markMatchRead(match.id);
    navigation.navigate('Chat', { matchId: match.id });
  }, [markMatchRead, navigation]);

  const renderRow = useCallback(({ item }: { item: Match }) => (
    <ConvoRow
      match={item}
      onPress={() => openChat(item)}
      onUnmatch={() => removeMatch(item.id)}
    />
  ), [openChat, removeMatch]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <WText style={styles.headerTitle}>הודעות</WText>
        {state.matches.length > 0 && (
          <View style={styles.countPill}>
            <WText style={styles.countText}>{state.matches.length} matches</WText>
          </View>
        )}
      </View>

      {/* New matches bubble row */}
      {newMatches.length > 0 && (
        <View style={styles.newMatchSection}>
          <WText style={styles.sectionLabel}>התאמות חדשות</WText>
          <FlatList
            horizontal
            data={newMatches}
            keyExtractor={m => m.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bubblesContent}
            renderItem={({ item }) => (
              <NewMatchBubble match={item} onPress={() => openChat(item)} />
            )}
          />
        </View>
      )}

      {/* Conversation list */}
      <FlatList
        data={allRows}
        keyExtractor={m => m.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={allRows.length === 0 ? styles.listEmpty : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListHeaderComponent={allRows.length > 0 ? (
          <WText style={[styles.sectionLabel, { paddingHorizontal: Spacing.base, paddingTop: Spacing.base }]}>
            שיחות
          </WText>
        ) : null}
        ListEmptyComponent={(
          <View style={styles.empty}>
            <MaterialCommunityIcons name="paw" size={64} color={Colors.cream2} />
            <WText style={styles.emptyTitle}>אין התאמות עדיין</WText>
            <WText style={styles.emptySub}>גלה כלבים ותמצא חברים לטיול</WText>
            <TouchableOpacity
              style={styles.discoverBtn}
              onPress={() => navigation.navigate('Discover' as any)}
              activeOpacity={0.85}
            >
              <Ionicons name="heart-outline" size={16} color={Colors.white} />
              <WText style={styles.discoverBtnText}>גלה כלבים</WText>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.text,
  },
  countPill: {
    backgroundColor: Colors.forestDim,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  countText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.forest,
  },

  // New matches
  newMatchSection: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  sectionLabel: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
    textAlign: 'right',
  },
  bubblesContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },

  // List
  listContent: { paddingBottom: Spacing['2xl'] },
  listEmpty:   { flexGrow: 1 },
  separator:   { height: 0.5, backgroundColor: Colors.border, marginRight: Spacing.base, marginLeft: 72 + Spacing.base + Spacing.md },

  // Row
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.white,
    gap: Spacing.md,
  },
  rowUnread: { backgroundColor: Colors.terraDim },
  rowContent: { flex: 1 },
  rowTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  rowBottom: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dogName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  dogNameBold: { fontFamily: FontFamily.bold },
  timestamp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  timestampBold: { fontFamily: FontFamily.semibold, color: Colors.terra },
  preview: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  previewBold: { fontFamily: FontFamily.medium, color: Colors.text },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: Spacing.xs,
  },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 10, color: Colors.white },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['3xl'], gap: Spacing.md },
  emptyTitle: { fontFamily: FontFamily.displayBlack, fontSize: FontSize['2xl'], color: Colors.forest },
  emptySub: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing['2xl'] },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.terra,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    ...Shadow.md,
  },
  discoverBtnText: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.white },
});
