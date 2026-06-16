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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '@/context/AppContext';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText, WAvatar } from '@/components/ui';
import { generateId } from '@/services/storage';
import { Message, MessagesStackParamList } from '@/types';

// ─── Mock auto-replies ────────────────────────────────────────────────────────

const AUTO_REPLIES = [
  'נשמע מגניב! מתי אפשר להיפגש?',
  'שמחתי לשמוע! אנחנו בטח נהנה להיפגש',
  'כן! הכלב שלי יהיה מאושר',
  'סופר! איפה אתה רגיל לטייל?',
  'בוא נתאם משהו לסוף שבוע?',
  'מדהים! הכלב שלי חיכה לזה',
  'יאללה, נעשה זאת!',
  'בכיף! ספר לי יותר על הכלב שלך',
];

function autoReply(): string {
  return AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
}

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function needsSeparator(a: string, b: string): boolean {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) > 5 * 60_000;
}

function fmtSeparator(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const t   = `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  if (d.toDateString() === now.toDateString()) return `היום ${t}`;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${t}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ChatRoute = RouteProp<MessagesStackParamList, 'Chat'>;

type ListItem =
  | { kind: 'msg';       msg: Message }
  | { kind: 'separator'; timestamp: string }
  | { kind: 'typing' };

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const anims = dots.map((d, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.spring(d, { toValue: -6, useNativeDriver: true, speed: 30, bounciness: 8 }),
          Animated.spring(d, { toValue:  0, useNativeDriver: true, speed: 20, bounciness: 4 }),
          Animated.delay(320),
        ])
      )
    );
    anims.forEach(a => a.start());
    return () => anims.forEach(a => a.stop());
  }, []);

  return (
    <View style={typing.wrap}>
      <View style={typing.bubble}>
        {dots.map((d, i) => (
          <Animated.View key={i} style={[typing.dot, { transform: [{ translateY: d }] }]} />
        ))}
      </View>
    </View>
  );
};

const typing = StyleSheet.create({
  wrap:   { paddingLeft: Spacing.base, paddingVertical: Spacing.xs },
  bubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cream2, borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, gap: 5, alignSelf: 'flex-start' },
  dot:    { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.placeholder },
});

// ─── Read receipt ─────────────────────────────────────────────────────────────

const ReadReceipt: React.FC<{ sent?: boolean }> = ({ sent }) => (
  <Ionicons
    name={sent ? 'checkmark-done' : 'checkmark'}
    size={13}
    color={sent ? Colors.success : 'rgba(255,255,255,0.50)'}
    style={{ marginTop: 2, marginLeft: 4 }}
  />
);

// ─── Main screen ──────────────────────────────────────────────────────────────

export const ChatScreen: React.FC = () => {
  const navigation   = useNavigation<any>();
  const route        = useRoute<ChatRoute>();
  const { matchId }  = route.params;

  const { state, addMessage, markMatchRead, removeMatch } = useApp();
  const match = state.matches.find(m => m.id === matchId);

  const [inputText, setInputText] = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    if (match) markMatchRead(matchId);
  }, [matchId]);

  // Build flat list items
  const buildItems = useCallback((msgs: Message[]): ListItem[] => {
    const items: ListItem[] = [];
    for (let i = 0; i < msgs.length; i++) {
      const prev = msgs[i - 1];
      if (i === 0 || needsSeparator(prev.timestamp, msgs[i].timestamp)) {
        items.push({ kind: 'separator', timestamp: msgs[i].timestamp });
      }
      items.push({ kind: 'msg', msg: msgs[i] });
    }
    if (isTyping) items.push({ kind: 'typing' });
    return items;
  }, [isTyping]);

  const msgs      = match?.messages ?? [];
  const listItems = buildItems([...msgs]).reverse();

  // Send message
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !match) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    addMessage(matchId, { id: generateId('msg'), senderId: 'me', text, timestamp: new Date().toISOString() });
    setInputText('');

    // Show typing indicator after 400ms
    setTimeout(() => setIsTyping(true), 400);

    // Send auto-reply after 1.5s
    setTimeout(() => {
      setIsTyping(false);
      addMessage(matchId, { id: generateId('msg'), senderId: match.dog.id, text: autoReply(), timestamp: new Date().toISOString() });
    }, 1600);
  }, [inputText, match, matchId, addMessage]);

  // More options
  const handleMore = useCallback(() => {
    Alert.alert('אפשרויות', undefined, [
      {
        text: 'דווח על משתמש',
        style: 'destructive',
        onPress: () => Alert.alert('תודה', 'הדיווח נשלח לצוות Woofy'),
      },
      {
        text: 'חסום משתמש',
        style: 'destructive',
        onPress: () => Alert.alert('חסימה', `${match?.dog.name} נחסם`, [{ text: 'אישור', onPress: () => { removeMatch(matchId); navigation.goBack(); } }]),
      },
      {
        text: 'הסר התאמה',
        style: 'destructive',
        onPress: () => Alert.alert('הסרת התאמה', `להסיר את ${match?.dog.name}?`, [
          { text: 'ביטול', style: 'cancel' },
          { text: 'הסר', style: 'destructive', onPress: () => { removeMatch(matchId); navigation.goBack(); } },
        ]),
      },
      { text: 'ביטול', style: 'cancel' },
    ]);
  }, [match, matchId, removeMatch, navigation]);

  // Render item
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.kind === 'typing')    return <TypingIndicator />;
    if (item.kind === 'separator') return (
      <View style={styles.sep}>
        <WText style={styles.sepText}>{fmtSeparator(item.timestamp)}</WText>
      </View>
    );

    const isMe = item.msg.senderId === 'me';
    return (
      <View style={[styles.bubbleWrap, isMe ? styles.bubbleWrapMe : styles.bubbleWrapThem]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <WText style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
            {item.msg.text}
          </WText>
        </View>
        <View style={styles.metaRow}>
          <WText style={styles.msgTime}>{fmtTime(item.msg.timestamp)}</WText>
          {isMe && <ReadReceipt sent />}
        </View>
      </View>
    );
  }, []);

  const keyExtractor = useCallback((item: ListItem, idx: number): string => {
    if (item.kind === 'typing')    return `typing_${idx}`;
    if (item.kind === 'separator') return `sep_${item.timestamp}_${idx}`;
    return item.msg.id;
  }, []);

  if (!match) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.notFound}>
          <WText style={styles.notFoundText}>שיחה לא נמצאה</WText>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <WText style={styles.goBack}>חזור</WText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const online = match.messages.length > 0;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="chevron-back" size={28} color={Colors.forest} />
        </TouchableOpacity>

        <WAvatar uri={match.dog.photos?.[0] ?? null} size={40} online={online} />

        <View style={styles.headerInfo}>
          <WText style={styles.headerName}>{match.dog.name}</WText>
          <View style={styles.headerStatus}>
            {online && <View style={styles.onlineDot} />}
            <WText style={[styles.headerStatusText, { color: online ? Colors.success : Colors.textSecondary }]}>
              {isTyping ? 'מקליד...' : online ? 'מחובר עכשיו' : 'לא מחובר'}
            </WText>
          </View>
        </View>

        <TouchableOpacity onPress={handleMore} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="ellipsis-horizontal" size={22} color={Colors.forest} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <FlatList
          ref={flatRef}
          data={listItems}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          inverted
          contentContainerStyle={styles.msgContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
          ListEmptyComponent={(
            <View style={styles.emptyChat}>
              <WAvatar uri={match.dog.photos?.[0] ?? null} size={72} />
              <WText style={styles.emptyChatName}>{match.dog.name}</WText>
              <WText style={styles.emptyChatSub}>שלח הודעה ראשונה</WText>
            </View>
          )}
        />

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
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
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color={Colors.white} style={{ transform: [{ scaleX: -1 }] }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },

  // Not found
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  notFoundText: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.forest },
  goBack: { fontFamily: FontFamily.semibold, fontSize: FontSize.base, color: Colors.terra },

  // Header
  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  headerInfo: { flex: 1, alignItems: 'flex-end' },
  headerName: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  headerStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.success },
  headerStatusText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },

  // Messages
  msgContent: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, flexGrow: 1, justifyContent: 'flex-end' },

  bubbleWrap: { maxWidth: '78%' },
  bubbleWrapMe:   { alignSelf: 'flex-end',   alignItems: 'flex-end'   },
  bubbleWrapThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },

  bubble: { paddingHorizontal: 14, paddingVertical: 10 },
  bubbleMe:   { backgroundColor: Colors.terra,  borderRadius: 18, borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: Colors.cream2, borderRadius: 18, borderBottomLeftRadius: 4  },

  bubbleText:     { fontFamily: FontFamily.regular, fontSize: FontSize.base, lineHeight: FontSize.base * 1.5 },
  bubbleTextMe:   { color: Colors.white, textAlign: 'right' },
  bubbleTextThem: { color: Colors.text,  textAlign: 'right' },

  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, paddingHorizontal: 4 },
  msgTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary },

  sep: { alignItems: 'center', marginVertical: Spacing.sm },
  sepText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.textSecondary, backgroundColor: Colors.background, paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },

  // Empty chat
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyChatName: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.text },
  emptyChatSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.textSecondary },

  // Input bar
  inputBar: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'right',
    maxHeight: 120,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.terra,
    alignItems: 'center', justifyContent: 'center',
    ...Shadow.sm,
  },
  sendBtnDisabled: { opacity: 0.35 },
});
