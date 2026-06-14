import React, { useState, useCallback } from 'react';
import {
  View,
  Modal,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { Notification } from '@/types';
import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `לפני ${m} דק׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `לפני ${h} שע׳`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'אתמול';
  return `לפני ${d} ימים`;
}

const TYPE_CONFIG = {
  like:    { icon: 'heart'          as const, color: Colors.terra  },
  comment: { icon: 'chatbubble'     as const, color: Colors.forest },
  follow:  { icon: 'person-add'     as const, color: '#3B8EC5'     },
  event:   { icon: 'calendar'       as const, color: Colors.yellow },
  match:   { icon: 'heart-circle'   as const, color: '#E85D9A'     },
};

interface NotifCardProps {
  notif: Notification;
  onPress: () => void;
}

const NotifCard = React.memo<NotifCardProps>(({ notif, onPress }) => {
  const cfg = TYPE_CONFIG[notif.type];

  return (
    <TouchableOpacity
      style={[styles.card, !notif.isRead && styles.cardUnread]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Unread dot */}
      {!notif.isRead && <View style={styles.unreadDot} />}

      {/* Actor avatar + type icon */}
      <View style={styles.avatarWrap}>
        <Image source={{ uri: notif.actorDogPhoto }} style={styles.avatar} />
        <View style={[styles.typeIcon, { backgroundColor: cfg.color }]}>
          <Ionicons name={cfg.icon} size={10} color={Colors.white} />
        </View>
      </View>

      {/* Text */}
      <View style={styles.textWrap}>
        <WText style={styles.notifText} numberOfLines={2}>
          <WText style={styles.actorName}>{notif.actorDogName} </WText>
          {notif.text}
        </WText>
        <WText style={styles.notifTime}>{timeAgo(notif.createdAt)}</WText>
      </View>

      {/* Post thumbnail (like/comment) */}
      {notif.postPhoto && (
        <Image source={{ uri: notif.postPhoto }} style={styles.postThumb} />
      )}

      {/* Event emoji */}
      {notif.eventEmoji && !notif.postPhoto && (
        <View style={[styles.eventThumb, { backgroundColor: Colors.yellow + '22' }]}>
          <WText style={styles.eventThumbEmoji}>{notif.eventEmoji}</WText>
        </View>
      )}
    </TouchableOpacity>
  );
});

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ visible, onClose }) => {
  const [notifs, setNotifs] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const markAllRead = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const handlePress = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom'] as any}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <WText style={styles.headerTitle}>עדכונים</WText>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <WText style={styles.unreadBadgeText}>{unreadCount}</WText>
              </View>
            )}
          </View>

          {unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllRead}>
              <WText style={styles.markAllRead}>סמן הכל כנקרא</WText>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        {/* List */}
        <FlatList
          data={notifs}
          keyExtractor={n => n.id}
          renderItem={({ item }) => (
            <NotifCard notif={item} onPress={() => handlePress(item.id)} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <WText style={styles.emptyEmoji}>🔔</WText>
              <WText style={styles.emptyText}>אין עדכונים עדיין</WText>
              <WText style={styles.emptySub}>כשמישהו יאהב פוסט שלך — תדע/י כאן</WText>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, color: Colors.text },
  unreadBadge: {
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, color: Colors.white },
  markAllRead: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.terra },

  list: { paddingVertical: Spacing.sm },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    position: 'relative',
  },
  cardUnread: { backgroundColor: Colors.terraDim },

  unreadDot: {
    position: 'absolute',
    left: 6,
    top: '50%',
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.terra,
    marginTop: -3.5,
  },

  avatarWrap: { position: 'relative', width: 48, height: 48 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.cream2 },
  typeIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },

  textWrap: { flex: 1 },
  notifText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 19,
    marginBottom: 3,
  },
  actorName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  notifTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.gray, textAlign: 'right' },

  postThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.small,
    backgroundColor: Colors.cream2,
  },
  eventThumb: {
    width: 48,
    height: 48,
    borderRadius: Radius.small,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventThumbEmoji: { fontSize: 26 },

  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.md },
  emptyEmoji: { fontSize: 52 },
  emptyText: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.text },
  emptySub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.gray, textAlign: 'center', paddingHorizontal: Spacing['2xl'] },
});
