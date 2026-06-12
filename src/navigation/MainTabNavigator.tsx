import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MainTabParamList } from '@/types';
import { Colors, FontFamily, FontSize, Shadow } from '@/theme';
import { WText } from '@/components/ui';
import { useApp } from '@/context/AppContext';

import { HomeScreen } from '@/screens/HomeScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { MapScreen } from '@/screens/MapScreen';
import { MyDogScreen } from '@/screens/MyDogScreen';
import { MessagesNavigator } from './MessagesNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ITEMS = [
  { name: 'Home' as const, label: 'בית', emoji: '🏠' },
  { name: 'Discover' as const, label: 'גילוי', emoji: '💛' },
  { name: 'Map' as const, label: 'מפה', emoji: '🗺️' },
  { name: 'MyDog' as const, label: 'הכלב שלי', emoji: '🐾' },
  { name: 'Messages' as const, label: 'הודעות', emoji: '💬' },
];

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { unreadMatchCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View style={[styles.bar, { paddingBottom: insets.bottom || 8 }]}>
          {TAB_ITEMS.map((item, index) => {
            const focused = state.index === index;
            const unread = item.name === 'Messages' ? unreadMatchCount() : 0;
            return (
              <View key={item.name} style={styles.tabItem}>
                <View
                  onTouchEnd={() =>
                    navigation.navigate(item.name as string)
                  }
                  style={styles.tabTouchable}
                >
                  <WText
                    style={[
                      styles.emoji,
                      focused ? styles.emojiFocused : styles.emojiBlur,
                    ]}
                  >
                    {item.emoji}
                  </WText>
                  <WText
                    style={[
                      styles.label,
                      { color: focused ? Colors.terra : Colors.gray },
                    ]}
                  >
                    {item.label}
                  </WText>
                  {unread > 0 && (
                    <View style={styles.badge}>
                      <WText style={styles.badgeText}>{unread}</WText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="MyDog" component={MyDogScreen} />
      <Tab.Screen name="Messages" component={MessagesNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    ...Shadow.soft,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabTouchable: {
    alignItems: 'center',
    paddingHorizontal: 4,
    position: 'relative',
  },
  emoji: {
    fontSize: 22,
  },
  emojiFocused: {
    transform: [{ scale: 1.1 }],
  },
  emojiBlur: {
    opacity: 0.65,
  },
  label: {
    fontFamily: FontFamily.displayBold,
    fontSize: FontSize.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.terra,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontFamily: FontFamily.bold,
    lineHeight: 13,
  },
});
