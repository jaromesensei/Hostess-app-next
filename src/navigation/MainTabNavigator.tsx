import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { MainTabParamList } from '@/types';
import { Colors, FontFamily, Shadow, Spacing } from '@/theme';
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
  { name: 'Map',      label: 'חקור',     icon: 'compass-outline',    iconFocused: 'compass'    },
  { name: 'MyDog',    label: 'הכלב שלי', icon: 'paw-outline',        iconFocused: 'paw'        },
  { name: 'Messages', label: 'הודעות',   icon: 'chatbubble-outline', iconFocused: 'chatbubble' },
];

// ─── Animated tab item ────────────────────────────────────────────────────────

interface AnimatedTabProps {
  item: TabItem;
  focused: boolean;
  unread: number;
  onPress: () => void;
}

const AnimatedTabItem: React.FC<AnimatedTabProps> = ({ item, focused, unread, onPress }) => {
  const iconScale   = useRef(new Animated.Value(focused ? 1 : 0.88)).current;
  const pillWidth   = useRef(new Animated.Value(focused ? 28 : 0)).current;
  const pillOpacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (focused) {
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 1.1, damping: 8, stiffness: 250, useNativeDriver: true }),
        Animated.timing(pillWidth, { toValue: 28, duration: 220, useNativeDriver: false }),
        Animated.timing(pillOpacity, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start(() => {
        Animated.spring(iconScale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }).start();
      });
    } else {
      Animated.parallel([
        Animated.spring(iconScale, { toValue: 0.88, damping: 14, stiffness: 200, useNativeDriver: true }),
        Animated.timing(pillWidth, { toValue: 0, duration: 180, useNativeDriver: false }),
        Animated.timing(pillOpacity, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [focused]);

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
    >
      {/* Active pill indicator */}
      <Animated.View style={[styles.activePill, { width: pillWidth, opacity: pillOpacity }]} />

      {/* Icon with scale animation */}
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Ionicons
          name={focused ? item.iconFocused : item.icon}
          size={25}
          color={focused ? Colors.forest : Colors.gray}
        />
      </Animated.View>

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
};

// ─── Navigator ────────────────────────────────────────────────────────────────

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
              <AnimatedTabItem
                key={item.name}
                item={item}
                focused={focused}
                unread={unread}
                onPress={() => navigation.navigate(item.name as string)}
              />
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
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.terra,
    marginBottom: 6,
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
