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
import { Colors, FontFamily, FontSize, Spacing, Radius } from '@/theme';
import { WText, WAvatar } from '@/components/ui';
import { WButton } from '@/components/ui';
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
  if (diffHours < 48) {
    return 'אתמול';
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo}`;
}

// Seeded pseudo-random for stable online status per match id
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

  // Sort: unread first, then by matchedAt desc
  const sortedMatches = [...state.matches].sort((a, b) => {
    if (!a.isRead && b.isRead) return -1;
    if (a.isRead && !b.isRead) return 1;
    return new Date(b.matchedAt).getTime() - new Date(a.matchedAt).getTime();
  });

  const handlePressMatch = useCallback((match: Match) => {
    markMatchRead(match.id);
    navigation.navigate('Chat', { matchId: match.id });
  }, [markMatchRead, navigation]);

  const renderItem = useCallback(({ item }: { item: Match }) => {
    const lastMessage = item.messages.length > 0
      ? item.messages[item.messages.length - 1].text
      : 'היי! בואו נדבר 🐾';
    const unread = unreadCount(item);
    const isOnline = seededOnline(item.id);

    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handlePressMatch(item)}
        activeOpacity={0.75}
      >
        <WAvatar
          uri={item.dog.photos?.[0] ?? null}
          size={56}
          online={isOnline}
        />

        <View style={styles.rowContent}>
          <WText variant="bodySemibold" color={Colors.text} right>
            {item.dog.name}
          </WText>
          <WText
            variant="captionMedium"
            color={Colors.gray}
            numberOfLines={1}
            right
          >
            {lastMessage}
          </WText>
        </View>

        <View style={styles.rowRight}>
          <WText variant="captionMedium" color={Colors.gray}>
            {formatMatchTime(item.matchedAt)}
          </WText>
          {unread > 0 && (
            <View style={styles.unreadBadge}>
              <WText style={styles.unreadText}>{unread}</WText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [handlePressMatch]);

  const keyExtractor = useCallback((item: Match) => item.id, []);

  const EmptyComponent = (
    <View style={styles.emptyContainer}>
      <WText style={styles.emptyEmoji}>🐾</WText>
      <WText variant="h3" color={Colors.forest} center style={{ marginTop: Spacing.base }}>
        עוד אין matches
      </WText>
      <WText variant="body" color={Colors.gray} center style={{ marginTop: Spacing.sm }}>
        לך לגלות כלבים חדשים
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
        <WText variant="h1" color={Colors.forest} right>
          הודעות 💬
        </WText>
        <WText variant="caption" color={Colors.gray} right>
          {state.matches.length} matches
        </WText>
      </View>

      {/* List */}
      <FlatList
        data={sortedMatches}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          sortedMatches.length === 0 ? styles.listEmpty : undefined
        }
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.cream,
  },

  // Row
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.cream,
  },
  rowContent: {
    flex: 1,
    marginHorizontal: Spacing.md,
    alignItems: 'flex-end',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
    minWidth: 44,
  },

  // Unread badge
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },

  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing['3xl'],
  },
  emptyEmoji: {
    fontSize: 64,
  },
  listEmpty: {
    flexGrow: 1,
  },
});
