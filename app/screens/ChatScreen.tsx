import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Conversation } from './MessagesScreen';
import { useApp } from '../context/AppContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

interface Message {
  id: string;
  text: string;
  fromMe: boolean;
  timestamp: string;
}

const getInitialMessages = (dogName: string): Message[] => [
  { id: '1', text: `Hey! My dog ${dogName} saw yours and went crazy! 😄`, fromMe: false, timestamp: '10:32 AM' },
  { id: '2', text: "Ha! Mine too! Dogs know best 🐾", fromMe: true, timestamp: '10:33 AM' },
  { id: '3', text: "Want to set up a playdate? Maybe at Hayarkon Park?", fromMe: false, timestamp: '10:34 AM' },
  { id: '4', text: "That sounds amazing! This weekend? 🌳", fromMe: true, timestamp: '10:35 AM' },
];

export default function ChatScreen({ navigation, route }: Props) {
  const { userDog } = useApp();
  const conversation = route.params?.conversation as Conversation;
  const [messages, setMessages] = useState<Message[]>(getInitialMessages(conversation?.dogName || 'your dog'));
  const [inputText, setInputText] = useState('');
  const listRef = useRef<FlatList>(null);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMessage: Message = {
      id: String(Date.now()),
      text,
      fromMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D3561" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarEmoji}>{conversation?.dogEmoji || '🐕'}</Text>
          </View>
          <View>
            <Text style={styles.headerDogName}>{conversation?.dogName || 'Dog'}</Text>
            <Text style={styles.headerOwner}>{conversation?.ownerName}'s dog</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>Active</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageWrapper, item.fromMe && styles.messageWrapperMe]}>
              {!item.fromMe && (
                <View style={styles.avatarSmall}>
                  <Text style={styles.avatarSmallEmoji}>{conversation?.dogEmoji || '🐕'}</Text>
                </View>
              )}
              <View style={[styles.bubble, item.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.messageText, item.fromMe && styles.messageTextMe]}>
                  {item.text}
                </Text>
                <Text style={[styles.messageTime, item.fromMe && styles.messageTimeMine]}>
                  {item.timestamp}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={`Message ${conversation?.dogName || 'them'}...`}
            placeholderTextColor="#bbb"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
            activeOpacity={0.75}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>🐾</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3561',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    marginRight: 8,
    padding: 4,
  },
  backArrow: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '300',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerAvatarEmoji: {
    fontSize: 22,
  },
  headerDogName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerOwner: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CD964',
  },
  onlineText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  messageWrapperMe: {
    flexDirection: 'row-reverse',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarSmallEmoji: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '75%',
    padding: 12,
    paddingBottom: 8,
    borderRadius: 16,
  },
  bubbleThem: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleMe: {
    backgroundColor: '#FF6B35',
    borderBottomRightRadius: 4,
    marginLeft: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#2D3561',
    lineHeight: 20,
  },
  messageTextMe: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#aaa',
    marginTop: 4,
    textAlign: 'right',
  },
  messageTimeMine: {
    color: 'rgba(255,255,255,0.6)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2D3561',
    maxHeight: 100,
    backgroundColor: '#FAFAFA',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#FFD5C5',
  },
  sendBtnText: {
    fontSize: 20,
  },
});
