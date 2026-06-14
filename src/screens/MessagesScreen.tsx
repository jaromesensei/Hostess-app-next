import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '@/context/AppContext';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText, WAvatar, WButton } from '@/components/ui';
import { Match } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatMatchTime(iso: string): string {
  const now = new Date();
  const d = new Date(iso);
  const diffMs = now.getTime() - d.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffHours < 24 && d.getDate() === now.getDate()) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
  if (diffHours < 48) return 'אתמול';
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo}`;
}

function seededOnline(id: string): boolean {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return (hash & 1) === 0;
}

function unreadCount(match: Match): number {
  if (match.isRead) return 0;
  return match.messages.filter(m => m.senderId !== 'me').length || 1;
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const MessagesScreen: React.FC = () => {
  const { state, markMatchRead } = useApp();
  const navigation = useNavigation<any>();

  const sortedMatches = [...state.matches].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
  });

  const handlePressMatch = useCallback((match: Match) => {
    markMatchRead(match.id);
    navigation.navigate('Chat', { matchId: match.id });
  }, [markMatchRead, navigation]);

  const renderItem = useCallback(({ item, index }: { item: Match; index: number }) => {
    const lastMessage = item.messages.length > 0
      ? item.messages[item.messages.length - 1].text
      : 'היי! בואו נדבר 🐾';
    const unread = unreadCount(item);
    const isOnline = seededOnline(item.id);
    const isNew = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.row, isNew && styles.rowUnread]}
        onPress={() => handlePressMatch(item)}
        activeOpacity={0.75}
      >
        {/* Avatar */}
        <WAvatar uri={item.dog.photos?.[0] ?? null} size={58} online={isOnline} />

        {/* Content */}
        <View style={styles.rowContent}>
          <View style={styles.rowTop}>
            <WText style={[styles.dogName, isNew && styles.dogNameUnread]}>
              {item.dog.name}
            </WText>
            <WText style={styles.timestamp}>{formatMatchTime(item.matchedAt)}</WText>
          </View>
          <View style={styles.rowBottom}>
            <WText
              style={[styles.lastMessage, isNew && styles.lastMessageUnread]}
              numberOfLines={1}
            >
              {lastMessage}
            </WText>
            {unread > 0 && (
              <View style={styles.unreadBadge}>
                <WText style={styles.unreadText}>{unread}</WText>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [handlePressMatch]);

  const keyExtractor = useCallback((item: Match) => item.id, []);

  const EmptyComponent = (
    <View style={styles.emptyContainer}>
      <WText style={styles.emptyEmoji}>💬</WText>
      <WText variant="h3" color={Colors.forest} center style={{ marginTop: Spacing.base }}>
        עוד אין matches
      </WText>
      <WText variant="body" color={Colors.gray} center style={{ marginTop: Spacing.sm }}>
        גלה כלבים ותמצא שידוכים!
      </WText>
      <View style={{ marginTop: Spacing.xl, paddingHorizontal: Spacing.xl }}>
        <WButton
          label="גלה כלבים →"
          onPress={() => navigation.navigate('Discover' as any)}
          variant="primary"
          size="md"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <WText style={styles.headerTitle}>הודעות</WText>
        {state.matches.length > 0 && (
          <View style={styles.matchCountPill}>
            <WText style={styles.matchCountText}>{state.matches.length} matches</WText>
          </View>
        )}
      </View>

      {/* List */}
      <FlatList
        data={sortedMatches}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={sortedMatches.length === 0 ? styles.listEmpty : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },

  // Header
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
    shadowColor: 'rgba(44,74,62,0.08)',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.forest,
    textAlign: 'right',
  },
  matchCountPill: {
    backgroundColor: Colors.forestDim,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  matchCountText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.forest,
  },

  // List
  listContent: {
    paddingTop: Spacing.sm,
  },
  listEmpty: {
    flexGrow: 1,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg,
    marginLeft: Spacing.lg + 58 + Spacing.md, // align to content start
  },

  // Row
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.cream,
    gap: Spacing.md,
  },
  rowUnread: {
    backgroundColor: Colors.white,
  },
  rowContent: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rowBottom: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dogName: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'right',
  },
  dogNameUnread: {
    fontFamily: FontFamily.bold,
    color: Colors.forest,
  },
  timestamp: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  lastMessage: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.gray,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.sm,
  },
  lastMessageUnread: {
    fontFamily: FontFamily.medium,
    color: Colors.text,
  },

  // Unread badge
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.xs,
  },
  unreadText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    color: Colors.white,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  emptyEmoji: { fontSize: 72 },
});
