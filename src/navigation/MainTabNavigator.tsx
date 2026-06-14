import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MainTabParamList } from '@/types';
import { Colors, FontFamily, Shadow } from '@/theme';
import { WText } from '@/components/ui';
import { useApp } from '@/context/AppContext';

import { FeedScreen } from '@/screens/FeedScreen';
import { DiscoverScreen } from '@/screens/DiscoverScreen';
import { MapScreen } from '@/screens/MapScreen';
import { MyDogScreen } from '@/screens/MyDogScreen';
import { MessagesNavigator } from './MessagesNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabItem {
  name: keyof MainTabParamList;
  label: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const TAB_ITEMS: TabItem[] = [
  { name: 'Home',     label: 'פיד',      icon: 'home-outline',       iconFocused: 'home'       },
  { name: 'Discover', label: 'גילוי',    icon: 'heart-outline',      iconFocused: 'heart'      },
  { name: 'Map',      label: 'מפה',      icon: 'map-outline',        iconFocused: 'map'        },
  { name: 'MyDog',    label: 'הכלב שלי', icon: 'paw-outline',        iconFocused: 'paw'        },
  { name: 'Messages', label: 'הודעות',   icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
];

export const MainTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { unreadMatchCount } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
          {TAB_ITEMS.map((item, index) => {
            const focused = state.index === index;
            const unread = item.name === 'Messages' ? unreadMatchCount() : 0;
            return (
              <TouchableOpacity
                key={item.name}
                style={styles.tabItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate(item.name as string);
                }}
                activeOpacity={0.7}
              >
                {/* Active pill indicator */}
                <View style={[styles.activePill, focused && styles.activePillVisible]} />

                {/* Icon */}
                <Ionicons
                  name={focused ? item.iconFocused : item.icon}
                  size={25}
                  color={focused ? Colors.forest : Colors.gray}
                />

                {/* Label */}
                <WText style={[styles.label, focused ? styles.labelActive : styles.labelInactive]}>
                  {item.label}
                </WText>

                {/* Unread badge */}
                {unread > 0 && (
                  <View style={styles.badge}>
                    <WText style={styles.badgeText}>{unread > 9 ? '9+' : unread}</WText>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    >
      <Tab.Screen name="Home"     component={FeedScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Map"      component={MapScreen} />
      <Tab.Screen name="MyDog"    component={MyDogScreen} />
      <Tab.Screen name="Messages" component={MessagesNavigator} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingTop: 8,
    shadowColor: 'rgba(0,0,0,0.10)',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 2,
    position: 'relative',
  },
  activePill: {
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.terra,
    marginBottom: 8,
    opacity: 0,
  },
  activePillVisible: {
    opacity: 1,
  },
  label: {
    fontFamily: FontFamily.semibold,
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.forest,
  },
  labelInactive: {
    color: Colors.gray,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: '16%',
    backgroundColor: Colors.terra,
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
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
