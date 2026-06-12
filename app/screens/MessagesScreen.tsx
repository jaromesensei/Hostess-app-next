import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export interface Conversation {
  id: string;
  dogName: string;
  ownerName: string;
  dogEmoji: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

export const conversations: Conversation[] = [
  {
    id: '1',
    dogName: 'Max',
    ownerName: 'David',
    dogEmoji: '🐕',
    lastMessage: "Hey! Want to meet at Hayarkon Park tomorrow? 🌳",
    timestamp: '2m ago',
    unread: 2,
  },
  {
    id: '2',
    dogName: 'Luna',
    ownerName: 'Sarah',
    dogEmoji: '🐩',
    lastMessage: "Luna loved playing with your dog! 🐾",
    timestamp: '1h ago',
    unread: 0,
  },
  {
    id: '3',
    dogName: 'Charlie',
    ownerName: 'Jake',
    dogEmoji: '🐶',
    lastMessage: "Are you free this Sunday afternoon?",
    timestamp: 'Yesterday',
    unread: 1,
  },
];

export default function MessagesScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <Text style={styles.title}>Messages 💬</Text>
        <Text style={styles.matchCount}>3 matches</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => navigation.navigate('Chat', { conversation: item })}
            activeOpacity={0.75}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{item.dogEmoji}</Text>
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.dogName}>{item.dogName}</Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              <Text style={styles.ownerName}>{item.ownerName}'s dog</Text>
              <Text
                style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyText}>No matches yet!</Text>
            <Text style={styles.emptySubtext}>Go to Discover and meet some dogs 🐾</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3561',
  },
  matchCount: {
    fontSize: 13,
    color: '#FF6B35',
    fontWeight: '700',
    backgroundColor: '#FFF5F2',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  separator: {
    height: 8,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FFD5C5',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dogName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3561',
  },
  timestamp: {
    fontSize: 12,
    color: '#aaa',
  },
  ownerName: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 13,
    color: '#888',
  },
  lastMessageUnread: {
    color: '#2D3561',
    fontWeight: '600',
  },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3561',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});
