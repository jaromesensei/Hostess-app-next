import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText, WAvatar } from '@/components/ui';
import { generateId } from '@/services/storage';
import { Message } from '@/types';
import { MessagesStackParamList } from '@/types';

// ─── Preset dog replies ───────────────────────────────────────────────────────

const DOG_REPLIES: string[] = [
  'וואו, נשמע מגניב! 🐾 מתי אפשר להיפגש?',
  'היי!! שמחתי לשמוע 🐕 אנחנו בטח נהנה להיפגש',
  'כן כן כן! 🎾 הכלב שלי יתפוצץ מאושר',
  'סופר! איפה אתה רגיל לטייל?',
  'מה שמך? אני מחכה בסבלנות! 🤝',
  'אהבתי! בוא נתאם משהו לסוף שבוע?',
  'מדהים 🌟 הכלב שלי חיכה לזה',
  'יאללה! נעשה זאת! 🏃',
];

function randomReply(): string {
  return DOG_REPLIES[Math.floor(Math.random() * DOG_REPLIES.length)];
}

// ─── Time formatting ──────────────────────────────────────────────────────────

function formatMsgTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

// Check if two timestamps are > 5 min apart
function showTimeSeparator(a: string, b: string): boolean {
  const diff = Math.abs(new Date(b).getTime() - new Date(a).getTime());
  return diff > 5 * 60 * 1000;
}

function formatSeparatorTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (isToday) return `היום ${hh}:${mm}`;
  const dd = String(d.getDate()).padStart(2, '0');
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mo} ${hh}:${mm}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatRouteProp = RouteProp<MessagesStackParamList, 'Chat'>;

// FlatList item can be a message or a time separator
type ListItem =
  | { kind: 'msg'; msg: Message }
  | { kind: 'separator'; timestamp: string };

// ─── Main Screen ─────────────────────────────────────────────────────────────

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<ChatRouteProp>();
  const { matchId } = route.params;

  const { state, addMessage, markMatchRead } = useApp();
  const match = state.matches.find(m => m.id === matchId);

  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Mark as read on mount
  useEffect(() => {
    if (match) markMatchRead(matchId);
  }, [matchId]);

  // ── Build list items from messages ──────────────────────────────────────────
  const buildListItems = useCallback((messages: Message[]): ListItem[] => {
    const items: ListItem[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const prev = messages[i - 1];
      if (i === 0 || showTimeSeparator(prev.timestamp, msg.timestamp)) {
        items.push({ kind: 'separator', timestamp: msg.timestamp });
      }
      items.push({ kind: 'msg', msg });
    }
    return items;
  }, []);

  const messages = match ? match.messages : [];
  // inverted=true so we reverse for display
  const listItems = buildListItems([...messages]).reverse();

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !match) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newMsg: Message = {
      id:        generateId('msg'),
      senderId:  'me',
      text,
      timestamp: new Date().toISOString(),
    };

    addMessage(matchId, newMsg);
    setInputText('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replyMsg: Message = {
        id:        generateId('msg'),
        senderId:  match.dog.id,
        text:      randomReply(),
        timestamp: new Date().toISOString(),
      };
      addMessage(matchId, replyMsg);
    }, 1500);
  }, [inputText, match, matchId, addMessage]);

  // ── Header more options ──────────────────────────────────────────────────────
  const handleMore = () => {
    Alert.alert('אפשרויות', undefined, [
      { text: 'דווח', style: 'destructive', onPress: () => Alert.alert('תודה', 'הדיווח נשלח') },
      { text: 'הסר התאמה', style: 'destructive', onPress: () => { navigation.goBack(); } },
      { text: 'ביטול', style: 'cancel' },
    ]);
  };

  // ── Render item ──────────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.kind === 'separator') {
      return (
        <View style={styles.separatorRow}>
          <WText variant="captionMedium" color={Colors.gray} center>
            {formatSeparatorTime(item.timestamp)}
          </WText>
        </View>
      );
    }

    const isMe = item.msg.senderId === 'me';

    return (
      <View
        style={[
          styles.bubbleWrapper,
          isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperThem,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
          ]}
        >
          <WText
            style={[
              styles.bubbleText,
              isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
            ]}
          >
            {item.msg.text}
          </WText>
        </View>
        <WText variant="caption" color={Colors.gray} style={styles.msgTime}>
          {formatMsgTime(item.msg.timestamp)}
        </WText>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.kind === 'separator') return `sep_${item.timestamp}_${index}`;
    return item.msg.id;
  }, []);

  // ── Not found ────────────────────────────────────────────────────────────────
  if (!match) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.notFoundContainer}>
          <WText variant="h3" color={Colors.forest} center>שיחה לא נמצאה</WText>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: Spacing.base }}>
            <WText variant="bodySemibold" color={Colors.terra} center>חזור</WText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isOnline = match.messages.length > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* ═══ HEADER ═══ */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <WText style={styles.backIcon}>‹</WText>
        </TouchableOpacity>

        {/* Avatar */}
        <WAvatar
          uri={match.dog.photos?.[0] ?? null}
          size={40}
          online={isOnline}
        />

        {/* Dog info */}
        <View style={styles.headerInfo}>
          <WText variant="title" color={Colors.forest} right>
            {match.dog.name}
          </WText>
          <WText variant="caption" color={isOnline ? Colors.success : Colors.gray} right>
            {isOnline ? 'מחובר עכשיו' : 'לא מחובר'}
          </WText>
        </View>

        {/* More options */}
        <TouchableOpacity
          onPress={handleMore}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <WText style={styles.moreIcon}>•••</WText>
        </TouchableOpacity>
      </View>

      {/* ═══ MESSAGES ═══ */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={listItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <WText variant="body" color={Colors.gray} center style={styles.emptyText}>
                👋 שלח הודעה ראשונה!
              </WText>
            </View>
          }
        />

        {/* ═══ INPUT BAR ═══ */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="כתוב הודעה..."
            placeholderTextColor={Colors.placeholder}
            multiline
            textAlign="right"
            returnKeyType="send"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.75}
          >
            <WText style={styles.sendIcon}>➤</WText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  flex: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  backButton: {
    paddingHorizontal: Spacing.xs,
  },
  backIcon: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: Colors.forest,
    lineHeight: 38,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  moreIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.forest,
    letterSpacing: 1,
    paddingHorizontal: Spacing.xs,
  },

  // Messages
  messagesContent: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },

  // Bubble wrapper
  bubbleWrapper: {
    maxWidth: '75%',
  },
  bubbleWrapperMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleWrapperThem: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: Colors.terra,
    borderRadius: 16,
    borderBottomRightRadius: 0,
  },
  bubbleThem: {
    backgroundColor: Colors.cream2,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
  },
  bubbleText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * 1.5,
  },
  bubbleTextMe: {
    color: Colors.white,
    textAlign: 'right',
  },
  bubbleTextThem: {
    color: Colors.text,
    textAlign: 'right',
  },
  msgTime: {
    marginTop: 2,
    marginHorizontal: 4,
  },

  // Time separator
  separatorRow: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },

  // Empty messages
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
  },
  emptyText: {
    fontStyle: 'italic',
  },

  // Input bar
  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.soft,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'right',
    maxHeight: 120,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
});
