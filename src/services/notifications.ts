import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '@/types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DAY_TO_WEEKDAY: Record<string, number> = {
  SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7,
};

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async scheduleReminder(reminder: Reminder, dogName: string): Promise<string[]> {
    const ids: string[] = [];
    const [hours, minutes] = reminder.time.split(':').map(Number);

    for (const day of reminder.days) {
      const weekday = DAY_TO_WEEKDAY[day];
      if (!weekday) continue;

      try {
        const id = await Notifications.scheduleNotificationAsync({
          content: {
            title: reminder.title,
            body: `${dogName} מחכה!`,
            sound: true,
          },
          trigger: Platform.OS === 'ios'
            ? { weekday, hour: hours, minute: minutes, repeats: true }
            : { weekday, hour: hours, minute: minutes, repeats: true },
        });
        ids.push(id);
      } catch {
        // Permission denied or scheduling failed
      }
    }

    return ids;
  },

  async cancelReminder(notificationIds: string[]): Promise<void> {
    await Promise.all(
      notificationIds.map(id => Notifications.cancelScheduledNotificationAsync(id))
    );
  },

  async cancelAll(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
